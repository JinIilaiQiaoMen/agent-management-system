#!/bin/bash

# ComfyUI 启动脚本 (Linux/macOS)

echo "=========================================="
echo "  ComfyUI 启动脚本"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

if [ ! -f "venv/bin/activate" ]; then
    echo "❌ 错误：虚拟环境不存在，请先运行安装脚本"
    exit 1
fi

echo "🔧 激活虚拟环境..."
source venv/bin/activate

echo ""
echo "🚀 启动 ComfyUI 服务..."
echo ""
echo "✅ 访问地址: http://localhost:8188"
echo "🛑 按 Ctrl+C 停止服务"
echo ""

python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header "*"
