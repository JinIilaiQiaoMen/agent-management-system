#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网页元素分析器
结合代码分析和AI图像识别，智能识别网页中的图片、视频、音频元素
"""

import asyncio
import base64
import json
from typing import List, Dict, Any, Tuple
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


class ElementAnalyzer:
    """网页元素分析器"""

    def __init__(self, url: str):
        """
        初始化分析器

        Args:
            url: 目标网站URL
        """
        self.url = url
        self.parsed_url = urlparse(url)
        self.elements = {
            'images': [],
            'videos': [],
            'audios': []
        }

    def analyze_from_code(self, html_content: str) -> Dict[str, Any]:
        """
        从HTML代码中分析元素

        Args:
            html_content: HTML内容

        Returns:
            分析结果字典
        """
        soup = BeautifulSoup(html_content, 'html.parser')

        # 分析图片
        self._analyze_images(soup)

        # 分析视频
        self._analyze_videos(soup)

        # 分析音频
        self._analyze_audios(soup)

        return self.elements

    def _analyze_images(self, soup: BeautifulSoup) -> None:
        """分析图片元素"""
        elements = []

        # img标签
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src:
                # 获取元素位置信息
                position = self._get_element_position(img)
                elements.append({
                    'src': urljoin(self.url, src),
                    'type': 'image',
                    'method': 'code',
                    'tag': 'img',
                    'position': position,
                    'alt': img.get('alt', ''),
                    'width': img.get('width'),
                    'height': img.get('height')
                })

        # background-image (style属性)
        for element in soup.find_all(style=True):
            style = element.get('style', '')
            if 'background-image' in style or 'background:' in style:
                # 简化处理，实际需要解析CSS
                pass

        self.elements['images'] = elements

    def _analyze_videos(self, soup: BeautifulSoup) -> None:
        """分析视频元素"""
        elements = []

        # video标签
        for video in soup.find_all('video'):
            src = video.get('src')
            if src:
                position = self._get_element_position(video)
                elements.append({
                    'src': urljoin(self.url, src),
                    'type': 'video',
                    'method': 'code',
                    'tag': 'video',
                    'position': position,
                    'poster': video.get('poster'),
                    'width': video.get('width'),
                    'height': video.get('height')
                })

            # source标签
            for source in video.find_all('source'):
                src = source.get('src')
                if src:
                    elements.append({
                        'src': urljoin(self.url, src),
                        'type': 'video',
                        'method': 'code',
                        'tag': 'source',
                        'position': position,
                        'mime': source.get('type', '')
                    })

        # iframe (可能是视频嵌入)
        for iframe in soup.find_all('iframe'):
            src = iframe.get('src', '')
            if any(domain in src for domain in ['youtube', 'vimeo', 'bilibili']):
                elements.append({
                    'src': src,
                    'type': 'video',
                    'method': 'code',
                    'tag': 'iframe',
                    'position': None
                })

        self.elements['videos'] = elements

    def _analyze_audios(self, soup: BeautifulSoup) -> None:
        """分析音频元素"""
        elements = []

        # audio标签
        for audio in soup.find_all('audio'):
            src = audio.get('src')
            if src:
                position = self._get_element_position(audio)
                elements.append({
                    'src': urljoin(self.url, src),
                    'type': 'audio',
                    'method': 'code',
                    'tag': 'audio',
                    'position': position
                })

            # source标签
            for source in audio.find_all('source'):
                src = source.get('src')
                if src:
                    elements.append({
                        'src': urljoin(self.url, src),
                        'type': 'audio',
                        'method': 'code',
                        'tag': 'source',
                        'position': position,
                        'mime': source.get('type', '')
                    })

        # a标签链接到音频文件
        for a in soup.find_all('a'):
            href = a.get('href', '')
            if any(ext in href.lower() for ext in ['.mp3', '.wav', '.flac', '.ogg']):
                elements.append({
                    'src': urljoin(self.url, href),
                    'type': 'audio',
                    'method': 'code',
                    'tag': 'a',
                    'position': None,
                    'text': a.get_text().strip()
                })

        self.elements['audios'] = elements

    def _get_element_position(self, element) -> Dict[str, Any]:
        """
        获取元素位置信息

        Args:
            element: BeautifulSoup元素对象

        Returns:
            位置字典 {x, y, width, height}
        """
        # 简化处理，实际需要使用浏览器API获取精确位置
        # 这里返回None，后续通过Playwright获取
        return None

    def merge_with_ai_results(self, ai_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        合并代码分析结果和AI识别结果

        Args:
            ai_results: AI识别结果

        Returns:
            合并后的结果
        """
        merged = {
            'images': [],
            'videos': [],
            'audios': []
        }

        # 合并图片
        for img in self.elements['images']:
            # 查找匹配的AI结果
            ai_match = self._find_ai_match(img, ai_results.get('images', []))
            if ai_match:
                merged['images'].append({
                    **img,
                    'ai_confidence': ai_match.get('confidence', 0),
                    'ai_verified': True
                })
            else:
                merged['images'].append({
                    **img,
                    'ai_confidence': 0,
                    'ai_verified': False
                })

        # AI检测到但代码分析未发现的
        for ai_img in ai_results.get('images', []):
            if not self._find_code_match(ai_img, self.elements['images']):
                merged['images'].append({
                    'src': ai_img.get('src', ''),
                    'type': 'image',
                    'method': 'ai',
                    'position': ai_img.get('position'),
                    'ai_confidence': ai_img.get('confidence', 0),
                    'ai_verified': True
                })

        return merged

    def _find_ai_match(self, code_element: Dict, ai_elements: List[Dict]) -> Dict:
        """查找匹配的AI结果"""
        for ai_elem in ai_elements:
            if code_element['src'] == ai_elem.get('src'):
                return ai_elem
        return None

    def _find_code_match(self, ai_element: Dict, code_elements: List[Dict]) -> Dict:
        """查找匹配的代码元素"""
        for code_elem in code_elements:
            if code_elem['src'] == ai_element.get('src'):
                return code_elem
        return None

    def get_summary(self) -> Dict[str, Any]:
        """获取分析摘要"""
        return {
            'url': self.url,
            'total_images': len(self.elements['images']),
            'total_videos': len(self.elements['videos']),
            'total_audios': len(self.elements['audios']),
            'total_elements': len(self.elements['images']) + len(self.elements['videos']) + len(self.elements['audios'])
        }
