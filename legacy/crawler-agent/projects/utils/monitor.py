#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
监控告警系统
支持日志监控、性能监控、异常告警
"""

import time
import threading
import logging
from typing import Dict, List, Callable, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict, deque
import json

logger = logging.getLogger(__name__)


class AlertLevel(Enum):
    """告警级别"""
    INFO = 'info'
    WARNING = 'warning'
    ERROR = 'error'
    CRITICAL = 'critical'


@dataclass
class Alert:
    """告警"""
    level: AlertLevel
    name: str
    message: str
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)


class Metrics:
    """指标收集器"""

    def __init__(self):
        """初始化指标"""
        self.counters = defaultdict(int)      # 计数器
        self.gauges = defaultdict(float)      # 仪表盘
        self.histograms = defaultdict(list)   # 直方图（用于统计分布）
        self.lock = threading.Lock()

    def increment(self, name: str, value: int = 1):
        """增加计数器"""
        with self.lock:
            self.counters[name] += value

    def decrement(self, name: str, value: int = 1):
        """减少计数器"""
        with self.lock:
            self.counters[name] -= value

    def set_gauge(self, name: str, value: float):
        """设置仪表盘"""
        with self.lock:
            self.gauges[name] = value

    def record_timing(self, name: str, value: float):
        """记录时间"""
        with self.lock:
            self.histograms[name].append(value)

    def get_counter(self, name: str) -> int:
        """获取计数器"""
        with self.lock:
            return self.counters.get(name, 0)

    def get_gauge(self, name: str) -> float:
        """获取仪表盘"""
        with self.lock:
            return self.gauges.get(name, 0.0)

    def get_histogram_stats(self, name: str) -> Dict[str, float]:
        """获取直方图统计"""
        with self.lock:
            values = self.histograms.get(name, [])

            if not values:
                return {}

            values.sort()
            length = len(values)

            return {
                'count': length,
                'min': values[0],
                'max': values[-1],
                'avg': sum(values) / length,
                'p50': values[length // 2],
                'p95': values[int(length * 0.95)],
                'p99': values[int(length * 0.99)]
            }

    def get_all_metrics(self) -> Dict[str, Any]:
        """获取所有指标"""
        with self.lock:
            return {
                'counters': dict(self.counters),
                'gauges': dict(self.gauges),
                'histograms': {
                    name: self.get_histogram_stats(name)
                    for name in self.histograms
                }
            }

    def reset(self):
        """重置指标"""
        with self.lock:
            self.counters.clear()
            self.gauges.clear()
            self.histograms.clear()


class AlertRule:
    """告警规则"""

    def __init__(
        self,
        name: str,
        condition: Callable[[Dict[str, Any]], bool],
        level: AlertLevel,
        message_template: str
    ):
        """
        初始化告警规则

        Args:
            name: 规则名称
            condition: 条件函数
            level: 告警级别
            message_template: 消息模板
        """
        self.name = name
        self.condition = condition
        self.level = level
        self.message_template = message_template


class Monitor:
    """监控器"""

    def __init__(self):
        """初始化监控器"""
        self.metrics = Metrics()
        self.alerts: deque = deque(maxlen=1000)
        self.alert_rules: List[AlertRule] = []
        self.alert_callbacks: List[Callable[[Alert], None]] = []
        self.lock = threading.Lock()

        # 默认告警规则
        self._init_default_rules()

    def _init_default_rules(self):
        """初始化默认告警规则"""
        # 高失败率告警
        self.add_alert_rule(
            AlertRule(
                name='high_failure_rate',
                condition=lambda m: self._calculate_failure_rate(m) > 0.5,
                level=AlertLevel.WARNING,
                message_template='失败率过高: {failure_rate:.2%}'
            )
        )

        # 慢响应告警
        self.add_alert_rule(
            AlertRule(
                name='slow_response',
                condition=lambda m: self._get_avg_response_time(m) > 10,
                level=AlertLevel.WARNING,
                message_template='响应过慢: {avg_response_time:.2f}s'
            )
        )

        # 队列满告警
        self.add_alert_rule(
            AlertRule(
                name='queue_full',
                condition=lambda m: m.get('gauges', {}).get('queue_size', 0) > m.get('gauges', {}).get('queue_capacity', 100) * 0.9,
                level=AlertLevel.WARNING,
                message_template='队列接近满: {queue_size}/{queue_capacity}'
            )
        )

    def _calculate_failure_rate(self, metrics: Dict[str, Any]) -> float:
        """计算失败率"""
        total_tasks = metrics.get('counters', {}).get('total_tasks', 0)
        failed_tasks = metrics.get('counters', {}).get('failed_tasks', 0)

        if total_tasks == 0:
            return 0.0

        return failed_tasks / total_tasks

    def _get_avg_response_time(self, metrics: Dict[str, Any]) -> float:
        """获取平均响应时间"""
        histogram = metrics.get('histograms', {}).get('response_time', {})
        return histogram.get('avg', 0.0)

    def add_alert_rule(self, rule: AlertRule):
        """
        添加告警规则

        Args:
            rule: 告警规则
        """
        self.alert_rules.append(rule)
        logger.info(f"告警规则已添加: {rule.name}")

    def remove_alert_rule(self, name: str):
        """
        移除告警规则

        Args:
            name: 规则名称
        """
        self.alert_rules = [r for r in self.alert_rules if r.name != name]
        logger.info(f"告警规则已移除: {name}")

    def register_alert_callback(self, callback: Callable[[Alert], None]):
        """
        注册告警回调

        Args:
            callback: 回调函数
        """
        self.alert_callbacks.append(callback)
        logger.info(f"告警回调已注册: {callback.__name__}")

    def check_alerts(self):
        """检查告警"""
        metrics = self.metrics.get_all_metrics()

        for rule in self.alert_rules:
            try:
                if rule.condition(metrics):
                    # 格式化消息
                    message = rule.message_template.format(**metrics, **{
                        'failure_rate': self._calculate_failure_rate(metrics),
                        'avg_response_time': self._get_avg_response_time(metrics)
                    })

                    alert = Alert(
                        level=rule.level,
                        name=rule.name,
                        message=message,
                        metadata={'metrics': metrics}
                    )

                    self._trigger_alert(alert)

            except Exception as e:
                logger.error(f"检查告警规则失败 ({rule.name}): {e}")

    def _trigger_alert(self, alert: Alert):
        """
        触发告警

        Args:
            alert: 告警对象
        """
        with self.lock:
            self.alerts.append(alert)

        # 调用回调
        for callback in self.alert_callbacks:
            try:
                callback(alert)
            except Exception as e:
                logger.error(f"告警回调失败: {e}")

        # 记录日志
        log_level = {
            AlertLevel.INFO: logger.info,
            AlertLevel.WARNING: logger.warning,
            AlertLevel.ERROR: logger.error,
            AlertLevel.CRITICAL: logger.critical
        }.get(alert.level, logger.info)

        log_level(f"[{alert.level.value.upper()}] {alert.name}: {alert.message}")

    def get_metrics(self) -> Dict[str, Any]:
        """获取指标"""
        return self.metrics.get_all_metrics()

    def get_alerts(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
       获取告警列表

        Args:
            limit: 限制数量

        Returns:
            告警列表
        """
        with self.lock:
            alerts = list(self.alerts)[-limit:]
            return [
                {
                    'level': alert.level.value,
                    'name': alert.name,
                    'message': alert.message,
                    'timestamp': alert.timestamp,
                    'metadata': alert.metadata
                }
                for alert in alerts
            ]

    def record_task_start(self):
        """记录任务开始"""
        self.metrics.increment('total_tasks')

    def record_task_success(self, response_time: float = 0):
        """
        记录任务成功

        Args:
            response_time: 响应时间
        """
        self.metrics.increment('successful_tasks')
        if response_time > 0:
            self.metrics.record_timing('response_time', response_time)

    def record_task_failure(self, error: str):
        """
        记录任务失败

        Args:
            error: 错误信息
        """
        self.metrics.increment('failed_tasks')

        # 触发错误告警
        alert = Alert(
            level=AlertLevel.ERROR,
            name='task_failure',
            message=f'任务失败: {error}'
        )
        self._trigger_alert(alert)

    def record_queue_size(self, size: int, capacity: int):
        """
        记录队列大小

        Args:
            size: 当前大小
            capacity: 容量
        """
        self.metrics.set_gauge('queue_size', size)
        self.metrics.set_gauge('queue_capacity', capacity)

    def start_monitoring(self, interval: int = 10):
        """
        开始监控

        Args:
            interval: 检查间隔（秒）
        """
        def monitor_loop():
            while True:
                try:
                    self.check_alerts()
                    time.sleep(interval)
                except Exception as e:
                    logger.error(f"监控循环错误: {e}")
                    time.sleep(interval)

        thread = threading.Thread(target=monitor_loop, daemon=True)
        thread.start()
        logger.info(f"监控已启动 (间隔: {interval}s)")

    def get_monitoring_summary(self) -> Dict[str, Any]:
        """获取监控摘要"""
        metrics = self.get_metrics()
        recent_alerts = self.get_alerts(limit=10)

        return {
            'metrics': metrics,
            'recent_alerts': recent_alerts,
            'alert_count': len(recent_alerts),
            'health_status': self._calculate_health_status(metrics)
        }

    def _calculate_health_status(self, metrics: Dict[str, Any]) -> str:
        """计算健康状态"""
        failure_rate = self._calculate_failure_rate(metrics)
        avg_response_time = self._get_avg_response_time(metrics)

        if failure_rate > 0.5 or avg_response_time > 30:
            return 'unhealthy'
        elif failure_rate > 0.2 or avg_response_time > 10:
            return 'degraded'
        else:
            return 'healthy'


