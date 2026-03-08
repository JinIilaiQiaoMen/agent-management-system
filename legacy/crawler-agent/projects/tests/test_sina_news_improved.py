#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目测试：爬取新浪网火热新闻（改进版）
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


def test_sina_news_extraction():
    """测试新浪网新闻提取"""
    print("\n" + "="*60)
    print("新浪网火热新闻爬取测试")
    print("="*60)
    print(f"目标网址: https://www.sina.com.cn/")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    try:
        url = "https://www.sina.com.cn/"

        # 发送请求
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        }
        response = requests.get(url, headers=headers, timeout=10)

        print(f"\n✓ 状态码: {response.status_code}")
        print(f"✓ 内容长度: {len(response.text)} 字符")

        # 检测编码
        if response.encoding != 'utf-8':
            response.encoding = 'utf-8'
            print(f"✓ 编码: {response.encoding}")

        # 解析 HTML
        soup = BeautifulSoup(response.text, 'html.parser')

        # 提取新闻标题（新浪网的新闻通常在特定的结构中）
        news_list = []

        # 方法1: 查找包含新闻的链接
        print("\n正在提取新闻...")

        # 查找所有可能包含新闻的链接
        all_links = soup.find_all('a', href=True)

        for link in all_links:
            href = link.get('href', '')
            text = link.get_text(strip=True)

            # 过滤条件
            # 1. 包含新闻路径
            is_news_link = (
                '/news/' in href or
                '/s/' in href or
                '/finance/' in href or
                '/tech/' in href or
                '/sports/' in href
            )

            # 2. 标题长度合适（不要太短也不要太长）
            is_valid_title = 10 <= len(text) <= 100

            # 3. 排除导航和广告
            is_not_nav = not any(x in text.lower() for x in ['登录', '注册', '首页', '更多', '查看', '点击'])

            if is_news_link and is_valid_title and is_not_nav:
                news_list.append({
                    'title': text,
                    'link': href,
                    'source': 'link'
                })

        print(f"✓ 找到 {len(news_list)} 条新闻")

        # 方法2: 查找特定的新闻容器
        print("\n正在提取特定新闻区域...")

        # 新浪网的常见新闻区域选择器
        news_selectors = [
            'h1',
            'h2',
            'h3',
            '.news-item',
            '.news-title',
            '.headline',
            '.title',
            '[class*="news"]',
            '[class*="headline"]'
        ]

        for selector in news_selectors:
            elements = soup.select(selector)
            count = 0
            for elem in elements[:10]:  # 只取前10个
                text = elem.get_text(strip=True)
                link = elem.find('a')
                if link:
                    href = link.get('href', '')
                else:
                    href = elem.get('href', '')

                if 10 <= len(text) <= 100:
                    # 检查是否已存在
                    if not any(n['title'] == text for n in news_list):
                        news_list.append({
                            'title': text,
                            'link': href,
                            'source': selector
                        })
                        count += 1

            if count > 0:
                print(f"✓ 从 '{selector}' 提取了 {count} 条")

        # 去重（基于标题）
        seen = set()
        unique_news = []
        for news in news_list:
            title = news['title']
            if title not in seen:
                seen.add(title)
                unique_news.append(news)

        print(f"\n✓ 去重后: {len(unique_news)} 条唯一新闻")

        # 显示前15条新闻
        print("\n" + "="*60)
        print("热门新闻 Top 15")
        print("="*60)

        for i, news in enumerate(unique_news[:15], 1):
            print(f"\n{i}. {news['title']}")
            if news['link']:
                print(f"   链接: {news['link'][:100]}")
            print(f"   来源: {news['source']}")

        # 保存结果
        output_file = '/workspace/projects/sina_news_final.json'
        result = {
            'timestamp': datetime.now().isoformat(),
            'url': url,
            'total_found': len(news_list),
            'unique_count': len(unique_news),
            'news': unique_news
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"\n✓ 结果已保存到: {output_file}")

        # 生成简化的文本报告
        report_file = '/workspace/projects/sina_news_report.txt'
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("="*60 + "\n")
            f.write("新浪网火热新闻\n")
            f.write("="*60 + "\n")
            f.write(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"来源: https://www.sina.com.cn/\n")
            f.write(f"总数: {len(unique_news)} 条\n")
            f.write("="*60 + "\n\n")

            for i, news in enumerate(unique_news, 1):
                f.write(f"{i}. {news['title']}\n")
                if news['link']:
                    f.write(f"   {news['link']}\n")
                f.write("\n")

        print(f"✓ 报告已保存到: {report_file}")

        return unique_news

    except Exception as e:
        logger.error(f"测试失败: {e}")
        import traceback
        traceback.print_exc()
        return []


def main():
    """主函数"""
    news = test_sina_news_extraction()

    if news:
        print("\n" + "="*60)
        print("✓ 测试成功完成！")
        print("="*60)
        print(f"\n共提取到 {len(news)} 条新闻")
        print("\n生成的文件:")
        print("  - sina_news_final.json (JSON格式)")
        print("  - sina_news_report.txt (文本报告)")
    else:
        print("\n" + "="*60)
        print("✗ 测试失败！")
        print("="*60)


if __name__ == '__main__':
    main()
