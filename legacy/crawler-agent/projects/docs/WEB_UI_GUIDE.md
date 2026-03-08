# Web爬虫控制台 - 使用指南

## 🌟 功能特性

- 🎨 **现代化界面**：简洁美观的Web UI
- 📊 **实时监控**：实时显示爬取进度和日志
- ⚙️ **可视化配置**：表单化配置爬虫参数
- 📈 **统计数据**：成功/失败/跳过数量实时更新
- 🔄 **流式日志**：SSE实时日志推送
- 💾 **结果展示**：直观展示爬取结果

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

```bash
python start_web_ui.py
```

然后在浏览器中打开：http://localhost:5000

### 方法二：手动启动

```bash
# 1. 安装依赖
pip install -r web_ui/requirements.txt

# 2. 进入web_ui目录
cd web_ui

# 3. 启动服务
python app.py
```

## 📱 界面说明

### 整体布局

Web UI采用左右分栏布局：

```
┌──────────────────────────────────────────────────────────┐
│  🕷️ Web爬虫控制台                              [🔧]    │
├──────────────────────────┬───────────────────────────────┤
│                          │                               │
│  左侧配置面板             │   右侧状态面板               │
│                          │                               │
│  ⚙️ 爬取配置            │   📊 运行状态                │
│                          │                               │
│  目标URL:               │   状态: [🔵 运行中]          │
│  ┌────────────────┐     │   任务: 正在爬取...         │
│  │ https://...    │     │   ████████░░ 80%            │
│  │ https://...    │     │                               │
│  └────────────────┘     │   ┌──────┐ ┌──────┐         │
│                          │   │ 成功 │ │ 失败 │         │
│  配置选项:               │   │  10  │ │  2   │         │
│  ☑ 检查robots.txt       │   └──────┘ └──────┘         │
│  请求延时: 1-5秒         │                               │
│  最小文件大小: 10KB      │   📝 实时日志                │
│                          │   ┌──────────────────┐       │
│  [▶️ 开始爬取] [⏹️ 停止]│   │ [INFO] 开始爬取...│       │
│                          │   │ [INFO] 页面解析...│       │
└──────────────────────────┴──────────────────────────────┘
```

### 左侧配置面板

**必填项：**
- **目标URL**：每行输入一个URL，例如：
  ```
  https://example.com
  https://example2.com
  ```

**可选项：**
- **图片格式**：默认 `jpg, png, webp`
- **音频格式**：默认 `mp3, wav, flac`
- **视频格式**：默认 `mp4, mov, avi`
- **文档格式**：默认 `pdf, doc, docx`
- **最小文件大小**：默认 10240 字节（10KB）
- **请求延时范围**：默认 1.0-5.0 秒
- **检查robots.txt**：默认勾选
- **输出目录**：默认 `./crawled_content`

### 右侧状态面板

**运行状态：**
- 🟢 **就绪**：可以开始爬取
- 🔵 **运行中**：正在爬取
- 🟢 **完成**：爬取完成

**统计数据：**
- 成功下载：成功下载的文件数
- 失败：下载失败的文件数
- 跳过重复：因重复而跳过的文件数
- 总页数：爬取的页面总数

**实时日志：**
- 显示INFO/WARNING/ERROR级别的日志
- 自动滚动到最新日志
- 不同级别使用不同颜色标记

## 🎯 使用流程

1. **打开界面**
   ```
   访问 http://localhost:5000
   ```

2. **配置参数**
   - 输入目标URL（必填）
   - 根据需要调整其他参数

3. **开始爬取**
   - 点击"开始爬取"按钮
   - 等待爬取完成

4. **查看结果**
   - 实时查看进度和日志
   - 查看统计信息

5. **停止爬取**（可选）
   - 点击"停止"按钮
   - 立即停止当前任务

## 📋 配置示例

### 示例1：爬取图片

```
目标URL:
https://example.com/images

图片格式:
jpg, png, gif

最小文件大小:
20480
```

### 示例2：爬取音频

```
目标URL:
https://music-site.com/tracks

音频格式:
mp3, wav, flac
```

### 示例3：爬取多种内容

```
目标URL:
https://example.com

图片格式:
jpg, png, webp, gif

音频格式:
mp3, wav

视频格式:
mp4, mov

文档格式:
pdf, docx, xlsx
```

