#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目测试：爬取新浪网火热新闻
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import logging
import os

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_original_crawler():
    """测试原有爬虫功能（requests + BeautifulSoup）"""
    print("\n" + "="*60)
    print("测试 1: 原有爬虫功能（requests + BeautifulSoup）")
    print("="*60)

    try:
        url = "https://www.sina.com.cn/"

        # 发送请求
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)

        print(f"✓ 状态码: {response.status_code}")
        print(f"✓ 内容长度: {len(response.text)}")

        # 解析 HTML
        soup = BeautifulSoup(response.text, 'html.parser')

        # 提取新闻（新浪网的新闻通常在特定的 class 中）
        news_list = []

        # 尝试不同的选择器
        selectors = [
            'h1',
            'h2',
            'h3',
            '.news-item',
            '.news-title',
            'a[href*="/news/"]',
            'a[href*="/s/"]',
            '.title',
            '.headline'
        ]

        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                print(f"✓ 找到 {len(elements)} 个 '{selector}' 元素")
                # 保存前几个
                for i, elem in enumerate(elements[:5]):
                    text = elem.get_text(strip=True)
                    link = elem.get('href', '')
                    if text and len(text) > 5:
                        news_list.append({
                            'source': selector,
                            'title': text[:100],  # 限制长度
                            'link': link[:200] if link else ''
                        })

        print(f"✓ 提取到 {len(news_list)} 条新闻")

        # 保存结果
        output_file = '/workspace/projects/sina_news_original.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'url': url,
                'count': len(news_list),
                'news': news_list
            }, f, ensure_ascii=False, indent=2)

        print(f"✓ 结果已保存到: {output_file}")

        return news_list

    except Exception as e:
        logger.error(f"测试失败: {e}")
        import traceback
        traceback.print_exc()
        return []


def test_scrapling_fetcher():
    """测试 Scrapling Fetcher 功能"""
    print("\n" + "="*60)
    print("测试 2: Scrapling Fetcher 功能")
    print("="*60)

    try:
        from scrapling.fetchers import Fetcher

        url = "https://www.sina.com.cn/"

        # 使用 Fetcher 获取页面
        page = Fetcher.get(url)

        print(f"✓ 成功获取页面")

        # 提取新闻
        news_list = []

        # 尝试不同的选择器
        selectors = [
            'h1',
            'h2',
            'h3',
            '.news-item',
            '.news-title',
            'a[href*="/news/"]',
            'a[href*="/s/"]',
            '.title',
            '.headline'
        ]

        for selector in selectors:
            elements = page.css(selector)
            if elements:
                print(f"✓ 找到 {len(elements)} 个 '{selector}' 元素")
                # 保存前几个
                for i, elem in enumerate(elements[:5]):
                    text = elem.css('::text').get()
                    link = elem.css('::attr(href)').get()
                    if text and len(text) > 5:
                        news_list.append({
                            'source': selector,
                            'title': text[:100],
                            'link': link[:200] if link else ''
                        })

        print(f"✓ 提取到 {len(news_list)} 条新闻")

        # 保存结果
        output_file = '/workspace/projects/sina_news_scrapling.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'url': url,
                'count': len(news_list),
                'news': news_list
            }, f, ensure_ascii=False, indent=2)

        print(f"✓ 结果已保存到: {output_file}")

        return news_list

    except Exception as e:
        logger.error(f"测试失败: {e}")
        import traceback
        traceback.print_exc()
        return []


