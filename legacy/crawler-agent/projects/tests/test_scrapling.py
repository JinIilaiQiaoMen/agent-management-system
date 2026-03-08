#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scrapling 集成测试
"""

import sys
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_scrapling_import():
    """测试 Scrapling 导入"""
    print("\n" + "="*60)
    print("测试 1: Scrapling 模块导入")
    print("="*60)

    try:
        import scrapling
        print("✓ scrapling 模块导入成功")

        from scrapling.fetchers import Fetcher
        print("✓ Fetcher 导入成功")

        from scrapling.core import __version__
        print(f"✓ Scrapling 版本: {__version__}")

        return True

    except Exception as e:
        print(f"✗ 导入失败: {e}")
        return False


def test_fetcher_basic():
    """测试基础 Fetcher 功能"""
    print("\n" + "="*60)
    print("测试 2: 基础 Fetcher 功能")
    print("="*60)

    try:
        from scrapling.fetchers import Fetcher

        # 使用 get 方法获取页面
        page = Fetcher.get('https://example.com')
        print("✓ 成功获取页面")

        # 提取标题
        title = page.css('h1::text').get()
        print(f"✓ 提取标题: {title}")

        # 提取链接
        links = page.css('a::attr(href)').getall()
        print(f"✓ 提取链接: {len(links)} 个")

        return True

    except Exception as e:
        print(f"✗ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_selectors():
    """测试选择器功能"""
    print("\n" + "="*60)
    print("测试 3: 选择器功能")
    print("="*60)

    try:
        from scrapling.fetchers import Fetcher

        page = Fetcher.get('https://example.com')

        # CSS 选择器
        title = page.css('h1::text').get()
        print(f"✓ CSS 选择器: {title}")

        # XPath 选择器
        title = page.xpath('//h1/text()').get()
        print(f"✓ XPath 选择器: {title}")

        # 属性提取
        links = page.css('a::attr(href)').getall()
        print(f"✓ 属性提取: {len(links)} 个链接")

        return True

    except Exception as e:
        print(f"✗ 测试失败: {e}")
        return False


def main():
    """主函数"""
    print("\n" + "="*60)
    print("Scrapling 集成测试")
    print("="*60)

    results = []

    # 运行测试
    results.append(("Scrapling 导入", test_scrapling_import()))
    results.append(("基础 Fetcher", test_fetcher_basic()))
    results.append(("选择器功能", test_selectors()))

    # 显示结果
    print("\n" + "="*60)
    print("测试结果汇总")
    print("="*60)

    for name, success in results:
        status = "✓ 通过" if success else "✗ 失败"
        print(f"{name}: {status}")

    # 统计
    passed = sum(1 for _, success in results if success)
    total = len(results)

    print(f"\n通过: {passed}/{total}")

    if passed == total:
        print("\n✓ 所有测试通过！")
        return 0
    else:
        print(f"\n✗ {total - passed} 个测试失败")
        return 1


if __name__ == '__main__':
    sys.exit(main())
