# ComfyUI 集成功能升级说明

## 📋 升级内容

本次升级完成了 ComfyUI 工作流系统的完整实现，包括以下 4 个核心升级：

### ✅ 1. 创建 4 个 ComfyUI 工作流 JSON 配置文件

在 `public/workflows/` 目录下创建了 4 个工作流配置文件：

| 工作流文件 | 功能说明 | 输入参数 |
|-----------|---------|---------|
| `pet_product_scene.json` | 宠物产品场景图生成 | 产品图片、背景、光照、宠物类型、姿态 |
| `pet_product_unboxing.json` | 宠物产品开箱图生成 | 产品图片、包装风格、光照、角度 |
| `pet_product_features.json` | 宠物产品卖点图生成 | 产品图片、卖点列表、布局、风格 |
| `short_video.json` | 短视频生成 | 产品图片、音乐风格、转场、时长 |

### ✅ 2. 实现参数替换逻辑

在 `src/lib/comfyui/client.ts` 中实现了完整的参数替换系统：

**核心方法**:

1. `loadWorkflow()` - 从文件系统加载工作流配置
   ```typescript
   const workflow = await comfyuiClient.loadWorkflow('petProductScene');
   ```

2. `replaceWorkflowParams()` - 动态替换工作流中的占位符
   ```typescript
   const workflowWithParams = comfyuiClient.replaceWorkflowParams(workflow, {
     PROMPT: 'A cute dog playing',
     BACKGROUND: 'living room',
     LIGHTING: 'soft natural',
     PET_TYPE: 'golden retriever',
     POSE: 'playing'
   });
   ```

3. `buildPrompt()` - 根据业务参数构建提示词
   ```typescript
   const prompt = comfyuiClient.buildPrompt(params, 'petProductScene');
   ```

**占位符格式**:
```json
{
  "inputs": {
    "text": "{{PROMPT}}",  // 会被自动替换
    "background": "{{BACKGROUND}}"
  }
}
```

### ✅ 3. 创建 ComfyUI 工作流目录结构

```
public/
└── workflows/
    ├── pet_product_scene.json      ✅ 宠物产品场景图
    ├── pet_product_unboxing.json   ✅ 宠物产品开箱图
    ├── pet_product_features.json   ✅ 宠物产品卖点图
    └── short_video.json            ✅ 短视频生成
```

### ✅ 4. 配置环境变量和部署文档

**环境变量配置** (`.env.example`):
```env
# ComfyUI 配置
COMFYUI_ENDPOINT=http://localhost:8188
COMFYUI_WORKFLOW_PATH=./public/workflows
```

**部署文档** (`docs/COMFYUI_DEPLOYMENT.md`):
- 本地部署指南（Windows/macOS/Linux）
- 云端部署方案（Colab/RunPod/AWS）
- 工作流管理说明
- 常见问题解答
- 配置参数说明

---

## 🎯 使用示例

### 示例 1: 生成宠物产品场景图

```typescript
import { workflowExecutor } from '@/lib/comfyui/client';

const result = await workflowExecutor.generatePetProductScene({
  productImage: 'https://example.com/dog-toy.jpg',
  productDescription: 'Interactive dog toy with LED lights',
  background: 'modern living room',
  lighting: 'soft natural light',
  petType: 'golden retriever',
  pose: 'playing and jumping'
});

// 返回结果
// {
//   images: ['http://localhost:8188/view?filename=xxx'],
//   prompt: 'A professional product photography of...',
//   params: { ... }
// }
```

### 示例 2: 生成宠物产品开箱图

```typescript
const result = await workflowExecutor.generatePetProductUnboxing({
  productImage: 'https://example.com/cat-food.jpg',
  productDescription: 'Premium cat food for adult cats',
  handImage: 'https://example.com/hand.jpg',
  boxStyle: 'colorful eco-friendly',
  lighting: 'bright studio lighting',
  angle: '45-degree angle'
});
```

### 示例 3: 生成短视频

