#!/bin/bash
# ComfyUI 服务安装和启动脚本

set -e

COMFYUI_DIR="/workspace/projects/ComfyUI-Service"
VENV_DIR="$COMFYUI_DIR/venv"
LOG_FILE="/app/work/logs/bypass/comfyui.log"
PID_FILE="/app/work/logs/bypass/comfyui.pid"
INSTALL_LOG="/app/work/logs/bypass/comfyui-install.log"
PORT=8188

echo "========================================="
echo "  ComfyUI 服务自动安装和启动脚本"
echo "========================================="
echo ""

# 1. 创建虚拟环境
if [ ! -d "$VENV_DIR" ]; then
    echo "1. 创建 Python 虚拟环境..."
    cd "$COMFYUI_DIR"
    python3 -m venv venv
    echo "   ✓ 虚拟环境创建成功"
else
    echo "1. 虚拟环境已存在，跳过创建"
fi

# 2. 激活虚拟环境并安装依赖
echo ""
echo "2. 安装 ComfyUI 依赖（这可能需要几分钟）..."
cd "$COMFYUI_DIR"
source venv/bin/activate

# 检查是否已经安装了 PyTorch
if python -c "import torch; print(torch.__version__)" 2>/dev/null; then
    echo "   ✓ 依赖已安装，跳过安装步骤"
else
    echo "   正在安装依赖，请稍候..."
    pip install -r requirements.txt > "$INSTALL_LOG" 2>&1

    if [ $? -eq 0 ]; then
        echo "   ✓ 依赖安装成功"
    else
        echo "   ✗ 依赖安装失败，请查看日志: $INSTALL_LOG"
        exit 1
    fi
fi

# 3. 检查服务状态
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo ""
        echo "3. ComfyUI 服务已在运行 (PID: $OLD_PID)"
        echo "   访问地址: http://localhost:$PORT"
        exit 0
    else
        rm -f "$PID_FILE"
    fi
fi

# 4. 启动服务
echo ""
echo "4. 启动 ComfyUI 服务..."
nohup python main.py \
    --listen 0.0.0.0 \
    --port $PORT \
    --enable-cors-header "*" \
    > "$LOG_FILE" 2>&1 &

PID=$!
echo $PID > "$PID_FILE"

# 等待服务启动
sleep 5

# 检查服务是否成功启动
if ps -p $PID > /dev/null 2>&1; then
    echo "   ✓ ComfyUI 服务启动成功 (PID: $PID)"
    echo ""
    echo "========================================="
    echo "  ComfyUI 服务信息"
    echo "========================================="
    echo "  状态: 运行中"
    echo "  PID: $PID"
    echo "  端口: $PORT"
    echo "  访问地址: http://localhost:$PORT"
    echo "  日志文件: $LOG_FILE"
    echo ""
    echo "  管理命令:"
    echo "    停止: cd $COMFYUI_DIR && ./manage.sh stop"
    echo "    重启: cd $COMFYUI_DIR && ./manage.sh restart"
    echo "    查看日志: cd $COMFYUI_DIR && ./manage.sh logs"
    echo "========================================="
else
    echo "   ✗ ComfyUI 服务启动失败，请查看日志: $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi
