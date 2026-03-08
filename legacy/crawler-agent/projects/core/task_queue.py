#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Redis任务队列系统
支持分布式任务分发、任务持久化、失败重试
"""

import json
import time
import uuid
import threading
from typing import Dict, List, Optional, Any
from enum import Enum
import logging

try:
    import redis
except ImportError:
    redis = None
    logging.warning("Redis未安装，Redis任务队列功能将不可用")

logger = logging.getLogger(__name__)


class TaskStatus(Enum):
    """任务状态"""
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'
    RETRY = 'retry'


class TaskPriority(Enum):
    """任务优先级"""
    HIGH = 1
    MEDIUM = 2
    LOW = 3


class TaskQueue:
    """Redis任务队列"""

    def __init__(
        self,
        redis_url: str = 'redis://localhost:6379/0',
        queue_name: str = 'crawler_tasks',
        max_retries: int = 3,
        retry_delay: int = 60
    ):
        """
        初始化任务队列

        Args:
            redis_url: Redis连接URL
            queue_name: 队列名称
            max_retries: 最大重试次数
            retry_delay: 重试延迟（秒）
        """
        self.redis_url = redis_url
        self.queue_name = queue_name
        self.status_queue = f"{queue_name}:status"
        self.retry_queue = f"{queue_name}:retry"
        self.max_retries = max_retries
        self.retry_delay = retry_delay

        if redis is None:
            raise ImportError("Redis未安装，请安装redis包: pip install redis")

        self.redis = redis.from_url(redis_url, decode_responses=True)
        self.lock = threading.Lock()

        # 测试连接
        try:
            self.redis.ping()
            logger.info(f"Redis连接成功: {redis_url}")
        except Exception as e:
            logger.error(f"Redis连接失败: {e}")
            raise

    def push_task(
        self,
        url: str,
        task_type: str = 'crawl',
        priority: TaskPriority = TaskPriority.MEDIUM,
        **kwargs
    ) -> str:
        """
        推送任务到队列

        Args:
            url: 目标URL
            task_type: 任务类型
            priority: 任务优先级
            **kwargs: 其他参数

        Returns:
            任务ID
        """
        task_id = str(uuid.uuid4())

        task = {
            'task_id': task_id,
            'url': url,
            'task_type': task_type,
            'priority': priority.value,
            'status': TaskStatus.PENDING.value,
            'created_at': int(time.time()),
            'retries': 0,
            'kwargs': kwargs
        }

        try:
            # 推送到队列
            self.redis.rpush(self.queue_name, json.dumps(task))

            # 保存状态
            self._save_status(task_id, task)

            logger.info(f"任务已推送到队列: {task_id} ({url})")
            return task_id

        except Exception as e:
            logger.error(f"推送任务失败: {task_id}, 错误: {e}")
            raise

    def pop_task(self, timeout: int = 10) -> Optional[Dict[str, Any]]:
        """
        从队列获取任务（阻塞）

        Args:
            timeout: 超时时间（秒）

        Returns:
            任务字典，超时返回None
        """
        try:
            # 从队列左侧弹出任务
            result = self.redis.blpop(self.queue_name, timeout=timeout)

            if not result:
                return None

            _, task_json = result
            task = json.loads(task_json)

            # 更新状态为运行中
            task['status'] = TaskStatus.RUNNING.value
            task['started_at'] = int(time.time())
            self._save_status(task['task_id'], task)

            logger.info(f"任务已弹出: {task['task_id']} ({task['url']})")
            return task

        except Exception as e:
            logger.error(f"弹出任务失败: {e}")
            return None

    def complete_task(self, task_id: str, result: Optional[Dict] = None):
        """
        标记任务完成

        Args:
            task_id: 任务ID
            result: 任务结果
        """
        task = self._load_status(task_id)
        if not task:
            logger.warning(f"任务不存在: {task_id}")
            return

        task['status'] = TaskStatus.COMPLETED.value
        task['completed_at'] = int(time.time())
        if result:
            task['result'] = result

        self._save_status(task_id, task)
        logger.info(f"任务已完成: {task_id}")

    def fail_task(self, task_id: str, error: str):
        """
        标记任务失败

        Args:
            task_id: 任务ID
            error: 错误信息
        """
        task = self._load_status(task_id)
        if not task:
            logger.warning(f"任务不存在: {task_id}")
            return

        task['retries'] += 1
        task['error'] = error
        task['failed_at'] = int(time.time())

        # 检查是否需要重试
        if task['retries'] < self.max_retries:
            task['status'] = TaskStatus.RETRY.value

            # 推送到重试队列
            self.redis.zadd(
                self.retry_queue,
                {task_id: int(time.time()) + self.retry_delay}
            )

            logger.info(f"任务重试 ({task['retries']}/{self.max_retries}): {task_id}")
        else:
            task['status'] = TaskStatus.FAILED.value
            logger.error(f"任务最终失败: {task_id}, 错误: {error}")

        self._save_status(task_id, task)

    def retry_failed_tasks(self, limit: int = 10) -> int:
        """
        重试失败的任务

        Args:
            limit: 最多重试数量

        Returns:
            重试的任务数
        """
        now = int(time.time())
        retry_count = 0

        try:
            # 获取到期的重试任务
            task_ids = self.redis.zrangebyscore(
                self.retry_queue,
                0,
                now,
                start=0,
                num=limit
            )

            for task_id in task_ids:
                task = self._load_status(task_id)
                if not task or task['status'] != TaskStatus.RETRY.value:
                    self.redis.zrem(self.retry_queue, task_id)
                    continue

                # 重置任务状态
                task['status'] = TaskStatus.PENDING.value
                task['retries'] = 0

                # 重新推送到队列
                self.redis.rpush(self.queue_name, json.dumps(task))
                self._save_status(task_id, task)

                # 从重试队列移除
                self.redis.zrem(self.retry_queue, task_id)

                retry_count += 1
                logger.info(f"任务已重试: {task_id}")

            return retry_count

        except Exception as e:
            logger.error(f"重试失败任务出错: {e}")
            return retry_count

    def _save_status(self, task_id: str, task: Dict[str, Any]):
        """保存任务状态"""
        key = f"{self.status_queue}:{task_id}"
        self.redis.setex(key, 86400, json.dumps(task))  # 24小时过期

    def _load_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """加载任务状态"""
        key = f"{self.status_queue}:{task_id}"
        task_json = self.redis.get(key)

        if not task_json:
            return None

        return json.loads(task_json)

    def get_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        获取任务状态

        Args:
            task_id: 任务ID

        Returns:
            任务状态字典
        """
        return self._load_status(task_id)

    def get_queue_stats(self) -> Dict[str, int]:
        """获取队列统计"""
        try:
            return {
                'queue_size': self.redis.llen(self.queue_name),
                'retry_queue_size': self.redis.zcard(self.retry_queue),
                'pending_count': self._count_by_status(TaskStatus.PENDING),
                'running_count': self._count_by_status(TaskStatus.RUNNING),
                'completed_count': self._count_by_status(TaskStatus.COMPLETED),
                'failed_count': self._count_by_status(TaskStatus.FAILED),
                'retry_count': self._count_by_status(TaskStatus.RETRY)
            }
        except Exception as e:
            logger.error(f"获取队列统计失败: {e}")
            return {}

    def _count_by_status(self, status: TaskStatus) -> int:
        """统计指定状态的任务数"""
        count = 0
        pattern = f"{self.status_queue}:*"

        try:
            for key in self.redis.scan_iter(match=pattern):
                task_json = self.redis.get(key)
                if task_json:
                    task = json.loads(task_json)
                    if task.get('status') == status.value:
                        count += 1
        except Exception as e:
            logger.error(f"统计任务状态失败: {e}")

        return count

    def clear_queue(self):
        """清空队列"""
        try:
            self.redis.delete(self.queue_name)
            self.redis.delete(self.retry_queue)

            # 清除所有状态
            pattern = f"{self.status_queue}:*"
            for key in self.redis.scan_iter(match=pattern):
                self.redis.delete(key)

            logger.info("队列已清空")

        except Exception as e:
            logger.error(f"清空队列失败: {e}")

    def cleanup_old_status(self, hours: int = 24):
        """
        清理旧的任务状态

        Args:
            hours: 保留时间（小时）
        """
        cutoff_time = int(time.time()) - hours * 3600
        count = 0

        try:
            pattern = f"{self.status_queue}:*"
            for key in self.redis.scan_iter(match=pattern):
                task_json = self.redis.get(key)
                if task_json:
                    task = json.loads(task_json)
                    created_at = task.get('created_at', 0)

                    if created_at < cutoff_time:
                        self.redis.delete(key)
                        count += 1

            logger.info(f"清理了 {count} 个旧任务状态")

        except Exception as e:
            logger.error(f"清理旧任务状态失败: {e}")

    def close(self):
        """关闭连接"""
        if self.redis:
            self.redis.close()
            logger.info("Redis连接已关闭")


