#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多线程并发爬取模块
支持线程池管理、速率限制、任务调度
"""

import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from queue import PriorityQueue, Empty
from dataclasses import dataclass, field
from typing import Callable, Optional, Dict, Any
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class TaskPriority(Enum):
    """任务优先级"""
    HIGH = 1
    MEDIUM = 2
    LOW = 3


@dataclass(order=True)
class CrawlTask:
    """爬取任务"""
    priority: int = field(compare=True)
    task_id: str = field(compare=False)
    url: str = field(compare=False)
    callback: Callable = field(compare=False)
    kwargs: Dict[str, Any] = field(default_factory=dict, compare=False)
    retries: int = field(default=0, compare=False)
    max_retries: int = field(default=3, compare=False)


class RateLimiter:
    """速率限制器 - 令牌桶算法"""

    def __init__(self, rate_limit: float):
        """
        初始化速率限制器

        Args:
            rate_limit: 速率限制（请求/秒）
        """
        self.rate_limit = rate_limit
        self.tokens = rate_limit
        self.last_update = time.time()
        self.lock = threading.Lock()

    def acquire(self, blocking: bool = True, timeout: Optional[float] = None) -> bool:
        """
        获取令牌

        Args:
            blocking: 是否阻塞等待
            timeout: 超时时间

        Returns:
            是否成功获取令牌
        """
        with self.lock:
            now = time.time()
            # 计算新令牌
            elapsed = now - self.last_update
            self.tokens = min(self.rate_limit, self.tokens + elapsed * self.rate_limit)
            self.last_update = now

            if self.tokens >= 1:
                self.tokens -= 1
                return True

            if not blocking:
                return False

            # 计算等待时间
            wait_time = (1 - self.tokens) / self.rate_limit

            if timeout is not None and wait_time > timeout:
                return False

            # 等待令牌
            self.lock.release()
            time.sleep(wait_time)
            self.lock.acquire()

            now = time.time()
            elapsed = now - self.last_update
            self.tokens = min(self.rate_limit, self.tokens + elapsed * self.rate_limit)
            self.last_update = now

            if self.tokens >= 1:
                self.tokens -= 1
                return True

            return False


class ConcurrentCrawler:
    """并发爬虫"""

    def __init__(
        self,
        max_workers: int = 10,
        rate_limit: float = 2.0,
        queue_size: int = 1000,
        task_timeout: int = 30
    ):
        """
        初始化并发爬虫

        Args:
            max_workers: 最大线程数
            rate_limit: 速率限制（请求/秒）
            queue_size: 队列大小
            task_timeout: 任务超时时间（秒）
        """
        self.max_workers = max_workers
        self.rate_limiter = RateLimiter(rate_limit)
        self.queue_size = queue_size
        self.task_timeout = task_timeout

        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.task_queue = PriorityQueue(maxsize=queue_size)
        self.running = False
        self.worker_thread = None

        # 统计信息
        self.stats = {
            'total_tasks': 0,
            'completed_tasks': 0,
            'failed_tasks': 0,
            'skipped_tasks': 0
        }
        self.stats_lock = threading.Lock()

    def submit_task(
        self,
        task_id: str,
        url: str,
        callback: Callable,
        priority: TaskPriority = TaskPriority.MEDIUM,
        **kwargs
    ) -> bool:
        """
        提交爬取任务

        Args:
            task_id: 任务ID
            url: 目标URL
            callback: 回调函数
            priority: 任务优先级
            **kwargs: 其他参数

        Returns:
            是否成功提交
        """
        try:
            task = CrawlTask(
                priority=priority.value,
                task_id=task_id,
                url=url,
                callback=callback,
                kwargs=kwargs
            )
            self.task_queue.put(task, timeout=5)

            with self.stats_lock:
                self.stats['total_tasks'] += 1

            logger.info(f"任务已提交: {task_id} ({url})")
            return True

        except Exception as e:
            logger.error(f"提交任务失败: {task_id}, 错误: {e}")
            return False

    def _worker_loop(self):
        """工作线程循环"""
        while self.running:
            try:
                # 从队列获取任务
                task = self.task_queue.get(timeout=1)

                # 速率限制
                if not self.rate_limiter.acquire(blocking=True, timeout=10):
                    logger.warning(f"速率限制超时，跳过任务: {task.task_id}")
                    self.task_queue.task_done()

                    with self.stats_lock:
                        self.stats['skipped_tasks'] += 1

                    continue

                # 提交任务到线程池
                future = self.executor.submit(self._execute_task, task)

                # 标记任务完成
                self.task_queue.task_done()

            except Empty:
                continue
            except Exception as e:
                logger.error(f"工作线程错误: {e}")

    def _execute_task(self, task: CrawlTask):
        """执行任务"""
        try:
            logger.info(f"开始执行任务: {task.task_id}")

            # 调用回调函数
            result = task.callback(task.url, **task.kwargs)

            # 记录成功
            with self.stats_lock:
                self.stats['completed_tasks'] += 1

            logger.info(f"任务完成: {task.task_id}")
            return result

        except Exception as e:
            logger.error(f"任务执行失败: {task.task_id}, 错误: {e}")

            # 重试逻辑
            if task.retries < task.max_retries:
                task.retries += 1
                task.priority = task.priority  # 保持原优先级
                self.task_queue.put(task)
                logger.info(f"任务重试 ({task.retries}/{task.max_retries}): {task.task_id}")
            else:
                with self.stats_lock:
                    self.stats['failed_tasks'] += 1
                logger.error(f"任务最终失败: {task.task_id}")

            return None

    def start(self):
        """启动爬虫"""
        if self.running:
            logger.warning("爬虫已在运行")
            return

        self.running = True
        self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        self.worker_thread.start()

        logger.info(f"并发爬虫已启动 (workers={self.max_workers}, rate_limit={self.rate_limiter.rate_limit})")

    def stop(self, wait: bool = True):
        """
        停止爬虫

        Args:
            wait: 是否等待任务完成
        """
        self.running = False

        if wait:
            logger.info("等待任务完成...")
            self.task_queue.join()

        self.executor.shutdown(wait=wait)

        if self.worker_thread:
            self.worker_thread.join(timeout=5)

        logger.info("并发爬虫已停止")

    def get_stats(self) -> Dict[str, int]:
        """获取统计信息"""
        with self.stats_lock:
            return {
                **self.stats,
                'queue_size': self.task_queue.qsize(),
                'active_threads': self.executor._work_queue.qsize()
            }

    def is_running(self) -> bool:
        """是否在运行"""
        return self.running

    def get_queue_size(self) -> int:
        """获取队列大小"""
        return self.task_queue.qsize()

    def clear_queue(self):
        """清空队列"""
        while not self.task_queue.empty():
            try:
                self.task_queue.get_nowait()
            except Empty:
                break

        logger.info("队列已清空")


# 使用示例
if __name__ == '__main__':
    import requests
    from bs4 import BeautifulSoup

    # 示例回调函数
    def crawl_callback(url: str) -> dict:
        """爬取回调函数"""
        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')

            return {
                'url': url,
                'status': response.status_code,
                'title': soup.title.string if soup.title else '',
                'success': True
            }

        except Exception as e:
            return {
                'url': url,
                'error': str(e),
                'success': False
            }

    # 创建并发爬虫
    crawler = ConcurrentCrawler(
        max_workers=5,
        rate_limit=2.0,
        queue_size=100
    )

    # 启动爬虫
    crawler.start()

    # 提交任务
    urls = [
        'https://example.com',
        'https://example.org',
        'https://example.net',
    ]

    for i, url in enumerate(urls):
        crawler.submit_task(
            task_id=f'task_{i}',
            url=url,
            callback=crawl_callback,
            priority=TaskPriority.HIGH if i == 0 else TaskPriority.MEDIUM
        )

    # 等待任务完成
    import time
    while crawler.get_queue_size() > 0 or any(
        crawler.stats['completed_tasks'] + crawler.stats['failed_tasks'] < crawler.stats['total_tasks']
        for _ in [0]
    ):
        print(f"统计: {crawler.get_stats()}")
        time.sleep(1)

    # 停止爬虫
    crawler.stop()

    # 最终统计
    print(f"最终统计: {crawler.get_stats()}")