## 🔄 API 接口

Web UI提供以下API接口：

### GET `/api/status`
获取爬虫状态

**响应示例：**
```json
{
  "running": false,
  "progress": 100,
  "message": "爬取完成",
  "stats": {
    "success_downloads": 10,
    "failed_downloads": 2,
    "skipped_duplicates": 5,
    "total_pages": 5
  }
}
```

### POST `/api/crawl/start`
启动爬虫

**请求体：**
```json
{
  "urls": ["https://example.com"],
  "image_types": ["jpg", "png"],
  "min_size": 10240,
  "check_robots": true
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "爬虫已启动"
}
```

### POST `/api/crawl/stop`
停止爬虫

**响应示例：**
```json
{
  "success": true,
  "message": "爬虫已停止"
}
```

### GET `/api/logs/stream`
实时日志流（SSE）

**事件格式：**
```
data: {"timestamp":"2025-02-05 01:00:00","level":"INFO","message":"开始爬取: https://example.com"}
```

### GET `/api/config/default`
获取默认配置

**响应示例：**
```json
{
  "urls": [],
  "image_types": ["jpg", "png", "webp"],
  "audio_types": ["mp3", "wav", "flac"],
  "video_types": ["mp4", "mov", "avi"],
  "doc_types": ["pdf", "doc", "docx"],
  "min_size": 10240,
  "delay_min": 1.0,
  "delay_max": 5.0,
  "check_robots": true,
  "output_dir": "./crawled_content"
}
```

## 🛠️ 故障排查

### 问题1：无法访问 http://localhost:5000

**解决方案：**
1. 检查Flask服务是否启动
2. 检查端口5000是否被占用
3. 尝试使用其他端口：
   ```python
   # 在web_ui/app.py中修改
   port = int(os.environ.get('PORT', 5001))
   ```

### 问题2：日志不显示

**解决方案：**
1. 检查浏览器是否支持SSE（Server-Sent Events）
2. 打开浏览器控制台查看错误
3. 尝试刷新页面

### 问题3：爬取失败

**解决方案：**
1. 查看实时日志中的错误信息
2. 检查URL是否正确
3. 检查网络连接
4. 查看日志文件：`crawler_YYYYMMDD_HHMMSS.log`

### 问题4：依赖安装失败

**解决方案：**
```bash
# 使用国内镜像源
pip install -r web_ui/requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

## 💡 使用技巧

### 1. 批量URL处理

在"目标URL"文本框中，每行输入一个URL，支持批量爬取多个网站。

### 2. 调整延时

- 反爬严格的网站：设置为 3.0-10.0 秒
- 普通网站：保持默认 1.0-5.0 秒
- 友好网站：设置为 0.5-2.0 秒

### 3. 过滤小文件

增加"最小文件大小"可以过滤掉缩略图和广告图片：
- 10KB：过滤大多数缩略图
- 50KB：只保留较大图片
- 100KB：只保留高清图片

### 4. 选择合适格式

只选择需要的格式可以加快爬取速度：
- 只需图片：只填写图片格式
- 只需音频：只填写音频格式
- 需要全部：填写所有格式

## 📊 输出目录结构

```
./crawled_content/
├── example.com/
│   └── 20250205/
│       ├── images/
│       │   ├── 1_example.jpg
│       │   └── 2_demo.png
│       ├── audios/
│       ├── videos/
│       └── documents/
└── another-site.com/
    └── 20250205/
        └── ...
```

## 🔒 安全注意事项

1. **不要爬取个人数据**：姓名、电话、邮箱等
2. **遵守robots.txt**：默认会检查并遵守
3. **控制访问频率**：合理设置请求延时
4. **仅用于学习研究**：商业用途需获得授权

## 📚 相关文档

- [主README](README.md) - 完整使用说明
- [可行性分析](FEASIBILITY_ANALYSIS.md) - 爬取风险评估
- [合规提醒](COMPLIANCE_NOTICE.md) - 法律合规要求

## 🆘 获取帮助

如遇到问题：
1. 查看实时日志
2. 检查控制台错误
3. 查看日志文件
4. 参考故障排查部分

---

**版本**：v2.0.0
**更新日期**：2025-02-05
