# Web爬虫控制台使用指南

## 功能概述

Web爬虫控制台是一个基于Python的现代化网页内容爬取工具，支持多类型内容爬取、反爬配置、去重机制、容错处理，并提供智能元素分析能力。

## 主要功能

### 1. 网页内容爬取

**支持的媒体类型：**
- 图片：jpg, png, webp, gif 等
- 音频：mp3, wav, flac, aac 等
- 视频：mp4, mov, avi, webm 等
- 文档：pdf, doc, docx, txt 等

**核心特性：**
- 智能去重机制
- 请求延时配置（防止被封）
- robots.txt 遵守
- 最小文件大小过滤
- 实时进度监控
- SSE 实时日志推送

### 2. 智能元素分析 🆕

**功能说明：**
- 自动截图网页
- AI 元素识别（图片/视频/音频/文档）
- 精确元素定位（红色方框标记）
- 实时预览与分析

**使用方法：**
1. 在左侧面板切换到"元素分析"标签
2. 输入要分析的网页 URL
3. 点击"开始分析"按钮
4. 等待分析完成，查看截图和元素列表

**技术实现：**
- 使用 Playwright 进行网页截图
- 使用 BeautifulSoup 进行 HTML 解析
- 结合两种方式提取和定位元素
- 支持响应式页面分析

## 安装与运行

### 环境要求
- Python 3.7+
- 现代浏览器（推荐 Chrome）

### 安装依赖
```bash
pip install -r requirements.txt
```

### 启动服务
```bash
python web_ui/app.py
```

服务将在 http://localhost:5000 启动

### 使用 Playwright
```bash
playwright install chromium
```

## API 接口文档

### 1. 开始爬取
```http
POST /api/crawl/start
Content-Type: application/json

{
  "urls": ["https://example.com"],
  "image_types": ["jpg", "png"],
  "audio_types": ["mp3", "wav"],
  "video_types": ["mp4"],
  "doc_types": ["pdf"],
  "min_size": 10240,
  "delay_min": 1.0,
  "delay_max": 5.0,
  "check_robots": true,
  "output_dir": "./crawled_content"
}
```

### 2. 停止爬取
```http
POST /api/crawl/stop
```

### 3. 获取状态
```http
GET /api/status
```

### 4. 获取日志流 (SSE)
```
GET /api/logs/stream
```

### 5. 开始元素分析 🆕
```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### 6. 获取分析结果 🆕
```http
GET /api/analyze/result
```

## 配置说明

### 爬取配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| urls | 目标URL列表（每行一个） | - |
| image_types | 图片格式 | jpg, png, webp |
| audio_types | 音频格式 | mp3, wav, flac |
| video_types | 视频格式 | mp4, mov, avi |
| doc_types | 文档格式 | pdf, doc, docx |
| min_size | 最小文件大小（字节） | 10240 |
| delay_min | 最小请求延时（秒） | 1.0 |
| delay_max | 最大请求延时（秒） | 5.0 |
| check_robots | 是否检查robots.txt | true |
| output_dir | 输出目录 | ./crawled_content |

## 常见问题

### Q: 元素分析功能无法使用？
A: 请确保已安装 Playwright 浏览器：
```bash
playwright install chromium
```

### Q: 爬取速度太慢？
A: 可以调整 `delay_min` 和 `delay_max` 参数，但请注意不要设置过快以免被封。

### Q: 如何处理反爬虫？
A:
1. 增加 `delay_min` 和 `delay_max`
2. 设置合理的 User-Agent
3. 遵守网站的 robots.txt

### Q: 如何只爬取特定类型的文件？
A: 在对应的格式输入框中只填写需要的格式，多个格式用逗号分隔。

## 项目结构

```
web_ui/
├── app.py                 # Flask 后端
├── element_analyzer.py    # 元素分析器
├── screenshot_analyzer.py # 截图分析器
├── templates/
│   └── index.html        # 前端页面
└── requirements.txt       # 依赖列表
```

## 技术栈

- **后端**：Flask, Flask-CORS
- **前端**：HTML5, CSS3, JavaScript (原生)
- **爬取**：requests, beautifulsoup4, lxml
- **截图**：Playwright
- **日志**：SSE (Server-Sent Events)

## 许可证

MIT License
