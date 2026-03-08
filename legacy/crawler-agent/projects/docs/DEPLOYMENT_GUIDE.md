# 智能Web爬虫控制系统 - 部署与使用指南

> 🚀 一键部署 · 🎯 开箱即用 · 📚 详细文档

---

## 📖 目录

- [项目概述](#项目概述)
- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [详细安装步骤](#详细安装步骤)
- [配置说明](#配置说明)
- [使用指南](#使用指南)
- [常见问题](#常见问题)
- [故障排查](#故障排查)
- [进阶功能](#进阶功能)

---

## 项目概述

### 项目简介

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

### 技术栈

| 类别 | 技术 |
|------|------|
| 核心语言 | Python 3.8+ |
| Web框架 | Flask 3.0+ |
| 爬虫框架 | Scrapling 0.4+ |
| 数据解析 | BeautifulSoup4, lxml |
| 浏览器自动化 | Playwright, Patchright |
| 任务队列 | Redis |
| 数据库 | SQLite |
| 数据处理 | Pandas, OpenPyXL |

---

## 系统要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 双核 2.0GHz | 四核 3.0GHz+ |
| 内存 | 4GB | 8GB+ |
| 硬盘 | 10GB 可用空间 | 50GB+ SSD |
| 网络 | 10Mbps | 100Mbps+ |

### 软件要求

| 软件 | 版本要求 |
|------|----------|
| 操作系统 | Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+) |
| Python | 3.8 或更高版本 |
| 浏览器 | Chrome 90+, Firefox 88+, Safari 14+ |
| Git | 2.0+ （可选，用于克隆项目） |
| Redis | 6.0+ （可选，用于任务队列） |

---

## 快速开始

### 方法一：Windows 用户（推荐）

#### 🚀 一键启动

1. **下载项目**
   ```cmd
   # 如果已下载，跳过此步骤
   # 解压到任意目录，例如：C:\web-crawler
   ```

2. **一键启动**
   ```cmd
   # 双击运行启动脚本
   start_windows.bat
   ```

3. **访问系统**
   ```
   浏览器自动打开：http://localhost:5000
   ```

#### 📝 启动脚本说明

`start_windows.bat` 会自动执行以下操作：
- ✅ 检查 Python 环境
- ✅ 安装/更新依赖
- ✅ 启动 Web 服务
- ✅ 自动打开浏览器

### 方法二：Linux/Mac 用户

#### 🚀 一键启动

1. **下载项目**
   ```bash
   # 如果已下载，跳过此步骤
   # 解压到任意目录，例如：~/web-crawler
   ```

2. **一键启动**
   ```bash
   # 添加执行权限并运行
   chmod +x start_linux.sh
   ./start_linux.sh
   ```

3. **访问系统**
   ```
   浏览器打开：http://localhost:5000
   ```

### 方法三：手动启动（适用于所有平台）

#### 1. 克隆或下载项目

```bash
# 如果使用 Git
git clone <repository-url>
cd web-crawler

# 或直接解压已下载的项目包
```

#### 2. 创建虚拟环境（推荐）

```bash
# Python 3.8+
python3 -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 3. 安装依赖

```bash
# 安装所有依赖
pip install -r requirements.txt

# 如果安装速度慢，使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 4. 启动服务

```bash
# 启动 Web 服务
python web_ui/app.py
```

#### 5. 访问系统

```
浏览器打开：http://localhost:5000
```

---

## 详细安装步骤

### Windows 完整安装指南

#### 第一步：安装 Python

1. 下载 Python 安装包
   ```
   官网：https://www.python.org/downloads/
   推荐：Python 3.10 或 3.11
   ```

2. 运行安装程序
   - ✅ 勾选 "Add Python to PATH"
   - ✅ 点击 "Install Now"

3. 验证安装
   ```cmd
   python --version
   # 应该显示：Python 3.10.x 或更高版本
   ```

#### 第二步：下载项目

1. 下载项目压缩包并解压
   ```
   解压路径建议：C:\web-crawler
   ```

2. 打开项目目录
   ```cmd
   cd C:\web-crawler
   ```

#### 第三步：安装依赖

```cmd
# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

#### 第四步：安装 Playwright 浏览器

```cmd
# 安装 Playwright 浏览器（可选，用于动态网页）
playwright install

# 如果只需要 Chromium
playwright install chromium
```

#### 第五步：启动服务

```cmd
# 一键启动
start_windows.bat

# 或手动启动
python web_ui/app.py
```

### Linux 完整安装指南

#### 第一步：安装系统依赖

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv git

# CentOS/RHEL
sudo yum install python3 python3-pip git

# macOS
brew install python3 git
```

#### 第二步：下载项目

```bash
# 如果使用 Git
git clone <repository-url>
cd web-crawler

# 或直接解压项目包
cd ~/web-crawler
```

#### 第三步：创建虚拟环境

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate
```

#### 第四步：安装依赖

```bash
# 安装 Python 依赖
pip install -r requirements.txt

# 如果安装速度慢，使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 第五步：安装 Playwright 浏览器

```bash
# 安装 Playwright 浏览器
playwright install

# 如果只需要 Chromium
playwright install chromium

# 安装系统依赖（如果报错）
playwright install-deps
```

#### 第六步：启动服务

```bash
# 一键启动
chmod +x start_linux.sh
./start_linux.sh

# 或手动启动
python web_ui/app.py
```

### macOS 完整安装指南

#### 第一步：安装 Homebrew（如果未安装）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 第二步：安装 Python

```bash
# 使用 Homebrew 安装 Python
brew install python3

# 验证安装
python3 --version
```

#### 第三步：下载项目

```bash
# 如果使用 Git
git clone <repository-url>
cd web-crawler

# 或直接解压项目包
cd ~/web-crawler
```

#### 第四步：创建虚拟环境并安装依赖

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

#### 第五步：安装 Playwright 浏览器

```bash
# 安装 Playwright 浏览器
playwright install

# 如果只需要 Chromium
playwright install chromium
```

#### 第六步：启动服务

```bash
# 一键启动
chmod +x start_linux.sh
./start_linux.sh

# 或手动启动
python web_ui/app.py
```

---

## 配置说明

### 环境变量配置

创建 `.env` 文件（可选）：

```bash
# Web 服务配置
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# 数据库配置
DATABASE_URL=sqlite:///web_crawler.db

# Redis 配置（可选）
REDIS_URL=redis://localhost:6379/0

# 下载配置
DOWNLOAD_DIR=./downloads
MAX_CONCURRENT_DOWNLOADS=5
DOWNLOAD_TIMEOUT=30

# 反爬虫配置
DEFAULT_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
DEFAULT_DELAY=1
DEFAULT_RETRIES=3

# 代理配置（可选）
PROXY_URL=http://proxy.example.com:8080
PROXY_USER=username
PROXY_PASS=password
```

### 下载目录配置

默认下载目录：`./downloads`

修改下载目录：

1. **通过环境变量**
   ```bash
   DOWNLOAD_DIR=/path/to/your/downloads
   ```

2. **通过代码修改**
   ```python
   # 在 web_ui/app.py 中修改
   DOWNLOAD_DIR = '/path/to/your/downloads'
   ```

### 端口配置

默认端口：`5000`

修改端口：

```python
# 在 web_ui/app.py 中修改
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    # 修改 port 为其他端口，例如 8080
```

### Redis 配置（可选）

安装 Redis：

```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis

# macOS
brew install redis

# 启动 Redis
redis-server
```

配置 Redis 连接：

```python
# 在 web_ui/app.py 中修改
REDIS_URL = 'redis://localhost:6379/0'
```

---

## 使用指南

### 访问系统

启动成功后，在浏览器中访问以下地址：

```
http://localhost:5000
```

### 主要功能页面

#### 1. 主页（配置爬取）

**地址**: http://localhost:5000/

**功能**:
- 输入目标 URL
- 配置爬取参数
- 选择文件格式
- 配置反爬虫设置
- 启动爬取任务

**使用步骤**:
1. 在输入框中输入目标 URL
2. 勾选需要爬取的文件类型（图片、音频、视频、文档）
3. 配置反爬虫参数（User-Agent、请求延迟、重试次数）
4. 点击"开始爬取"按钮

#### 2. 智能爬虫

**地址**: http://localhost:5000/smart

**功能**:
- AI 智能分析网页
- 自动识别页面元素
- 可视化选择目标
- 一键启动爬取

**使用步骤**:
1. 输入目标 URL
2. 点击"分析网页"按钮
3. 等待 AI 分析完成
4. 在截图上点击需要爬取的元素
5. 点击"开始爬取"按钮

#### 3. 内容预览

**地址**: http://localhost:5000/preview

**功能**:
- 预览已爬取的内容
- 查看下载进度
- 选择性下载
- 导出为 Excel/CSV

**使用步骤**:
1. 查看已识别的内容列表
2. 预览图片、视频等内容
3. 选择需要下载的项目
4. 点击"下载选中"按钮

### Scrapling 功能使用

#### 通过 Web UI 使用

1. **获取页面**
   - 访问：http://localhost:5000/
   - 使用 API 调用 `/api/scrapling/fetch`

2. **提取数据**
   - 访问：http://localhost:5000/
   - 使用 API 调用 `/api/scrapling/extract`

#### 通过 API 使用

**获取页面**:
```bash
curl -X POST http://localhost:5000/api/scrapling/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "use_stealthy": false,
    "use_dynamic": false,
    "headless": true
  }'
```

**提取数据**:
```bash
curl -X POST http://localhost:5000/api/scrapling/extract \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selectors": {
      "title": "h1::text",
      "price": ".price::text",
      "image": ".product-img::attr(src)"
    }
  }'
```

**绕过 Cloudflare**:
```bash
curl -X POST http://localhost:5000/api/scrapling/bypass \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

#### 通过 Python 代码使用

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

### 运行测试脚本

#### 新浪网新闻爬取测试

```bash
# 运行改进版测试脚本
python3 test_sina_news_improved.py

# 查看结果
cat sina_news_report.txt
```

**测试结果**:
- ✅ 自动提取 105 条新闻
- ✅ 生成 JSON 和文本报告
- ✅ 自动检测编码
- ✅ 智能去重

---

## 常见问题

### Q1: 启动失败，提示 "ModuleNotFoundError"

**原因**: 缺少依赖包

**解决方案**:
```bash
# 重新安装所有依赖
pip install -r requirements.txt

# 如果使用虚拟环境，确保已激活
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Q2: 端口 5000 被占用

**原因**: 其他程序占用了 5000 端口

**解决方案**:

**Windows**:
```cmd
# 查找占用端口的进程
netstat -ano | findstr :5000

# 结束进程
taskkill /PID <进程ID> /F
```

**Linux/Mac**:
```bash
# 查找占用端口的进程
lsof -i :5000

# 结束进程
kill -9 <进程ID>
```

或者修改端口：
```python
# 在 web_ui/app.py 中修改
app.run(host='0.0.0.0', port=8080, debug=True)
```

### Q3: Playwright 浏览器未安装

**原因**: Playwright 浏览器未安装

**解决方案**:
```bash
# 安装所有浏览器
playwright install

# 只安装 Chromium
playwright install chromium

# 安装系统依赖（Linux）
playwright install-deps
```

### Q4: 爬取速度慢

**原因**: 请求延迟设置过高

**解决方案**:
1. 在 Web UI 中降低请求延迟
2. 使用并发下载
3. 使用代理 IP

```python
# 在代码中配置
DEFAULT_DELAY = 0.5  # 降低延迟
MAX_CONCURRENT_DOWNLOADS = 10  # 增加并发数
```

### Q5: 遇到反爬限制

**原因**: 目标网站有反爬虫机制

**解决方案**:

1. **使用 StealthyFetcher**
```bash
curl -X POST http://localhost:5000/api/scrapling/bypass \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

2. **使用代理 IP**
```python
# 配置代理
proxy = {
    'http': 'http://proxy.example.com:8080',
    'https': 'https://proxy.example.com:8080'
}
```

3. **增加请求延迟**
```python
DEFAULT_DELAY = 2  # 增加延迟到 2 秒
```

4. **轮换 User-Agent**
```python
user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
]
```

### Q6: 下载的文件乱码

**原因**: 编码问题

**解决方案**:
```python
# 在代码中指定编码
response.encoding = 'utf-8'
# 或
response.encoding = 'gbk'
```

### Q7: Redis 连接失败

**原因**: Redis 未安装或未启动

**解决方案**:

1. **安装 Redis**
```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHL
sudo yum install redis

# macOS
brew install redis
```

2. **启动 Redis**
```bash
redis-server
```

3. **测试连接**
```bash
redis-cli ping
# 应该返回：PONG
```

### Q8: 内存占用过高

**原因**: 并发数设置过高或爬取大量内容

**解决方案**:
1. 降低并发数
2. 使用分批处理
3. 定期清理下载的临时文件

```python
MAX_CONCURRENT_DOWNLOADS = 3  # 降低并发数
```

### Q9: 如何停止爬取任务？

**解决方案**:

1. **Web UI**: 在控制台点击"停止"按钮
2. **命令行**: 按 Ctrl+C 停止服务
3. **代码**: 使用信号处理

```python
import signal
import sys

def signal_handler(sig, frame):
    print('\n停止爬取...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
```

### Q10: 如何查看日志？

**解决方案**:

1. **Web UI**: 在页面底部的日志区域查看
2. **控制台**: 查看运行命令行的输出
3. **日志文件**: 查看 `app.log` 文件

```bash
# 查看最新日志
tail -f app.log

# 查看错误日志
grep ERROR app.log
```

---

## 故障排查

### 问题诊断流程

#### 1. 检查环境

```bash
# 检查 Python 版本
python --version

# 检查依赖是否安装
pip list | grep -E "Flask|requests|beautifulsoup4"

# 检查端口是否被占用
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

#### 2. 检查配置

```bash
# 检查配置文件
cat .env

# 检查日志文件
tail -n 50 app.log
```

#### 3. 测试网络连接

```bash
# 测试目标网站是否可访问
curl -I https://example.com

# 测试代理连接（如果使用）
curl -I --proxy http://proxy.example.com:8080 https://example.com
```

#### 4. 运行测试脚本

```bash
# 运行测试脚本
python3 test_sina_news_improved.py

# 检查测试输出
cat sina_news_report.txt
```

### 常见错误及解决方案

#### 错误 1: `ImportError: No module named 'flask'`

**原因**: Flask 未安装

**解决方案**:
```bash
pip install flask
```

#### 错误 2: `ConnectionError: Max retries exceeded`

**原因**: 网络连接失败

**解决方案**:
1. 检查网络连接
2. 检查目标网站是否可访问
3. 增加重试次数

```python
DEFAULT_RETRIES = 5
```

#### 错误 3: `TimeoutError: Request timeout`

**原因**: 请求超时

**解决方案**:
1. 增加超时时间
2. 使用代理 IP
3. 降低并发数

```python
DOWNLOAD_TIMEOUT = 60  # 增加超时时间
```

#### 错误 4: `PermissionError: [Errno 13] Permission denied`

**原因**: 没有写入权限

**解决方案**:
1. 检查下载目录权限
2. 使用管理员权限运行
3. 修改下载目录

```bash
# Linux/Mac: 修改权限
chmod 755 downloads/

# Windows: 以管理员身份运行
```

#### 错误 5: `SSLError: SSL: CERTIFICATE_VERIFY_FAILED`

**原因**: SSL 证书验证失败

**解决方案**:
```python
import requests
from urllib3.exceptions import InsecureRequestWarning

# 禁用 SSL 验证（不推荐生产环境使用）
requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)
response = requests.get(url, verify=False)
```

#### 错误 6: `PlaywrightError: Executable doesn't exist`

**原因**: Playwright 浏览器未安装

**解决方案**:
```bash
playwright install
```

#### 错误 7: `RedisError: Connection refused`

**原因**: Redis 未启动

**解决方案**:
```bash
# 启动 Redis
redis-server

# 或使用后台模式
redis-server --daemonize yes
```

---

## 进阶功能

### 1. 使用 Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM python:3.10-slim

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# 安装 Playwright 依赖
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 安装 Playwright 浏览器
RUN playwright install chromium
RUN playwright install-deps chromium

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 5000

# 启动服务
CMD ["python", "web_ui/app.py"]
```

构建并运行:

```bash
# 构建镜像
docker build -t web-crawler .

# 运行容器
docker run -d -p 5000:5000 --name web-crawler web-crawler

# 查看日志
docker logs -f web-crawler

# 停止容器
docker stop web-crawler
```

### 2. 使用 Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - ./downloads:/app/downloads
      - ./data:/app/data
    environment:
      - FLASK_ENV=production
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

启动服务:

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down
```

### 3. 配置 Nginx 反向代理

创建 Nginx 配置文件:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

启动 Nginx:

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置 SSL/HTTPS

使用 Let's Encrypt:

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 5. 使用 Supervisor 管理进程

创建配置文件 `/etc/supervisor/conf.d/web-crawler.conf`:

```ini
[program:web-crawler]
command=/path/to/venv/bin/python web_ui/app.py
directory=/path/to/web-crawler
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/web-crawler.log
environment=FLASK_ENV="production"
```

启动服务:

```bash
# 重新加载配置
sudo supervisorctl reread
sudo supervisorctl update

# 启动服务
sudo supervisorctl start web-crawler

# 查看状态
sudo supervisorctl status
```

### 6. 配置日志轮转

创建日志轮转配置 `/etc/logrotate.d/web-crawler`:

```
/var/log/web-crawler.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 7. 监控和告警

使用 Prometheus + Grafana:

```python
from prometheus_client import start_http_server, Counter

# 创建指标
crawl_requests = Counter('crawl_requests_total', 'Total crawl requests')
crawl_errors = Counter('crawl_errors_total', 'Total crawl errors')

# 在代码中使用
crawl_requests.inc()
```

---

## 支持与反馈

### 获取帮助

- 📖 查看文档：[README.md](README.md)
- 📚 集成文档：[SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md)
- 🐛 报告问题：通过项目 Issue 页面

### 技术支持

- 邮箱：support@example.com
- 微信群：扫描二维码加入
- 论坛：https://forum.example.com

### 贡献代码

欢迎提交 Pull Request！

---

## 许可证

MIT License

---

## 更新日志

### v2.0.0 (2026-02-27)
- ✅ 集成 Scrapling 现代化 Web 爬虫框架
- ✅ 新增自适应解析功能
- ✅ 新增反反爬功能（StealthyFetcher）
- ✅ 新增动态网页处理（DynamicFetcher）
- ✅ 完成新浪网新闻爬取测试
- ✅ 更新部署文档

### v1.0.0 (2025-02-26)
- ✅ 初始版本发布
- ✅ 基础爬虫功能
- ✅ Web UI 界面
- ✅ 实时日志推送
- ✅ 企业级特性（并发、任务队列、监控）

---

**祝你使用愉快！🎉**
