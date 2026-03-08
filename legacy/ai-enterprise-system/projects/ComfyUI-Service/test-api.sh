#!/bin/bash

# ComfyUI API 测试脚本

COMFYUI_URL="http://localhost:8188"
CLIENT_ID="test-client-$(date +%s)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "ComfyUI API 测试"
echo "========================================="
echo ""

# 1. 测试系统信息 API
echo "[1/3] 测试系统信息 API..."
RESPONSE=$(curl -s $COMFYUI_URL/system_stats)
if echo "$RESPONSE" | grep -q "comfyui_version"; then
    echo -e "${GREEN}✓ 系统信息 API 正常${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
else
    echo -e "${RED}✗ 系统信息 API 失败${NC}"
    exit 1
fi

echo ""

# 2. 测试对象信息 API
echo "[2/3] 测试对象信息 API..."
RESPONSE=$(curl -s $COMFYUI_URL/object_info | head -100)
if echo "$RESPONSE" | grep -q "CheckpointLoaderSimple"; then
    echo -e "${GREEN}✓ 对象信息 API 正常${NC}"
    echo -e "  可用节点数量: $(curl -s $COMFYUI_URL/object_info | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))" 2>/dev/null)"
else
    echo -e "${RED}✗ 对象信息 API 失败${NC}"
    exit 1
fi

echo ""

# 3. 测试队列 API
echo "[3/3] 测试队列 API..."
RESPONSE=$(curl -s $COMFYUI_URL/prompt)
if echo "$RESPONSE" | grep -q "queue_remaining"; then
    QUEUE_SIZE=$(echo "$RESPONSE" | grep -o '"queue_remaining":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✓ 队列 API 正常${NC}"
    echo -e "  当前队列大小: $QUEUE_SIZE"
else
    echo -e "${RED}✗ 队列 API 失败${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}所有 API 测试通过！${NC}"
echo "========================================="
echo ""
echo "可用节点列表（前10个）:"
curl -s $COMFYUI_URL/object_info | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'  - {k}') for k in list(d.keys())[:10]]" 2>/dev/null
echo ""
