#!/bin/bash

# Vercel 快速部署脚本
# 使用方法: bash scripts/deploy-vercel.sh

set -e

echo "🚀 开始部署到 Vercel..."
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
echo "📋 检查登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "请先登录 Vercel:"
    vercel login
fi

# 检查环境变量
echo ""
echo "⚙️  检查必需的环境变量..."
required_vars=(
    "DATABASE_URL"
    "COZE_API_KEY"
    "COZE_API_SECRET"
    "S3_ACCESS_KEY_ID"
    "S3_SECRET_ACCESS_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "⚠️  以下环境变量未设置:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "请在 Vercel Dashboard 中配置这些环境变量"
    echo "或者按 Ctrl+C 取消部署，配置好环境变量后重新运行"
    echo ""
    read -p "继续部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 部署到预览环境
echo ""
echo "📦 部署到预览环境..."
vercel

# 询问是否部署到生产环境
echo ""
read -p "是否部署到生产环境？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 部署到生产环境..."
    vercel --prod
    echo ""
    echo "✅ 生产环境部署完成！"
else
    echo ""
    echo "✅ 预览环境部署完成！"
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "查看部署状态: vercel ls"
echo "查看日志: vercel logs"
