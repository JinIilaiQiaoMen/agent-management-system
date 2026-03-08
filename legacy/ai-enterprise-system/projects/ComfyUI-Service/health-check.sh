#!/bin/bash

# ComfyUI 服务健康检查脚本

# 配置
COMFYUI_URL="http://localhost:8188"
LOG_FILE="/app/work/logs/bypass/comfyui-check.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "ComfyUI 服务健康检查"
echo "========================================="
echo ""

# 1. 检查服务进程
echo "[1/5] 检查服务进程..."
if [ -f "/app/work/logs/bypass/comfyui.pid" ]; then
    PID=$(cat /app/work/logs/bypass/comfyui.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 服务进程运行中 (PID: $PID)${NC}"
    else
        echo -e "${RED}✗ 服务进程未运行${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}! PID 文件不存在${NC}"
fi

# 2. 检查端口监听
echo ""
echo "[2/5] 检查端口监听..."
if ss -lptn 'sport = :8188' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 端口 8188 正在监听${NC}"
else
    echo -e "${RED}✗ 端口 8188 未监听${NC}"
    exit 1
fi

# 3. 检查 HTTP 响应
echo ""
echo "[3/5] 检查 HTTP 响应..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $COMFYUI_URL)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ HTTP 200 OK${NC}"
else
    echo -e "${RED}✗ HTTP 响应异常: $HTTP_CODE${NC}"
    exit 1
fi

# 4. 检查 API 端点
echo ""
echo "[4/5] 检查 API 端点..."
API_RESPONSE=$(curl -s $COMFYUI_URL/system_stats)
if echo "$API_RESPONSE" | grep -q "comfyui_version"; then
    VERSION=$(echo "$API_RESPONSE" | grep -o '"comfyui_version":"[^"]*"' | cut -d'"' -f4)
    PYTORCH=$(echo "$API_RESPONSE" | grep -o '"pytorch_version":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ API 正常${NC}"
    echo -e "  版本: $VERSION"
    echo -e "  PyTorch: $PYTORCH"
else
    echo -e "${RED}✗ API 响应异常${NC}"
    exit 1
fi

# 5. 检查模型目录
echo ""
echo "[5/5] 检查模型目录..."
COMFYUI_DIR="/workspace/projects/ComfyUI-Service"
if [ -d "$COMFYUI_DIR/models/checkpoints" ]; then
    MODEL_COUNT=$(ls -1 $COMFYUI_DIR/models/checkpoints/*.safetensors 2>/dev/null | wc -l)
    if [ "$MODEL_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ 已找到 $MODEL_COUNT 个模型文件${NC}"
    else
        echo -e "${YELLOW}! 模型目录为空，需要下载模型文件${NC}"
        echo -e "  下载地址: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0"
    fi
else
    echo -e "${RED}✗ 模型目录不存在${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}健康检查完成！${NC}"
echo "========================================="
echo ""
echo "服务访问地址:"
echo "  Web 界面: $COMFYUI_URL"
echo "  API 端点: $COMFYUI_URL/prompt"
echo ""
