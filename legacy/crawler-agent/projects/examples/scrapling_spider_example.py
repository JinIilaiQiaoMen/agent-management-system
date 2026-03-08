#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrapling Spider 集成示例
展示如何使用 Scrapling Spider 框架进行大规模爬取
"""

from scrapling.spiders import Spider, Response
import logging
import json
import asyncio

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ExampleSpider(Spider):
    """示例 Spider"""

    name = "example_spider"

    # 起始 URL
    start_urls = [
        "https://example.com",
    ]

    # 自定义设置
    custom_settings = {
        'CONCURRENT_REQUESTS': 10,  # 并发请求数
        'DOWNLOAD_DELAY': 1,  # 下载延迟（秒）
        'RANDOMIZE_DOWNLOAD_DELAY': True,  # 随机延迟
        'COOKIES_ENABLED': True,  # 启用 Cookies
        'LOG_LEVEL': 'INFO',
    }

    def parse(self, response: Response):
        """解析起始页面"""
        logger.info(f"正在解析: {response.url}")

        # 提取链接
        for link in response.css('a::attr(href)').getall():
            # 过滤外部链接
            if link.startswith('/'):
                yield response.follow(link, callback=self.parse_page)

    def parse_page(self, response: Response):
        """解析子页面"""
        logger.info(f"正在解析页面: {response.url}")

        # 提取页面数据
        yield {
            'url': response.url,
            'title': response.css('h1::text').get(),
            'content': response.css('p::text').getall(),
        }


class ProductSpider(Spider):
    """电商产品爬虫示例"""

    name = "product_spider"

    start_urls = [
        "https://example.com/products",
    ]

    custom_settings = {
        'CONCURRENT_REQUESTS': 5,
        'DOWNLOAD_DELAY': 2,
        'PROXY_ROTATION_ENABLED': True,  # 启用代理轮换
        'PROXY_LIST': [
            'http://proxy1:port',
            'http://proxy2:port',
        ],
    }

    def parse(self, response: Response):
        """解析产品列表页"""
        logger.info(f"解析产品列表: {response.url}")

        # 提取产品链接
        for product_link in response.css('.product a::attr(href)').getall():
            if product_link:
                yield response.follow(product_link, callback=self.parse_product)

        # 提取下一页
        next_page = response.css('.next-page::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

    def parse_product(self, response: Response):
        """解析产品详情页"""
        logger.info(f"解析产品详情: {response.url}")

        yield {
            'title': response.css('.product-title::text').get(),
            'price': response.css('.product-price::text').get(),
            'description': response.css('.product-description::text').get(),
            'image': response.css('.product-image::attr(src)').get(),
            'url': response.url,
        }


class AsyncSpider(Spider):
    """异步爬虫示例"""

    name = "async_spider"

    start_urls = [
        "https://example.com",
    ]

    custom_settings = {
        'CONCURRENT_REQUESTS': 20,
        'DOWNLOAD_DELAY': 0.5,
    }

    async def parse(self, response: Response):
        """异步解析"""
        logger.info(f"异步解析: {response.url}")

        # 提取数据
        yield {
            'url': response.url,
            'title': response.css('h1::text').get(),
        }


class CrawlSpider(Spider):
    """爬取型爬虫示例"""

    name = "crawl_spider"

    start_urls = [
        "https://example.com",
    ]

    custom_settings = {
        'CONCURRENT_REQUESTS': 10,
        'DOWNLOAD_DELAY': 1,
        'DEPTH_LIMIT': 3,  # 限制爬取深度
        'CLOSESPIDER_PAGECOUNT': 100,  # 限制爬取页面数
    }

    def parse(self, response: Response):
        """解析页面"""
        logger.info(f"爬取页面: {response.url}")

        # 提取数据
        yield {
            'url': response.url,
            'title': response.css('h1::text').get(),
        }

        # 提取所有链接继续爬取
        for link in response.css('a::attr(href)').getall():
            if link.startswith('/'):
                yield response.follow(link, callback=self.parse)


class NewsSpider(Spider):
    """新闻爬虫示例"""

    name = "news_spider"

    start_urls = [
        "https://example.com/news",
    ]

    custom_settings = {
        'CONCURRENT_REQUESTS': 15,
        'DOWNLOAD_DELAY': 1,
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }

    def parse(self, response: Response):
        """解析新闻列表"""
        logger.info(f"解析新闻列表: {response.url}")

        # 提取新闻链接
        for news_link in response.css('.news-item a::attr(href)').getall():
            if news_link:
                yield response.follow(news_link, callback=self.parse_news)

    def parse_news(self, response: Response):
        """解析新闻详情"""
        logger.info(f"解析新闻详情: {response.url}")

        yield {
            'title': response.css('.news-title::text').get(),
            'author': response.css('.news-author::text').get(),
            'date': response.css('.news-date::text').get(),
            'content': response.css('.news-content::text').getall(),
            'url': response.url,
        }


def main():
    """主函数"""
    print("\n" + "="*60)
    print("Scrapling Spider 示例")
    print("="*60)

    # 选择要运行的 Spider
    spider_classes = {
        '1': ExampleSpider,
        '2': ProductSpider,
        '3': AsyncSpider,
        '4': CrawlSpider,
        '5': NewsSpider,
    }

    print("\n请选择要运行的 Spider:")
    print("1. ExampleSpider - 基础示例")
    print("2. ProductSpider - 电商爬虫")
    print("3. AsyncSpider - 异步爬虫")
    print("4. CrawlSpider - 爬取型爬虫")
    print("5. NewsSpider - 新闻爬虫")

    choice = input("\n请输入选择 (1-5): ").strip()

    if choice in spider_classes:
        spider_class = spider_classes[choice]
        spider = spider_class()

        print(f"\n启动爬虫: {spider.name}")
        print(f"起始 URL: {spider.start_urls}")
        print(f"设置: {spider.custom_settings}")

        # 启动爬虫
        spider.start()
    else:
        print("无效的选择")


if __name__ == '__main__':
    main()
