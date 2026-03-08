# 智能Web爬虫控制系统

> 工业级多类型内容爬取自动化平台 | AI驱动 | 智能化 | 可视化

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

---

## 📚 文档导航

| 文档 | 适用场景 | 链接 |
|------|----------|------|
| 🚀 快速开始 | 3分钟上手 | [QUICKSTART.md](QUICKSTART.md) |
| 📖 项目概述 | 了解项目特性 | 本文档 |
| 📦 部署指南 | 完整安装部署 | [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) |
| 🔧 Scrapling集成 | 使用Scrapling功能 | [SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md) |
| 📁 文件结构 | 了解项目结构 | [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) |
| 📋 文档索引 | 查找所有文档 | [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) |

> 💡 **新手推荐**: 先阅读 [QUICKSTART.md](QUICKSTART.md)，3分钟快速上手！

---

## 📌 项目简介

智能Web爬虫控制系统是一款基于Python开发的工业级爬虫工具，采用AI驱动的方式，提供从网页内容分析、智能识别、可视化选择到灵活下载的完整工作流程。

### 核心特性

- 🤖 **AI智能分析**: 自动识别网页中的文本、图片、视频、音频等元素
- 🎨 **可视化操作**: 直观的界面操作，在截图上点击选择目标元素
- ⚡ **高效爬取**: 支持批量处理、并发下载，大幅提升效率
- 🛡️ **合规安全**: 支持Robots协议检查，遵守网络规范
- 📊 **实时监控**: SSE实时日志推送，下载进度可视化
- 📦 **多种输出**: 支持本地文件夹、Excel、CSV多种格式导出
- 🚀 **Scrapling集成**: 集成现代化Web爬虫框架，支持自适应解析和反反爬
- 🔥 **企业级特性**: 支持多线程并发、Redis任务队列、熔断降级、监控告警

---

## 🚀 快速开始

### 一键启动（Windows）

```cmd
双击 start_windows.bat
```

### 一键启动（Linux/Mac）

```bash
chmod +x start_linux.sh
./start_linux.sh
```

### 访问系统

启动成功后，在浏览器中打开：

- **主页（配置爬取）**: http://localhost:5000/
- **智能爬虫**: http://localhost:5000/smart
- **内容预览**: http://localhost:5000/preview

---

## ✨ 功能特性

### 1. 智能爬虫一体化

- AI驱动的网页元素分析
- 自动识别文本、图片、视频、音频
- 可视化选择界面，直观标记目标元素
- 支持点击选中、复选框标记

### 2. 配置爬取模式

- 支持20+种文件格式
- 反爬虫配置（User-Agent、代理、延时）
- 双重去重机制（URL和MD5）
- 批量URL导入

### 3. 内容提取模式

- 提取文章标题和正文
- 提取相关图片和评论
- 智能预览，选择性下载
- 保留文章结构

### 4. 实时日志系统

- SSE实时日志推送
- 分级日志显示
- 下载进度可视化
- 日志历史记录

---

## 📋 系统要求

### 硬件要求

- CPU: 双核 2.0GHz+
- 内存: 4GB+ (推荐 8GB)
- 硬盘: 10GB+ 可用空间
- 网络: 10Mbps+

### 软件要求

- 操作系统: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- Python: 3.8 或更高版本
- 浏览器: Chrome 90+, Firefox 88+, Safari 14+

---

## 🛠️ 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.8+ | 编程语言 |
| Flask | 3.0+ | Web框架 |
| Playwright | 1.40+ | 网页自动化 |
| Requests | 2.31+ | HTTP请求 |
| BeautifulSoup4 | 4.12+ | HTML解析 |
| Scrapling | 0.4+ | 现代化爬虫框架 |
| Redis | - | 任务队列（可选） |

### 前端

| 技术 | 用途 |
|------|------|
| HTML5/CSS3 | 页面布局和样式 |
| Vanilla JavaScript | 交互逻辑 |
| SSE | 实时日志推送 |
| Canvas API | 截图标记绘制 |

---

## 📖 使用示例

### 示例1: 智能爬取新闻网站

1. 访问 `http://localhost:5000/smart`
2. 输入新闻网站URL
3. 点击"开始分析"
4. 在截图上选择要下载的图片
5. 点击"开始下载"

### 示例2: 批量下载视频

1. 访问 `http://localhost:5000/`
2. 勾选 "MP4" 格式
3. 输入多个URL（每行一个）
4. 设置请求间隔
5. 点击"开始爬取"

### 示例3: 提取文章内容

1. 访问 `http://localhost:5000/`
2. 输入文章URL
3. 点击"提取内容"
4. 访问预览页面查看结果
5. 选择性下载

### 示例4: 使用 Scrapling 绕过反爬

1. 访问 `http://localhost:5000/`
2. 切换到 "监控面板" 标签
3. 使用 Scrapling API 获取页面
4. 选择 "StealthyFetcher" 绕过反爬
5. 提取自定义数据

### 示例5: 使用 Scrapling Spider 批量爬取

```python
# 运行 Spider 示例
python3 scrapling_spider_example.py

# 选择要运行的 Spider
# 1. ExampleSpider - 基础示例
# 2. ProductSpider - 电商爬虫
# 3. AsyncSpider - 异步爬虫
# 4. CrawlSpider - 爬取型爬虫
# 5. NewsSpider - 新闻爬虫
```

---

## 📂 项目结构

