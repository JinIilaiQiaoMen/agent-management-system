# 安装指南

本指南将帮助您完成项目安装，包含所有平台的安装方法和常见问题解决方案。

---

## 🚀 快速开始

### 推荐安装方式（跨平台）

```bash
# 使用Python脚本安装（推荐）
python install.py --venv
```

### 验证安装

```bash
python check_installation.py
```

### 启动项目

```bash
# Web UI方式（推荐）
python start_web_ui.py

# 命令行方式
python web_crawler.py https://example.com
```

---

## 📦 安装方式

### 方式1：Python脚本（推荐）⭐

**适用于**：所有平台（Windows/Linux/Mac）

**特点**：
- ✅ 跨平台支持
- ✅ 自动检测和安装
- ✅ 支持虚拟环境
- ✅ 自动处理编码问题
- ✅ 友好的错误提示

**使用方法**：

```bash
# 基础安装
python install.py

# 创建虚拟环境（推荐）
python install.py --venv

# 跳过pip升级
python install.py --skip-upgrade

# 查看帮助
python install.py --help
```

---

### 方式2：Shell脚本（Linux/Mac）

**适用于**：Linux、macOS

**使用方法**：

```bash
# 赋予执行权限
chmod +x install.sh

# 运行安装脚本
./install.sh
```

---

### 方式3：批处理脚本（Windows）

**适用于**：Windows

**在CMD中**：

```bash
install.bat
```

**在PowerShell中**（需要使用相对路径）：

```powershell
.\install.bat
```

**或者使用Python脚本（推荐）**：

```powershell
python install.py
```

---

## ⚠️ Windows用户特别说明

### PowerShell执行问题

如果在PowerShell中直接执行 `install.bat` 报错，请使用以下方法之一：

**方法1：使用相对路径**

```powershell
.\install.bat
```

**方法2：使用Python脚本（推荐）**

```powershell
python install.py
```

**方法3：临时修改执行策略**

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
install.bat
```

**方法4：使用CMD替代PowerShell**

```cmd
cmd /c install.bat
```

### Windows编码问题

如果在PowerShell中遇到 `UnicodeDecodeError: 'gbk' codec can't decode` 错误，请使用以下方法：

**方法1：使用修复脚本（最简单）⭐**

```powershell
python fix_windows.py
```

**方法2：切换到UTF-8编码**

```powershell
chcp 65001
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

**方法3：逐个安装（最可靠）**

```powershell
pip install requests beautifulsoup4 pandas openpyxl flask flask-cors -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 🔧 虚拟环境

### 为什么使用虚拟环境？

虚拟环境可以：
- ✅ 隔离项目依赖
- ✅ 避免版本冲突
- ✅ 保持系统Python干净
- ✅ 便于项目迁移

### 创建虚拟环境

**使用安装脚本自动创建**：

```bash
python install.py --venv
```

**手动创建**：

Linux/Mac:
```bash
python3 -m venv venv
source venv/bin/activate
```

Windows:
```bash
python -m venv venv
venv\Scripts\activate.bat
```

### 激活虚拟环境

**Linux/Mac**:

```bash
source venv/bin/activate
```

**Windows**:

```bash
venv\Scripts\activate.bat
```

激活后，命令行提示符会显示 `(venv)`，表示虚拟环境已激活。

### 退出虚拟环境

```bash
deactivate
```

---

## 📋 安装内容

### 核心依赖（必需）

| 依赖 | 说明 |
|------|------|
| requests | HTTP请求库 |
| beautifulsoup4 | HTML解析库 |
| pandas | 数据处理库 |
| openpyxl | Excel支持 |
| urllib3 | HTTP底层库 |

### Web UI依赖（必需）

| 依赖 | 说明 |
|------|------|
| flask | Web框架 |
| flask-cors | 跨域支持 |

### 可选依赖

| 依赖 | 说明 |
|------|------|
| lxml | 高性能XML/HTML解析器 |
| aiohttp | 异步HTTP支持 |
| tqdm | 进度条显示 |

---

## ✅ 验证安装

### 运行安装检查

```bash
python check_installation.py
```

**正常输出示例**：

