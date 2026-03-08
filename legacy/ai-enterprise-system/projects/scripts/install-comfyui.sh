#!/bin/bash

# ============================================================
# ComfyUI 一键部署脚本 (Linux/macOS)
# ============================================================

set -e

echo "=========================================="
echo "  ComfyUI 一键部署脚本"
echo "=========================================="
echo ""

# 检查系统
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    echo "❌ 不支持的操作系统: $OSTYPE"
    exit 1
fi

echo "📌 检测到系统: $OS"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 未检测到 Python3，请先安装 Python 3.10 或更高版本"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "✅ Python 版本: $PYTHON_VERSION"
echo ""

# 检查 pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ 未检测到 pip3"
    exit 1
fi

echo "✅ pip3 已安装"
echo ""

# 安装目录
INSTALL_DIR="$HOME/ComfyUI"
if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  ComfyUI 目录已存在: $INSTALL_DIR"
    read -p "是否删除并重新安装？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$INSTALL_DIR"
        echo "🗑️  已删除旧版本"
    else
        echo "❌ 取消安装"
        exit 0
    fi
fi

# 克隆 ComfyUI
echo "📥 正在下载 ComfyUI..."
git clone https://github.com/comfyanonymous/ComfyUI.git "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "✅ ComfyUI 下载完成"
echo ""

# 创建虚拟环境
echo "🔧 创建 Python 虚拟环境..."
python3 -m venv venv

echo "✅ 虚拟环境创建完成"
echo ""

# 激活虚拟环境
if [[ "$OS" == "linux-gnu"* ]]; then
    source venv/bin/activate
elif [[ "$OSTYPE" == "darwin"* ]]; then
    source venv/bin/activate
fi

echo "✅ 虚拟环境已激活"
echo ""

# 安装 PyTorch
echo "📦 安装 PyTorch（这可能需要几分钟）..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo "✅ PyTorch 安装完成"
echo ""

# 安装 ComfyUI 依赖
echo "📦 安装 ComfyUI 依赖..."
pip install -r requirements.txt

echo "✅ 依赖安装完成"
echo ""

# 创建模型目录
echo "📁 创建模型目录..."
mkdir -p models/checkpoints
mkdir -p models/vae
mkdir -p models/clip
mkdir -p models/embeddings

echo "✅ 目录结构创建完成"
echo ""

# 下载 SDXL 模型（可选）
echo "=========================================="
echo "⚠️  重要提示：需要下载模型文件"
echo "=========================================="
echo ""
echo "ComfyUI 需要模型文件才能工作。请手动下载以下模型："
echo ""
echo "1. SDXL Base 模型（必需）:"
echo "   https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0"
echo "   下载: sd_xl_base_1.0.safetensors"
echo "   保存到: $INSTALL_DIR/models/checkpoints/"
echo ""
echo "2. SDXL Refiner（可选，提升质量）:"
echo "   https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0"
echo "   下载: sd_xl_refiner_1.0.safetensors"
echo "   保存到: $INSTALL_DIR/models/checkpoints/"
echo ""

read -p "模型文件是否已下载？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "请先下载模型文件，然后运行此脚本再次安装"
    echo "或者使用以下命令继续（模型缺失会导致生成失败）"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ ComfyUI 安装完成！"
echo "=========================================="
echo ""
echo "📂 安装目录: $INSTALL_DIR"
echo ""
echo "🚀 启动 ComfyUI 服务："
echo ""
echo "  # 方式 1: 使用此脚本启动"
echo "  cd $INSTALL_DIR"
echo "  source venv/bin/activate"
echo "  python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header '*'"
echo ""
echo "  # 方式 2: 后台运行"
echo "  cd $INSTALL_DIR"
echo "  source venv/bin/activate"
echo "  nohup python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header '*' > comfyui.log 2>&1 &"
echo ""
echo "✅ 启动后访问: http://localhost:8188"
echo ""
echo "🔗 项目集成配置："
echo "   确保环境变量已设置: COMFYUI_ENDPOINT=http://localhost:8188"
echo ""
echo "📚 更多信息: docs/COMFYUI_DEPLOYMENT.md"
echo ""
