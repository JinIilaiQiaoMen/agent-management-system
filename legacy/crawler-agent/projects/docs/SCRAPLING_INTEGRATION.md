# Scrapling 集成文档

## 概述

Scrapling 是一个现代化的 Web 爬虫框架，具有自适应解析、反反爬、并发爬取等功能。本节介绍如何将 Scrapling 集成到现有的 Web 爬虫控制台中。

**集成状态**: ✅ 已完成
**测试状态**: ✅ 已通过
**最后更新**: 2026-02-27

## 核心功能

### 1. Fetcher（获取器）

Scrapling 提供了多种 Fetcher：

- **Fetcher**: 基础获取器，用于简单的网页获取
- **AsyncFetcher**: 异步获取器，支持并发请求
- **StealthyFetcher**: 隐形获取器，可以绕过 Cloudflare Turnstile 等反爬系统
- **DynamicFetcher**: 动态获取器，用于处理动态网页

### 2. Spider（爬虫框架）

Scrapling 提供了强大的 Spider 框架，支持：

- 并发爬取
- 会话管理
- 暂停/恢复
- 自动代理轮换
- 实时统计

### 3. 自适应解析

Scrapling 的解析器可以自动学习网站结构，当网站结构变化时，可以自动重新定位元素。

## 集成方式

### 方式 1: 使用 ScraplingAdapter

`scrapling_adapter.py` 提供了一个适配器类，可以方便地在现有项目中使用 Scrapling 功能。

```python
from scrapling_adapter import ScraplingAdapter

# 创建适配器
adapter = ScraplingAdapter()

# 获取页面
page = adapter.fetch_url('https://example.com')

# 提取数据
selectors = {
    'title': 'h1::text',
    'links': 'a::attr(href)',
    'images': 'img::attr(src)'
}
data = adapter.extract_data(page, selectors)
```

### 方式 2: 直接使用 Scrapling

```python
from scrapling.fetchers import Fetcher, StealthyFetcher

# 基础使用
page = Fetcher.fetch('https://example.com')
title = page.css('h1::text').get()

# 绕过反爬
StealthyFetcher.adaptive = True
page = StealthyFetcher.fetch('https://example.com', headless=True, network_idle=True)
```

### 方式 3: 使用 Spider

```python
from scrapling.spiders import Spider, Response

class MySpider(Spider):
    name = "demo"
    start_urls = ["https://example.com/"]

    def parse(self, response: Response):
        for item in response.css('.product'):
            yield {"title": item.css('h2::text').get()}

MySpider().start()
```

## Web UI 集成

### 新增 API 接口

#### 1. 获取页面

```http
POST /api/scrapling/fetch
Content-Type: application/json

{
    "url": "https://example.com",
    "use_stealthy": false,
    "use_dynamic": false,
    "headless": true
}
```

#### 2. 提取自定义数据

```http
POST /api/scrapling/extract
Content-Type: application/json

{
    "url": "https://example.com",
    "selectors": {
        "title": "h1::text",
        "price": ".price::text",
        "image": ".product-img::attr(src)"
    }
}
```

#### 3. 绕过 Cloudflare

```http
POST /api/scrapling/bypass
Content-Type: application/json

{
    "url": "https://example.com"
}
```

## 使用示例

### 示例 1: 基础爬取

```python
# 运行 scrapling_example.py
python3 scrapling_example.py
```

### 示例 2: Spider 爬取

```python
# 运行 scrapling_spider_example.py
python3 scrapling_spider_example.py
```

### 示例 3: 适配器使用

```python
# 运行 scrapling_adapter.py
python3 scrapling_adapter.py
```

## 高级功能

### 1. 自适应解析

```python
# 首次爬取，保存选择器映射
products = page.css('div.product', auto_save=True)

# 如果网站结构变化，使用 adaptive=True 自动重新定位
products = page.css('div.product', adaptive=True)
```

### 2. 绕过反爬

```python
from scrapling.fetchers import StealthyFetcher

StealthyFetcher.adaptive = True
page = StealthyFetcher.fetch(
    'https://example.com',
    headless=True,
    network_idle=True
)
```

### 3. 动态网页处理

```python
from scrapling.fetchers import DynamicFetcher

page = DynamicFetcher.fetch(
    'https://example.com',
    headless=True,
    network_idle=True,
    wait_for_selector='h1'
)
```

### 4. 异步并发

```python
from scrapling.fetchers import AsyncFetcher
import asyncio

async def fetch_urls(urls):
    tasks = [AsyncFetcher.fetch(url) for url in urls]
    pages = await asyncio.gather(*tasks)
    return pages

urls = ['https://example.com', 'https://example.org']
pages = asyncio.run(fetch_urls(urls))
```

## 配置说明

### Spider 配置

