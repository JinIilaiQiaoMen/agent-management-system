# 项目依赖库说明

本文档详细列出了项目所需的所有Python库，包括核心依赖、Web UI依赖和可选依赖。

---

## 📦 依赖库概览

### 核心依赖（必需）
用于爬虫核心功能，必须安装。

| 库名 | 最低版本 | 说明 |
|------|----------|------|
| requests | 2.31.0 | HTTP请求库 |
| beautifulsoup4 | 4.12.0 | HTML解析库 |
| pandas | 2.0.0 | 数据处理库 |
| openpyxl | 3.1.0 | Excel支持 |
| urllib3 | 2.0.0 | HTTP底层库 |

### Web UI依赖（必需）
用于Web界面，如果需要使用Web UI则必须安装。

| 库名 | 最低版本 | 说明 |
|------|----------|------|
| flask | 2.3.0 | Web框架 |
| flask-cors | 4.0.0 | 跨域支持 |

### 可选依赖
增强功能，按需安装。

| 库名 | 最低版本 | 说明 |
|------|----------|------|
| lxml | 4.9.0 | 高性能XML/HTML解析器 |
| aiohttp | 3.8.0 | 异步HTTP支持 |
| tqdm | 4.66.0 | 进度条显示 |
| oss2 | 2.18.0 | 阿里云OSS支持 |
| boto3 | 1.28.0 | AWS S3支持 |
| pymysql | 1.1.0 | MySQL数据库支持 |

---

## 🔧 安装方式

### 方式1：一键安装（推荐）⭐

```bash
python install.py --venv
```

详细说明请查看：[INSTALL.md](INSTALL.md)

### 方式2：手动安装核心依赖

```bash
pip install -r requirements.txt
```

### 方式3：手动安装Web UI依赖

```bash
pip install -r web_ui/requirements.txt
```

### 方式4：安装全部依赖

```bash
pip install -r requirements.txt
pip install -r web_ui/requirements.txt
```

---

## 📚 详细依赖说明

### 核心依赖

#### 1. requests

**版本要求**：>= 2.31.0

**功能**：
- 发送HTTP请求
- 处理Cookie
- 会话管理
- 文件上传/下载

**用途**：
- 获取网页内容
- 下载图片/音频/视频/文档
- 处理登录和会话

**示例**：
```python
import requests

# 基本请求
response = requests.get('https://example.com')

# 带请求头
headers = {'User-Agent': 'Mozilla/5.0'}
response = requests.get(url, headers=headers)

# 下载文件
response = requests.get(image_url)
with open('image.jpg', 'wb') as f:
    f.write(response.content)
```

---

#### 2. beautifulsoup4

**版本要求**：>= 4.12.0

**功能**：
- 解析HTML/XML
- 查找和提取元素
- 处理损坏的HTML

**用途**：
- 解析网页HTML
- 提取img/audio/video/a标签
- 获取链接和属性

**示例**：
```python
from bs4 import BeautifulSoup

# 解析HTML
soup = BeautifulSoup(html_content, 'html.parser')

# 查找所有图片
images = soup.find_all('img')
for img in images:
    print(img.get('src'))
```

---

#### 3. pandas

**版本要求**：>= 2.0.0

**功能**：
- 数据处理和分析
- CSV/Excel文件读写
- 数据去重和过滤

**用途**：
- 生成爬取报告（CSV/Excel）
- 数据去重
- 统计分析

**示例**：
```python
import pandas as pd

# 创建DataFrame
data = {'url': ['https://example.com/1.jpg'], 'type': ['image']}
df = pd.DataFrame(data)

# 保存为Excel
df.to_excel('report.xlsx', index=False)
```

---

#### 4. openpyxl

**版本要求**：>= 3.1.0

**功能**：
- 读写Excel文件（.xlsx）
- 操作工作表和单元格

**用途**：
- 生成Excel格式的爬取报告
- 读取配置文件

**注意**：
- 只支持.xlsx格式，不支持旧版.xls格式

**示例**：
```python
from openpyxl import Workbook

# 创建Excel文件
wb = Workbook()
ws = wb.active
ws['A1'] = 'URL'
ws['B1'] = 'Type'

wb.save('report.xlsx')
```

---

