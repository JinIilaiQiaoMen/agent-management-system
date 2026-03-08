#!/bin/bash
# 一键安装脚本（Linux/Mac）

set -e  # 遇到错误立即退出

echo "======================================"
echo "  智能Web爬虫控制系统 - 一键安装"
echo "======================================"
echo ""

# 检查 Python 版本
echo "📌 检查 Python 版本..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3.8 或更高版本"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "✅ Python 版本: $PYTHON_VERSION"

# 检查 pip
echo ""
echo "📌 检查 pip..."
if ! command -v pip3 &> /dev/null; then
    echo "⚠️  pip3 未安装，正在安装..."
    python3 -m ensurepip --upgrade
fi

echo "✅ pip 已安装"

# 创建虚拟环境（可选）
echo ""
read -p "是否创建虚拟环境？推荐使用 (y/n): " create_venv
if [ "$create_venv" = "y" ] || [ "$create_venv" = "Y" ]; then
    echo ""
    echo "📌 创建虚拟环境..."
    python3 -m venv venv
    echo "✅ 虚拟环境创建成功"
    echo ""
    echo "📌 激活虚拟环境..."
    source venv/bin/activate
    echo "✅ 虚拟环境已激活"
fi

# 升级 pip
echo ""
echo "📌 升级 pip..."
pip3 install --upgrade pip

# 安装依赖
echo ""
echo "📌 安装项目依赖..."
echo "   这可能需要几分钟，请耐心等待..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 安装 Playwright 浏览器
echo ""
echo "📌 安装 Playwright 浏览器..."
read -p "是否安装 Playwright 浏览器？用于处理动态网页 (y/n): " install_playwright

if [ "$install_playwright" = "y" ] || [ "$install_playwright" = "Y" ]; then
    echo "   正在安装 Chromium 浏览器..."
    playwright install chromium

    if [ $? -eq 0 ]; then
        echo "✅ Playwright 浏览器安装成功"
    else
        echo "❌ Playwright 浏览器安装失败"
        echo "   可以稍后手动安装: playwright install chromium"
    fi
else
    echo "⚠️  已跳过 Playwright 浏览器安装"
    echo "   如需使用，请运行: playwright install chromium"
fi

# 创建必要目录
echo ""
echo "📌 创建项目目录..."
mkdir -p downloads data logs
echo "✅ 目录创建成功"

# 复制环境配置文件
echo ""
echo "📌 配置环境变量..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ 已创建 .env 配置文件"
        echo "   可以根据需要修改 .env 文件"
    fi
else
    echo "⚠️  .env 文件已存在，跳过创建"
fi

# 运行环境检查
echo ""
echo "📌 运行环境检查..."
python3 check_env.py

# 完成提示
echo ""
echo "======================================"
echo "🎉 安装完成！"
echo "======================================"
echo ""
echo "启动方式:"
echo "  一键启动: ./start_linux.sh"
echo "  手动启动: python3 web_ui/app.py"
echo ""
echo "访问地址: http://localhost:5000"
echo ""
echo "其他命令:"
echo "  环境检查: python3 check_env.py"
echo "  运行测试: python3 test_sina_news_improved.py"
echo ""