```
============================================================
  安装检查
============================================================

[INFO] Python版本: 3.x.x

检查核心依赖:
[✓] requests (v2.32.5)
[✓] beautifulsoup4 (v4.12.2)
[✓] pandas (v2.x.x)

检查Web UI依赖:
[✓] flask (v3.x.x)
[✓] flask_cors (v4.x.x)

检查可选依赖:
[✓] lxml (v6.0.2)
[✓] openpyxl (v3.x.x)

检查必要文件:
[✓] 主爬虫脚本: web_crawler.py
[✓] Web UI启动脚本: start_web_ui.py
[✓] 爬虫依赖列表: requirements.txt
[✓] Web UI后端: web_ui/app.py
[✓] Web UI前端: web_ui/templates/index.html

============================================================
  检查结果
============================================================

核心依赖: 3/3
Web UI依赖: 2/2
可选依赖: 2/2
必要文件: 5/5

[✓] 所有依赖已正确安装！
```

---

## 🐛 常见问题

### 问题1：pip不是最新版本

**解决方案**：

```bash
pip install --upgrade pip
```

### 问题2：安装速度慢

**解决方案**：使用国内镜像源

```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 问题3：lxml安装失败

**原因**：lxml需要编译，可能缺少系统依赖

**解决方案**：

**Linux**:
```bash
sudo apt-get install libxml2-dev libxslt-dev
```

**Mac**:
```bash
brew install libxml2 libxslt
```

**Windows**：跳过lxml安装（可选依赖）

### 问题4：权限不足

**解决方案**：使用用户安装或虚拟环境

```bash
# 用户安装
pip install --user -r requirements.txt

# 或使用虚拟环境（推荐）
python -m venv venv
```

### 问题5：pandas安装失败

**解决方案**：先安装依赖

```bash
pip install numpy
pip install pandas
```

### 问题6：Windows编码错误

**解决方案**：

```powershell
# 使用修复脚本
python fix_windows.py
```

或使用chcp切换编码：

```powershell
chcp 65001
```

---

## 🔄 更新依赖

### 升级所有依赖

```bash
pip install --upgrade -r requirements.txt
```

### 升级特定依赖

```bash
pip install --upgrade requests
```

---

## 📊 安装状态对比

### 安装前

```
核心依赖: 0/3
Web UI依赖: 0/2
可选依赖: 0/2
```

### 安装后

```
核心依赖: 3/3 ✓
Web UI依赖: 2/2 ✓
可选依赖: 2/2 ✓
```

---

## 🚀 安装后使用

### Web UI方式（推荐）

```bash
python start_web_ui.py
```

然后在浏览器中打开：http://localhost:5000

### 命令行方式

```bash
# 基本用法
python web_crawler.py https://example.com

# 查看帮助
python web_crawler.py --help

# 指定参数
python web_crawler.py https://example.com --format excel --no-robots
```

### Python API方式

```python
from web_crawler import CrawlerConfig, WebCrawler

config = CrawlerConfig(urls=['https://example.com'])
crawler = WebCrawler(config)
report = crawler.crawl()
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目主文档和完整使用说明 |
| [WEB_UI_GUIDE.md](WEB_UI_GUIDE.md) | Web UI使用指南 |
| [DEPENDENCIES.md](DEPENDENCIES.md) | 项目依赖库详细说明 |

---

## 🆘 需要帮助？

### 1. 查看安装状态

```bash
python check_installation.py
```

### 2. 使用修复脚本（Windows）

```bash
python fix_windows.py
```

### 3. 查看日志

安装过程中会显示详细的日志信息，请查看错误提示。

---

## 📝 系统要求

- **Python版本**：3.7或更高版本
- **操作系统**：Windows、Linux、macOS
- **网络连接**：需要下载依赖包
- **磁盘空间**：约50MB（包括虚拟环境）

---

## 🎉 总结

### 快速安装（3步）

```bash
# 1. 安装
python install.py --venv

# 2. 激活虚拟环境
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate.bat

# 3. 验证并启动
python check_installation.py
python start_web_ui.py
```

### 推荐流程

1. ✅ 使用虚拟环境
2. ✅ 定期检查安装状态
3. ✅ 遇到问题使用修复脚本
4. ✅ 使用Web UI进行操作

---

**版本**：v1.0.0
**最后更新**：2025-02-05
**适用系统**：Windows/Linux/macOS
