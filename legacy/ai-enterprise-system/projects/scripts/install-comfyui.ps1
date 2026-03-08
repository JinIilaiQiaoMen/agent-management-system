# ============================================================
# ComfyUI 一键部署脚本 (Windows PowerShell)
# ============================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  ComfyUI 一键部署脚本 (Windows)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python 版本: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未检测到 Python，请先安装 Python 3.10 或更高版本" -ForegroundColor Red
    Write-Host "下载地址: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 检查 pip
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ pip 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ 未检测到 pip" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 安装目录
$installDir = "$env:USERPROFILE\ComfyUI"

if (Test-Path $installDir) {
    Write-Host "⚠️  ComfyUI 目录已存在: $installDir" -ForegroundColor Yellow
    $response = Read-Host "是否删除并重新安装？(y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Remove-Item -Recurse -Force $installDir
        Write-Host "🗑️  已删除旧版本" -ForegroundColor Green
    } else {
        Write-Host "❌ 取消安装" -ForegroundColor Red
        exit 0
    }
}

# 克隆 ComfyUI
Write-Host "📥 正在下载 ComfyUI..." -ForegroundColor Cyan
git clone https://github.com/comfyanonymous/ComfyUI.git $installDir
Set-Location $installDir

Write-Host "✅ ComfyUI 下载完成" -ForegroundColor Green
Write-Host ""

# 创建虚拟环境
Write-Host "🔧 创建 Python 虚拟环境..." -ForegroundColor Cyan
python -m venv venv

Write-Host "✅ 虚拟环境创建完成" -ForegroundColor Green
Write-Host ""

# 激活虚拟环境
Write-Host "✅ 激活虚拟环境..." -ForegroundColor Cyan
& ".\venv\Scripts\activate.ps1"

Write-Host "✅ 虚拟环境已激活" -ForegroundColor Green
Write-Host ""

# 安装 PyTorch
Write-Host "📦 安装 PyTorch（这可能需要几分钟）..." -ForegroundColor Cyan
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

Write-Host "✅ PyTorch 安装完成" -ForegroundColor Green
Write-Host ""

# 安装 ComfyUI 依赖
Write-Host "📦 安装 ComfyUI 依赖..." -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "✅ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 创建模型目录
Write-Host "📁 创建模型目录..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "models\checkpoints"
New-Item -ItemType Directory -Force -Path "models\vae"
New-Item -ItemType Directory -Force -Path "models\clip"
New-Item -ItemType Directory -Force -Path "models\embeddings"

Write-Host "✅ 目录结构创建完成" -ForegroundColor Green
Write-Host ""

# 模型下载提示
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "⚠️  重要提示：需要下载模型文件" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ComfyUI 需要模型文件才能工作。请手动下载以下模型：" -ForegroundColor White
Write-Host ""
Write-Host "1. SDXL Base 模型（必需）:" -ForegroundColor Yellow
Write-Host "   https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0" -ForegroundColor Cyan
Write-Host "   下载: sd_xl_base_1.0.safetensors" -ForegroundColor White
Write-Host "   保存到: $installDir\models\checkpoints\" -ForegroundColor White
Write-Host ""
Write-Host "2. SDXL Refiner（可选，提升质量）:" -ForegroundColor Yellow
Write-Host "   https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0" -ForegroundColor Cyan
Write-Host "   下载: sd_xl_refiner_1.0.safetensors" -ForegroundColor White
Write-Host "   保存到: $installDir\models\checkpoints\" -ForegroundColor White
Write-Host ""

$response = Read-Host "模型文件是否已下载？(y/n)"
if ($response -ne 'y' -and $response -ne 'Y') {
    Write-Host ""
    Write-Host "请先下载模型文件，然后运行此脚本再次安装" -ForegroundColor Yellow
    Write-Host "或者使用以下命令继续（模型缺失会导致生成失败）" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ ComfyUI 安装完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 安装目录: $installDir" -ForegroundColor White
Write-Host ""
Write-Host "🚀 启动 ComfyUI 服务：" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # 方式 1: 使用此脚本启动" -ForegroundColor White
Write-Host "  cd $installDir" -ForegroundColor White
Write-Host "  .\venv\Scripts\activate.ps1" -ForegroundColor White
Write-Host "  python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header '*'" -ForegroundColor White
Write-Host ""
Write-Host "  # 方式 2: 使用启动脚本" -ForegroundColor White
Write-Host "  cd $installDir" -ForegroundColor White
Write-Host "  .\start-comfyui.bat" -ForegroundColor White
Write-Host ""
Write-Host "✅ 启动后访问: http://localhost:8188" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 项目集成配置：" -ForegroundColor Cyan
Write-Host "   确保环境变量已设置: COMFYUI_ENDPOINT=http://localhost:8188" -ForegroundColor White
Write-Host ""
Write-Host "📚 更多信息: docs\COMFYUI_DEPLOYMENT.md" -ForegroundColor White
Write-Host ""