# 使用示例
if __name__ == '__main__':
    # 创建任务队列
    try:
        queue = TaskQueue(
            redis_url='redis://localhost:6379/0',
            queue_name='crawler_tasks'
        )

        # 推送任务
        task_ids = []
        urls = [
            'https://example.com',
            'https://example.org',
            'https://example.net',
        ]

        for url in urls:
            task_id = queue.push_task(
                url=url,
                task_type='crawl',
                priority=TaskPriority.HIGH,
                custom_param='value'
            )
            task_ids.append(task_id)
            print(f"推送任务: {task_id}")

        # 获取队列统计
        print(f"队列统计: {queue.get_queue_stats()}")

        # 消费任务
        print("\n开始消费任务...")
        for _ in range(len(urls)):
            task = queue.pop_task(timeout=5)
            if task:
                print(f"获取任务: {task['task_id']} ({task['url']})")

                # 模拟任务执行
                import time
                time.sleep(1)

                # 标记完成
                queue.complete_task(task['task_id'], {'success': True})

        # 查看状态
        for task_id in task_ids:
            status = queue.get_status(task_id)
            print(f"任务状态 {task_id}: {status}")

        # 队列统计
        print(f"\n最终队列统计: {queue.get_queue_stats()}")

        # 关闭连接
        queue.close()

    except Exception as e:
        print(f"错误: {e}")
        print("\n提示: 请确保Redis服务已启动")
        print("启动Redis: docker run -d -p 6379:6379 redis")
