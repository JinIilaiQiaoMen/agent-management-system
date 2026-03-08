# 项目结构规范（V2.0）
---
## 目录结构
```
web_ui/
├── app.py                      # 主服务入口，Flask API服务
├── requirements.txt            # Python依赖包清单
├── content_extractor.py        # 内容提取核心模块
├── smart_analyzer.py           # 智能数据分析模块
├── crawler_state.db            # SQLite数据库（爬取状态、项目数据）
│
├── templates/                  # 前端HTML模板目录
│   ├── index.html              # 旧版控制台界面
│   ├── new_index.html          # 新版产品级界面（对标biaoda.me）
│   ├── preview.html            # 爬取结果预览页面
│   └── smart_crawler.html      # 智能爬虫配置页面
│
├── docs/                       # 项目文档目录
│   ├── CODE_CLEANUP_SUMMARY.md
│   ├── FORMAT_SELECTOR_OPTIMIZATION.md
│   ├── OPTIMIZATION_SUMMARY.md
│   ├── PREVIEW_FEATURE.md
│   ├── PROJECT_STRUCTURE.md    # 本文件
│   ├── README.md
│   ├── SMART_CRAWLER_DESIGN.md
│   ├── STATUS_PANEL_OPTIMIZATION.md
│   └── TOGGLE_SELECT_ALL_FEATURE.md
│
├── logs/                       # 运行日志目录（自动生成）
│   └── crawler_*.log           # 爬虫运行日志
│
├── data/                       # 爬取数据存储目录（自动生成）
│   └── [网站域名]/             # 按域名分类存储爬取的资源文件
│
└── __pycache__/                # Python缓存目录（自动生成）
```

## 命名规范
### 1. 文件命名
- 代码文件：小写+下划线命名，例如 `content_extractor.py`
- 模板文件：小写+下划线命名，例如 `new_index.html`
- 文档文件：大写开头+下划线命名，例如 `PROJECT_STRUCTURE.md`
- 日志文件：`crawler_YYYYMMDD_HHMMSS.log` 格式

### 2. API接口命名
- 所有接口统一使用 `/api/` 前缀，例如 `/api/crawl` `/api/analyze`
- 接口命名使用动词+名词结构，小写+中划线分隔，例如 `/api/get-project-list`

### 3. 变量命名
- Python代码：小写下划线命名
- 前端JS：小驼峰命名
- CSS类名：小写下划线/中划线命名

## 代码规范
### 1. Python代码
- 遵循PEP8规范，4空格缩进
- 所有函数必须添加类型提示和注释
- 异常必须捕获并打印日志
- 敏感信息不允许硬编码，必须从环境变量读取

### 2. 前端代码
- HTML语义化标签
- JS代码模块化，避免全局变量污染
- CSS使用BEM命名规范
- 所有第三方依赖使用CDN引入，版本固定

## 访问路径规范
| 路径 | 说明 | 权限 |
| --- | --- | --- |
| `/` | 旧版控制台首页 | 公开 |
| `/index.html` | 旧版控制台首页 | 公开 |
| `/new` | 新版产品级界面 | 公开 |
| `/new_index.html` | 新版产品级界面 | 公开 |
| `/preview` | 预览页面 | 公开 |
| `/smart_crawler` | 智能爬虫页面 | 公开 |
| `/api/*` | API接口 | 公开 |

## 数据存储规范
- 爬取的原始数据：按域名分类存储在 `data/` 目录下
- 结构化数据：存储到SQLite数据库 `crawler_state.db`
- 日志文件：保留最近7天的日志，自动清理过期日志
- 临时文件：存储到 `/tmp` 目录，自动清理