#### 5. urllib3

**版本要求**：>= 2.0.0

**功能**：
- HTTP连接池
- 重试机制
- 编码解码

**用途**：
- requests库的底层依赖
- 连接管理

**注意**：
- 通常作为requests的依赖自动安装

---

### Web UI依赖

#### 1. flask

**版本要求**：>= 2.3.0

**功能**：
- Web框架
- 路由管理
- 模板渲染
- 请求/响应处理

**用途**：
- Web UI后端服务
- API接口
- SSE实时日志推送

**示例**：
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/status')
def get_status():
    return jsonify({'status': 'running'})

if __name__ == '__main__':
    app.run(port=5000)
```

---

#### 2. flask-cors

**版本要求**：>= 4.0.0

**功能**：
- 处理跨域请求
- CORS配置

**用途**：
- 允许前端跨域访问API
- 安全性配置

**示例**：
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 启用跨域支持
```

---

### 可选依赖

#### 1. lxml

**版本要求**：>= 4.9.0

**功能**：
- 高性能XML/HTML解析
- XPath支持
- XSLT转换

**用途**：
- 提高HTML解析速度
- 复杂的XPath查询

**优势**：
- 比默认解析器快得多
- 支持更复杂的查询

**安装**：
```bash
pip install lxml>=4.9.0
```

**使用**：
```python
from bs4 import BeautifulSoup

# 使用lxml解析器
soup = BeautifulSoup(html_content, 'lxml')
```

---

#### 2. aiohttp

**版本要求**：>= 3.8.0

**功能**：
- 异步HTTP客户端/服务器
- 支持async/await

**用途**：
- 异步爬虫
- 高并发请求

**优势**：
- 提高并发性能
- 减少等待时间

**安装**：
```bash
pip install aiohttp>=3.8.0
```

**使用**：
```python
import aiohttp
import asyncio

async def fetch(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

async def main():
    html = await fetch('https://example.com')

asyncio.run(main())
```

---

#### 3. tqdm

**版本要求**：>= 4.66.0

**功能**：
- 进度条显示
- 时间预估
- 性能监控

**用途**：
- 显示爬取进度
- 估算剩余时间

**安装**：
```bash
pip install tqdm>=4.66.0
```

**使用**：
```python
from tqdm import tqdm

for url in tqdm(urls, desc="爬取进度"):
    crawl(url)
```

---

#### 4. oss2

**版本要求**：>= 2.18.0

**功能**：
- 阿里云OSS存储
- 文件上传/下载
- 权限管理

**用途**：
- 将爬取的内容存储到阿里云OSS
- 对象存储管理

**安装**：
```bash
pip install oss2>=2.18.0
```

**使用**：
```python
import oss2

# 配置OSS
auth = oss2.Auth('AccessKey', 'AccessSecret')
bucket = oss2.Bucket(auth, 'endpoint', 'bucket-name')

# 上传文件
with open('image.jpg', 'rb') as f:
    bucket.put_object('images/image.jpg', f)
```

---

#### 5. boto3

**版本要求**：>= 1.28.0

**功能**：
- AWS SDK
- S3存储
- 其他AWS服务

**用途**：
- 将爬取的内容存储到AWS S3
- AWS服务集成

**安装**：
```bash
pip install boto3>=1.28.0
```

**使用**：
```python
import boto3

# 配置S3
s3 = boto3.client('s3')
s3.upload_file('image.jpg', 'bucket-name', 'images/image.jpg')
```

---

#### 6. pymysql

**版本要求**：>= 1.1.0

**功能**：
- MySQL数据库连接
- SQL执行
- 事务管理

**用途**：
- 将爬取结果存储到MySQL数据库
- 数据持久化

**注意**：
- Python内置了sqlite3，无需额外安装

**安装**：
```bash
pip install pymysql>=1.1.0
```

**使用**：
```python
import pymysql

# 连接数据库
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='password',
    database='crawler'
)

cursor = conn.cursor()

# 执行SQL
cursor.execute("INSERT INTO urls (url, type) VALUES (%s, %s)", (url, type))
conn.commit()
```

---

## 🎯 推荐安装组合

### 基础爬虫（最小依赖）

