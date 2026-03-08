# 🎯 智能Web爬虫控制系统 - 部署和使用总览

> 📚 一站式文档索引，快速找到所需信息

---

## 🚀 5分钟快速上手

### 第一步：安装（1分钟）

**Windows**:
```cmd
install.bat
```

**Linux/Mac**:
```bash
chmod +x install.sh
./install.sh
```

### 第二步：启动（1分钟）

**Windows**:
```cmd
start_windows.bat
```

**Linux/Mac**:
```bash
./start_linux.sh
```

### 第三步：使用（3分钟）

1. 浏览器打开：`http://localhost:5000`
2. 输入目标 URL
3. 选择文件类型
4. 点击"开始爬取"

---

## 📚 完整文档列表

### 快速入门（推荐新手）

| 文档 | 时间 | 说明 |
|------|------|------|
| [QUICKSTART.md](QUICKSTART.md) | 3分钟 | 快速开始指南 |
| [README.md](README.md) | 5分钟 | 项目概述 |

### 安装部署

| 文档 | 时间 | 说明 |
|------|------|------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | 15分钟 | 完整部署指南 |

### 技术文档

| 文档 | 时间 | 说明 |
|------|------|------|
| [SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md) | 10分钟 | Scrapling集成 |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | 10分钟 | 文件结构 |

### 文档导航

| 文档 | 时间 | 说明 |
|------|------|------|
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | 5分钟 | 文档索引 |

---

## 🛠️ 快速命令参考

### 安装命令

```bash
# 一键安装
install.bat              # Windows
./install.sh            # Linux/Mac

# 手动安装
pip install -r requirements.txt
playwright install chromium
```

### 启动命令

```bash
# 一键启动
start_windows.bat       # Windows
./start_linux.sh        # Linux/Mac

# 手动启动
python web_ui/app.py
```

### 检查命令

```bash
# 环境检查
python check_env.py

# 查看日志
tail -f app.log

# 测试爬取
python test_sina_news_improved.py
```

---

## 🌐 API 快速参考

### 基础 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/crawl` | POST | 启动爬取 |
| `/api/analyze` | POST | 分析网页 |
| `/api/screenshot` | POST | 获取截图 |
| `/api/preview` | GET | 预览内容 |
| `/api/download` | POST | 下载内容 |

### Scrapling API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/scrapling/fetch` | POST | 获取页面 |
| `/api/scrapling/extract` | POST | 提取数据 |
| `/api/scrapling/bypass` | POST | 绕过反爬 |

### 使用示例

```bash
# Scrapling 获取页面
curl -X POST http://localhost:5000/api/scrapling/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Scrapling 提取数据
curl -X POST http://localhost:5000/api/scrapling/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "selectors": {"title": "h1::text"}}'
```

---

## 📊 功能速查表

### 三大核心功能

| 功能 | 页面 | 适用场景 |
|------|------|----------|
| 配置爬取 | `/` | 批量下载文件 |
| 智能爬虫 | `/smart` | 精准提取内容 |
| 内容预览 | `/preview` | 选择性下载 |

### Scrapling 三大功能

| 功能 | 特点 | 适用场景 |
|------|------|----------|
| Fetcher | 基础获取 | 简单静态页面 |
| StealthyFetcher | 反反爬 | 有反爬机制的网站 |
| DynamicFetcher | 动态网页 | JS 渲染页面 |

---

## 🔧 配置速查

### 环境变量配置

创建 `.env` 文件：

```bash
# Web 服务
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key

# 下载配置
DOWNLOAD_DIR=./downloads
MAX_CONCURRENT_DOWNLOADS=5

# 反爬虫配置
DEFAULT_DELAY=1
DEFAULT_RETRIES=3

# 代理配置（可选）
PROXY_URL=http://proxy.example.com:8080
```

### 修改端口

在 `web_ui/app.py` 中修改：

```python
app.run(host='0.0.0.0', port=8080, debug=True)
```

---

## 🧪 测试示例

### 新浪网新闻爬取测试

```bash
# 运行测试
python test_sina_news_improved.py

# 查看结果
cat sina_news_report.txt

# 预期结果
# ✅ 成功提取 105 条新闻
# ✅ JSON 和文本报告
```

### Scrapling 测试

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

print(data)
```

---

## ❓ 常见问题速查

| 问题 | 解决方案 |
|------|----------|
| 缺少依赖 | `pip install -r requirements.txt` |
| 端口被占用 | 修改端口或结束占用进程 |
| Playwright 未安装 | `playwright install chromium` |
| 爬取速度慢 | 降低延迟，增加并发 |
| 遇到反爬 | 使用 StealthyFetcher |

---

## 📁 项目结构速查

```
web-crawler/
├── core/                    # 核心模块
│   ├── base_crawler.py      # 基础爬虫
│   ├── download_manager.py  # 下载管理
│   └── ...
├── web_ui/                  # Web 界面
│   ├── app.py               # Flask 应用
│   ├── index.html           # 主页
│   ├── smart_crawler.html   # 智能爬虫
│   └── ...
├── scrapling/               # Scrapling 框架
│   ├── fetchers/            # 获取器
│   ├── spiders/             # Spider
│   └── ...
├── downloads/               # 下载目录
├── data/                    # 数据目录
├── start_windows.bat        # Windows 启动脚本
├── start_linux.sh           # Linux/Mac 启动脚本
├── install.bat              # Windows 安装脚本
├── install.sh               # Linux/Mac 安装脚本
├── check_env.py             # 环境检查脚本
├── requirements.txt         # 依赖列表
└── README.md                # 项目文档
```

---

## 🎯 按角色选择文档

### 👨‍💻 新手用户
1. [QUICKSTART.md](QUICKSTART.md) - 快速开始
2. 运行安装脚本
3. 运行启动脚本
4. 开始使用

### 🏢 部署人员
1. [README.md](README.md) - 了解项目
2. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 详细部署
3. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 文件结构
4. 按照指南部署

### 👨‍🔧 开发人员
1. [README.md](README.md) - 了解项目
2. [SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md) - Scrapling 集成
3. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 文件结构
4. 阅读源代码开发

### 📋 项目负责人
1. [README.md](README.md) - 项目概述
2. [DELIVERY.md](DELIVERY.md) - 交付文档
3. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 部署指南

---

## 📞 获取帮助

### 自助排查

1. **检查环境**
   ```bash
   python check_env.py
   ```

2. **查看日志**
   ```bash
   tail -f app.log
   ```

3. **查看文档**
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 故障排查
   - [README.md](README.md) - 常见问题

### 联系支持

- 📧 邮箱：support@example.com
- 💬 论坛：https://forum.example.com
- 🐛 Issues：提交 Issue

---

## 🎉 开始使用

### Windows 用户

```cmd
# 1. 安装
install.bat

# 2. 启动
start_windows.bat

# 3. 访问
浏览器打开 http://localhost:5000
```

### Linux/Mac 用户

```bash
# 1. 安装
chmod +x install.sh
./install.sh

# 2. 启动
./start_linux.sh

# 3. 访问
浏览器打开 http://localhost:5000
```

---

## 📚 文档维护

本文档索引会随着项目发展持续更新。

最后更新：2026-02-27

---

**祝你使用愉快！🎉**
