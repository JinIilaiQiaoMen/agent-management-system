# AI 智能化企业系统 - 快速开始指南

## 🎯 项目概述

这是一个基于 Next.js 16 的 AI 智能化企业系统，集成了大语言模型、数据库、知识库和图像生成功能，提供外贸业务、企业管理、智能营销三大领域的全流程 AI 解决方案。

## ✅ 系统已部署并运行

- ✅ Next.js 开发服务器: **http://localhost:5000**
- ✅ ComfyUI 图像生成服务: **http://localhost:8188**
- ✅ 数据库: Supabase（需配置）
- ✅ AI 模型: LLM SDK（支持豆包/DeepSeek/Kimi）

## 🚀 快速启动

### 1. 启动开发服务器

```bash
cd /workspace/projects
pnpm install  # 首次运行
pnpm dev      # 启动开发服务器（端口 5000）
```

### 2. 访问应用

打开浏览器访问: **http://localhost:5000**

### 3. 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并配置以下变量：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ComfyUI 配置（已自动配置）
NEXT_PUBLIC_COMFYUI_ENDPOINT=http://localhost:8188
COMFYUI_WORKFLOW_PATH=./public/workflows
COMFYUI_OUTPUT_DIR=/workspace/projects/ComfyUI-Service/output
COMFYUI_TIMEOUT=120

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here_please_replace_in_production
```

## 📦 ComfyUI 图像生成服务

ComfyUI 服务已自动部署并运行，提供零成本的图像生成能力。

### 服务信息

- **地址**: http://localhost:8188
- **版本**: ComfyUI 0.15.1
- **PyTorch**: 2.10.0+cpu (CPU 模式)
- **状态**: ✅ 运行中

### 服务管理

```bash
# 进入 ComfyUI 目录
cd /workspace/projects/ComfyUI-Service

# 启动服务
./manage.sh start

# 停止服务
./manage.sh stop

# 查看状态
./manage.sh status

# 查看日志
./manage.sh logs

# 健康检查
./health-check.sh

# API 测试
./test-api.sh
```

### 下载模型文件

ComfyUI 需要模型文件才能生成图片。请下载 SDXL Base 模型：

1. 访问: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
2. 下载: `sd_xl_base_1.0.safetensors`
3. 保存到: `ComfyUI-Service/models/checkpoints/`

### 使用 ComfyUI

- **Web 界面**: http://localhost:8188
- **API 端点**: http://localhost:8188/prompt
- **工作流**: 存储在 `public/workflows/` 目录

## 🏗️ 项目结构

```
workspace/projects/
├── src/                          # 源代码
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/            # 仪表盘
│   │   ├── foreign-trade/        # 外贸业务
│   │   ├── enterprise/           # 企业管理
│   │   ├── marketing/            # 智能营销
│   │   └── pet-content-generator/# 宠物内容生成
│   ├── components/               # React 组件
│   │   └── ui/                   # shadcn/ui 组件
│   ├── lib/                      # 工具库
│   │   ├── supabase.ts           # Supabase 客户端
│   │   ├── llm.ts                # LLM SDK 集成
│   │   └── comfyui.ts            # ComfyUI 集成
│   └── styles/                   # 样式文件
├── public/                       # 静态资源
│   └── workflows/                # ComfyUI 工作流
├── ComfyUI-Service/              # ComfyUI 服务
│   ├── models/                   # 模型文件
│   ├── manage.sh                 # 服务管理脚本
│   ├── health-check.sh           # 健康检查脚本
│   └── test-api.sh               # API 测试脚本
├── docs/                         # 文档
├── scripts/                      # 部署脚本
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .env.local                    # 环境变量
```

## 🎨 功能模块

### 外贸业务（5个模块）

1. **客户背调系统** - 对话式客户分析，支持流式输出
2. **邮件生成系统** - AI 智能邮件撰写
3. **谈单辅助系统** - AI 谈判助手
4. **线索筛选系统** - AI 线索评分与排序
5. **知识库管理** - RAG 知识库，支持文档导入

### 企业管理（4个模块）

1. **HR 管理系统** - 员工、简历、面试、考勤、绩效、薪资
2. **财务审计系统** - 自动化财务审计
3. **资产管理系统** - 企业资产管理
4. **流程审批系统** - 审批流程管理

### 智能营销（4个模块）

1. **国内全渠道发布中心** - 30+ 平台一键发布
2. **欧美线下渠道赋能系统** - GDPR/CCPA 合规
3. **AI 能力中台** - 模型路由、智能缓存、用量监控
4. **宠物内容生成 Agent** - 集成 ComfyUI 的内容生成

## 🔧 开发指南

### 添加新页面

```typescript
// src/app/your-page/page.tsx
export default function YourPage() {
  return (
    <div>
      <h1>新页面</h1>
    </div>
  )
}
```

### 使用 LLM SDK

```typescript
import { generateText } from '@/lib/llm'

const result = await generateText({
  model: 'doubao',
  prompt: '你的问题'
})
```

### 使用 ComfyUI

```typescript
import { generateImage } from '@/lib/comfyui'

const imageUrl = await generateImage({
  workflowPath: './workflows/pet-generation.json',
  prompt: '一只可爱的猫'
})
```

### 使用 Supabase

```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

## 📚 相关文档

- [项目 README](/README.md)
- [ComfyUI 部署指南](/ComfyUI-Service/README.md)
- [数据库设计](/docs/DATABASE.md)
- [API 文档](/docs/API.md)
- [部署指南](/docs/DEPLOYMENT.md)

## 🐛 故障排查

### 开发服务器无法启动

```bash
# 检查端口
ss -lptn 'sport = :5000'

# 查看日志
tail -n 50 /app/work/logs/bypass/dev.log
```

### ComfyUI 服务无法启动

```bash
# 检查服务状态
cd /workspace/projects/ComfyUI-Service
./manage.sh status

# 查看日志
./manage.sh logs

# 重新启动
./manage.sh restart
```

### 数据库连接失败

1. 检查 `.env.local` 中的 Supabase 配置
2. 确保 Supabase 项目已创建
3. 验证 API 密钥是否正确

## 📞 支持

如有问题，请查看文档或提交 Issue。

---

**祝使用愉快！** 🎉
