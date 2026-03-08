#!/bin/bash

# GitHub 一键推送脚本
# 使用方法: bash scripts/push-to-github.sh

set -e

echo "🚀 开始推送代码到 GitHub..."
echo ""

# 检查 git 状态
echo "📋 检查 Git 状态..."
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 工作区干净，无需提交"
else
    echo "📝 检测到未提交的更改，正在提交..."
    git add .
    git commit -m "feat: 添加多平台部署配置

- Vercel 部署配置
- Netlify 部署配置
- Docker 部署配置
- CI/CD 自动化流程
- 完整部署文档"
fi

# 检查是否已配置远程仓库
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "❌ 尚未配置 GitHub 远程仓库"
    echo ""
    echo "请按以下步骤操作："
    echo ""
    echo "1️⃣  在 GitHub 上创建新仓库："
    echo "   访问 https://github.com/new"
    echo "   仓库名称建议：company-agent-management"
    echo "   设置为 Public 或 Private（推荐 Public 用于免费部署）"
    echo ""
    echo "2️⃣  复制仓库 URL，然后重新运行此脚本："
    echo "   bash scripts/push-to-github.sh <你的仓库URL>"
    echo ""
    exit 1
fi

# 检查是否传入了仓库 URL
if [ -n "$1" ]; then
    echo ""
    echo "🔗 配置远程仓库..."
    git remote set-url origin "$1"
    echo "✅ 远程仓库已配置: $1"
fi

# 获取远程仓库 URL
REMOTE_URL=$(git remote get-url origin)
echo ""
echo "📍 远程仓库: $REMOTE_URL"

# 推送代码
echo ""
echo "📤 推送代码到 GitHub..."
git push -u origin main

echo ""
echo "✅ 代码已成功推送到 GitHub！"
echo ""
echo "🌐 下一步："
echo "   1. 访问你的 GitHub 仓库"
echo "   2. 连接到 Vercel/Netlify 进行部署"
echo "   3. 查看 QUICK_START.md 了解详细步骤"
echo ""
