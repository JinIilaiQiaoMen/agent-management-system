# 智能网页爬虫 - 内容预览与下载功能

## 新功能概述

新增了**智能网页内容预览与选择性下载**功能，用户可以：

1. 🔍 **预览网页内容** - 提取标题、正文、图片、评论等内容
2. ✅ **选择性下载** - 自由选择想要下载的内容类型
3. 💾 **自动保存** - 下载的内容会自动保存到本地目录

## 功能特点

### 1. 内容提取

支持提取以下内容类型：

- **标题** - 文章标题
- **正文** - 文章主要内容
- **图片** - 文章中的所有图片（带预览）
- **评论** - 文章的评论内容

### 2. 智能预览

- 实时预览网页内容
- 图片网格展示
- 评论列表展示
- 内容统计（图片数量、评论数量、正文字数）

### 3. 选择性下载

- 单独选择下载标题
- 单独选择下载正文
- 选择性下载图片（支持多选、全选）
- 选择性下载评论（支持多选、全选）
- 一键下载所有选中的内容

## 使用说明

### 1. 访问预览页面

启动Web服务后，访问：

```
http://localhost:5000/preview
```

或者从主页点击"🆕 智能预览下载"按钮。

### 2. 输入URL

在输入框中输入要爬取的网页URL，例如：

- `https://mp.weixin.qq.com/s/xxxxx`（微信公众号文章）
- `https://www.zhihu.com/question/xxxxx`（知乎问题）
- `https://juejin.cn/post/xxxxx`（掘金文章）
- 其他支持的内容网站

### 3. 预览内容

点击"🔍 预览内容"按钮，系统会：

1. 获取网页内容
2. 提取标题、正文、图片、评论
3. 在左侧展示内容预览
4. 在右侧显示选择面板

### 4. 选择内容

在右侧选择面板中：

- 勾选"下载标题"复选框
- 勾选"下载正文"复选框
- 在图片列表中选择要下载的图片（可全选）
- 在评论列表中选择要下载的评论（可全选）

选择摘要会实时显示已选择的内容数量。

### 5. 下载内容

点击"⬇️ 开始下载"按钮，系统会：

1. 创建以文章标题命名的目录
2. 下载选中的内容到对应目录
3. 显示下载结果提示

### 6. 查看下载结果

下载的内容会保存在：

```
./downloads/文章标题/
├── title_20240101_120000.txt      # 标题文件
├── content_20240101_120000.txt    # 正文文件
├── comments_20240101_120000.txt   # 评论文件
└── images/                         # 图片目录
    ├── image_001.jpg
    ├── image_002.jpg
    └── ...
```

## API接口

### 1. 预览内容

**接口**：`POST /api/content/preview`

**请求体**：
```json
{
  "url": "https://example.com/article"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/article",
    "title": "文章标题",
    "content": "正文内容...",
    "images": [
      {
        "id": 1,
        "url": "https://example.com/image.jpg",
        "alt": "图片描述",
        "title": "图片标题",
        "selected": false
      }
    ],
    "comments": [
      {
        "id": 1,
        "username": "用户名",
        "content": "评论内容",
        "time": "2024-01-01",
        "selected": false
      }
    ],
    "meta": {
      "image_count": 10,
      "comment_count": 5,
      "content_length": 5000
    }
  }
}
```

### 2. 下载选中的内容

**接口**：`POST /api/content/download`

**请求体**：
```json
{
  "selection": {
    "title": true,
    "content": true,
    "images": [1, 3, 5],
    "comments": [1, 2, 3]
  },
  "output_dir": "./downloads"
}
```

**响应**：
```json
{
  "success": true,
  "message": "下载完成到: ./downloads/文章标题",
  "result": {
    "title_file": "./downloads/文章标题/title_20240101_120000.txt",
    "content_file": "./downloads/文章标题/content_20240101_120000.txt",
    "images_downloaded": [
      "./downloads/文章标题/images/image_001.jpg",
      "./downloads/文章标题/images/image_003.jpg",
      "./downloads/文章标题/images/image_005.jpg"
    ],
    "comments_file": "./downloads/文章标题/comments_20240101_120000.txt"
  }
}
```

### 3. 清除内容

**接口**：`POST /api/content/clear`

**响应**：
```json
{
  "success": true,
  "message": "已清除内容缓存"
}
```

## 技术实现

### 后端

- **content_extractor.py** - 内容提取器
  - `ContentExtractor` 类：通用网页内容提取
  - `GenericCrawler` 类：内容预览和下载

- **app.py** - Flask API
  - `/api/content/preview` - 预览接口
  - `/api/content/download` - 下载接口
  - `/api/content/clear` - 清除接口

### 前端

- **preview.html** - 预览页面
  - 响应式设计
  - 实时预览
  - 交互式选择
  - 进度反馈

## 支持的网站类型

该功能基于通用的内容提取算法，支持大多数类型的网站：

- ✅ 新闻网站
- ✅ 博客文章
- ✅ 社交媒体（部分）
- ✅ 知乎、掘金等技术社区
- ✅ 微信公众号
- ✅ 其他静态内容网站

## 注意事项

1. **URL格式**：必须以 `http://` 或 `https://` 开头
2. **网络连接**：确保可以访问目标网站
3. **图片数量限制**：最多提取100张图片
4. **评论数量限制**：最多提取50条评论
5. **下载目录**：默认保存在 `./downloads` 目录下

## 扩展功能

### 自定义提取规则

如果需要为特定网站定制提取规则，可以在 `ContentExtractor` 类中添加：

```python
def custom_extraction(self):
    """自定义提取方法"""
    # 添加特定网站的提取逻辑
    pass
```

### 批量下载

可以扩展功能支持批量URL预览和下载：

```python
def batch_preview(urls):
    """批量预览"""
    results = []
    for url in urls:
        result = self.preview(url)
        results.append(result)
    return results
```

## 问题排查

### 1. 预览失败

**问题**：点击预览后提示失败

**解决**：
- 检查URL是否正确
- 检查网络连接
- 查看浏览器控制台错误信息

### 2. 内容提取不完整

**问题**：部分内容没有被提取

**解决**：
- 不同网站的结构可能不同
- 可以在 `ContentExtractor` 类中添加特定的选择器

### 3. 图片下载失败

**问题**：图片无法下载

**解决**：
- 检查图片URL是否有效
- 某些网站可能有防盗链机制

## 更新日志

### v2.0.0 (2024-01-06)

新增功能：
- ✅ 智能内容预览
- ✅ 标题提取
- ✅ 正文提取
- ✅ 图片提取和预览
- ✅ 评论提取
- ✅ 选择性下载
- ✅ 自动保存到本地

## 反馈与建议

如有问题或建议，请通过以下方式联系：

- 提交Issue
- 发送邮件
- 查看文档

## 许可证

MIT License
