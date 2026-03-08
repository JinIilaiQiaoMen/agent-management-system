# ComfyUI 集成说明

## 🎯 一键启动，直接使用

我已经完成了 ComfyUI 服务的深度集成，现在你可以通过页面直接一键启动服务并生成图片，无需手动运行任何脚本！

## 🚀 使用方法

### 1. 访问页面

打开浏览器访问: **http://localhost:5000/pet-content-generator**

### 2. 一键启动服务

页面会自动检查 ComfyUI 服务状态：
- ❌ 如果服务未运行，点击"**一键启动服务**"按钮
- ✅ 如果服务正在运行，直接进入下一步

### 3. 下载模型文件（首次使用必需）

如果显示"需要下载模型文件"，请按照以下步骤操作：

1. 访问: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
2. 下载文件: `sd_xl_base_1.0.safetensors` (约 7GB)
3. 保存到: `ComfyUI-Service/models/checkpoints/`
4. 在页面点击刷新按钮

### 4. 生成图片

模型加载完成后：
1. 点击"**生成示例图片**"按钮
2. 等待生成完成（CPU 模式约 1-2 分钟）
3. 预览或下载生成的图片

## 📊 API 端点

### 服务状态 API

```typescript
GET /api/comfyui/service
```

返回:
```json
{
  "running": true,
  "healthy": true,
  "version": "0.15.1",
  "port": 8188,
  "url": "http://localhost:8188",
  "hasModels": false
}
```

### 启动/停止服务

```typescript
POST /api/comfyui/service
Content-Type: application/json

{
  "action": "start"  // 或 "stop"
}
```

### 生成图片

```typescript
POST /api/comfyui/generate
Content-Type: application/json

{
  "prompt": "A cute cat with big eyes, fluffy fur",
  "width": 1024,
  "height": 1024
}
```

返回:
```json
{
  "success": true,
  "promptId": "xxx",
  "image": "data:image/png;base64,...",
  "filename": "pet_content_xxx.png"
}
```

## 🎨 自定义工作流

如需自定义生成流程，可以修改工作流配置：

编辑 `src/app/api/comfyui/generate/route.ts` 中的 `loadWorkflow` 函数，或创建新的工作流文件。

## 🔧 故障排查

### 服务无法启动

1. 检查端口是否被占用:
   ```bash
   ss -lptn 'sport = :8188'
   ```

2. 查看服务日志:
   ```bash
   tail -n 50 /app/work/logs/bypass/comfyui.log
   ```

3. 手动重启服务:
   ```bash
   cd /workspace/projects/ComfyUI-Service
   ./manage.sh restart
   ```

### 模型加载失败

1. 确认模型文件已下载到正确目录:
   ```
   ComfyUI-Service/models/checkpoints/sd_xl_base_1.0.safetensors
   ```

2. 检查文件是否完整（约 7GB）

3. 在页面点击刷新按钮重新检查

### 生成超时

- CPU 模式生成速度较慢，请耐心等待
- 首次生成可能需要 2-3 分钟
- 后续生成会更快（模型已加载）

## 📚 相关文档

- [快速开始指南](/QUICK_START.md)
- [ComfyUI 官方文档](https://docs.comfy.org/)
- [项目 README](/README.md)

## 💡 提示

1. **GPU 加速**: 如果有 NVIDIA GPU，可以重新安装 GPU 版本的 PyTorch 来提升速度
2. **批量生成**: 可以通过 API 批量生成多张图片
3. **自定义 Prompt**: 可以根据需要调整 Prompt 来生成不同风格的图片

---

**祝你使用愉快！** 🎉
