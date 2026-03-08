# 企业级爬虫平台项目结构规范 V2.0
---
## 整体目录结构
```
projects/
├── core/                           # 核心爬虫引擎目录
│   ├── web_crawler.py              # 基础爬虫核心实现
│   ├── concurrent_crawler.py       # 多线程/分布式爬虫实现
│   ├── element_analyzer.py         # 网页元素分析模块
│   ├── screenshot_analyzer.py      # 截图分析模块
│   ├── scrapling_adapter.py        # Scrapling框架适配层
│   └── task_queue.py               # 任务队列调度模块
│
├── utils/                          # 工具类目录
│   ├── circuit_breaker.py          # 熔断降级组件
│   ├── monitor.py                  # 监控告警组件
│   ├── proxy_manager.py            # 代理池管理组件
│   ├── resume_manager.py           # 断点续爬组件
│   └── check_env.py                # 环境检查工具
│
├── web_ui/                         # Web UI服务目录（已规范化）
│   ├── app.py                      # Flask主服务入口
│   ├── requirements.txt            # Web服务依赖
│   ├── content_extractor.py        # 内容提取模块
│   ├── smart_analyzer.py           # 智能数据分析模块
│   ├── crawler_state.db            # SQLite数据库
│   ├── templates/                  # 前端HTML模板
│   │   ├── index.html              # 旧版控制台
│   │   ├── new_index.html          # 新版产品级界面
│   │   ├── preview.html            # 结果预览页面
│   │   └── smart_crawler.html      # 智能爬虫配置页面
│   ├── docs/                       # Web UI相关文档
│   ├── logs/                       # Web服务运行日志
│   └── data/                       # 爬取资源存储目录
│
├── tests/                          # 单元测试目录
│   ├── test_scrapling.py           # Scrapling适配测试
│   ├── test_sina_news.py           # 新浪新闻爬取测试
│   └── test_sina_news_improved.py  # 改进版爬取测试
│
├── examples/                       # 示例代码目录
│   ├── scrapling_example.py        # Scrapling基础使用示例
│   └── scrapling_spider_example.py # Scrapling爬虫示例
│
├── scripts/                        # 脚本目录
│   ├── install.sh                  # Linux环境安装脚本
│   ├── install.bat                 # Windows环境安装脚本
│   ├── start_linux.sh              # Linux启动脚本
│   └── start_windows.bat           # Windows启动脚本
│
├── config/                         # 配置文件目录
│   ├── requirements.txt            # 全局Python依赖
│   ├── .env.example                # 环境变量示例
│   └── .gitignore                  # Git忽略配置
│
├── data/                           # 全局数据存储目录
│   └── [项目名]/                    # 按项目分类存储爬取结果
│
├── docs/                           # 全局文档目录
│   ├── README.md                   # 项目介绍
│   ├── QUICKSTART.md               # 快速上手
│   ├── INSTALL_GUIDE.md            # 安装指南
│   ├── DEPLOYMENT_GUIDE.md         # 部署指南
│   ├── UPGRADE_PLAN.md             # 升级计划
│   ├── SCRAPLING_INTEGRATION.md    # Scrapling集成文档
│   ├── WEB_UI_GUIDE.md             # Web UI使用指南
│   ├── PROJECT_STRUCTURE_V2.md     # 本结构规范文档
│   └── 项目更新总结.md              # 项目更新记录
│
├── Scrapling-main/                 # Scrapling框架源码（第三方依赖）
└── scrapling/                      # Scrapling本地适配版本
```

## 模块职责划分
| 目录 | 职责 | 访问规则 |
| --- | --- | --- |
| core/ | 核心爬虫引擎，所有爬取逻辑的实现 | 只能被上层模块调用，不允许直接调用其他上层模块 |
| utils/ | 通用工具组件，无业务逻辑，可复用 | 可被所有模块调用 |
| web_ui/ | Web服务层，提供用户交互界面和API接口 | 只能调用core和utils层，不允许实现爬取逻辑 |
| tests/ | 单元测试代码，和业务代码分离 | 独立运行，不允许被其他模块调用 |
| examples/ | 示例代码，供用户参考使用 | 独立运行，不允许被其他模块调用 |
| scripts/ | 部署、启动、安装相关脚本 | 独立执行，不允许被代码导入 |
| config/ | 全局配置文件 | 所有模块可读取，运行时不允许修改 |
| docs/ | 项目文档 | 仅作说明使用 |
| data/ | 爬取结果存储 | 运行时写入，只读访问 |

## 代码规范
### 1. 导入规则
- core层只能导入utils层和自身模块
- utils层只能导入自身模块和第三方依赖
- web层可以导入core、utils和自身模块
- 不允许循环导入

### 2. 命名规则
- 模块名：小写+下划线，例如 `web_crawler.py`
- 类名：大驼峰，例如 `WebCrawler`
- 函数名：小写+下划线，例如 `crawl_page()`
- 常量名：全大写下划线，例如 `MAX_RETRY_TIMES = 3`

### 3. 注释规则
- 所有公共类、函数必须添加docstring注释，说明功能、参数、返回值
- 核心逻辑必须添加行级注释
- 复杂算法必须添加实现思路说明

## 部署规范
1. 开发环境：直接运行 `python web_ui/app.py` 启动服务
2. 生产环境：使用Gunicorn部署，配置Nginx反向代理
3. 配置文件：生产环境必须配置独立的`.env`文件，不允许硬编码敏感信息
4. 日志：所有日志统一输出到`logs/`目录，保留7天自动清理

## 版本管理规范
- 核心功能迭代更新需要更新`UPGRADE_PLAN.md`
- 每次发版需要更新`项目更新总结.md`
- 重大变更需要提交PR并审核
