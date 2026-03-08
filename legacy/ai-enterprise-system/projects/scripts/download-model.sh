#!/bin/bash

# SDXL 模型下载脚本

set -e

# 配置
MODEL_NAME="sd_xl_base_1.0.safetensors"
MODEL_URL="https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/${MODEL_NAME}"
DEST_DIR="/workspace/projects/ComfyUI-Service/models/checkpoints"
DEST_FILE="${DEST_DIR}/${MODEL_NAME}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "SDXL 模型下载脚本"
echo "========================================="
echo ""

# 检查目标目录
if [ ! -d "$DEST_DIR" ]; then
    echo -e "${RED}错误: 目标目录不存在: $DEST_DIR${NC}"
    echo "请先创建 ComfyUI 项目"
    exit 1
fi

# 检查是否已存在
if [ -f "$DEST_FILE" ]; then
    echo -e "${YELLOW}警告: 模型文件已存在${NC}"
    echo "文件: $DEST_FILE"
    echo "大小: $(ls -lh "$DEST_FILE" | awk '{print $5}')"

    read -p "是否重新下载? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "取消下载"
        exit 0
    fi

    rm -f "$DEST_FILE"
    echo "已删除旧文件"
fi

# 检查可用工具
DOWNLOAD_TOOL=""

if command -v aria2c &> /dev/null; then
    DOWNLOAD_TOOL="aria2c"
    echo -e "${GREEN}✓ 检测到 aria2c，将使用多线程下载${NC}"
elif command -v wget &> /dev/null; then
    DOWNLOAD_TOOL="wget"
    echo -e "${GREEN}✓ 检测到 wget${NC}"
elif command -v curl &> /dev/null; then
    DOWNLOAD_TOOL="curl"
    echo -e "${GREEN}✓ 检测到 curl${NC}"
else
    echo -e "${RED}错误: 未找到下载工具 (aria2c, wget, curl)${NC}"
    exit 1
fi

echo ""
echo "开始下载..."
echo "模型: $MODEL_NAME"
echo "目标: $DEST_FILE"
echo "URL: $MODEL_URL"
echo ""

# 执行下载
case $DOWNLOAD_TOOL in
    "aria2c")
        aria2c -x 16 -s 16 -c -d "$DEST_DIR" "$MODEL_URL"
        ;;
    "wget")
        wget -c -O "$DEST_FILE" "$MODEL_URL"
        ;;
    "curl")
        curl -C - -L -o "$DEST_FILE" "$MODEL_URL"
        ;;
esac

# 验证下载
if [ -f "$DEST_FILE" ]; then
    FILE_SIZE=$(ls -lh "$DEST_FILE" | awk '{print $5}')
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}✓ 下载完成！${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "文件信息:"
    echo "  路径: $DEST_FILE"
    echo "  大小: $FILE_SIZE"
    echo ""
    echo "验证:"

    # 检查文件大小（应该接近 7GB）
    SIZE_BYTES=$(stat -f%z "$DEST_FILE" 2>/dev/null || stat -c%s "$DEST_FILE" 2>/dev/null || echo "0")

    if [ "$SIZE_BYTES" -gt 6000000000 ]; then  # 大于 6GB
        echo -e "  ${GREEN}✓ 文件大小正常${NC}"
    else
        echo -e "  ${RED}✗ 文件大小异常（可能下载不完整）${NC}"
    fi

    # 检查文件类型
    if file "$DEST_FILE" 2>/dev/null | grep -q "data"; then
        echo -e "  ${GREEN}✓ 文件类型正确${NC}"
    else
        echo -e "  ${YELLOW}! 无法验证文件类型${NC}"
    fi

    echo ""
    echo "现在可以在 ComfyUI 界面中使用模型了！"
    echo "访问: http://localhost:5000/pet-content-generator"
else
    echo ""
    echo -e "${RED}✗ 下载失败，请检查网络连接${NC}"
    exit 1
fi
