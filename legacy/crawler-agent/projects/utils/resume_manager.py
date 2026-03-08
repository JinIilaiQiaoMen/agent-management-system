#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
断点续爬模块
支持进度持久化、状态恢复、失败重试
"""

import sqlite3
import json
import time
import threading
from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class TaskState(Enum):
    """任务状态"""
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'


class ResumeManager:
    """断点续爬管理器"""

    def __init__(self, db_path: str = 'crawler_state.db'):
        """
        初始化断点续爬管理器

        Args:
            db_path: 数据库文件路径
        """
        self.db_path = db_path
        self.lock = threading.Lock()
        self.init_db()

    def init_db(self):
        """初始化数据库"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # 创建任务表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    url TEXT NOT NULL,
                    status TEXT NOT NULL,
                    progress INTEGER DEFAULT 0,
                    total INTEGER DEFAULT 0,
                    retries INTEGER DEFAULT 0,
                    max_retries INTEGER DEFAULT 3,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    error TEXT,
                    metadata TEXT
                )
            ''')

            # 创建检查点表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS checkpoints (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    checkpoint_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks(id)
                )
            ''')

            # 创建索引
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_tasks_status
                ON tasks(status)
            ''')

            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_checkpoints_task
                ON checkpoints(task_id)
            ''')

            conn.commit()

        logger.info(f"数据库已初始化: {self.db_path}")

    def create_task(
        self,
        task_id: str,
        url: str,
        total: int = 0,
        max_retries: int = 3,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        创建任务

        Args:
            task_id: 任务ID
            url: 目标URL
            total: 总任务数
            max_retries: 最大重试次数
            metadata: 元数据

        Returns:
            是否成功
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO tasks (id, url, status, total, max_retries, metadata)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    task_id,
                    url,
                    TaskState.PENDING.value,
                    total,
                    max_retries,
                    json.dumps(metadata) if metadata else None
                ))
                conn.commit()

            logger.info(f"任务已创建: {task_id}")
            return True

        except sqlite3.IntegrityError:
            logger.warning(f"任务已存在: {task_id}")
            return False
        except Exception as e:
            logger.error(f"创建任务失败: {task_id}, 错误: {e}")
            return False

    def update_task(
        self,
        task_id: str,
        status: Optional[TaskState] = None,
        progress: Optional[int] = None,
        error: Optional[str] = None
    ) -> bool:
        """
        更新任务

        Args:
            task_id: 任务ID
            status: 任务状态
            progress: 进度
            error: 错误信息

        Returns:
            是否成功
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                updates = ['updated_at = CURRENT_TIMESTAMP']
                params = []

                if status is not None:
                    updates.append('status = ?')
                    params.append(status.value)

                    if status == TaskState.COMPLETED:
                        updates.append('completed_at = CURRENT_TIMESTAMP')

                if progress is not None:
                    updates.append('progress = ?')
                    params.append(progress)

                if error is not None:
                    updates.append('error = ?')
                    params.append(error)

                params.append(task_id)

                cursor.execute(f'''
                    UPDATE tasks
                    SET {', '.join(updates)}
                    WHERE id = ?
                ''', params)

                conn.commit()

            logger.debug(f"任务已更新: {task_id}")
            return True

        except Exception as e:
            logger.error(f"更新任务失败: {task_id}, 错误: {e}")
            return False

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        获取任务

        Args:
            task_id: 任务ID

        Returns:
            任务字典
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, url, status, progress, total, retries,
                           max_retries, created_at, updated_at,
                           completed_at, error, metadata
                    FROM tasks
                    WHERE id = ?
                ''', (task_id,))

                row = cursor.fetchone()
                if not row:
                    return None

                return {
                    'id': row[0],
                    'url': row[1],
                    'status': row[2],
                    'progress': row[3],
                    'total': row[4],
                    'retries': row[5],
                    'max_retries': row[6],
                    'created_at': row[7],
                    'updated_at': row[8],
                    'completed_at': row[9],
                    'error': row[10],
                    'metadata': json.loads(row[11]) if row[11] else None
                }

        except Exception as e:
            logger.error(f"获取任务失败: {task_id}, 错误: {e}")
            return None

    def get_tasks_by_status(self, status: TaskState) -> List[Dict[str, Any]]:
        """
        根据状态获取任务列表

        Args:
            status: 任务状态

        Returns:
            任务列表
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, url, status, progress, total, retries,
                           max_retries, created_at, updated_at,
                           completed_at, error, metadata
                    FROM tasks
                    WHERE status = ?
                ''', (status.value,))

                rows = cursor.fetchall()
                return [
                    {
                        'id': row[0],
                        'url': row[1],
                        'status': row[2],
                        'progress': row[3],
                        'total': row[4],
                        'retries': row[5],
                        'max_retries': row[6],
                        'created_at': row[7],
                        'updated_at': row[8],
                        'completed_at': row[9],
                        'error': row[10],
                        'metadata': json.loads(row[11]) if row[11] else None
                    }
                    for row in rows
                ]

        except Exception as e:
            logger.error(f"获取任务列表失败: {e}")
            return []

    def save_checkpoint(self, task_id: str, checkpoint_data: Dict[str, Any]) -> bool:
        """
        保存检查点

        Args:
            task_id: 任务ID
            checkpoint_data: 检查点数据

        Returns:
            是否成功
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO checkpoints (task_id, checkpoint_data)
                    VALUES (?, ?)
                ''', (task_id, json.dumps(checkpoint_data)))
                conn.commit()

            logger.debug(f"检查点已保存: {task_id}")
            return True

        except Exception as e:
            logger.error(f"保存检查点失败: {task_id}, 错误: {e}")
            return False

    def load_checkpoint(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        加载检查点

        Args:
            task_id: 任务ID

        Returns:
            检查点数据
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT checkpoint_data, created_at
                    FROM checkpoints
                    WHERE task_id = ?
                    ORDER BY created_at DESC
                    LIMIT 1
                ''', (task_id,))

                row = cursor.fetchone()
                if not row:
                    return None

                return {
                    'data': json.loads(row[0]),
                    'created_at': row[1]
                }

        except Exception as e:
            logger.error(f"加载检查点失败: {task_id}, 错误: {e}")
            return None

    def increment_retry(self, task_id: str) -> bool:
        """
        增加重试次数

        Args:
            task_id: 任务ID

        Returns:
            是否成功
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE tasks
                    SET retries = retries + 1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (task_id,))
                conn.commit()

            logger.debug(f"重试次数已增加: {task_id}")
            return True

        except Exception as e:
            logger.error(f"增加重试次数失败: {task_id}, 错误: {e}")
            return False

    def recover_state(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        恢复状态

        Returns:
            状态字典 {status: tasks}
        """
        states = {}

        for status in TaskState:
            if status == TaskState.CANCELLED:
                continue

            tasks = self.get_tasks_by_status(status)
            if tasks:
                states[status.value] = tasks

        logger.info(f"状态已恢复: {len(states)} 个状态")
        return states

    def get_stats(self) -> Dict[str, int]:
        """
        获取统计信息

        Returns:
            统计字典
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                stats = {}

                # 统计各状态任务数
                for status in TaskState:
                    cursor.execute('''
                        SELECT COUNT(*) FROM tasks WHERE status = ?
                    ''', (status.value,))
                    stats[f'{status.value}_count'] = cursor.fetchone()[0]

                # 总任务数
                cursor.execute('SELECT COUNT(*) FROM tasks')
                stats['total_tasks'] = cursor.fetchone()[0]

                # 检查点数
                cursor.execute('SELECT COUNT(*) FROM checkpoints')
                stats['total_checkpoints'] = cursor.fetchone()[0]

                return stats

        except Exception as e:
            logger.error(f"获取统计信息失败: {e}")
            return {}

    def clear_completed_tasks(self, days: int = 7):
        """
        清理已完成的任务

        Args:
            days: 保留天数
        """
        try:
            cutoff_date = datetime.now() - datetime.timedelta(days=days)

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # 删除检查点
                cursor.execute('''
                    DELETE FROM checkpoints
                    WHERE task_id IN (
                        SELECT id FROM tasks
                        WHERE status = ? AND completed_at < ?
                    )
                ''', (TaskState.COMPLETED.value, cutoff_date))

                # 删除任务
                cursor.execute('''
                    DELETE FROM tasks
                    WHERE status = ? AND completed_at < ?
                ''', (TaskState.COMPLETED.value, cutoff_date))

                deleted = cursor.rowcount
                conn.commit()

            logger.info(f"清理了 {deleted} 个已完成的任务")

        except Exception as e:
            logger.error(f"清理完成任务失败: {e}")

    def clear_all_tasks(self):
        """清空所有任务"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM checkpoints')
                cursor.execute('DELETE FROM tasks')
                conn.commit()

            logger.info("所有任务已清空")

        except Exception as e:
            logger.error(f"清空任务失败: {e}")


# 使用示例
if __name__ == '__main__':
    # 创建断点续爬管理器
    resume_manager = ResumeManager('test_crawler_state.db')

    # 创建任务
    task_id = 'test_task_001'
    resume_manager.create_task(
        task_id=task_id,
        url='https://example.com',
        total=100,
        max_retries=3,
        metadata={'param': 'value'}
    )

    # 更新进度
    for i in range(0, 101, 20):
        resume_manager.update_task(task_id, progress=i)
        print(f"进度: {i}%")

        # 保存检查点
        if i % 40 == 0:
            resume_manager.save_checkpoint(task_id, {'progress': i, 'data': 'sample'})
            print(f"  检查点已保存")

    # 标记完成
    resume_manager.update_task(task_id, status=TaskState.COMPLETED)
    print("任务已完成")

    # 获取任务
    task = resume_manager.get_task(task_id)
    print(f"\n任务信息: {task}")

    # 恢复状态
    states = resume_manager.recover_state()
    print(f"\n恢复的状态: {list(states.keys())}")

    # 统计
    stats = resume_manager.get_stats()
    print(f"\n统计信息: {stats}")

    # 清理
    resume_manager.clear_all_tasks()
    print("\n任务已清空")
