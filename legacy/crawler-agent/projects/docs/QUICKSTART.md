# 快速开始指南

> 🚀 3 分钟上手智能 Web 爬虫控制系统

---

## 一、Windows 用户

### 1️⃣ 下载项目

将项目解压到任意目录，例如：`C:\web-crawler`

### 2️⃣ 一键启动

双击运行 `start_windows.bat`

### 3️⃣ 开始使用

浏览器自动打开 `http://localhost:5000`

---

## 二、Linux/Mac 用户

### 1️⃣ 下载项目

```bash
# 解压到任意目录，例如：~/web-crawler
cd ~/web-crawler
```

### 2️⃣ 一键启动

```bash
chmod +x start_linux.sh
./start_linux.sh
```

### 3️⃣ 开始使用

浏览器打开 `http://localhost:5000`

---

## 三、手动启动（所有平台）

### 步骤 1：安装依赖

```bash
pip install -r requirements.txt
```

### 步骤 2：启动服务

```bash
python web_ui/app.py
```

### 步骤 3：访问系统

浏览器打开 `http://localhost:5000`

---

## 四、功能介绍

### 1. 配置爬取模式
- 输入 URL
- 选择文件类型（图片、音频、视频、文档）
- 配置反爬虫参数
- 点击"开始爬取"

### 2. 智能爬虫模式
- 输入 URL
- 点击"分析网页"
- 在截图上点击需要爬取的元素
- 点击"开始爬取"

### 3. 内容预览模式
- 查看已爬取的内容
- 预览图片、视频等
- 选择性下载
- 导出为 Excel/CSV

---

## 五、测试示例

### 爬取新浪网新闻

```bash
# 运行测试脚本
python3 test_sina_news_improved.py

# 查看结果
cat sina_news_report.txt
```

**预期结果**: 成功提取 105 条新闻

---

## 六、常见问题

### Q: 提示缺少依赖？
```bash
pip install -r requirements.txt
```

### Q: 端口 5000 被占用？
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :5000
kill -9 <进程ID>
```

### Q: Playwright 浏览器未安装？
```bash
playwright install
```

---

## 七、获取更多帮助

- 📖 详细部署文档：[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- 📚 项目介绍：[README.md](README.md)
- 🔧 Scrapling 集成：[SCRAPLING_INTEGRATION.md](SCRAPLING_INTEGRATION.md)

---

**祝你使用愉快！🎉**
