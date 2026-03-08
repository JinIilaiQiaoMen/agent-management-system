#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网页截图和元素定位器
使用Playwright进行网页截图和获取元素位置
"""

import asyncio
import base64
from typing import List, Dict, Any, Optional
from playwright.async_api import async_playwright, Browser, Page, ElementHandle


class ScreenshotAnalyzer:
    """网页截图和元素定位器"""

    def __init__(self):
        """初始化分析器"""
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.playwright = None

    async def start(self):
        """启动浏览器"""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=False)  # 显示浏览器窗口
        self.page = await self.browser.new_page()

    async def stop(self):
        """停止浏览器"""
        if self.page:
            await self.page.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def capture_and_analyze(self, url: str) -> Dict[str, Any]:
        """
        截图并分析页面元素

        Args:
            url: 目标URL

        Returns:
            包含截图和元素位置信息的字典
        """
        if not self.page:
            await self.start()

        # 导航到URL
        await self.page.goto(url, wait_until='networkidle')
        await asyncio.sleep(2)  # 等待页面完全加载

        # 获取页面内容
        content = await self.page.content()

        # 获取所有元素的位置
        images = await self._get_image_positions()
        videos = await self._get_video_positions()
        audios = await self._get_audio_positions()

        # 截图
        screenshot_bytes = await self.page.screenshot(full_page=True)
        screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')

        # 获取页面尺寸
        viewport = await self.page.viewport_size()

        return {
            'url': url,
            'screenshot': screenshot_base64,
            'content': content,
            'page_size': {
                'width': viewport['width'],
                'height': viewport['height']
            },
            'elements': {
                'images': images,
                'videos': videos,
                'audios': audios
            }
        }

    async def _get_image_positions(self) -> List[Dict[str, Any]]:
        """获取所有图片元素的位置"""
        images = []

        # 获取所有img标签
        img_elements = await self.page.query_selector_all('img')
        for img in img_elements:
            try:
                box = await img.bounding_box()
                if box:
                    src = await img.get_attribute('src')
                    alt = await img.get_attribute('alt')
                    images.append({
                        'src': src,
                        'alt': alt or '',
                        'position': {
                            'x': int(box['x']),
                            'y': int(box['y']),
                            'width': int(box['width']),
                            'height': int(box['height'])
                        }
                    })
            except Exception as e:
                print(f"Error getting image position: {e}")

        return images

    async def _get_video_positions(self) -> List[Dict[str, Any]]:
        """获取所有视频元素的位置"""
        videos = []

        # 获取所有video标签
        video_elements = await self.page.query_selector_all('video')
        for video in video_elements:
            try:
                box = await video.bounding_box()
                if box:
                    src = await video.get_attribute('src')
                    poster = await video.get_attribute('poster')
                    videos.append({
                        'src': src,
                        'poster': poster,
                        'position': {
                            'x': int(box['x']),
                            'y': int(box['y']),
                            'width': int(box['width']),
                            'height': int(box['height'])
                        }
                    })
            except Exception as e:
                print(f"Error getting video position: {e}")

        # 获取iframe（可能是视频嵌入）
        iframe_elements = await self.page.query_selector_all('iframe')
        for iframe in iframe_elements:
            try:
                box = await iframe.bounding_box()
                if box:
                    src = await iframe.get_attribute('src')
                    if any(domain in src for domain in ['youtube', 'vimeo', 'bilibili']):
                        videos.append({
                            'src': src,
                            'type': 'iframe',
                            'position': {
                                'x': int(box['x']),
                                'y': int(box['y']),
                                'width': int(box['width']),
                                'height': int(box['height'])
                            }
                        })
            except Exception as e:
                print(f"Error getting iframe position: {e}")

        return videos

    async def _get_audio_positions(self) -> List[Dict[str, Any]]:
        """获取所有音频元素的位置"""
        audios = []

        # 获取所有audio标签
        audio_elements = await self.page.query_selector_all('audio')
        for audio in audio_elements:
            try:
                box = await audio.bounding_box()
                if box:
                    src = await audio.get_attribute('src')
                    audios.append({
                        'src': src,
                        'position': {
                            'x': int(box['x']),
                            'y': int(box['y']),
                            'width': int(box['width']),
                            'height': int(box['height'])
                        }
                    })
            except Exception as e:
                print(f"Error getting audio position: {e}")

        return audios

    async def highlight_element(self, element_selector: str, color: str = 'red'):
        """
        高亮显示指定元素

        Args:
            element_selector: 元素选择器
            color: 高亮颜色
        """
        if not self.page:
            return

        # 注入高亮样式
        await self.page.evaluate(f"""
            (selector, color) => {{
                const element = document.querySelector(selector);
                if (element) {{
                    element.style.boxShadow = `0 0 5px 5px ${{color}}`;
                    element.style.border = `2px solid ${{color}}`;
                }}
            }}
        """, element_selector, color)


# 使用示例
async def main():
    """测试函数"""
    analyzer = ScreenshotAnalyzer()

    try:
        # 启动
        await analyzer.start()

        # 分析
        result = await analyzer.capture_and_analyze('https://example.com')

        print(f"找到 {len(result['elements']['images'])} 张图片")
        print(f"找到 {len(result['elements']['videos'])} 个视频")
        print(f"找到 {len(result['elements']['audios'])} 个音频")

    finally:
        # 停止
        await analyzer.stop()


if __name__ == '__main__':
    asyncio.run(main())
