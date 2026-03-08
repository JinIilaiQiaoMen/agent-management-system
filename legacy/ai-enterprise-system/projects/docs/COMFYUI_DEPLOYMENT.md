# ComfyUI 部署指南

本指南介绍如何在本地或云端部署 ComfyUI 服务，以支持宠物内容生成系统的图像/视频生成功能。

## 📋 目录

- [环境要求](#环境要求)
- [本地部署](#本地部署)
- [云端部署](#云端部署)
- [配置说明](#配置说明)
- [工作流管理](#工作流管理)
- [常见问题](#常见问题)

---

## 🖥️ 环境要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 4核 | 8核+ |
| 内存 | 16GB | 32GB+ |
| GPU | NVIDIA GTX 1060 (6GB) | NVIDIA RTX 3090/4090 (24GB+) |
| 存储 | 20GB 可用空间 | 50GB+ SSD |

### 软件要求

- **操作系统**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Python**: 3.10 或 3.11
- **CUDA**: 11.8 或 12.1 (NVIDIA GPU)
- **Git**: 用于克隆仓库

---

## 🏠 本地部署

### 1. 克隆 ComfyUI 仓库

```bash
# 克装 ComfyUI
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# Windows 用户也可以使用便携版（推荐）
# 下载链接: https://github.com/comfyanonymous/ComfyUI/releases
```

### 2. 创建 Python 虚拟环境

```bash
# 使用 venv
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

### 3. 安装依赖

```bash
# 安装 PyTorch (根据你的 CUDA 版本选择)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# 安装 ComfyUI 依赖
pip install -r requirements.txt
```

### 4. 下载模型

ComfyUI 需要模型文件才能工作。推荐使用以下模型：

```bash
# 创建模型目录
mkdir -p models/checkpoints
mkdir -p models/vae
mkdir -p models/clip

# 下载 SDXL Base 模型 (推荐)
cd models/checkpoints
wget https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors

# 下载 SDXL Refiner (可选，用于提升质量)
wget https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0/resolve/main/sd_xl_refiner_1.0.safetensors

# 回到 ComfyUI 根目录
cd ../..
```

**提示**: 你也可以在 Hugging Face 上搜索更多模型：
- [Stable Diffusion XL](https://huggingface.co/models?pipeline_tag=text-to-image&sort=downloads)
- [Juggernaut XL](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)

### 5. 安装自定义节点（可选）

```bash
# 安装 IP-Adapter (用于图像控制)
cd custom_nodes
git clone https://github.com/tencent-ailab/IP-Adapter.git

# 安装 ControlNet (用于姿势控制)
git clone https://github.com/Fannovel16/comfyui_controlnet_aux.git

# 回到根目录
cd ..
```

### 6. 启动 ComfyUI 服务

```bash
# 基础启动（默认端口 8188）
python main.py

# 自定义配置启动
python main.py --port 8188 --listen 0.0.0.0 --enable-cors-header "*"

# 开发模式启动（带详细日志）
python main.py --verbose
```

### 7. 验证服务

打开浏览器访问: `http://localhost:8188`

如果看到 ComfyUI 的图形界面，说明服务已成功启动。

---

## ☁️ 云端部署

### 方案 1: 使用 Google Colab (免费/低成本)

创建一个 Colab notebook，安装并运行 ComfyUI：

```python
# 在 Colab 中运行
!git clone https://github.com/comfyanonymous/ComfyUI.git
%cd ComfyUI

!pip install -q torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
!pip install -q -r requirements.txt

# 下载模型
!wget https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors -P models/checkpoints/

# 启动服务（使用 ngrok 暴露公网访问）
!pip install -q pyngrok
from pyngrok import ngrok

# 启动 ComfyUI
import subprocess
import threading

def run_comfyui():
    subprocess.run(['python', 'main.py', '--listen', '0.0.0.0', '--port', '8188'])

thread = threading.Thread(target=run_comfyui, daemon=True)
thread.start()

# 创建隧道
public_url = ngrok.connect(8188)
print(f'ComfyUI 公网访问地址: {public_url.public_url}')
```

### 方案 2: 使用 RunPod (推荐，GPU 性价比高)

1. 注册 [RunPod](https://www.runpod.io/)
2. 创建一个新实例
3. 选择镜像: `runpod/stable-diffusion`
4. 启动实例
5. 连接到实例并执行本地部署的步骤 6-7

### 方案 3: 使用 AWS/GCP/Azure

```bash
# 以 AWS EC2 为例
# 1. 启动 GPU 实例 (如 p3.2xlarge)
# 2. SSH 连接到实例
# 3. 执行本地部署的所有步骤
# 4. 配置安全组，开放 8188 端口
```

---

## ⚙️ 配置说明

### 环境变量配置

在你的 Next.js 项目根目录创建 `.env.local` 文件：

```env
# ComfyUI 服务端点
# 本地部署: http://localhost:8188
# 云端部署: http://your-cloud-ip:8188 或 https://your-domain.com
COMFYUI_ENDPOINT=http://localhost:8188

# ComfyUI 工作流文件路径
COMFYUI_WORKFLOW_PATH=./public/workflows
```

### ComfyUI 启动参数

```bash
python main.py --help

# 常用参数
--port 8188              # 端口号
--listen 0.0.0.0         # 监听所有网络接口
--enable-cors-header "*" # 允许跨域访问
--output-directory ./output # 输出目录
--temp-directory ./temp  # 临时文件目录
--fp16-vae               # 使用 FP16 VAE (减少显存)
--force-fp16             # 强制使用 FP16
```

---

## 📁 工作流管理

### 工作流文件位置

工作流文件存储在 `public/workflows/` 目录：

```
public/workflows/
├── pet_product_scene.json      # 宠物产品场景图
├── pet_product_unboxing.json   # 宠物产品开箱图
├── pet_product_features.json   # 宠物产品卖点图
└── short_video.json            # 短视频生成
```

### 自定义工作流

1. 在 ComfyUI 界面中设计你的工作流
2. 点击 "Save" 按钮，导出为 JSON 格式
3. 将 JSON 文件保存到 `public/workflows/` 目录
4. 在代码中引用：`const workflow = await comfyuiClient.loadWorkflow('your_workflow');`

### 工作流参数替换

工作流中使用 `{{参数名}}` 占位符，运行时会被自动替换：

```json
{
  "6": {
    "inputs": {
      "text": "{{PROMPT}}",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode"
  }
}
```

运行时：

```typescript
const workflowWithParams = comfyuiClient.replaceWorkflowParams(workflow, {
  PROMPT: 'A cute dog playing with a toy',
  // ... 其他参数
});
```

---

## ❓ 常见问题

### Q1: 启动失败，提示 CUDA 错误

**解决方法**:
```bash
# 检查 CUDA 版本
nvidia-smi

# 重新安装匹配的 PyTorch
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Q2: 显存不足 (OOM)

**解决方法**:
1. 启动时添加 `--fp16-vae` 参数
2. 降低图片分辨率
3. 使用更小的模型
4. 关闭其他占用显存的程序

### Q3: 生成速度慢

**优化方法**:
1. 使用更快的采样器（如 `euler`, `dpm++ 2m`）
2. 减少采样步数（从 50 降到 20-30）
3. 使用 GPU 加速
4. 启用 `--fp16-vae`

### Q4: 跨域访问错误 (CORS)

**解决方法**:
```bash
# 启动时添加 CORS 允许
python main.py --enable-cors-header "*"
```

### Q5: 工作流加载失败

**排查步骤**:
1. 检查工作流文件是否在 `public/workflows/` 目录
2. 验证 JSON 格式是否正确
3. 查看浏览器控制台错误信息
4. 检查 ComfyUI 服务是否正常运行

---

## 📚 参考资源

- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI 官方文档](https://docs.comfy.org/)
- [Stable Diffusion XL 模型](https://huggingface.co/models?pipeline_tag=text-to-image)
- [ComfyUI 社区节点](https://github.com/ltdrdata/ComfyUI-Manager)

---

## 🆘 技术支持

如遇到问题，请查看：
1. 本指南的常见问题部分
2. ComfyUI GitHub Issues
3. 项目 README 文件

---

## 📄 许可证

ComfyUI 使用 GPL-3.0 许可证。请确保合规使用。