```typescript
const result = await workflowExecutor.generateShortVideo({
  productDescription: 'Cat scratching post with modern design',
  productImages: [
    'https://example.com/product1.jpg',
    'https://example.com/product2.jpg',
    'https://example.com/product3.jpg'
  ],
  musicStyle: 'upbeat energetic',
  transition: 'smooth fade',
  duration: 30,
  textOverlay: ['Premium Quality', 'Modern Design', 'Durable']
});
```

---

## 🧪 测试 API

已创建测试端点: `/api/comfyui/test`

### 测试 GET 请求（检查状态）
```bash
curl http://localhost:5000/api/comfyui/test
```

### 测试 POST 请求（执行工作流）
```bash
curl -X POST http://localhost:5000/api/comfyui/test \
  -H 'Content-Type: application/json' \
  -d '{
    "workflowType": "petProductScene",
    "params": {
      "productImage": "https://example.com/toy.jpg",
      "productDescription": "Interactive dog toy",
      "background": "living room",
      "lighting": "natural light",
      "petType": "dog",
      "pose": "playing"
    }
  }'
```

---

## 🔄 工作流程

```
1. 前端调用 API
   ↓
2. 加载工作流配置 (loadWorkflow)
   ↓
3. 构建提示词 (buildPrompt)
   ↓
4. 替换工作流参数 (replaceWorkflowParams)
   ↓
5. 上传产品图片到 ComfyUI (uploadImage)
   ↓
6. 提交工作流到 ComfyUI (executeWorkflow)
   ↓
7. 轮询等待完成 (waitForCompletion)
   ↓
8. 返回生成的图片/视频
```

---

## 📦 文件清单

### 新增文件

1. **工作流配置文件**
   - `public/workflows/pet_product_scene.json`
   - `public/workflows/pet_product_unboxing.json`
   - `public/workflows/pet_product_features.json`
   - `public/workflows/short_video.json`

2. **配置文件**
   - `.env.example`

3. **文档**
   - `docs/COMFYUI_DEPLOYMENT.md`

4. **API 端点**
   - `src/app/api/comfyui/test/route.ts`

### 修改文件

1. `src/lib/ai-platform/config.ts` - 更新工作流配置
2. `src/lib/comfyui/client.ts` - 实现参数替换逻辑和工作流方法

---

## ⚠️ 注意事项

### 1. ComfyUI 服务必须启动

在使用工作流功能前，必须先启动 ComfyUI 服务：

```bash
# 进入 ComfyUI 目录
cd ComfyUI

# 启动服务（端口 8188）
python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header "*"
```

### 2. 模型文件必须存在

确保已下载必要的模型文件到 ComfyUI 的 `models/checkpoints/` 目录：
- `sd_xl_base_1.0.safetensors` (必需)
- `sd_xl_refiner_1.0.safetensors` (可选)

### 3. 网络配置

- 确保防火墙允许 8188 端口访问
- 如果是云端部署，需要配置安全组
- 本地开发时，需要启用 CORS 允许跨域访问

### 4. 性能优化

- 使用 `--fp16-vae` 参数减少显存占用
- 根据硬件情况调整采样步数（20-30 步）
- 选择合适的采样器（euler、dpm++ 2m）

---

## 🚀 下一步

### 短期优化
1. 添加工作流执行结果缓存
2. 实现批量图片上传
3. 添加生成进度实时推送
4. 支持自定义模型加载

### 长期规划
1. 集成更多自定义节点
2. 支持工作流可视化编辑
3. 实现分布式渲染
4. 添加工作流市场

---

## 📚 相关文档

- [ComfyUI 部署指南](./COMFYUI_DEPLOYMENT.md)
- [宠物内容生成 Agent 说明](../app/pet-content-generator/README.md)
- [AI 平台配置说明](../lib/ai-platform/README.md)

---

## 🆘 技术支持

如遇到问题，请参考：
1. `docs/COMFYUI_DEPLOYMENT.md` 中的常见问题部分
2. ComfyUI 官方文档: https://docs.comfy.org/
3. 项目 GitHub Issues
