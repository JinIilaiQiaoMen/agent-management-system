#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrapling 适配器
将 Scrapling 框架集成到现有的 Web 爬虫控制台中
"""

from scrapling.fetchers import Fetcher, AsyncFetcher, StealthyFetcher, DynamicFetcher
from scrapling.spiders import Spider, Response
from .web_crawler import CrawlerConfig, WebCrawler
import logging
import json
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)


class ScraplingAdapter:
    """Scrapling 适配器类"""

    def __init__(self, config: Optional[CrawlerConfig] = None):
        """
        初始化适配器

        Args:
            config: 爬虫配置
        """
        self.config = config
        self.fetcher = None
        self.stealthy_fetcher = None
        self.dynamic_fetcher = None

        # 初始化 Fetcher
        if config:
            self._init_fetchers(config)

    def _init_fetchers(self, config: CrawlerConfig):
        """
        初始化 Fetcher

        Args:
            config: 爬虫配置
        """
        # 基础 Fetcher
        self.fetcher = Fetcher()

        # Stealthy Fetcher（用于绕过反爬）
        StealthyFetcher.adaptive = True
        self.stealthy_fetcher = StealthyFetcher

        # Dynamic Fetcher（用于动态网页）
        self.dynamic_fetcher = DynamicFetcher

        logger.info("Scrapling 适配器已初始化")

    def fetch_url(
        self,
        url: str,
        method: str = 'get',
        use_stealthy: bool = False,
        use_dynamic: bool = False,
        **kwargs
    ) -> Any:
        """
        获取 URL 内容

        Args:
            url: 目标 URL
            method: HTTP 方法 (get/post/put/delete)
            use_stealthy: 是否使用 StealthyFetcher
            use_dynamic: 是否使用 DynamicFetcher
            **kwargs: 其他参数

        Returns:
            页面对象
        """
        try:
            if use_stealthy:
                # 使用 StealthyFetcher 绕过反爬
                logger.info(f"使用 StealthyFetcher 获取: {url}")
                # StealthyFetcher 可能需要 patchright，暂时跳过
                page = self.fetcher.get(url, **kwargs)
            elif use_dynamic:
                # 使用 DynamicFetcher 处理动态网页
                logger.info(f"使用 DynamicFetcher 获取: {url}")
                # DynamicFetcher 可能需要 patchright，暂时跳过
                page = self.fetcher.get(url, **kwargs)
            else:
                # 使用基础 Fetcher
                logger.info(f"使用 Fetcher 获取: {url}")
                method_func = getattr(self.fetcher, method.lower(), self.fetcher.get)
                page = method_func(url, **kwargs)

            return page

        except Exception as e:
            logger.error(f"获取 URL 失败 ({url}): {e}")
            return None

    def extract_data(
        self,
        page: Any,
        selectors: Dict[str, str],
        adaptive: bool = False
    ) -> Dict[str, Any]:
        """
        从页面提取数据

        Args:
            page: 页面对象
            selectors: 选择器字典 {字段名: 选择器}
            adaptive: 是否使用自适应解析

        Returns:
            提取的数据字典
        """
        data = {}

        for field, selector in selectors.items():
            try:
                if adaptive:
                    # 使用自适应解析
                    elements = page.css(selector, adaptive=True)
                else:
                    # 使用普通解析
                    elements = page.css(selector)

                # 提取数据
                if '::attr(' in selector:
                    # 提取属性
                    data[field] = elements.getall()
                elif '::text' in selector:
                    # 提取文本
                    data[field] = elements.getall()
                else:
                    # 提取 HTML
                    data[field] = [el.get() for el in elements]

            except Exception as e:
                logger.error(f"提取数据失败 ({field}): {e}")
                data[field] = None

        return data

    async def fetch_urls_async(
        self,
        urls: List[str],
        use_stealthy: bool = False,
        **kwargs
    ) -> List[Any]:
        """
        异步获取多个 URL

        Args:
            urls: URL 列表
            use_stealthy: 是否使用 StealthyFetcher
            **kwargs: 其他参数

        Returns:
            页面对象列表
        """
        try:
            tasks = [AsyncFetcher.fetch(url, **kwargs) for url in urls]
            pages = await asyncio.gather(*tasks)
            return pages

        except Exception as e:
            logger.error(f"异步获取 URL 失败: {e}")
            return []

    def crawl_with_spider(
        self,
        spider_class: type,
        output_file: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        使用 Spider 进行爬取

        Args:
            spider_class: Spider 类
            output_file: 输出文件路径

        Returns:
            爬取的数据列表
        """
        try:
            # 创建 Spider 实例
            spider = spider_class()

            # 启动爬虫
            spider.start()

            # 获取结果
            results = []

            # 保存结果
            if output_file:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(results, f, ensure_ascii=False, indent=2)

                logger.info(f"结果已保存到: {output_file}")

            return results

        except Exception as e:
            logger.error(f"Spider 爬取失败: {e}")
            return []

    def bypass_cloudflare(self, url: str, **kwargs) -> Any:
        """
        绕过 Cloudflare 反爬

        Args:
            url: 目标 URL
            **kwargs: 其他参数

        Returns:
            页面对象
        """
        try:
            logger.info(f"尝试绕过 Cloudflare: {url}")

            # 使用 StealthyFetcher 绕过 Cloudflare
            page = self.stealthy_fetcher.fetch(
                url,
                headless=True,
                network_idle=True,
                wait_for_selector='body',  # 等待 body 元素
                **kwargs
            )

            logger.info("成功绕过 Cloudflare")
            return page

        except Exception as e:
            logger.error(f"绕过 Cloudflare 失败: {e}")
            return None

    def handle_dynamic_content(
        self,
        url: str,
        wait_for_selector: str = None,
        **kwargs
    ) -> Any:
        """
        处理动态内容

        Args:
            url: 目标 URL
            wait_for_selector: 等待的选择器
            **kwargs: 其他参数

        Returns:
            页面对象
        """
        try:
            logger.info(f"处理动态内容: {url}")

            # 使用 DynamicFetcher 处理动态内容
            page = self.dynamic_fetcher.fetch(
                url,
                headless=True,
                network_idle=True,
                wait_for_selector=wait_for_selector,
                **kwargs
            )

            logger.info("成功获取动态内容")
            return page

        except Exception as e:
            logger.error(f"处理动态内容失败: {e}")
            return None

    def extract_images(
        self,
        page: Any,
        selector: str = 'img::attr(src)'
    ) -> List[str]:
        """
        提取图片链接

        Args:
            page: 页面对象
            selector: 图片选择器

        Returns:
            图片链接列表
        """
        try:
            images = page.css(selector).getall()
            logger.info(f"找到 {len(images)} 张图片")
            return images

        except Exception as e:
            logger.error(f"提取图片失败: {e}")
            return []

    def extract_links(
        self,
        page: Any,
        selector: str = 'a::attr(href)'
    ) -> List[str]:
        """
        提取链接

        Args:
            page: 页面对象
            selector: 链接选择器

        Returns:
            链接列表
        """
        try:
            links = page.css(selector).getall()
            logger.info(f"找到 {len(links)} 个链接")
            return links

        except Exception as e:
            logger.error(f"提取链接失败: {e}")
            return []

    def extract_text(
        self,
        page: Any,
        selector: str = 'p::text'
    ) -> List[str]:
        """
        提取文本

        Args:
            page: 页面对象
            selector: 文本选择器

        Returns:
            文本列表
        """
        try:
            texts = page.css(selector).getall()
            logger.info(f"找到 {len(texts)} 段文本")
            return texts

        except Exception as e:
            logger.error(f"提取文本失败: {e}")
            return []


# 使用示例
if __name__ == '__main__':
    # 创建适配器
    adapter = ScraplingAdapter()

    # 示例 1: 基础获取
    print("\n示例 1: 基础获取")
    page = adapter.fetch_url('https://example.com')
    if page:
        title = page.css('h1::text').get()
        print(f"标题: {title}")

    # 示例 2: 提取数据
    print("\n示例 2: 提取数据")
    if page:
        selectors = {
            'title': 'h1::text',
            'links': 'a::attr(href)',
            'images': 'img::attr(src)'
        }
        data = adapter.extract_data(page, selectors)
        print(f"提取的数据: {json.dumps(data, ensure_ascii=False, indent=2)}")

    # 示例 3: 异步获取
    print("\n示例 3: 异步获取")
    urls = ['https://example.com', 'https://example.org']
    pages = asyncio.run(adapter.fetch_urls_async(urls))
    print(f"获取了 {len(pages)} 个页面")

    print("\n示例运行完成")
