#!/bin/bash
# Web爬虫控制台 - Linux/Mac启动脚本
# 使用方法: ./start_linux.sh

echo "========================================"
echo "  Web爬虫控制台 - 启动中..."
echo "========================================"
echo ""

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到Python3，请先安装Python 3.8+"
    exit 1
fi

echo "[1/4] 检查Python环境... OK"
echo ""

# 检查虚拟环境
if [ ! -d ".venv" ]; then
    echo "[警告] 未找到虚拟环境，创建中..."
    python3 -m venv .venv
    echo "[信息] 虚拟环境创建完成"
    echo ""
fi

# 激活虚拟环境
source .venv/bin/activate
echo "[2/4] 激活虚拟环境... OK"
echo ""

# 安装依赖
echo "[3/4] 安装依赖包..."
pip install -r requirements.txt --quiet
if [ $? -ne 0 ]; then
    echo "[错误] 依赖安装失败，请检查网络连接"
    exit 1
fi
echo "[信息] 依赖安装完成"
echo ""

# 安装Playwright浏览器
echo "[信息] 检查Playwright浏览器..."
playwright install chromium --quiet
echo ""

# 启动Web服务
echo "[4/4] 启动Web服务..."
echo ""
echo "========================================"
echo "  服务地址: http://localhost:5000"
echo "  按Ctrl+C停止服务"
echo "========================================"
echo ""

cd web_ui
python app.py