class LogMonitor:
    """日志监控器"""

    def __init__(self, log_level: int = logging.WARNING):
        """
        初始化日志监控器

        Args:
            log_level: 监控的日志级别
        """
        self.log_level = log_level
        self.alert_callbacks: List[Callable[[str, str, str], None]] = []
        self.lock = threading.Lock()

    def add_alert_callback(self, callback: Callable[[str, str, str], None]):
        """
        添加告警回调

        Args:
            callback: 回调函数 (level, message, logger_name)
        """
        self.alert_callbacks.append(callback)
        logger.info(f"日志监控回调已注册: {callback.__name__}")

    def check_log_handler(self, record: logging.LogRecord):
        """
        检查日志记录

        Args:
            record: 日志记录
        """
        if record.levelno >= self.log_level:
            for callback in self.alert_callbacks:
                try:
                    callback(
                        logging.getLevelName(record.levelno),
                        record.getMessage(),
                        record.name
                    )
                except Exception as e:
                    logger.error(f"日志监控回调失败: {e}")


# 使用示例
if __name__ == '__main__':
    print("=" * 60)
    print("监控告警系统示例")
    print("=" * 60)

    # 创建监控器
    monitor = Monitor()

    # 注册告警回调
    def on_alert(alert: Alert):
        print(f"\n[告警] {alert.level.value.upper()}: {alert.name}")
        print(f"  消息: {alert.message}")
        print(f"  时间: {alert.timestamp}")

    monitor.register_alert_callback(on_alert)

    # 模拟任务
    print("\n模拟任务执行...")

    for i in range(20):
        monitor.record_task_start()

        import random
        if random.random() > 0.7:  # 30%失败率
            monitor.record_task_failure("模拟失败")
        else:
            response_time = random.uniform(0.5, 15.0)  # 0.5-15秒响应时间
            monitor.record_task_success(response_time)

        time.sleep(0.1)

    # 查看指标
    metrics = monitor.get_metrics()
    print(f"\n指标:")
    print(json.dumps(metrics, indent=2, default=str))

    # 查看告警
    alerts = monitor.get_alerts(limit=10)
    print(f"\n最近告警: {len(alerts)} 个")
    for alert in alerts:
        print(f"  [{alert['level']}] {alert['name']}: {alert['message']}")

    # 监控摘要
    summary = monitor.get_monitoring_summary()
    print(f"\n监控摘要:")
    print(f"  健康状态: {summary['health_status']}")
    print(f"  告警数量: {summary['alert_count']}")
    print(f"  成功率: {100 * (1 - monitor._calculate_failure_rate(metrics)):.1f}%")
    print(f"  平均响应时间: {monitor._get_avg_response_time(metrics):.2f}s")

    print("\n监控告警系统示例完成")
