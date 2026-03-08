#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
代理IP管理模块（合规）
仅用于合法用途：访问速率控制、区域适配、企业内网穿透等
"""

import time
import threading
import random
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging
import requests

logger = logging.getLogger(__name__)


class ProxyStatus(Enum):
    """代理状态"""
    HEALTHY = 'healthy'
    FAILED = 'failed'
    TESTING = 'testing'


@dataclass
class ProxyInfo:
    """代理信息"""
    url: str
    status: ProxyStatus = ProxyStatus.TESTING
    failure_count: int = 0
    last_used: float = 0
    last_verified: float = 0
    response_time: float = 0
    region: str = 'unknown'


class ProxyManager:
    """代理IP管理器（合规）"""

    def __init__(
        self,
        proxy_list: List[str],
        verify_interval: int = 300,
        max_failures: int = 3,
        rotate_on_failure: bool = True,
        test_url: str = 'http://httpbin.org/ip'
    ):
        """
        初始化代理管理器

        Args:
            proxy_list: 代理列表
            verify_interval: 验证间隔（秒）
            max_failures: 最大失败次数
            rotate_on_failure: 失败时是否轮换
            test_url: 测试URL
        """
        self.proxy_list = proxy_list
        self.verify_interval = verify_interval
        self.max_failures = max_failures
        self.rotate_on_failure = rotate_on_failure
        self.test_url = test_url

        # 代理池
        self.proxies: Dict[str, ProxyInfo] = {}
        self._init_proxies()

        # 当前代理
        self.current_proxy: Optional[str] = None
        self.current_index = 0
        self.lock = threading.Lock()

        # 统计信息
        self.stats = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'proxy_rotations': 0
        }

    def _init_proxies(self):
        """初始化代理池"""
        for proxy_url in self.proxy_list:
            self.proxies[proxy_url] = ProxyInfo(url=proxy_url)

        logger.info(f"代理池已初始化，共 {len(self.proxies)} 个代理")

    def get_proxy(self) -> Optional[str]:
        """
        获取代理

        Returns:
            代理URL，如果没有可用代理返回None
        """
        with self.lock:
            # 获取健康的代理
            healthy_proxies = [
                proxy_info for proxy_info in self.proxies.values()
                if proxy_info.status == ProxyStatus.HEALTHY
            ]

            if not healthy_proxies:
                logger.warning("没有可用的健康代理")
                return None

            # 轮换代理
            proxy_info = healthy_proxies[self.current_index % len(healthy_proxies)]
            self.current_index += 1

            proxy_url = proxy_info.url
            self.current_proxy = proxy_url
            proxy_info.last_used = time.time()

            logger.debug(f"使用代理: {proxy_url}")
            return proxy_url

    def get_proxy_dict(self) -> Optional[Dict[str, str]]:
        """
        获取代理字典（用于requests）

        Returns:
            代理字典，如 {'http': 'http://proxy:port', 'https': 'http://proxy:port'}
        """
        proxy_url = self.get_proxy()
        if not proxy_url:
            return None

        # 解析代理URL
        parsed = proxy_url.replace('://', '://')  # 确保格式正确

        return {
            'http': proxy_url,
            'https': proxy_url
        }

    def mark_success(self, proxy_url: str, response_time: float = 0):
        """
        标记代理成功

        Args:
            proxy_url: 代理URL
            response_time: 响应时间（秒）
        """
        with self.lock:
            if proxy_url not in self.proxies:
                return

            proxy_info = self.proxies[proxy_url]
            proxy_info.status = ProxyStatus.HEALTHY
            proxy_info.failure_count = 0
            proxy_info.response_time = response_time
            proxy_info.last_used = time.time()

            self.stats['successful_requests'] += 1
            self.stats['total_requests'] += 1

            logger.debug(f"代理成功: {proxy_url}")

    def mark_failed(self, proxy_url: str, error: str):
        """
        标记代理失败

        Args:
            proxy_url: 代理URL
            error: 错误信息
        """
        with self.lock:
            if proxy_url not in self.proxies:
                return

            proxy_info = self.proxies[proxy_url]
            proxy_info.failure_count += 1

            # 检查是否达到最大失败次数
            if proxy_info.failure_count >= self.max_failures:
                proxy_info.status = ProxyStatus.FAILED
                logger.warning(f"代理已标记为失败: {proxy_url} (失败次数: {proxy_info.failure_count})")
            else:
                logger.warning(f"代理失败: {proxy_url} (失败次数: {proxy_info.failure_count})")

            self.stats['failed_requests'] += 1
            self.stats['total_requests'] += 1

            # 轮换代理
            if self.rotate_on_failure and self.current_proxy == proxy_url:
                self.rotate()
                self.stats['proxy_rotations'] += 1

    def rotate(self):
        """轮换代理"""
        with self.lock:
            self.current_index = (self.current_index + 1) % len(self.proxies)
            logger.info("代理已轮换")

    def verify_proxy(self, proxy_url: str, timeout: int = 10) -> bool:
        """
        验证代理可用性

        Args:
            proxy_url: 代理URL
            timeout: 超时时间（秒）

        Returns:
            是否可用
        """
        if proxy_url not in self.proxies:
            logger.warning(f"代理不存在: {proxy_url}")
            return False

        proxy_info = self.proxies[proxy_url]
        proxy_info.status = ProxyStatus.TESTING

        try:
            proxy_dict = {
                'http': proxy_url,
                'https': proxy_url
            }

            start_time = time.time()
            response = requests.get(
                self.test_url,
                proxies=proxy_dict,
                timeout=timeout
            )
            response_time = time.time() - start_time

            if response.status_code == 200:
                proxy_info.status = ProxyStatus.HEALTHY
                proxy_info.response_time = response_time
                proxy_info.last_verified = time.time()
                proxy_info.failure_count = 0

                logger.info(f"代理验证成功: {proxy_url} (响应时间: {response_time:.2f}s)")
                return True
            else:
                raise Exception(f"状态码: {response.status_code}")

        except Exception as e:
            proxy_info.status = ProxyStatus.FAILED
            proxy_info.failure_count += 1
            logger.error(f"代理验证失败: {proxy_url}, 错误: {e}")
            return False

    def verify_all_proxies(self, timeout: int = 10) -> Dict[str, bool]:
        """
        验证所有代理

        Args:
            timeout: 超时时间（秒）

        Returns:
            验证结果字典 {proxy_url: is_healthy}
        """
        results = {}

        for proxy_url in self.proxies.keys():
            results[proxy_url] = self.verify_proxy(proxy_url, timeout)

        return results

    def get_healthy_proxies(self) -> List[str]:
        """获取健康的代理列表"""
        with self.lock:
            return [
                proxy_info.url
                for proxy_info in self.proxies.values()
                if proxy_info.status == ProxyStatus.HEALTHY
            ]

    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        with self.lock:
            healthy_count = len(self.get_healthy_proxies())
            failed_count = len(self.get_healthy_proxies())

            return {
                **self.stats,
                'total_proxies': len(self.proxies),
                'healthy_proxies': healthy_count,
                'failed_proxies': failed_count,
                'current_proxy': self.current_proxy,
                'success_rate': self.stats['successful_requests'] / max(self.stats['total_requests'], 1)
            }

    def get_proxy_info(self, proxy_url: str) -> Optional[ProxyInfo]:
        """获取代理信息"""
        return self.proxies.get(proxy_url)

    def remove_proxy(self, proxy_url: str):
        """移除代理"""
        with self.lock:
            if proxy_url in self.proxies:
                del self.proxies[proxy_url]
                logger.info(f"代理已移除: {proxy_url}")

    def add_proxy(self, proxy_url: str):
        """添加代理"""
        with self.lock:
            if proxy_url not in self.proxies:
                self.proxies[proxy_url] = ProxyInfo(url=proxy_url)
                logger.info(f"代理已添加: {proxy_url}")
            else:
                logger.warning(f"代理已存在: {proxy_url}")

    def cleanup_failed_proxies(self, max_age: int = 3600):
        """
        清理失败的代理

        Args:
            max_age: 最大保留时间（秒）
        """
        cutoff_time = time.time() - max_age
        to_remove = []

        with self.lock:
            for proxy_url, proxy_info in self.proxies.items():
                if (proxy_info.status == ProxyStatus.FAILED and
                    proxy_info.last_verified < cutoff_time):
                    to_remove.append(proxy_url)

            for proxy_url in to_remove:
                del self.proxies[proxy_url]
                logger.info(f"清理失败的代理: {proxy_url}")

        logger.info(f"清理了 {len(to_remove)} 个失败的代理")


# 使用示例
if __name__ == '__main__':
    # 示例代理列表（请替换为您的合法代理）
    proxy_list = [
        # 'http://proxy1.example.com:8080',
        # 'http://proxy2.example.com:8080',
        # 'http://proxy3.example.com:8080',
    ]

    if not proxy_list:
        print("没有配置代理列表")
        print("请在 proxy_list 中添加您的合法代理")
        print("\n合规使用提示:")
        print("- 代理用于合法用途：访问速率控制、区域适配、企业内网穿透")
        print("- 确保代理来源合法，有书面授权")
        print("- 遵守目标网站的服务条款")
        print("- 不使用代理进行非法活动")
        exit(0)

    # 创建代理管理器
    proxy_manager = ProxyManager(
        proxy_list=proxy_list,
        verify_interval=300,
        max_failures=3,
        rotate_on_failure=True
    )

    # 验证所有代理
    print("验证所有代理...")
    results = proxy_manager.verify_all_proxies(timeout=5)
    for proxy_url, is_healthy in results.items():
        status = "✓ 健康" if is_healthy else "✗ 失败"
        print(f"  {proxy_url}: {status}")

    # 获取健康代理
    healthy_proxies = proxy_manager.get_healthy_proxies()
    print(f"\n健康的代理: {len(healthy_proxies)}/{len(proxy_list)}")

    # 获取代理
    print("\n获取代理:")
    proxy_dict = proxy_manager.get_proxy_dict()
    print(f"  代理字典: {proxy_dict}")

    # 使用代理请求
    if proxy_dict:
        try:
            print("\n使用代理请求...")
            response = requests.get('http://httpbin.org/ip', proxies=proxy_dict, timeout=10)
            print(f"  响应: {response.json()}")

            # 标记成功
            proxy_manager.mark_success(proxy_dict['http'], response_time=1.0)
        except Exception as e:
            print(f"  请求失败: {e}")

            # 标记失败
            proxy_manager.mark_failed(proxy_dict['http'], str(e))

    # 查看统计
    print(f"\n统计信息: {proxy_manager.get_stats()}")

    print("\n合规使用提示:")
    print("- 代理用于合法用途：访问速率控制、区域适配、企业内网穿透")
    print("- 确保代理来源合法，有书面授权")
    print("- 遵守目标网站的服务条款")
    print("- 不使用代理进行非法活动")