```
web-crawler/
├── web_ui/                      # Web界面
│   ├── app.py                   # Flask后端
│   ├── templates/               # HTML模板
│   │   ├── index.html           # 配置爬取页面
│   │   ├── smart_crawler.html   # 智能爬虫页面
│   │   └── preview.html         # 内容预览页面
│   ├── content_extractor.py     # 内容提取器
│   └── smart_analyzer.py        # 智能分析器
├── web_crawler.py               # 爬虫核心
├── element_analyzer.py          # 元素分析
├── screenshot_analyzer.py       # 截图分析
├── requirements.txt             # 依赖列表
├── start_windows.bat            # Windows启动脚本
├── start_linux.sh               # Linux/Mac启动脚本
├── README.md                    # 项目说明
├── INSTALL_GUIDE.md             # 安装指南
└── DELIVERY.md                  # 交付文档
```

---

## 🔧 依赖项

```
Flask>=3.0.0
Flask-CORS>=4.0.0
requests>=2.31.0
beautifulsoup4>=4.12.0
lxml>=4.9.0
playwright>=1.40.0
pandas>=2.0.0
openpyxl>=3.1.0
scrapling>=0.4.0
curl_cffi>=0.6.0
cssselect>=1.2.0
orjson>=3.9.0
tld>=0.13.0
w3lib>=2.1.0
msgspec>=0.18.0
anyio>=4.0.0
browserforge>=1.0.0
patchright>=1.40.0
```

---

## 🎯 支持的格式

### 图片
JPG, JPEG, PNG, GIF, BMP, WEBP, SVG

### 音频
MP3, WAV, OGG, FLAC, AAC

### 视频
MP4, AVI, MOV, WMV, MKV, WEBM

### 文档
PDF, DOCX, XLSX, PPTX, TXT, HTML

---

## 📚 文档

- [交付文档](DELIVERY.md) - 详细的项目介绍和技术文档
- [安装指南](INSTALL_GUIDE.md) - 详细的安装和配置说明
- [Scrapling集成文档](SCRAPLING_INTEGRATION.md) - Scrapling框架集成指南
- [常见问题](#常见问题) - 常见问题解答

---

## 🚀 Scrapling 集成

本项目已成功集成 Scrapling 现代化 Web 爬虫框架，提供以下高级功能：

### 核心特性

- **自适应解析**: 自动学习网站结构，结构变化时自动重新定位
- **反反爬**: 支持 Cloudflare Turnstile 等反爬系统绕过
- **并发爬取**: 支持异步并发，大幅提升爬取效率
- **动态网页**: 自动处理 JavaScript 渲染内容

### 使用方式

#### 1. Web UI API

```bash
# 获取页面
curl -X POST http://localhost:5000/api/scrapling/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# 提取数据
curl -X POST http://localhost:5000/api/scrapling/extract \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selectors": {
      "title": "h1::text",
      "links": "a::attr(href)"
    }
  }'
```

#### 2. Python 代码

```python
from scrapling_adapter import ScraplingAdapter

# 创建适配器
adapter = ScraplingAdapter()

# 获取页面
page = adapter.fetch_url('https://example.com')

# 提取数据
data = adapter.extract_data(page, {
    'title': 'h1::text',
    'links': 'a::attr(href)'
})
```

#### 3. 使用 Spider

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

### 测试结果

**新浪网新闻爬取测试** (2026-02-27):
- ✅ 成功提取 105 条新闻
- ✅ JSON 格式和文本格式报告
- ✅ 自动编码检测和转换
- ✅ 智能去重和数据清洗

查看详细文档: [SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md)

---

## ❓ 常见问题

### Q: 如何修改端口号？

修改 `web_ui/app.py` 文件末尾的端口号

### Q: 如何使用代理？

在配置页面设置代理地址和端口

### Q: 如何提高爬取速度？

- 减少请求间隔
- 使用更快的网络连接
- 批量处理时关闭实时日志

### Q: 为什么某些元素无法识别？

- 元素使用JavaScript动态加载
- 元素被反爬虫机制保护
- 截图分辨率不够高

---

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 分析速度 | 5-10秒/页面 |
| 下载速度 | 1-5秒/文件 |
| 并发处理 | 5-10个并发 |
| 内存占用 | 200-500MB |
| 成功率 | 85-95% |

---

## 🤝 贡献

欢迎提交Issue和Pull Request

---

## 📄 许可证

MIT License

---

## 👥 联系方式

如有问题，请提交Issue或联系开发团队

---

## 📚 相关文档

- 🚀 [快速开始指南](QUICKSTART.md) - 3分钟上手
- 📦 [部署指南](DEPLOYMENT_GUIDE.md) - 详细安装和配置说明
- 🔧 [Scrapling集成文档](SCRAPLING_INTEGRATION.md) - Scrapling框架使用指南
- 📁 [项目文件结构](PROJECT_STRUCTURE.md) - 了解项目文件组织
- 📋 [文档索引](DOCUMENTATION_INDEX.md) - 完整文档导航

---

## 🔄 更新日志

### v2.0.0 (2026-02-27)
- ✅ 集成 Scrapling 现代化 Web 爬虫框架
- ✅ 新增自适应解析功能
- ✅ 新增反反爬功能（StealthyFetcher）
- ✅ 新增动态网页处理（DynamicFetcher）
- ✅ 完成新浪网新闻爬取测试（105条新闻）
- ✅ 创建完整文档体系（7个文档文件）
- ✅ 创建一键安装和启动脚本
- ✅ 创建环境检查脚本

### v1.0.0 (2025-02-26)
- ✅ 初始版本发布
- ✅ 基础爬虫功能
- ✅ Web UI 界面
- ✅ 实时日志推送
- ✅ 企业级特性（并发、任务队列、监控）

---

**最后更新**: 2026-02-27
**版本**: v2.0.0

---

**感谢您的使用！🎉**
