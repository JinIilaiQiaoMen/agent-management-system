# ⚠️ 模型文件下载说明

## 问题说明

您提供的 URL 指向的是一个 **PNG 图片文件**（约 92KB），而不是 ComfyUI 需要的 **SDXL 模型文件**（约 7GB）。

正确的 SDXL 模型文件信息：
- **文件名**: `sd_xl_base_1.0.safetensors`
- **文件大小**: 约 **7GB**
- **格式**: safetensors（二进制模型权重）
- **下载地址**: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0

## 🚀 快速下载（推荐）

### 使用自动下载脚本

我已经为您创建了一个自动下载脚本：

```bash
cd /workspace/projects
./scripts/download-model.sh
```

该脚本会：
- ✅ 自动检测可用的下载工具（aria2c、wget、curl）
- ✅ 优先使用 aria2c 进行多线程下载（最快）
- ✅ 支持断点续传
- ✅ 自动验证下载的文件
- ✅ 显示下载进度

## 📋 手动下载

### 方式 1：使用 wget

```bash
cd /workspace/projects/ComfyUI-Service/models/checkpoints/
wget https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors
```

### 方式 2：使用 aria2c（多线程，最快）

```bash
cd /workspace/projects/ComfyUI-Service/models/checkpoints/
aria2c -x 16 -s 16 https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors
```

### 方式 3：使用 curl

```bash
cd /workspace/projects/ComfyUI-Service/models/checkpoints/
curl -L -o sd_xl_base_1.0.safetensors https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors
```

### 方式 4：从浏览器下载

1. 访问: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
2. 找到文件: `sd_xl_base_1.0.safetensors`
3. 点击下载按钮
4. 下载完成后，将文件复制到: `ComfyUI-Service/models/checkpoints/`

## ✅ 验证下载

下载完成后，运行以下命令验证：

```bash
ls -lh /workspace/projects/ComfyUI-Service/models/checkpoints/sd_xl_base_1.0.safetensors
```

应该看到类似输出：
```
-rw-r--r-- 1 user user 6.9G Jan 1 00:00 sd_xl_base_1.0.safetensors
```

文件大小应该在 **6GB - 7GB** 之间。

## 🎯 下载完成后

1. 在浏览器中访问: http://localhost:5000/pet-content-generator
2. 切换到 "AI 图像生成" 标签页
3. 等待状态刷新（会显示 "✅ 模型已就绪"）
4. 点击 "生成产品宣传图" 开始生成图片

## 📊 下载时间参考

- **aria2c（多线程）**: 约 10-20 分钟（取决于网络速度）
- **wget**: 约 20-40 分钟
- **curl**: 约 20-40 分钟

## ⚠️ 注意事项

1. **磁盘空间**: 确保至少有 10GB 可用空间
2. **网络稳定**: 建议在网络环境稳定时下载
3. **断点续传**: 脚本和 wget/aria2c 都支持断点续传
4. **文件完整性**: 下载完成后检查文件大小是否接近 7GB

## 🔧 故障排查

### 下载失败或中断

```bash
# 使用脚本重新下载（会自动断点续传）
./scripts/download-model.sh
```

### 文件大小不正确

删除文件后重新下载：
```bash
rm -f /workspace/projects/ComfyUI-Service/models/checkpoints/sd_xl_base_1.0.safetensors
./scripts/download-model.sh
```

### 无法访问 Hugging Face

可能需要配置代理或使用镜像站。

---

**提示**: 模型文件较大，建议使用提供的自动下载脚本，它会自动选择最快的下载方式并验证文件完整性。