def test_playwright():
    """测试 Playwright 功能"""
    print("\n" + "="*60)
    print("测试 3: Playwright 功能")
    print("="*60)

    try:
        from playwright.sync_api import sync_playwright

        url = "https://www.sina.com.cn/"

        with sync_playwright() as p:
            # 启动浏览器
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # 访问页面
            page.goto(url, timeout=30000)
            print(f"✓ 成功访问页面")

            # 提取新闻
            news_list = []

            # 尝试不同的选择器
            selectors = [
                'h1',
                'h2',
                'h3',
                '.news-item',
                '.news-title',
                'a[href*="/news/"]',
                'a[href*="/s/"]',
                '.title',
                '.headline'
            ]

            for selector in selectors:
                elements = page.query_selector_all(selector)
                if elements:
                    print(f"✓ 找到 {len(elements)} 个 '{selector}' 元素")
                    # 保存前几个
                    for i, elem in enumerate(elements[:5]):
                        text = elem.text_content()
                        link = elem.get_attribute('href')
                        if text and len(text) > 5:
                            news_list.append({
                                'source': selector,
                                'title': text[:100],
                                'link': link[:200] if link else ''
                            })

            print(f"✓ 提取到 {len(news_list)} 条新闻")

            # 关闭浏览器
            browser.close()

            # 保存结果
            output_file = '/workspace/projects/sina_news_playwright.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'timestamp': datetime.now().isoformat(),
                    'url': url,
                    'count': len(news_list),
                    'news': news_list
                }, f, ensure_ascii=False, indent=2)

            print(f"✓ 结果已保存到: {output_file}")

            return news_list

    except Exception as e:
        logger.error(f"测试失败: {e}")
        import traceback
        traceback.print_exc()
        return []


def compare_results(original, scrapling, playwright):
    """对比三种方式的结果"""
    print("\n" + "="*60)
    print("结果对比")
    print("="*60)

    print(f"\n原有爬虫（requests + BeautifulSoup）:")
    print(f"  - 提取数量: {len(original)}")
    if original:
        print(f"  - 示例: {original[0]['title'][:50]}...")

    print(f"\nScrapling Fetcher:")
    print(f"  - 提取数量: {len(scrapling)}")
    if scrapling:
        print(f"  - 示例: {scrapling[0]['title'][:50]}...")

    print(f"\nPlaywright:")
    print(f"  - 提取数量: {len(playwright)}")
    if playwright:
        print(f"  - 示例: {playwright[0]['title'][:50]}...")

    # 合并所有新闻
    all_news = original + scrapling + playwright

    # 去重（基于标题）
    seen = set()
    unique_news = []
    for news in all_news:
        title = news['title']
        if title not in seen:
            seen.add(title)
            unique_news.append(news)

    print(f"\n合并后去重: {len(unique_news)} 条唯一新闻")

    # 保存合并结果
    output_file = '/workspace/projects/sina_news_all.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'original_count': len(original),
            'scrapling_count': len(scrapling),
            'playwright_count': len(playwright),
            'unique_count': len(unique_news),
            'news': unique_news
        }, f, ensure_ascii=False, indent=2)

    print(f"✓ 合并结果已保存到: {output_file}")


def display_top_news(news_list, limit=10):
    """显示前几条新闻"""
    print("\n" + "="*60)
    print(f"热门新闻 Top {limit}")
    print("="*60)

    if not news_list:
        print("没有提取到新闻")
        return

    for i, news in enumerate(news_list[:limit], 1):
        print(f"\n{i}. {news['title']}")
        if news['link']:
            print(f"   链接: {news['link'][:100]}")
        print(f"   来源: {news['source']}")


def main():
    """主函数"""
    print("\n" + "="*60)
    print("新浪网火热新闻爬取测试")
    print("="*60)
    print(f"目标网址: https://www.sina.com.cn/")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    results = {}

    # 测试 1: 原有爬虫
    results['original'] = test_original_crawler()

    # 测试 2: Scrapling
    results['scrapling'] = test_scrapling_fetcher()

    # 测试 3: Playwright
    results['playwright'] = test_playwright()

    # 对比结果
    compare_results(
        results['original'],
        results['scrapling'],
        results['playwright']
    )

    # 显示热门新闻
    all_news = results['original'] + results['scrapling'] + results['playwright']
    seen = set()
    unique_news = []
    for news in all_news:
        title = news['title']
        if title not in seen:
            seen.add(title)
            unique_news.append(news)

    display_top_news(unique_news, limit=15)

    print("\n" + "="*60)
    print("测试完成！")
    print("="*60)
    print("\n生成的文件:")
    print("  - sina_news_original.json (原有爬虫)")
    print("  - sina_news_scrapling.json (Scrapling)")
    print("  - sina_news_playwright.json (Playwright)")
    print("  - sina_news_all.json (合并所有结果)")


if __name__ == '__main__':
    main()