```python
custom_settings = {
    'CONCURRENT_REQUESTS': 10,  # 并发请求数
    'DOWNLOAD_DELAY': 1,  # 下载延迟（秒）
    'RANDOMIZE_DOWNLOAD_DELAY': True,  # 随机延迟
    'COOKIES_ENABLED': True,  # 启用 Cookies
    'PROXY_ROTATION_ENABLED': True,  # 启用代理轮换
    'PROXY_LIST': [
        'http://proxy1:port',
        'http://proxy2:port',
    ],
    'DEPTH_LIMIT': 3,  # 限制爬取深度
    'CLOSESPIDER_PAGECOUNT': 100,  # 限制爬取页面数
}
```

## 依赖安装

```bash
pip install -r requirements.txt
```

主要依赖：
- `Scrapling>=0.4.0`
- `curl_cffi>=0.14.0`
- `cssselect>=1.4.0`
- `orjson>=3.11.7`
- `playwright==1.56.0`
- `anyio>=4.12.1`

## 注意事项

### 1. 合规性

- 使用 StealthyFetcher 时请遵守相关法律法规
- 不要对目标网站造成过大压力
- 遵守 robots.txt 规则

### 2. 性能

- 合理设置并发数
- 合理设置下载延迟
- 定期清理缓存

### 3. 反爬策略

- StealthyFetcher 可以绕过大多数反爬系统
- 但仍需遵守网站的使用条款
- 不要频繁请求同一网站

## 与现有功能的对比

| 功能 | 原有实现 | Scrapling 实现 |
|------|---------|---------------|
| 基础爬取 | requests + BeautifulSoup | Fetcher |
| 反反爬 | 手动实现 | StealthyFetcher（自动） |
| 动态网页 | Playwright | DynamicFetcher |
| 并发爬取 | 手动实现 | Spider（自动） |
| 自适应解析 | 无 | 自动学习 |
| 代理轮换 | ProxyManager | Spider 内置 |

## 迁移建议

### 从原有爬虫迁移到 Scrapling

1. **简单爬取**: 使用 `Fetcher` 替代 `requests + BeautifulSoup`
2. **反爬场景**: 使用 `StealthyFetcher` 替代手动反爬策略
3. **动态网页**: 使用 `DynamicFetcher` 替代 Playwright
4. **大规模爬取**: 使用 `Spider` 框架替代手动并发实现

### 兼容性

 Scrapling 与现有功能完全兼容，可以：
- 在同一个项目中同时使用
- 通过 `ScraplingAdapter` 进行集成
- 逐步迁移，无需一次性替换

## 问题排查

### 1. 导入错误

```bash
ModuleNotFoundError: No module named 'scrapling'
```

**解决方案**: 安装依赖
```bash
pip install -r requirements.txt
```

### 2. StealthyFetcher 失败

**原因**: 可能是反爬策略过于严格

**解决方案**:
- 增加延迟时间
- 使用代理轮换
- 检查请求头设置

### 3. 动态内容加载失败

**原因**: 等待时间不足

**解决方案**:
- 增加 `wait_for_selector` 参数
- 增加 `network_idle=True`
- 延长超时时间

## 参考资料

- [Scrapling 官方文档](https://scrapling.readthedocs.io/)
- [Scrapling GitHub](https://github.com/D4Vinci/Scrapling)
- [Scrapling 示例](https://github.com/D4Vinci/Scrapling/tree/main/examples)

## 更新日志

### 2026-02-27
- ✅ 完成新浪网新闻爬取测试
- ✅ 成功提取 105 条新闻
- ✅ 生成 JSON 格式和文本格式报告
- ✅ 改进中文编码处理

### 2025-02-26
- ✅ 集成 Scrapling 框架
- ✅ 添加 ScraplingAdapter 适配器
- ✅ 添加 Web UI API 接口
- ✅ 创建使用示例
- ✅ 编写集成文档

## 测试结果

### 新浪网新闻爬取测试

**测试时间**: 2026-02-27 00:29:47
**测试网址**: https://www.sina.com.cn/
**测试脚本**: `test_sina_news_improved.py`

**测试结果**:
- ✅ 状态码: 200
- ✅ 内容长度: 408,802 字符
- ✅ 编码: utf-8
- ✅ 提取到: 105 条新闻

**输出文件**:
- `sina_news_final.json` - JSON 格式数据
- `sina_news_report.txt` - 文本格式报告

**主要新闻示例**:
1. 天博智能IPO前分红6.3亿
2. 慧仑科技成立 推动机器人产业发展
3. 拒绝加班！用老板的网速偷偷打BOSS
4. 这可能是人类史上最大银行抢劫案 就这样泡汤了
5. DeepSeekR1升级：提升思维深度与推理能力

**功能特点**:
- 自动检测编码并转换为 UTF-8
- 多种选择器策略组合提取
- 智能去重（基于标题）
- 生成 JSON 和 TXT 两种格式报告
- 清晰的日志输出和进度显示
