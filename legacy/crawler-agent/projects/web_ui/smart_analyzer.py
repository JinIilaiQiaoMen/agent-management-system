#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能爬虫分析器
结合元素分析和截图功能，提供智能化的爬取体验
"""

import asyncio
import os
import requests
from typing import List, Dict, Optional
from datetime import datetime
import pandas as pd
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.element_analyzer import ElementAnalyzer
from core.screenshot_analyzer import ScreenshotAnalyzer
import logging

logger = logging.getLogger(__name__)


class SmartAnalyzer:
    """智能爬虫分析器"""

    def __init__(self):
        self.screenshot_analyzer = ScreenshotAnalyzer()

    async def download_file(self, url: str, filepath: str) -> bool:
        """下载文件"""
        try:
            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()

            # 确保目录存在
            os.makedirs(os.path.dirname(filepath), exist_ok=True)

            # 写入文件
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

            logger.info(f"下载成功: {filepath}")
            return True

        except Exception as e:
            logger.error(f"下载失败: {url}, 错误: {e}")
            return False

    async def analyze_page(self, url: str) -> Dict:
        """
        分析网页元素

        Args:
            url: 目标URL

        Returns:
            包含截图和元素列表的字典
        """
        try:
            logger.info(f"开始分析网页: {url}")

            # 创建元素分析器
            element_analyzer = ElementAnalyzer(url)

            # 截图并分析
            screenshot_data = await self.screenshot_analyzer.screenshot_url(url)
            elements = await element_analyzer.analyze_url(url)

            # 分析结果
            result = {
                'success': True,
                'url': url,
                'timestamp': datetime.now().isoformat(),
                'screenshot': screenshot_data,
                'elements': elements,
                'summary': {
                    'total': len(elements),
                    'images': len([e for e in elements if e['type'] == 'image']),
                    'videos': len([e for e in elements if e['type'] == 'video']),
                    'audio': len([e for e in elements if e['type'] == 'audio']),
                    'docs': len([e for e in elements if e['type'] == 'doc'])
                }
            }

            logger.info(f"分析完成，共发现 {result['summary']['total']} 个元素")

            return result

        except Exception as e:
            logger.error(f"分析网页失败: {e}")
            return {
                'success': False,
                'message': str(e)
            }

    async def download_elements(
        self,
        elements: List[Dict],
        save_type: str = 'folder',
        output_path: str = './downloads'
    ) -> Dict:
        """
        下载选中的元素

        Args:
            elements: 元素列表
            save_type: 保存类型 ('folder', 'excel', 'csv')
            output_path: 输出路径

        Returns:
            下载结果
        """
        try:
            logger.info(f"开始下载 {len(elements)} 个元素，保存类型: {save_type}")

            if save_type == 'folder':
                return await self._download_to_folder(elements, output_path)
            elif save_type in ('excel', 'csv'):
                return await self._download_to_table(elements, save_type, output_path)
            else:
                return {
                    'success': False,
                    'message': f'不支持的保存类型: {save_type}'
                }

        except Exception as e:
            logger.error(f"下载元素失败: {e}")
            return {
                'success': False,
                'message': str(e)
            }

    async def _download_to_folder(self, elements: List[Dict], output_path: str) -> Dict:
        """下载到文件夹"""
        # 创建输出目录
        os.makedirs(output_path, exist_ok=True)

        # 按类型分类
        result = {
            'success': True,
            'downloaded': 0,
            'failed': 0,
            'details': []
        }

        for element in elements:
            try:
                element_type = element['type']
                element_url = element.get('src', element.get('href', ''))

                if not element_url:
                    result['failed'] += 1
                    result['details'].append({
                        'element': element,
                        'status': 'failed',
                        'message': '无有效URL'
                    })
                    continue

                # 创建类型子目录
                type_dir = os.path.join(output_path, element_type)
                os.makedirs(type_dir, exist_ok=True)

                # 下载文件
                filename = self._generate_filename(element_url, element_type)
                filepath = os.path.join(type_dir, filename)

                success = await self.download_file(element_url, filepath)

                if success:
                    result['downloaded'] += 1
                    result['details'].append({
                        'element': element,
                        'status': 'success',
                        'filepath': filepath
                    })
                    logger.info(f"下载成功: {filepath}")
                else:
                    result['failed'] += 1
                    result['details'].append({
                        'element': element,
                        'status': 'failed',
                        'message': '下载失败'
                    })

            except Exception as e:
                result['failed'] += 1
                result['details'].append({
                    'element': element,
                    'status': 'failed',
                    'message': str(e)
                })
                logger.error(f"下载失败: {e}")

        return result

    async def _download_to_table(
        self,
        elements: List[Dict],
        save_type: str,
        output_path: str
    ) -> Dict:
        """下载并保存为表格"""
        # 下载数据
        download_result = await self._download_to_folder(
            elements,
            output_path.replace('.xlsx', '').replace('.csv', '')
        )

        # 创建表格数据
        table_data = []
        for i, element in enumerate(elements):
            detail = download_result['details'][i]

            table_data.append({
                '序号': i + 1,
                '类型': element['type'],
                'URL': element.get('src', element.get('href', '')),
                '文件名': os.path.basename(detail.get('filepath', '')),
                '状态': detail['status'],
                '本地路径': detail.get('filepath', ''),
                '大小': self._get_file_size(detail.get('filepath', '')),
                '时间': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })

        # 保存为表格
        df = pd.DataFrame(table_data)

        if save_type == 'excel':
            df.to_excel(output_path, index=False, engine='openpyxl')
        else:  # csv
            df.to_csv(output_path, index=False, encoding='utf-8-sig')

        logger.info(f"表格已保存: {output_path}")

        return {
            'success': True,
            'downloaded': download_result['downloaded'],
            'failed': download_result['failed'],
            'table_path': output_path,
            'details': download_result['details']
        }

    def _generate_filename(self, url: str, element_type: str) -> str:
        """生成文件名"""
        # 从URL提取文件名
        filename = url.split('/')[-1]
        if not filename or '?' in filename:
            # 使用时间戳
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{element_type}_{timestamp}"

        # 添加扩展名
        ext = self._get_extension(element_type)
        if not filename.endswith(ext):
            filename += ext

        return filename

    def _get_extension(self, element_type: str) -> str:
        """获取默认扩展名"""
        extensions = {
            'image': '.jpg',
            'video': '.mp4',
            'audio': '.mp3',
            'doc': '.pdf'
        }
        return extensions.get(element_type, '')

    def _get_file_size(self, filepath: str) -> str:
        """获取文件大小"""
        try:
            if os.path.exists(filepath):
                size = os.path.getsize(filepath)
                return self._format_size(size)
        except:
            pass
        return '0 B'

    def _format_size(self, size: int) -> str:
        """格式化文件大小"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.2f} {unit}"
            size /= 1024
        return f"{size:.2f} TB"


# 全局实例
smart_analyzer = SmartAnalyzer()
