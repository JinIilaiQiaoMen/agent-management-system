# ⚠️ 网络限制说明

## 问题

沙箱环境无法访问 Hugging Face 下载模型文件。

错误信息：
```
Connecting to huggingface.co... failed: Connection timed out
```

## 📝 解决方案

由于网络限制，您需要手动下载模型文件并上传到服务器。

### 步骤 1: 在本地下载模型

在您的本地电脑上：

1. 访问: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
2. 登录 Hugging Face 账号（免费）
3. 点击下载 `sd_xl_base_1.0.safetensors` 文件
4. 等待下载完成（约 7GB）

### 步骤 2: 上传到服务器

将下载的模型文件上传到以下路径：

**路径**: `ComfyUI-Service/models/checkpoints/sd_xl_base_1.0.safetensors`

上传方式：

#### 方式 A: 使用 SCP 命令

```bash
scp sd_xl_base_1.0.safetensors user@server:/workspace/projects/ComfyUI-Service/models/checkpoints/
```

#### 方式 B: 使用 SFTP 客户端

- 使用 FileZilla、WinSCP 等工具
- 连接到服务器
- 上传文件到 `ComfyUI-Service/models/checkpoints/` 目录

#### 方式 C: 使用 FTP

如果您的服务器支持 FTP，也可以通过 FTP 上传。

### 步骤 3: 验证文件

上传完成后，在服务器上验证：

```bash
ls -lh /workspace/projects/ComfyUI-Service/models/checkpoints/sd_xl_base_1.0.safetensors
```

应该看到：
```
-rw-r--r-- 1 user user 6.9G Jan 1 00:00 sd_xl_base_1.0.safetensors
```

### 步骤 4: 使用模型

1. 访问: http://localhost:5000/pet-content-generator
2. 切换到 "AI 图像生成" 标签页
3. 点击刷新按钮
4. 看到状态显示 "✅ 模型已就绪"
5. 点击 "生成产品宣传图"

## 💡 替代方案

如果您无法上传 7GB 的文件，可以考虑：

### 1. 使用较小的模型

有一些较小的 SD 模型（约 1-2GB）可以使用：

- Stable Diffusion 1.5: `v1-5-pruned-emaonly.safetensors` (约 4GB)
- 其他轻量级模型

### 2. 使用 API 服务

使用在线 AI 图像生成 API（如 OpenAI DALL-E、Stability AI 等），无需本地模型。

### 3. 使用演示模式

当前界面支持演示模式，可以体验功能但使用示例图片。

## 📞 需要帮助？

如果您需要帮助配置上传或遇到其他问题，请告诉我。

---

**注意**: 由于网络限制，无法在沙箱环境中直接下载大型模型文件。请手动下载并上传。
