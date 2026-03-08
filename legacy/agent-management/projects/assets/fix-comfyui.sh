#!/bin/bash
# 快速修复 ComfyUI 服务

set -e

cd /workspace/projects/ComfyUI-Service
echo "1. 停止所有 ComfyUI 进程..."
pkill -f "python main.py" || true
sleep 2

echo "2. 创建虚拟环境..."
python3 -m venv venv

echo "3. 激活虚拟环境并安装依赖..."
source venv/bin/activate
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt

echo "4. 启动 ComfyUI 服务..."
nohup python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header "*" > /app/work/logs/bypass/comfyui.log 2>&1 &
echo $! > /app/work/logs/bypass/comfyui.pid

sleep 5

if ps -p $(cat /app/work/logs/bypass/comfyui.pid) > /dev/null 2>&1; then
    echo "✓ ComfyUI 服务启动成功"
    echo "  PID: $(cat /app/work/logs/bypass/comfyui.pid)"
    echo "  端口: 8188"
    echo "  访问地址: http://localhost:8188"
else
    echo "✗ ComfyUI 服务启动失败"
    tail -n 20 /app/work/logs/bypass/comfyui.log
fi
