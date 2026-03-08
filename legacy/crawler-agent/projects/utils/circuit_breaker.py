#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
熔断降级机制
支持健康检查、自动熔断、降级策略
"""

import time
import threading
from typing import Callable, Optional, Any
from enum import Enum
from collections import deque
import logging

logger = logging.getLogger(__name__)


class CircuitState(Enum):
    """熔断器状态"""
    CLOSED = 'closed'      # 关闭（正常）
    OPEN = 'open'          # 开启（熔断）
    HALF_OPEN = 'half_open'  # 半开（尝试恢复）


class CircuitBreaker:
    """熔断器"""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        half_open_max_calls: int = 3,
        sliding_window_size: int = 10
    ):
        """
        初始化熔断器

        Args:
            failure_threshold: 失败阈值
            recovery_timeout: 恢复超时（秒）
            half_open_max_calls: 半开状态最大调用次数
            sliding_window_size: 滑动窗口大小
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls
        self.sliding_window_size = sliding_window_size

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0
        self.half_open_calls = 0

        # 滑动窗口（记录最近N次调用的结果）
        self.call_history = deque(maxlen=sliding_window_size)

        self.lock = threading.Lock()

        logger.info(f"熔断器已初始化 (failure_threshold={failure_threshold}, recovery_timeout={recovery_timeout}s)")

    def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        调用函数（带熔断保护）

        Args:
            func: 要调用的函数
            *args: 位置参数
            **kwargs: 关键字参数

        Returns:
            函数返回值

        Raises:
            CircuitBreakerOpenError: 熔断器开启时抛出
        """
        if not self.can_attempt():
            raise CircuitBreakerOpenError("熔断器已开启，拒绝调用")

        try:
            start_time = time.time()
            result = func(*args, **kwargs)
            elapsed = time.time() - start_time

            self.record_success(elapsed)
            return result

        except Exception as e:
            self.record_failure()
            raise

    def can_attempt(self) -> bool:
        """
        是否可以尝试调用

        Returns:
            是否可以调用
        """
        with self.lock:
            # 检查是否需要从OPEN转换为HALF_OPEN
            if self.state == CircuitState.OPEN:
                if time.time() - self.last_failure_time >= self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    self.half_open_calls = 0
                    logger.info("熔断器转换到半开状态")
                    return True
                return False

            # 检查半开状态调用次数
            if self.state == CircuitState.HALF_OPEN:
                return self.half_open_calls < self.half_open_max_calls

            return True

    def record_success(self, response_time: float = 0):
        """
        记录成功

        Args:
            response_time: 响应时间
        """
        with self.lock:
            self.call_history.append(True)
            self.failure_count = 0

            if self.state == CircuitState.HALF_OPEN:
                self.half_open_calls += 1
                if self.half_open_calls >= self.half_open_max_calls:
                    self.state = CircuitState.CLOSED
                    logger.info("熔断器已关闭（恢复成功）")

            logger.debug(f"记录成功, 响应时间: {response_time:.2f}s")

    def record_failure(self):
        """记录失败"""
        with self.lock:
            self.call_history.append(False)
            self.failure_count += 1
            self.last_failure_time = time.time()

            # 检查是否需要开启熔断
            recent_failures = sum(1 for x in self.call_history if not x)

            if recent_failures >= self.failure_threshold:
                self.state = CircuitState.OPEN
                logger.warning(f"熔断器已开启 (失败次数: {recent_failures}/{self.failure_threshold})")

    def get_state(self) -> CircuitState:
        """获取当前状态"""
        with self.lock:
            return self.state

    def get_stats(self) -> dict:
        """获取统计信息"""
        with self.lock:
            if not self.call_history:
                return {
                    'state': self.state.value,
                    'failure_count': self.failure_count,
                    'total_calls': 0,
                    'success_rate': 0.0
                }

            success_count = sum(1 for x in self.call_history if x)
            total_calls = len(self.call_history)
            success_rate = success_count / total_calls

            return {
                'state': self.state.value,
                'failure_count': self.failure_count,
                'total_calls': total_calls,
                'success_rate': success_rate,
                'recent_failures': sum(1 for x in self.call_history if not x),
                'half_open_calls': self.half_open_calls
            }

    def reset(self):
        """重置熔断器"""
        with self.lock:
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.last_failure_time = 0
            self.half_open_calls = 0
            self.call_history.clear()

            logger.info("熔断器已重置")


class CircuitBreakerOpenError(Exception):
    """熔断器开启异常"""
    pass


class HealthChecker:
    """健康检查器"""

    def __init__(
        self,
        check_interval: int = 30,
        timeout: int = 10,
        unhealthy_threshold: int = 3
    ):
        """
        初始化健康检查器

        Args:
            check_interval: 检查间隔（秒）
            timeout: 超时时间（秒）
            unhealthy_threshold: 不健康阈值
        """
        self.check_interval = check_interval
        self.timeout = timeout
        self.unhealthy_threshold = unhealthy_threshold

        self.check_results = deque(maxlen=unhealthy_threshold)
        self.is_healthy = True

        self.check_callbacks = []
        self.lock = threading.Lock()

    def register_callback(self, callback: Callable[[bool], None]):
        """
        注册健康状态变化回调

        Args:
            callback: 回调函数
        """
        self.check_callbacks.append(callback)
        logger.info(f"健康检查回调已注册: {callback.__name__}")

    def check(self, check_func: Callable[[], bool]) -> bool:
        """
        执行健康检查

        Args:
            check_func: 检查函数

        Returns:
            是否健康
        """
        try:
            result = check_func()

            with self.lock:
                self.check_results.append(result)

                # 计算健康状态
                if len(self.check_results) >= self.unhealthy_threshold:
                    recent_results = list(self.check_results)[-self.unhealthy_threshold:]
                    is_healthy = all(recent_results)

                    if is_healthy != self.is_healthy:
                        self.is_healthy = is_healthy

                        # 触发回调
                        for callback in self.check_callbacks:
                            try:
                                callback(is_healthy)
                            except Exception as e:
                                logger.error(f"健康检查回调失败: {e}")

                        if is_healthy:
                            logger.info("健康状态: 健康")
                        else:
                            logger.warning("健康状态: 不健康")

            return result

        except Exception as e:
            logger.error(f"健康检查失败: {e}")
            with self.lock:
                self.check_results.append(False)
            return False

    def is_healthy(self) -> bool:
        """是否健康"""
        with self.lock:
            return self.is_healthy


class DegradationStrategy:
    """降级策略"""

    @staticmethod
    def fallback_value(default_value: Any) -> Callable[[], Any]:
        """
        降级到默认值

        Args:
            default_value: 默认值

        Returns:
            降级函数
        """
        def fallback():
            logger.info(f"降级到默认值: {default_value}")
            return default_value
        return fallback

    @staticmethod
    def fallback_cache(cache_key: str, cache: dict) -> Callable[[], Any]:
        """
        降级到缓存

        Args:
            cache_key: 缓存键
            cache: 缓存字典

        Returns:
            降级函数
        """
        def fallback():
            if cache_key in cache:
                logger.info(f"降级到缓存: {cache_key}")
                return cache[cache_key]
            else:
                logger.warning(f"缓存不存在: {cache_key}")
                raise DegradationError("缓存不存在")
        return fallback

    @staticmethod
    def fallback_empty() -> Callable[[], Any]:
        """
        降级到空值

        Returns:
            降级函数
        """
        def fallback():
            logger.info("降级到空值")
            return None
        return fallback


class DegradationError(Exception):
    """降级异常"""
    pass


# 使用示例
if __name__ == '__main__':
    # 示例1: 熔断器
    print("=" * 60)
    print("示例1: 熔断器")
    print("=" * 60)

    circuit_breaker = CircuitBreaker(
        failure_threshold=3,
        recovery_timeout=5
    )

    def failing_function():
        """会失败的函数"""
        raise Exception("模拟失败")

    def success_function():
        """成功的函数"""
        return "成功"

    # 测试失败
    for i in range(5):
        try:
            result = circuit_breaker.call(failing_function)
            print(f"调用 {i+1}: {result}")
        except CircuitBreakerOpenError as e:
            print(f"调用 {i+1}: 熔断器已开启")
        except Exception as e:
            print(f"调用 {i+1}: 失败 - {e}")

    print(f"熔断器状态: {circuit_breaker.get_state()}")
    print(f"统计信息: {circuit_breaker.get_stats()}")

    # 等待恢复
    print("\n等待恢复...")
    time.sleep(6)

    # 测试恢复
    for i in range(3):
        try:
            result = circuit_breaker.call(success_function)
            print(f"调用 {i+1}: {result}")
        except CircuitBreakerOpenError as e:
            print(f"调用 {i+1}: 熔断器已开启")

    print(f"熔断器状态: {circuit_breaker.get_state()}")
    print(f"统计信息: {circuit_breaker.get_stats()}")

    # 示例2: 健康检查
    print("\n" + "=" * 60)
    print("示例2: 健康检查")
    print("=" * 60)

    health_checker = HealthChecker(
        check_interval=1,
        unhealthy_threshold=3
    )

    def health_check():
        """健康检查函数"""
        import random
        return random.random() > 0.3  # 70%概率健康

    # 健康状态变化回调
    def on_health_change(is_healthy: bool):
        print(f"健康状态变化: {'健康' if is_healthy else '不健康'}")

    health_checker.register_callback(on_health_change)

    # 执行健康检查
    for i in range(10):
        is_healthy = health_checker.check(health_check)
        print(f"检查 {i+1}: {'健康' if is_healthy else '不健康'}")
        time.sleep(0.5)

    # 示例3: 降级策略
    print("\n" + "=" * 60)
    print("示例3: 降级策略")
    print("=" * 60)

    cache = {'data': '缓存数据'}

    # 使用降级
    try:
        result = circuit_breaker.call(failing_function)
    except (CircuitBreakerOpenError, Exception):
        # 降级到缓存
        fallback_func = DegradationStrategy.fallback_cache('data', cache)
        result = fallback_func()
        print(f"降级结果: {result}")
