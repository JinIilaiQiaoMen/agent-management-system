#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrapling 集成示例
展示如何使用 Scrapling 框架进行网页爬取
"""

from scrapling.fetchers import Fetcher, AsyncFetcher, StealthyFetcher, DynamicFetcher
import logging
import json
import asyncio

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def example_basic_fetcher():
    """示例 1: 基础 Fetcher 使用"""
    print("\n" + "="*60)
    print("示例 1: 基础 Fetcher")
    print("="*60)

    # 使用基础 Fetcher 获取网页
    page = Fetcher.fetch('https://example.com')

    # 提取标题
    title = page.css('h1::text').get()
    print(f"标题: {title}")

    # 提取所有链接
    links = page.css('a::attr(href)').getall()
    print(f"找到 {len(links)} 个链接")

    # 提取所有段落
    paragraphs = page.css('p::text').getall()
    print(f"找到 {len(paragraphs)} 个段落")


def example_stealthy_fetcher():
    """示例 2: StealthyFetcher 使用（绕过反爬）"""
    print("\n" + "="*60)
    print("示例 2: StealthyFetcher (绕过反爬)")
    print("="*60)

    # 使用 StealthyFetcher 获取网页
    # StealthyFetcher 可以绕过 Cloudflare Turnstile 等反爬系统
    StealthyFetcher.adaptive = True
    page = StealthyFetcher.fetch(
        'https://example.com',
        headless=True,
        network_idle=True  # 等待网络空闲
    )

    # 提取标题
    title = page.css('h1::text').get()
    print(f"标题: {title}")


def example_dynamic_fetcher():
    """示例 3: DynamicFetcher 使用（动态网页）"""
    print("\n" + "="*60)
    print("示例 3: DynamicFetcher (动态网页)")
    print("="*60)

    # 使用 DynamicFetcher 获取动态网页
    page = DynamicFetcher.fetch(
        'https://example.com',
        headless=True,
        network_idle=True,
        wait_for_selector='h1'  # 等待特定元素出现
    )

    # 提取标题
    title = page.css('h1::text').get()
    print(f"标题: {title}")


def example_adaptive_parsing():
    """示例 4: 自适应解析（应对网站结构变化）"""
    print("\n" + "="*60)
    print("示例 4: 自适应解析")
    print("="*60)

    # 首次爬取，保存选择器映射
    page = Fetcher.fetch('https://example.com')
    products = page.css('div.product', auto_save=True)  # auto_save=True 会保存选择器映射

    print(f"找到 {len(products)} 个产品")

    # 如果网站结构变化，使用 adaptive=True 自动重新定位
    # products = page.css('div.product', adaptive=True)


def example_css_selector():
    """示例 5: 高级 CSS 选择器"""
    print("\n" + "="*60)
    print("示例 5: 高级 CSS 选择器")
    print("="*60)

    page = Fetcher.fetch('https://example.com')

    # 提取文本
    text = page.css('h1::text').get()
    print(f"文本: {text}")

    # 提取属性
    links = page.css('a::attr(href)').getall()
    print(f"属性: {links}")

    # 提取 HTML
    html = page.css('h1').get()
    print(f"HTML: {html[:100]}...")

    # 使用 XPath
    title = page.xpath('//h1/text()').get()
    print(f"XPath: {title}")


async def example_async_fetcher():
    """示例 6: AsyncFetcher 使用（异步请求）"""
    print("\n" + "="*60)
    print("示例 6: AsyncFetcher (异步请求)")
    print("="*60)

    urls = [
        'https://example.com',
        'https://example.org',
        'https://example.net'
    ]

    # 并发请求多个 URL
    tasks = [AsyncFetcher.fetch(url) for url in urls]
    pages = await asyncio.gather(*tasks)

    for i, page in enumerate(pages):
        title = page.css('h1::text').get()
        print(f"URL {i+1}: {title}")


def example_custom_headers():
    """示例 7: 自定义请求头"""
    print("\n" + "="*60)
    print("示例 7: 自定义请求头")
    print("="*60)

    # 自定义请求头
    page = Fetcher.fetch(
        'https://example.com',
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    )

    title = page.css('h1::text').get()
    print(f"标题: {title}")


def example_proxy_rotation():
    """示例 8: 代理轮换"""
    print("\n" + "="*60)
    print("示例 8: 代理轮换")
    print("="*60)

    # 配置代理
    proxies = [
        'http://proxy1:port',
        'http://proxy2:port',
        'http://proxy3:port'
    ]

    # 使用代理请求
    page = Fetcher.fetch(
        'https://example.com',
        proxy=proxies[0]  # 使用第一个代理
    )

    title = page.css('h1::text').get()
    print(f"标题: {title}")


def example_cookies_and_session():
    """示例 9: Cookies 和会话管理"""
    print("\n" + "="*60)
    print("示例 9: Cookies 和会话管理")
    print("="*60)

    # 创建 Fetcher 实例
    fetcher = Fetcher()

    # 第一次请求，获取 Cookies
    page1 = fetcher.fetch('https://example.com')
    print(f"第一次请求完成")

    # 第二次请求，自动携带 Cookies
    page2 = fetcher.fetch('https://example.com')
    print(f"第二次请求完成")


def example_e_commerce_scraping():
    """示例 10: 电商网站爬取示例"""
    print("\n" + "="*60)
    print("示例 10: 电商网站爬取")
    print("="*60)

    # 模拟电商网站爬取
    page = Fetcher.fetch('https://example.com')

    # 提取产品信息
    products = []

    for item in page.css('.product'):
        product = {
            'title': item.css('.title::text').get(),
            'price': item.css('.price::text').get(),
            'url': item.css('a::attr(href)').get(),
            'image': item.css('img::attr(src)').get()
        }
        products.append(product)

    print(f"找到 {len(products)} 个产品")

    # 保存到 JSON
    with open('/workspace/projects/products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print("产品信息已保存到 products.json")


def main():
    """主函数"""
    print("\n" + "="*60)
    print("Scrapling 集成示例")
    print("="*60)

    # 运行示例
    try:
        example_basic_fetcher()
    except Exception as e:
        logger.error(f"示例 1 失败: {e}")

    try:
        example_adaptive_parsing()
    except Exception as e:
        logger.error(f"示例 4 失败: {e}")

    try:
        example_css_selector()
    except Exception as e:
        logger.error(f"示例 5 失败: {e}")

    try:
        example_custom_headers()
    except Exception as e:
        logger.error(f"示例 7 失败: {e}")

    try:
        example_cookies_and_session()
    except Exception as e:
        logger.error(f"示例 9 失败: {e}")

    try:
        example_e_commerce_scraping()
    except Exception as e:
        logger.error(f"示例 10 失败: {e}")

    # 异步示例
    try:
        asyncio.run(example_async_fetcher())
    except Exception as e:
        logger.error(f"示例 6 失败: {e}")

    print("\n" + "="*60)
    print("所有示例运行完成")
    print("="*60)


if __name__ == '__main__':
    main()
