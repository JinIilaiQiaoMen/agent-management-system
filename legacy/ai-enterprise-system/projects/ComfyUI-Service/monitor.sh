#!/bin/bash
# ComfyUI 服务监控脚本

echo "========================================="
echo "  ComfyUI 服务状态监控"
echo "========================================="
echo ""

# 检查安装日志
INSTALL_LOG="/app/work/logs/bypass/comfyui-install.log"
LOG_FILE="/app/work/logs/bypass/comfyui.log"
PID_FILE="/app/work/logs/bypass/comfyui.pid"

echo "1. 检查安装进度..."
if [ -f "$INSTALL_LOG" ]; then
    echo "   最后 5 行安装日志:"
    tail -n 5 "$INSTALL_LOG" | sed 's/^/   /'
else
    echo "   安装日志尚未生成"
fi

echo ""
echo "2. 检查服务状态..."
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "   ✓ ComfyUI 服务正在运行 (PID: $PID)"
        echo "   端口: 8188"
        echo "   访问地址: http://localhost:8188"

        # 检查端口是否监听
        if ss -tuln 2>/dev/null | grep -E ':8188[[:space:]]' | grep -q LISTEN; then
            echo "   ✓ 端口 8188 正在监听"
        else
            echo "   ⚠ 服务正在启动中，端口尚未就绪"
        fi
    else
        echo "   ✗ 进程已退出 (PID: $PID)"
        if [ -f "$LOG_FILE" ]; then
            echo ""
            echo "   最后 10 行日志:"
            tail -n 10 "$LOG_FILE" | sed 's/^/   /'
        fi
    fi
else
    echo "   ⚠ 服务尚未启动"
fi

echo ""
echo "3. 正在进行的进程..."
ps aux | grep -E "(python main.py|pip install)" | grep -v grep | grep -v monitor | awk '{print "   PID:", $2, "-", $11, $12, $13}' || echo "   未发现相关进程"

echo ""
echo "========================================="
echo "  监控命令"
echo "========================================="
echo "  持续监控: watch -n 5 $0"
echo "  查看安装日志: tail -f $INSTALL_LOG"
echo "  查看服务日志: tail -f $LOG_FILE"
echo "  检查端口: ss -tuln | grep 8188"
echo "========================================="
