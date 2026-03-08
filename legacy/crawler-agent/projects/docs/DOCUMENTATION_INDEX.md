# 📚 智能Web爬虫控制系统 - 文档导航

> 🎯 完整的文档体系，助你快速上手和深入使用

---

## 📖 文档分类

### 🚀 快速入门类文档

| 文档 | 适用人群 | 阅读时间 | 说明 |
|------|----------|----------|------|
| [QUICKSTART.md](QUICKSTART.md) | 所有用户 | 3 分钟 | 快速开始指南，3分钟上手 |
| [README.md](README.md) | 所有用户 | 5 分钟 | 项目概述和核心功能介绍 |

### 📦 安装部署类文档

| 文档 | 适用人群 | 阅读时间 | 说明 |
|------|----------|----------|------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | 部署人员 | 15 分钟 | 完整的部署指南，包含所有平台的详细安装说明 |
| [INSTALL_GUIDE.md](INSTALL_GUIDE.md) | 开发人员 | 10 分钟 | 安装指南（如存在） |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | 开发人员 | 10 分钟 | 项目文件结构说明 |

### 🔧 技术集成类文档

| 文档 | 适用人群 | 阅读时间 | 说明 |
|------|----------|----------|------|
| [SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md) | 开发人员 | 10 分钟 | Scrapling 框架集成文档，包含 API 说明和使用示例 |

### 📋 项目交付类文档

| 文档 | 适用人群 | 阅读时间 | 说明 |
|------|----------|----------|------|
| [DELIVERY.md](DELIVERY.md) | 项目负责人 | 15 分钟 | 项目交付文档，包含项目介绍和技术细节 |

---

## 🎯 按场景选择文档

### 场景 1：我是新手，想快速开始

**推荐阅读顺序**：
1. [QUICKSTART.md](QUICKSTART.md) - 快速开始（3分钟）
2. 运行 `install.bat` (Windows) 或 `install.sh` (Linux/Mac) - 一键安装
3. 运行 `start_windows.bat` (Windows) 或 `start_linux.sh` (Linux/Mac) - 一键启动
4. 浏览器访问 `http://localhost:5000` - 开始使用

### 场景 2：我要部署到生产环境

**推荐阅读顺序**：
1. [README.md](README.md) - 了解项目特性（5分钟）
2. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 详细部署指南（15分钟）
3. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 了解文件结构（10分钟）
4. 按照部署指南逐步操作

### 场景 3：我要二次开发

**推荐阅读顺序**：
1. [README.md](README.md) - 了解项目特性（5分钟）
2. [SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md) - 了解 Scrapling 集成（10分钟）
3. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 了解文件结构（10分钟）
4. 阅读源代码，开始开发

### 场景 4：我要使用 Scrapling 功能

**推荐阅读顺序**：
1. [SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md) - 集成文档（10分钟）
2. 查看 `scrapling_example.py` - 使用示例
3. 查看 `test_sina_news_improved.py` - 测试示例

### 场景 5：我是项目负责人

**推荐阅读顺序**：
1. [README.md](README.md) - 项目概述（5分钟）
2. [DELIVERY.md](DELIVERY.md) - 交付文档（15分钟）
3. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 部署指南（15分钟）

---

## 🛠️ 工具和脚本说明

### 安装工具

| 脚本 | 平台 | 说明 |
|------|------|------|
| `install.bat` | Windows | 一键安装脚本 |
| `install.sh` | Linux/Mac | 一键安装脚本 |
| `check_env.py` | 所有平台 | 环境检查脚本 |

### 启动工具

| 脚本 | 平台 | 说明 |
|------|------|------|
| `start_windows.bat` | Windows | 一键启动脚本 |
| `start_linux.sh` | Linux/Mac | 一键启动脚本 |

### 测试工具

| 脚本 | 说明 |
|------|------|
| `test_sina_news_improved.py` | 新浪网新闻爬取测试 |
| `scrapling_example.py` | Scrapling 使用示例 |
| `scrapling_spider_example.py` | Spider 使用示例 |

---

## 📊 核心功能速查

### 基础功能

| 功能 | 页面/API | 说明 |
|------|----------|------|
| 配置爬取 | `/` | 输入 URL，配置参数，启动爬取 |
| 智能爬虫 | `/smart` | AI 分析，可视化选择，一键爬取 |
| 内容预览 | `/preview` | 预览内容，选择性下载，导出 |

### Scrapling 功能

| 功能 | API | 说明 |
|------|-----|------|
| 获取页面 | `POST /api/scrapling/fetch` | 获取网页内容 |
| 提取数据 | `POST /api/scrapling/extract` | 使用 CSS 选择器提取数据 |
| 绕过反爬 | `POST /api/scrapling/bypass` | 使用 StealthyFetcher 绕过反爬 |

---

## 🔧 常用命令速查

### 安装相关

```bash
# 一键安装（推荐）
install.bat              # Windows
./install.sh            # Linux/Mac

# 手动安装
pip install -r requirements.txt

# 安装 Playwright 浏览器
playwright install chromium
```

### 启动相关

```bash
# 一键启动（推荐）
start_windows.bat       # Windows
./start_linux.sh        # Linux/Mac

# 手动启动
python web_ui/app.py
```

### 测试相关

```bash
# 环境检查
python check_env.py

# 运行测试
python test_sina_news_improved.py

# 查看 API 测试
curl -X POST http://localhost:5000/api/scrapling/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## 📞 获取帮助

### 遇到问题？

1. **查看日志**
   ```bash
   tail -f app.log
   ```

2. **检查环境**
   ```bash
   python check_env.py
   ```

3. **查看文档**
   - [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 故障排查章节
   - [README.md](README.md) - 常见问题章节

4. **联系支持**
   - 📧 邮箱：support@example.com
   - 💬 论坛：https://forum.example.com

---

## 📝 文档更新日志

### 2026-02-27

- ✅ 创建 `QUICKSTART.md` - 快速开始指南
- ✅ 创建 `DEPLOYMENT_GUIDE.md` - 详细部署指南
- ✅ 创建 `PROJECT_STRUCTURE.md` - 项目文件结构说明
- ✅ 创建 `check_env.py` - 环境检查脚本
- ✅ 创建 `install.sh` / `install.bat` - 一键安装脚本
- ✅ 更新 `README.md` - 添加 Scrapling 集成说明
- ✅ 更新 `SCRAPLING_INTEGRATION.md` - 添加测试结果
- ✅ 创建 `DOCUMENTATION_INDEX.md` - 文档导航

---

## 🎉 开始使用

### 第一步：安装

**Windows**:
```cmd
install.bat
```

**Linux/Mac**:
```bash
chmod +x install.sh
./install.sh
```

### 第二步：启动

**Windows**:
```cmd
start_windows.bat
```

**Linux/Mac**:
```bash
./start_linux.sh
```

### 第三步：访问

浏览器打开：`http://localhost:5000`

---

## 📚 文档维护

本文档索引会随着项目发展持续更新。

如果你发现文档有误或有改进建议，欢迎提出！

---

**祝你使用愉快！🎉**
