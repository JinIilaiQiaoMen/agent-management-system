#!/bin/bash

# ComfyUI 服务管理脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
COMFYUI_DIR="/workspace/projects/ComfyUI-Service"
VENV_DIR="$COMFYUI_DIR/venv"
LOG_FILE="/app/work/logs/bypass/comfyui.log"
PID_FILE="/app/work/logs/bypass/comfyui.pid"
PORT=8188

# 检查虚拟环境
check_venv() {
    if [ ! -d "$VENV_DIR" ]; then
        echo -e "${RED}虚拟环境不存在，请先运行安装脚本${NC}"
        exit 1
    fi
}

# 检查服务状态
check_status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}ComfyUI 服务正在运行 (PID: $PID)${NC}"
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    echo -e "${YELLOW}ComfyUI 服务未运行${NC}"
    return 1
}

# 启动服务
start_service() {
    check_venv

    if check_status > /dev/null 2>&1; then
        echo -e "${YELLOW}服务已经在运行中${NC}"
        return 1
    fi

    echo -e "${GREEN}正在启动 ComfyUI 服务...${NC}"

    cd "$COMFYUI_DIR"
    source venv/bin/activate

    # 启动服务并记录 PID
    nohup python main.py \
        --listen 0.0.0.0 \
        --port $PORT \
        --enable-cors-header "*" \
        > "$LOG_FILE" 2>&1 &

    PID=$!
    echo $PID > "$PID_FILE"

    sleep 3

    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ ComfyUI 服务启动成功 (PID: $PID)${NC}"
        echo -e "${GREEN}✓ 访问地址: http://localhost:$PORT${NC}"
        echo -e "${GREEN}✓ 日志文件: $LOG_FILE${NC}"
    else
        echo -e "${RED}✗ ComfyUI 服务启动失败，请查看日志${NC}"
        rm -f "$PID_FILE"
        return 1
    fi
}

# 停止服务
stop_service() {
    if ! check_status > /dev/null 2>&1; then
        echo -e "${YELLOW}服务未运行${NC}"
        return 1
    fi

    PID=$(cat "$PID_FILE")
    echo -e "${YELLOW}正在停止 ComfyUI 服务 (PID: $PID)...${NC}"

    kill $PID

    # 等待进程结束
    for i in {1..10}; do
        if ! ps -p $PID > /dev/null 2>&1; then
            rm -f "$PID_FILE"
            echo -e "${GREEN}✓ ComfyUI 服务已停止${NC}"
            return 0
        fi
        sleep 1
    done

    # 强制杀死进程
    kill -9 $PID
    rm -f "$PID_FILE"
    echo -e "${GREEN}✓ ComfyUI 服务已强制停止${NC}"
}

# 重启服务
restart_service() {
    stop_service
    sleep 2
    start_service
}

# 查看日志
view_logs() {
    if [ ! -f "$LOG_FILE" ]; then
        echo -e "${RED}日志文件不存在${NC}"
        return 1
    fi

    echo -e "${GREEN}=== ComfyUI 服务日志 (最后 50 行) ===${NC}"
    tail -n 50 "$LOG_FILE"
}

# 检查依赖
check_deps() {
    check_venv

    echo -e "${GREEN}检查 ComfyUI 依赖...${NC}"
    cd "$COMFYUI_DIR"
    source venv/bin/activate

    python -c "import torch; print(f'✓ PyTorch: {torch.__version__}')" 2>&1 || echo -e "${RED}✗ PyTorch 未安装${NC}"
    python -c "import comfy; print('✓ ComfyUI 核心')" 2>&1 || echo -e "${RED}✗ ComfyUI 未安装${NC}"
}

# 主函数
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    check)
        check_deps
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs|check}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动 ComfyUI 服务"
        echo "  stop    - 停止 ComfyUI 服务"
        echo "  restart - 重启 ComfyUI 服务"
        echo "  status  - 查看服务状态"
        echo "  logs    - 查看服务日志"
        echo "  check   - 检查依赖安装状态"
        exit 1
        ;;
esac
