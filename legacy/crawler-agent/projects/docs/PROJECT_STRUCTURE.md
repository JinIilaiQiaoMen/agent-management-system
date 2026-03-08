# 项目文件结构说明

## 📁 根目录文件

| 文件名 | 说明 |
|--------|------|
| `README.md` | 项目主文档，包含项目介绍、功能特性、快速开始等 |
| `DEPLOYMENT_GUIDE.md` | 详细部署指南，包含完整的安装和配置说明 |
| `QUICKSTART.md` | 快速开始指南，3分钟上手 |
| `INSTALL_GUIDE.md` | 安装指南（如存在） |
| `SCRAPLING_INTEGRATION.md` | Scrapling 框架集成文档 |
| `DELIVERY.md` | 交付文档 |
| `requirements.txt` | Python 依赖包列表 |
| `.env.example` | 环境变量配置示例 |
| `check_env.py` | 环境检查脚本 |
| `install.sh` | Linux/Mac 一键安装脚本 |
| `install.bat` | Windows 一键安装脚本 |
| `start_linux.sh` | Linux/Mac 一键启动脚本 |
| `start_windows.bat` | Windows 一键启动脚本 |

## 📁 核心模块 (`core/`)

爬虫核心功能模块

| 文件名 | 说明 |
|--------|------|
| `base_crawler.py` | 基础爬虫类，提供基础爬取功能 |
| `download_manager.py` | 下载管理器，管理文件下载 |
| `config_manager.py` | 配置管理器，管理爬取配置 |
| `deduplication.py` | 去重模块，防止重复下载 |
| `anti_spider.py` | 反爬虫配置，User-Agent、延迟等 |
| `concurrent_crawler.py` | 并发爬虫，支持多线程 |
| `task_queue.py` | 任务队列，基于 Redis |
| `proxy_manager.py` | 代理管理器，管理代理 IP |
| `resume_manager.py` | 断点续爬管理器 |
| `circuit_breaker.py` | 熔断降级机制 |
| `monitor.py` | 监控告警系统 |
| `content_extractor.py` | 内容提取器，提取文章、图片等 |

## 📁 Web UI (`web_ui/`)

Web 界面相关文件

| 文件名 | 说明 |
|--------|------|
| `app.py` | Flask 应用主文件，包含所有 API 接口 |
| `index.html` | 主页（配置爬取模式） |
| `smart_crawler.html` | 智能爬虫页面 |
| `element_selector.html` | 元素选择页面 |
| `content_preview.html` | 内容预览页面 |
| `config_crawler.html` | 爬虫配置页面 |
| `main.js` | 前端 JavaScript 交互逻辑 |
| `styles.css` | 前端样式文件 |
| `playwright_utils.py` | Playwright 工具函数 |
| `scrapling_adapter.py` | Scrapling 适配器 |

## 📁 Scrapling 模块 (`scrapling/`)

Scrapling 核心模块

| 目录/文件 | 说明 |
|-----------|------|
| `fetchers/` | 获取器模块 |
| `fetchers/fetcher.py` | 基础获取器 |
| `fetchers/async_fetcher.py` | 异步获取器 |
| `fetchers/stealthy_fetcher.py` | 隐形获取器（反反爬） |
| `fetchers/dynamic_fetcher.py` | 动态获取器 |
| `spiders/` | Spider 框架 |
| `spiders/spider.py` | Spider 基类 |
| `parsers/` | 解析器模块 |
| `utils/` | 工具函数 |

## 📁 数据目录

| 目录 | 说明 |
|------|------|
| `downloads/` | 下载文件存储目录 |
| `data/` | 数据库和缓存目录 |
| `logs/` | 日志文件目录 |

## 📁 测试文件

| 文件名 | 说明 |
|--------|------|
| `test_sina_news.py` | 新浪网新闻爬取测试脚本（原始版） |
| `test_sina_news_improved.py` | 新浪网新闻爬取测试脚本（改进版） |
| `scrapling_example.py` | Scrapling 使用示例 |
| `scrapling_spider_example.py` | Spider 使用示例 |

## 📁 输出文件

| 文件名 | 说明 |
|--------|------|
| `sina_news_all.json` | 测试输出：所有爬取数据 |
| `sina_news_final.json` | 测试输出：整理后的数据 |
| `sina_news_report.txt` | 测试输出：文本格式报告 |

## 📁 配置文件

| 文件名 | 说明 |
|--------|------|
| `.env` | 环境变量配置（创建后不提交到版本控制） |
| `.gitignore` | Git 忽略文件配置 |
| `.coze` | Coze CLI 配置文件（如使用 Coze） |

## 📁 其他文件

| 文件名 | 说明 |
|--------|------|
| `cli.py` | 命令行界面 |
| `example_crawler.py` | 示例爬虫 |

---

## 🔧 启动脚本说明

### start_windows.bat (Windows)

功能：
1. 检查 Python 环境
2. 激活虚拟环境（如果存在）
3. 启动 Web 服务
4. 自动打开浏览器

### start_linux.sh (Linux/Mac)

功能：
1. 检查 Python 环境
2. 激活虚拟环境（如果存在）
3. 启动 Web 服务
4. 输出访问地址

---

## 📊 API 接口说明

### 爬虫相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/crawl` | POST | 启动爬取任务 |
| `/api/stop` | POST | 停止爬取任务 |
| `/api/analyze` | POST | 分析网页（智能爬虫） |
| `/api/screenshot` | POST | 获取网页截图 |
| `/api/preview` | GET | 预览已爬取内容 |
| `/api/download` | POST | 下载选中内容 |

### Scrapling 相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/scrapling/fetch` | POST | 获取页面 |
| `/api/scrapling/extract` | POST | 提取数据 |
| `/api/scrapling/bypass` | POST | 绕过反爬 |

### 其他

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/logs` | GET | 获取实时日志 |
| `/api/status` | GET | 获取系统状态 |
| `/api/config` | GET/POST | 获取/更新配置 |

---

## 🚀 快速导航

### 新手入门
1. 阅读 `QUICKSTART.md` - 3分钟快速上手
2. 运行 `install.bat` / `install.sh` - 一键安装
3. 运行 `start_windows.bat` / `start_linux.sh` - 一键启动

### 深入了解
1. 阅读 `README.md` - 了解项目特性
2. 阅读 `DEPLOYMENT_GUIDE.md` - 详细部署说明
3. 阅读 `SCRAPLING_INTEGRATION.md` - Scrapling 集成指南

### 开发调试
1. 运行 `check_env.py` - 检查环境配置
2. 运行 `test_sina_news_improved.py` - 测试爬取功能
3. 查看 `app.log` - 查看运行日志

---

## 📝 文件命名规范

### Python 文件
- 使用小写字母和下划线：`base_crawler.py`
- 类名使用驼峰命名：`BaseCrawler`
- 函数名使用小写和下划线：`fetch_url()`

### HTML/CSS/JS 文件
- 使用小写字母和下划线：`smart_crawler.html`
- 类名使用短横线：`.main-container`
- ID 使用短横线：`#submit-button`

### 配置文件
- 使用 `.env` 后缀：`.env`
- 示例文件使用 `.example` 后缀：`.env.example`

---

## 🔐 安全注意事项

1. **不要提交敏感信息到版本控制**
   - `.env` 文件
   - 密钥、密码等

2. **定期更新依赖**
   ```bash
   pip install --upgrade -r requirements.txt
   ```

3. **使用虚拟环境**
   - 隔离项目依赖
   - 避免版本冲突

4. **遵守爬虫规范**
   - 检查 Robots 协议
   - 设置合理的请求延迟
   - 尊重网站版权

---

## 📞 获取帮助

- 📖 文档：查看各 `.md` 文件
- 🐛 报错：运行 `check_env.py` 诊断环境
- 📧 邮箱：support@example.com
- 💬 论坛：https://forum.example.com

---

**祝你使用愉快！🎉**
