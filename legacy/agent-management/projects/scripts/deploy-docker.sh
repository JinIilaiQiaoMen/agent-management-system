#!/bin/bash

# Docker 快速部署脚本
# 使用方法: bash scripts/deploy-docker.sh

set -e

echo "🐳 开始 Docker 部署..."
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    echo "请先安装 Docker Compose"
    exit 1
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在"
    if [ -f .env.docker.example ]; then
        echo "正在从 .env.docker.example 创建 .env 文件..."
        cp .env.docker.example .env
        echo "✅ 已创建 .env 文件"
        echo "⚠️  请编辑 .env 文件，配置正确的环境变量"
        echo "   nano .env"
        echo ""
        read -p "按 Enter 继续（请确保已配置好环境变量）"
    else
        echo "❌ 找不到 .env.docker.example 文件"
        exit 1
    fi
fi

# 停止现有容器
echo ""
echo "🛑 停止现有容器..."
docker-compose down 2>/dev/null || true

# 构建镜像
echo ""
echo "🔨 构建 Docker 镜像..."
docker-compose build

# 启动服务
echo ""
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 显示服务状态
echo ""
echo "📊 服务状态:"
docker-compose ps

# 显示日志
echo ""
echo "📋 应用日志（最近 20 行）:"
docker-compose logs --tail=20 app

# 检查服务健康状态
echo ""
echo "🔍 检查服务健康状态..."
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ 服务运行正常！"
    echo ""
    echo "🌐 访问地址: http://localhost:5000"
else
    echo "⚠️  服务可能未完全启动，请稍后再试"
    echo "查看完整日志: docker-compose logs -f"
fi

echo ""
echo "🎉 Docker 部署完成！"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo "  进入容器: docker-compose exec app sh"
