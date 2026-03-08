# 智能爬虫 - 一体化工作流程设计

## 功能概述

将配置爬取与元素分析融合为一体，提供智能化的爬取体验。

## 工作流程

### 1. 输入目标URL
用户输入需要爬取的目标网页URL。

### 2. AI智能分析
使用Playwright截图并智能分析网页元素：
- 图片元素
- 视频元素
- 音频元素
- 文档元素

### 3. 可视化展示
- 在截图上标记所有发现的元素位置
- 右侧显示元素列表
- 点击元素列表时，截图上高亮显示对应元素

### 4. 交互式选择
- 在截图上直接打勾选择元素
- 提供一键全选功能
- 按类型筛选（只显示图片、视频等）
- 实时统计选择数量

### 5. 灵活下载
- 保存到本地文件夹（按类型分类）
- 保存为表格（Excel/CSV）
- 支持自定义输出路径

## UI布局设计

```
┌─────────────────────────────────────────────────────────┐
│                    🕷️ 智能爬虫控制台                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  URL输入： [________________________] [智能分析]          │
│                                                         │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│  网页截图（带候选框）          │   元素列表                │
│                              │                          │
│  ┌──────────────────────┐    │   📋 检选器               │
│  │                      │    │   □ 图片 (12)            │
│  │    [ ] [x] [ ] [ ]  │    │   □ 视频 (3)             │
│  │                      │    │   □ 音频 (5)             │
│  │    [x] [ ] [x] [ ]  │    │   □ 文档 (8)             │
│  │                      │    │                          │
│  └──────────────────────┘    │   📝 元素列表              │
│                              │                          │
│  缩放：[-] 100% [+]          │   ☑ image1.jpg (10KB)    │
│                              │   ☑ image2.png (20KB)    │
│                              │   ☐ video1.mp4 (5MB)     │
│                              │   ☐ audio1.mp3 (1MB)     │
│                              │                          │
│                              │   一键全选 [x]            │
│                              │   已选择：3/28            │
├──────────────────────────────┴──────────────────────────┤
│                                                         │
│  保存方式：                                              │
│  ○ 保存到本地文件夹  [./downloads/]                      │
│  ○ 保存为表格 (Excel)  [./result.xlsx]                  │
│  ○ 保存为表格 (CSV)     [./result.csv]                   │
│                                                         │
│  开始下载  [████████░░░░░░░] 30% (3/10)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 技术实现

### 1. 后端API

```python
@app.route('/api/smart/analyze', methods=['POST'])
async def smart_analyze():
    """智能分析网页元素"""
    url = request.json.get('url')
    # 使用Playwright截图和分析
    # 返回截图和元素列表

@app.route('/api/smart/download', methods=['POST'])
async def smart_download():
    """下载选中的元素"""
    selection = request.json.get('selection')
    save_type = request.json.get('save_type')  # 'folder' or 'excel' or 'csv'
    output_path = request.json.get('output_path')
    # 下载并保存
```

### 2. 前端交互

```javascript
// 智能分析
async function smartAnalyze() {
    // 调用API
    // 显示截图和元素列表
    // 创建候选框
}

// 元素选择
function toggleElement(elementId) {
    // 切换选中状态
    // 更新候选框样式
    // 更新统计
}

// 一键全选
function selectAllElements() {
    // 全选所有元素
}

// 下载
async function downloadElements() {
    // 获取选中的元素
    // 调用下载API
    // 显示进度
}
```

### 3. 候选框交互

```css
.element-box {
    position: absolute;
    border: 2px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.element-box:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
}

.element-box.selected {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.2);
}

.element-box .checkbox {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: white;
    border: 2px solid #10b981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #10b981;
}
```

## 文件结构

```
web_ui/
├── templates/
│   └── smart_crawler.html    # 智能爬虫主页面（新建）
├── smart_analyzer.py          # 智能分析器（新建）
└── app.py                     # 更新路由
```

## 开发计划

1. 创建智能分析器模块
2. 创建智能爬虫页面
3. 实现候选框交互
4. 实现下载功能（本地+表格）
5. 添加进度显示
6. 测试和优化