```bash
pip install requests>=2.31.0 beautifulsoup4>=4.12.0 pandas>=2.0.0 openpyxl>=3.1.0 urllib3>=2.0.0
```

### 基础爬虫 + Web UI

```bash
pip install -r requirements.txt
pip install -r web_ui/requirements.txt
```

### 完整功能（包含可选依赖）

```bash
pip install -r requirements.txt
pip install -r web_ui/requirements.txt
pip install lxml>=4.9.0 aiohttp>=3.8.0 tqdm>=4.66.0
```

### 云存储支持

```bash
# 阿里云OSS
pip install oss2>=2.18.0

# AWS S3
pip install boto3>=1.28.0
```

---

## 📋 依赖关系图

```
核心功能
├── requests (HTTP请求)
│   └── urllib3 (底层HTTP)
├── beautifulsoup4 (HTML解析)
│   └── lxml (可选，高性能解析器)
└── pandas (数据处理)
    └── openpyxl (Excel支持)

Web UI
├── flask (Web框架)
└── flask-cors (跨域支持)

可选功能
├── aiohttp (异步HTTP)
├── tqdm (进度条)
├── oss2 (阿里云OSS)
├── boto3 (AWS S3)
└── pymysql (MySQL数据库)
```

---

## 🔍 验证安装

使用检查脚本验证所有依赖是否正确安装：

```bash
python check_installation.py
```

检查内容：
- ✓ 核心依赖（requests, beautifulsoup4, pandas）
- ✓ Web UI依赖（flask, flask-cors）
- ✓ 可选依赖（lxml, openpyxl）
- ✓ 必要文件

---

## 🐛 常见问题

### 问题1：安装速度慢

**解决方案**：使用国内镜像

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

### 问题2：lxml安装失败

**原因**：lxml需要编译，可能缺少系统依赖

**解决方案**：
- **Linux**：
  ```bash
  sudo apt-get install libxml2-dev libxslt-dev
  ```
- **Mac**：
  ```bash
  brew install libxml2 libxslt
  ```
- **Windows**：下载预编译的wheel文件

### 问题3：pandas安装失败

**解决方案**：先安装依赖

```bash
pip install numpy
pip install pandas
```

### 问题4：权限不足

**解决方案**：使用用户安装

```bash
pip install --user -r requirements.txt
```

或使用虚拟环境（推荐）

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate.bat  # Windows
pip install -r requirements.txt
```

---

## 📊 依赖库统计

| 类别 | 数量 | 说明 |
|------|------|------|
| 核心依赖 | 5 | 爬虫功能必需 |
| Web UI依赖 | 2 | Web界面必需 |
| 可选依赖 | 6 | 增强功能 |
| **总计** | **13** | 完整功能 |

---

## 📝 版本说明

### 为什么指定最低版本？

1. **功能完整性**：确保库的某些关键功能可用
2. **安全性**：避免已知安全漏洞
3. **兼容性**：确保与项目代码兼容

### 如何升级依赖？

```bash
# 升级所有依赖
pip install --upgrade -r requirements.txt

# 升级特定库
pip install --upgrade requests
```

---

## 🔄 依赖更新策略

### 1. 定期更新依赖

```bash
# 查看过时的包
pip list --outdated

# 更新所有包
pip install --upgrade -r requirements.txt
```

### 2. 锁定依赖版本

生产环境建议使用固定版本：

```bash
# 生成requirements.txt（带版本号）
pip freeze > requirements_locked.txt

# 安装固定版本
pip install -r requirements_locked.txt
```

### 3. 测试兼容性

更新依赖后，务必测试项目功能：

```bash
# 运行测试
python -m pytest

# 启动项目验证
python start_web_ui.py
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [INSTALL.md](INSTALL.md) | 安装指南 |
| [README.md](README.md) | 完整使用说明 |
| [WEB_UI_GUIDE.md](WEB_UI_GUIDE.md) | Web UI使用指南 |

---

## 🆘 需要帮助？

### 验证安装状态

```bash
python check_installation.py
```

### 查看已安装的库

```bash
pip list
```

### 查看特定库的信息

```bash
pip show requests
```

### 卸载库

```bash
pip uninstall requests
```

---

**版本**：v1.0.0
**最后更新**：2025-02-05
