#!/bin/bash
# 公司智能体管理系统 - 一键部署脚本
# 支持开发环境和生产环境一键启动

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  公司智能体管理系统 - 一键部署${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装${NC}"
    exit 1
fi

# 检查环境变量
if [ ! -f .env ]; then
    echo -e "${YELLOW}提示: 未找到.env文件，创建默认配置...${NC}"
    cp config/.env.example .env 2>/dev/null || true
    echo -e "${YELLOW}请编辑.env文件配置必要的环境变量${NC}"
fi

# 选择部署模式
echo ""
echo "请选择部署模式:"
echo "  1) 开发模式 (端口3000)"
echo "  2) 生产模式 (Docker Compose)"
echo "  3) 仅启动OpenClaw"
echo "  4) 停止所有服务"
read -p "请输入选项 (1-4): " mode

case $mode in
    1)
        echo -e "${GREEN}启动开发模式...${NC}"
        pnpm install
        pnpm dev
        ;;
    2)
        echo -e "${GREEN}启动生产模式...${NC}"
        docker-compose up -d
        echo -e "${GREEN}部署完成！${NC}"
        echo "访问地址:"
        echo "  - 应用: http://localhost"
        echo "  - OpenClaw: http://localhost:5000"
        ;;
    3)
        echo -e "${GREEN}仅启动OpenClaw...${NC}"
        docker run -d \
            --name openclaw-standalone \
            -p 5000:5000 \
            -p 5001:5001 \
            openclaw/openclaw:latest
        ;;
    4)
        echo -e "${YELLOW}停止所有服务...${NC}"
        docker-compose down 2>/dev/null || true
        docker stop openclaw-standalone 2>/dev/null || true
        echo -e "${GREEN}已停止所有服务${NC}"
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac
