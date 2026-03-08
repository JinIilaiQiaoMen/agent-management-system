# ComfyUI 服务部署指南

## 📦 当前部署状态

- ✅ ComfyUI 代码已克隆到 `ComfyUI-Service/`
- ✅ Python 虚拟环境已创建
- ✅ PyTorch 2.10.0 (CPU 版本) 已安装
- ✅ ComfyUI 依赖已全部安装
- ✅ 模型目录结构已创建
- ✅ 服务已启动并运行在端口 8188
- ⏳ 模型文件：需要手动下载

## 🚀 服务信息

- **服务地址**: http://localhost:8188
- **版本**: ComfyUI 0.15.1
- **PyTorch**: 2.10.0+cpu (CPU 模式)
- **前端版本**: 1.39.19
- **Python**: 3.12.3

## 📥 下一步：下载模型文件

ComfyUI 需要模型文件才能生成图片。请下载以下模型：

### 必需模型：SDXL Base

1. 访问: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
2. 下载文件: `sd_xl_base_1.0.safetensors`
3. 保存到: `ComfyUI-Service/models/checkpoints/`

### 可选模型：SDXL Refiner（提升质量）

1. 访问: https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0
2. 下载文件: `sd_xl_refiner_1.0.safetensors`
3. 保存到: `ComfyUI-Service/models/checkpoints/`

## 🎮 服务管理

### 启动服务

```bash
cd /workspace/projects/ComfyUI-Service
./manage.sh start
```

### 停止服务

```bash
cd /workspace/projects/ComfyUI-Service
./manage.sh stop
```

### 重启服务

```bash
cd /workspace/projects/ComfyUI-Service
./manage.sh restart
```

### 查看状态

```bash
cd /workspace/projects/ComfyUI-Service
./manage.sh status
```

### 查看日志

```bash
cd /workspace/projects/ComfyUI-Service
./manage.sh logs
```

### 健康检查

```bash
cd /workspace/projects/ComfyUI-Service
./health-check.sh
```

## 🔗 环境变量

已配置在项目根目录的 `.env.local`:

```env
NEXT_PUBLIC_COMFYUI_ENDPOINT=http://localhost:8188
COMFYUI_WORKFLOW_PATH=./public/workflows
COMFYUI_OUTPUT_DIR=/workspace/projects/ComfyUI-Service/output
COMFYUI_TIMEOUT=120
```

## 📊 API 使用示例

### 1. 查看系统信息

```bash
curl http://localhost:8188/system_stats
```

### 2. 查看节点列表

```bash
curl http://localhost:8188/object_info
```

### 3. 提交生成任务

```bash
curl -X POST http://localhost:8188/prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": {...}, "client_id": "test"}'
```

### 4. 查看队列

```bash
curl http://localhost:8188/prompt
```

## 💡 注意事项

1. **CPU 模式**: 当前使用 CPU 运行，生成速度较慢。如有 NVIDIA GPU，可重新安装 GPU 版本的 PyTorch:
   ```bash
   pip uninstall torch torchvision torchaudio
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

2. **模型文件**: 必须下载模型文件才能生成图片。

3. **CORS 配置**: 服务已配置 CORS 允许跨域访问，可以直接在 Web 应用中使用。

4. **日志位置**: 服务日志保存在 `/app/work/logs/bypass/comfyui.log`

## 📚 相关文档

- [快速开始指南](/QUICK_START.md)
- [完整部署文档](/docs/COMFYUI_DEPLOYMENT.md)
- [ComfyUI 官方文档](https://docs.comfy.org/)
- [项目 README](/README.md)

## 🐛 故障排查

### 端口被占用

```bash
# 查找占用端口的进程
ss -lptn 'sport = :8188'

# 杀死进程
kill <PID>
```

### 服务无法启动

```bash
# 查看日志
tail -n 50 /app/work/logs/bypass/comfyui.log

# 重新启动
cd /workspace/projects/ComfyUI-Service
./manage.sh restart
```

### 模型加载失败

确保模型文件已下载到正确的目录：
```
ComfyUI-Service/models/checkpoints/
  └── sd_xl_base_1.0.safetensors
```
