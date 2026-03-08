# Web爬虫控制台 - 安装和启动指南

## 环境要求

- Python 3.8 或更高版本
- pip 包管理器
- 互联网连接（用于下载依赖）

## 快速启动

### Windows 用户

1. **双击运行启动脚本**
   ```
   双击 start_windows.bat
   ```

2. **或使用命令行**
   ```cmd
   # 1. 创建虚拟环境
   python -m venv .venv

   # 2. 激活虚拟环境
   .venv\Scripts\activate

   # 3. 安装依赖
   pip install -r requirements.txt

   # 4. 安装Playwright浏览器
   playwright install chromium

   # 5. 启动服务
   cd web_ui
   python app.py
   ```

### Linux/Mac 用户

1. **运行启动脚本**
   ```bash
   chmod +x start_linux.sh
   ./start_linux.sh
   ```

2. **或使用命令行**
   ```bash
   # 1. 创建虚拟环境
   python3 -m venv .venv

   # 2. 激活虚拟环境
   source .venv/bin/activate

   # 3. 安装依赖
   pip install -r requirements.txt

   # 4. 安装Playwright浏览器
   playwright install chromium

   # 5. 启动服务
   cd web_ui
   python app.py
   ```

## 访问地址

启动成功后，在浏览器中打开：

- **主页**: http://localhost:5000/
- **智能爬虫**: http://localhost:5000/smart
- **内容预览**: http://localhost:5000/preview

## 常见问题

### 1. ModuleNotFoundError: No module named 'playwright'

**原因**: 未安装Playwright依赖

**解决方案**:
```bash
pip install -r requirements.txt
playwright install chromium
```

### 2. 端口5000已被占用

**解决方案**: 修改 `web_ui/app.py` 文件末尾的端口号
```python
app.run(host='0.0.0.0', port=5001)  # 改为其他端口
```

### 3. 虚拟环境激活失败

**Windows**: 使用完整路径
```cmd
C:\path\to\.venv\Scripts\activate.bat
```

**Linux/Mac**: 确保使用bash
```bash
source .venv/bin/activate
```

### 4. 依赖安装速度慢

**使用国内镜像源**:
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 5. Playwright浏览器下载失败

**手动下载**:
```bash
playwright install chromium --with-deps
```

或使用系统安装的Chromium:
```python
# 修改 web_ui/screenshot_analyzer.py 中的浏览器配置
browser = await p.chromium.launch(
    channel='chrome',  # 使用系统Chrome
    headless=True
)
```

## 依赖包说明

| 包名 | 版本 | 用途 |
|------|------|------|
| Flask | >=3.0.0 | Web框架 |
| Flask-CORS | >=4.0.0 | 跨域支持 |
| requests | >=2.31.0 | HTTP请求 |
| beautifulsoup4 | >=4.12.0 | HTML解析 |
| lxml | >=4.9.0 | XML解析 |
| playwright | >=1.40.0 | 网页自动化 |
| pandas | >=2.0.0 | 数据处理 |
| openpyxl | >=3.1.0 | Excel文件支持 |

## 开发模式

### 使用热重载（开发时推荐）

安装Flask开发工具:
```bash
pip install Flask[async]
```

使用开发模式启动:
```python
# web_ui/app.py
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

## 生产部署

### 使用Gunicorn（推荐）

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 使用Docker

```bash
# 构建镜像
docker build -t web-crawler .

# 运行容器
docker run -p 5000:5000 web-crawler
```

## 目录结构

```
projects/
├── web_ui/                  # Web界面
│   ├── app.py              # Flask后端
│   ├── templates/          # HTML模板
│   ├── content_extractor.py # 内容提取器
│   └── smart_analyzer.py   # 智能分析器
├── web_crawler.py          # 爬虫核心
├── element_analyzer.py     # 元素分析
├── screenshot_analyzer.py  # 截图分析
├── requirements.txt        # 依赖列表
├── start_windows.bat       # Windows启动脚本
└── start_linux.sh          # Linux/Mac启动脚本
```

## 技术支持

如遇到问题，请检查：

1. Python版本是否 >= 3.8
2. 是否正确安装了所有依赖
3. Playwright浏览器是否正确安装
4. 端口是否被占用
5. 防火墙是否允许访问

## 更新日志

### 2025-02-06
- ✅ 添加启动脚本（Windows/Linux）
- ✅ 创建依赖文件
- ✅ 完善安装文档
- ✅ 添加常见问题解答
