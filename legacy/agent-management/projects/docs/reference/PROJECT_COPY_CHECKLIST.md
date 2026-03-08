# 📋 公司智能体管理系统 - 功能配置清单

本文档提供了在另一个扣子编程项目中复制本项目所需的**完整功能清单和配置信息**。

---

## 📖 目录

- [项目概述](#项目概述)
- [核心功能模块](#核心功能模块)
- [技术栈配置](#技术栈配置)
- [API 接口清单](#api-接口清单)
- [数据库表结构](#数据库表结构)
- [环境变量配置](#环境变量配置)
- [部署平台配置](#部署平台配置)
- [依赖包清单](#依赖包清单)
- [文件结构](#文件结构)
- [CI/CD 配置](#cicd-配置)

---

## 项目概述

### 项目名称
**公司智能体管理系统** (Company Agent Management System)

### 项目描述
基于 Next.js 16 的公司智能体管理系统，支持 CEO 任务发布、智能体管理、流式对话、知识库管理、文档上传解析、智能体自动生成、任务成果管理及智能分类、全自动化任务执行、API 配置管理。

### 核心特性
- ✅ CEO 任务发布与智能分配
- ✅ 智能体全生命周期管理（增删改查）
- ✅ 流式对话（SSE）
- ✅ 知识库管理（支持多文件类型上传）
- ✅ 文档上传解析（PDF、Word、Excel、Markdown）
- ✅ 智能体自动生成
- ✅ 任务成果管理（分类存储、版本管理）
- ✅ 全自动化任务执行流程
- ✅ API 配置管理（支持多种认证方式）

---

## 核心功能模块

### 1. 智能体管理模块

#### 功能清单
- [x] 创建智能体
- [x] 查看智能体列表
- [x] 编辑智能体信息
- [x] 删除智能体
- [x] 智能体状态管理（启用/禁用）
- [x] 智能体搜索与过滤
- [x] 智能体详情查看

#### 技术实现
- 使用 `agents` 表存储智能体基本信息
- 使用 `agent-knowledge-bases` 关联智能体与知识库
- 支持智能体自动生成（基于任务分析）

---

### 2. 任务管理模块

#### 功能清单
- [x] CEO 发布任务
- [x] 任务列表查看
- [x] 任务详情查看
- [x] 任务状态跟踪（待处理、进行中、已完成）
- [x] 任务智能分配（基于公司架构）
- [x] 任务自动执行
- [x] 任务完成确认
- [x] 任务描述生成

#### 技术实现
- 使用 `tasks` 表存储任务信息
- 使用 `task-assignments` 表存储任务分配关系
- 支持任务自动分析生成智能体
- 支持任务成果分类存储

---

### 3. 对话系统模块

#### 功能清单
- [x] 流式对话（SSE）
- [x] 会话管理
- [x] 对话历史记录
- [x] 多轮对话支持
- [x] 联网搜索集成
- [x] 知识库检索集成

#### 技术实现
- 使用 `conversations` 表存储对话记录
- 使用 `conversation-sessions` 表管理会话
- SSE 协议实现流式输出
- 集成 Coze 大语言模型
- 集成 Web Search SDK

---

### 4. 知识库管理模块

#### 功能清单
- [x] 创建知识库
- [x] 上传文档（PDF、Word、Excel、Markdown）
- [x] 文档解析与向量化
- [x] 知识库搜索
- [x] 知识库与智能体关联
- [x] 文档与智能体匹配度分析

#### 技术实现
- 使用 `knowledge-bases` 表存储知识库信息
- 使用 `documents` 表存储文档信息
- 使用 S3 存储文件
- 使用 KnowledgeClient 导入知识库
- 支持文档与智能体匹配度分析

---

### 5. 文档上传解析模块

#### 功能清单
- [x] 文件上传（支持多种格式）
- [x] PDF 解析
- [x] Word 文档解析
- [x] Excel 解析
- [x] Markdown 解析
- [x] 文件大小限制（10MB）
- [x] 文件类型验证

#### 技术实现
- 使用 `pdf-parse` 解析 PDF
- 使用 `mammoth` 解析 Word
- 使用 `xlsx` 解析 Excel
- 使用 `marked` 解析 Markdown
- S3 存储文件

---

### 6. 任务成果管理模块

#### 功能清单
- [x] 上传任务成果
- [x] 成果分类存储
- [x] 成果版本管理
- [x] 成果查看与下载
- [x] 智能分类（基于 AI）
- [x] 成果状态跟踪

#### 技术实现
- 使用 `task-deliverables` 表存储任务成果
- 支持多种成果类型（文档、代码、设计等）
- AI 自动分类

---

### 7. API 配置管理模块

#### 功能清单
- [x] API 配置管理
- [x] 多种认证方式支持（API Key、Bearer、Basic Auth）
- [x] API 测试
- [x] API 调用日志
- [x] 自动重试机制

#### 技术实现
- 使用 `agent-api-configs` 表存储 API 配置
- 支持 API Key、Bearer Token、Basic Auth
- 集成自动重试机制

---

### 8. 自动化任务执行模块

#### 功能清单
- [x] 自动生成智能体
- [x] 任务自动分析
- [x] 自主学习（知识库）
- [x] 协作执行
- [x] 交付成果
- [x] 完整工作流自动化

#### 技术实现
- 生成智能体 → 分析任务 → 自主学习 → 协作执行 → 交付成果
- AI 驱动的全流程自动化

---

## 技术栈配置

### 前端技术栈

```json
{
  "framework": "Next.js 16.1.1",
  "react": "19.2.3",
  "language": "TypeScript 5",
  "ui": "shadcn/ui",
  "styling": "Tailwind CSS 4",
  "state": "React Hooks",
  "forms": "react-hook-form",
  "validation": "zod 4.3.5"
}
```

### 后端技术栈

```json
{
  "runtime": "Node.js 20",
  "api": "Next.js API Routes",
  "database": "PostgreSQL",
  "orm": "Drizzle ORM 0.45.1",
  "cache": "Redis (可选)"
}
```

### 核心依赖

```json
{
  "ai": {
    "llm": "coze-coding-dev-sdk 0.7.15",
    "search": "coze-coding-dev-sdk (Web Search SDK)"
  },
  "storage": {
    "s3": "@aws-sdk/client-s3 3.958.0",
    "uploader": "@aws-sdk/lib-storage 3.958.0"
  },
  "database": {
    "client": "pg 8.16.3",
    "orm": "drizzle-orm 0.45.1",
    "migrations": "drizzle-kit 0.31.8"
  },
  "knowledge": {
    "sdk": "coze-coding-dev-sdk (KnowledgeClient)"
  }
}
```

### UI 组件库

```json
{
  "base": "shadcn/ui (Radix UI)",
  "components": [
    "@radix-ui/react-accordion",
    "@radix-ui/react-alert-dialog",
    "@radix-ui/react-avatar",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-label",
    "@radix-ui/react-select",
    "@radix-ui/react-tabs",
    "@radix-ui/react-tooltip",
    "sonner"
  ],
  "icons": "lucide-react 0.468.0",
  "charts": "recharts 2.15.4"
}
```

### 文档解析

```json
{
  "pdf": "pdf-parse 2.4.5",
  "word": "mammoth 1.11.0",
  "excel": "xlsx 0.18.5",
  "markdown": "marked 17.0.1"
}
```

---

## API 接口清单

### 智能体相关

| 端点 | 方法 | 功能 | 说明 |
|------|------|------|------|
| `/api/agents` | GET | 获取智能体列表 | 支持分页、搜索、过滤 |
| `/api/agents` | POST | 创建智能体 | 创建新智能体 |
| `/api/agents/[id]` | GET | 获取智能体详情 | 获取单个智能体信息 |
| `/api/agents/[id]` | PUT | 更新智能体 | 更新智能体信息 |
| `/api/agents/[id]` | DELETE | 删除智能体 | 删除智能体 |
| `/api/agents/[id]/execute-apis` | POST | 执行 API 调用 | 调用智能体的 API |
| `/api/agents/[id]/learn` | POST | 智能体学习 | 让智能体学习知识库 |
| `/api/agents/status` | GET | 获取智能体状态 | 批量获取智能体状态 |

### 任务相关

| 端点 | 方法 | 功能 | 说明 |
|------|------|------|------|
| `/api/tasks` | GET | 获取任务列表 | 支持分页、过滤 |
| `/api/tasks` | POST | 创建任务 | CEO 发布新任务 |
| `/api/tasks/[id]` | GET | 获取任务详情 | 获取单个任务信息 |
| `/api/tasks/[id]` | PUT | 更新任务 | 更新任务信息 |
| `/api/tasks/[id]` | DELETE | 删除任务 | 删除任务 |
| `/api/tasks/[id]/assign` | POST | 分配任务 | 将任务分配给智能体 |
| `/api/tasks/[id]/start` | POST | 开始任务 | 开始执行任务 |
| `/api/tasks/[id]/auto-execute` | POST | 自动执行任务 | 全自动执行任务 |
| `/api/tasks/[id]/complete` | POST | 完成任务 | 标记任务完成 |
| `/api/tasks/[id]/deliverables` | GET | 获取任务成果 | 获取任务的成果列表 |
| `/api/tasks/[id]/generate-agents` | POST | 生成智能体 | 基于任务生成智能体 |
| `/api/tasks/analyze` | POST | 分析任务 | AI 分析任务需求 |

### 对话相关

| 端点 | 方法 | 功能 | 说明 |
|------|------|------|------|
| `/api/chat` | POST | 流式对话 | SSE 流式响应 |
| `/api/conversations` | GET | 获取对话列表 | 获取对话历史 |
| `/api/conversations` | POST | 创建对话 | 创建新对话 |
| `/api/conversation-sessions` | GET | 获取会话列表 | 获取所有会话 |
| `/api/conversation-sessions` | POST | 创建会话 | 创建新会话 |

### 知识库相关

| 端点 | 方法 | 功能 | 说明 |
|------|------|------|------|
| `/api/knowledge-bases` | GET | 获取知识库列表 | 支持分页 |
| `/api/knowledge-bases` | POST | 创建知识库 | 创建新知识库 |
| `/api/knowledge-bases/[id]` | GET | 获取知识库详情 | 获取单个知识库 |
| `/api/knowledge-bases/[id]` | PUT | 更新知识库 | 更新知识库信息 |
| `/api/knowledge-bases/[id]` | DELETE | 删除知识库 | 删除知识库 |
| `/api/knowledge-bases/[id]/documents` | GET | 获取知识库文档 | 获取知识库的文档列表 |
| `/api/knowledge-bases/add-document` | POST | 添加文档 | 添加文档到知识库 |
| `/api/knowledge-bases/documents/[id]` | DELETE | 删除文档 | 从知识库删除文档 |
| `/api/knowledge-bases/upload-file` | POST | 上传文件 | 上传文件到 S3 |
| `/api/knowledge-bases/search` | POST | 搜索知识库 | 在知识库中搜索 |
| `/api/knowledge-bases/analyze-match` | POST | 分析匹配度 | 分析文档与智能体匹配度 |

### 文档相关

| 端点 | 方法 | 功能 | 说明 |
|------|------|------|------|
| `/api/documents/upload` | POST | 上传文档 | 上传并解析文档 |

### API 配置相关

| 端点 | 方法 | 功能 | 说明 |
|------|------|------|------|
| `/api/agent-api-configs` | GET | 获取 API 配置列表 | 获取所有 API 配置 |
| `/api/agent-api-configs` | POST | 创建 API 配置 | 创建新 API 配置 |
| `/api/agent-api-configs/[id]` | GET | 获取 API 配置详情 | 获取单个 API 配置 |
| `/api/agent-api-configs/[id]` | PUT | 更新 API 配置 | 更新 API 配置 |
| `/api/agent-api-configs/[id]` | DELETE | 删除 API 配置 | 删除 API 配置 |
| `/api/agent-api-configs/[id]/test` | POST | 测试 API 配置 | 测试 API 是否可用 |
| `/api/agent-api-configs/agent/[agentId]` | GET | 获取智能体 API 配置 | 获取智能体的 API 配置 |

### 其他

| 端点 | 方法 | 功能 | 说明 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | 检查服务状态 |
| `/api/web-search` | POST | 联网搜索 | 执行联网搜索 |
| `/api/generate-task-description` | POST | 生成任务描述 | AI 生成任务描述 |
| `/api/classify-deliverable` | POST | 分类成果 | AI 分类任务成果 |
| `/api/api-execution-logs` | GET | 获取 API 执行日志 | 获取 API 调用日志 |

---

## 数据库表结构

### agents（智能体表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | TEXT | 智能体名称 |
| description | TEXT | 描述 |
| role | TEXT | 角色 |
| department | TEXT | 部门 |
| capabilities | JSONB | 能力 |
| status | TEXT | 状态（active/inactive） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### tasks（任务表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| title | TEXT | 任务标题 |
| description | TEXT | 任务描述 |
| status | TEXT | 状态（pending/in_progress/completed） |
| priority | TEXT | 优先级 |
| assignee_id | UUID | 分配给谁 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### conversations（对话表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| agent_id | UUID | 智能体 ID |
| user_message | TEXT | 用户消息 |
| assistant_message | TEXT | 助手消息 |
| created_at | TIMESTAMP | 创建时间 |

### knowledge-bases（知识库表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | TEXT | 知识库名称 |
| description | TEXT | 描述 |
| created_at | TIMESTAMP | 创建时间 |

### documents（文档表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| knowledge_base_id | UUID | 知识库 ID |
| file_name | TEXT | 文件名 |
| file_type | TEXT | 文件类型 |
| file_size | INTEGER | 文件大小 |
| s3_key | TEXT | S3 存储键 |
| created_at | TIMESTAMP | 创建时间 |

### task-deliverables（任务成果表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| task_id | UUID | 任务 ID |
| title | TEXT | 标题 |
| description | TEXT | 描述 |
| type | TEXT | 类型 |
| status | TEXT | 状态 |
| created_at | TIMESTAMP | 创建时间 |

### agent-api-configs（API 配置表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| agent_id | UUID | 智能体 ID |
| name | TEXT | 配置名称 |
| url | TEXT | API URL |
| method | TEXT | 请求方法 |
| auth_type | TEXT | 认证类型（api_key/bearer/basic） |
| auth_config | JSONB | 认证配置 |
| headers | JSONB | 请求头 |
| created_at | TIMESTAMP | 创建时间 |

---

## 环境变量配置

### 必需配置

```bash
# 数据库
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Coze API
COZE_API_KEY=your-coze-api-key
COZE_API_SECRET=your-coze-api-secret
COZE_WORKSPACE_ID=your-workspace-id

# S3 存储
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com

# 应用配置
NODE_ENV=production
PORT=5000
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 可选配置

```bash
# Redis 缓存
REDIS_URL=redis://localhost:6379

# 应用名称
NEXT_PUBLIC_APP_NAME=Company Agent Management
```

---

## 部署平台配置

### Vercel 配置

**文件**: `vercel.json`

```json
{
  "version": 2,
  "name": "company-agent-management",
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": ".next",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["hkg1", "sin1", "iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**环境变量**:
- 通过 Vercel Dashboard 配置所有环境变量
- 或使用 CLI: `vercel env add DATABASE_URL production`

### Netlify 配置

**文件**: `netlify.toml`

```toml
[build]
  command = "pnpm install && pnpm build"
  publish = ".next"
  base = "/"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"
```

**环境变量**:
- 在 Netlify Dashboard 中配置

### Docker 配置

**文件**: `Dockerfile`

```dockerfile
FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# 运行
FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 5000
ENV PORT 5000
CMD ["node", "server.js"]
```

**文件**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/agentdb
      - COZE_API_KEY=${COZE_API_KEY}
      - COZE_API_SECRET=${COZE_API_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: agentdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

---

## 依赖包清单

### 生产依赖

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.958.0",
    "@aws-sdk/lib-storage": "^3.958.0",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "coze-coding-dev-sdk": "^0.7.15",
    "date-fns": "^4.1.0",
    "drizzle-orm": "^0.45.1",
    "drizzle-zod": "^0.8.3",
    "lucide-react": "^0.468.0",
    "mammoth": "^1.11.0",
    "marked": "^17.0.1",
    "next": "16.1.1",
    "next-themes": "^0.4.6",
    "pdf-parse": "^2.4.5",
    "pg": "^8.16.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.70.0",
    "recharts": "2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^2.6.0",
    "uuid": "^13.0.0",
    "xlsx": "^0.18.5",
    "zod": "^4.3.5"
  }
}
```

### 开发依赖

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pg": "^8.16.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "drizzle-kit": "^0.31.8",
    "eslint": "^9",
    "eslint-config-next": "16.1.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### 包管理器

```json
{
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "pnpm": ">=9.0.0"
  }
}
```

---

## 文件结构

```
company-agent-management/
├── src/
│   ├── app/
│   │   ├── api/                    # API 路由
│   │   │   ├── agents/            # 智能体 API
│   │   │   ├── tasks/             # 任务 API
│   │   │   ├── chat/              # 对话 API
│   │   │   ├── knowledge-bases/   # 知识库 API
│   │   │   ├── documents/         # 文档 API
│   │   │   └── ...
│   │   ├── agents/                # 智能体页面
│   │   ├── tasks/                 # 任务页面
│   │   ├── knowledge-bases/       # 知识库页面
│   │   ├── layout.tsx             # 布局
│   │   └── page.tsx               # 首页
│   ├── components/
│   │   ├── ui/                    # UI 组件（shadcn/ui）
│   │   ├── agents/                # 智能体组件
│   │   ├── tasks/                 # 任务组件
│   │   └── ...
│   ├── lib/
│   │   ├── db.ts                  # 数据库连接
│   │   ├── schema.ts              # 数据库 Schema
│   │   └── utils.ts               # 工具函数
│   └── styles/
│       └── globals.css            # 全局样式
├── scripts/
│   ├── build.sh                   # 构建脚本
│   ├── dev.sh                     # 开发脚本
│   ├── start.sh                   # 启动脚本
│   ├── deploy-vercel.sh           # Vercel 部署脚本
│   ├── deploy-docker.sh           # Docker 部署脚本
│   └── push-to-github.sh          # GitHub 推送脚本
├── .github/
│   └── workflows/
│       ├── deploy-vercel.yml      # Vercel CI/CD
│       └── deploy-docker.yml      # Docker CI/CD
├── vercel.json                    # Vercel 配置
├── netlify.toml                   # Netlify 配置
├── Dockerfile                     # Docker 配置
├── docker-compose.yml             # Docker Compose 配置
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript 配置
├── .env.example                   # 环境变量示例
└── README.md                      # 项目说明
```

---

## CI/CD 配置

### GitHub Actions - Vercel 部署

**文件**: `.github/workflows/deploy-vercel.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, master]

jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install Dependencies
        run: pnpm install

      - name: Build Project
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitHub Actions - Docker 部署

**文件**: `.github/workflows/deploy-docker.yml`

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main, master]
    tags:
      - 'v*'

jobs:
  Build-and-Push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: your-username/company-agent-management:latest
```

---

## 完整复制步骤

### Step 1: 创建新项目

```bash
# 使用 Coze CLI 初始化
coze init /workspace/projects/new-project --template nextjs
```

### Step 2: 配置包管理器

```bash
cd /workspace/projects/new-project
pnpm install
```

### Step 3: 复制依赖

在 `package.json` 中添加所有依赖（见上方依赖包清单）

```bash
pnpm install
```

### Step 4: 复制配置文件

复制以下文件到新项目：
- `vercel.json`
- `netlify.toml`
- `Dockerfile`
- `docker-compose.yml`
- `.github/workflows/deploy-vercel.yml`
- `.github/workflows/deploy-docker.yml`

### Step 5: 配置数据库

1. 创建 Supabase 项目
2. 获取数据库连接字符串
3. 运行数据库迁移

### Step 6: 配置环境变量

复制 `.env.example` 为 `.env`，填入实际值

### Step 7: 配置 S3 存储

1. 创建 S3 Bucket
2. 获取凭证
3. 配置环境变量

### Step 8: 测试

```bash
# 开发模式
pnpm dev

# 构建
pnpm build

# 生产模式
pnpm start
```

### Step 9: 部署

```bash
# Vercel
bash scripts/deploy-vercel.sh

# Docker
bash scripts/deploy-docker.sh
```

---

## 📚 相关文档

- [一键部署指南](ONE_CLICK_DEPLOY.md)
- [Vercel 部署详细指南](VERCEL_DEPLOYMENT_GUIDE.md)
- [多平台部署指南](MULTI_PLATFORM_DEPLOYMENT.md)
- [环境变量配置](DEPLOYMENT_ENV.md)

---

## ✅ 功能检查清单

复制项目时，确保以下功能都已实现：

- [ ] 智能体 CRUD
- [ ] 任务 CRUD
- [ ] 流式对话（SSE）
- [ ] 知识库管理
- [ ] 文档上传（PDF、Word、Excel、Markdown）
- [ ] 文档解析
- [ ] 任务成果管理
- [ ] API 配置管理
- [ ] 自动化任务执行
- [ ] 数据库集成（PostgreSQL + Drizzle）
- [ ] 对象存储集成（S3）
- [ ] LLM 集成（Coze）
- [ ] 联网搜索集成
- [ ] 知识库集成
- [ ] Vercel 部署配置
- [ ] Netlify 部署配置
- [ ] Docker 部署配置
- [ ] CI/CD 配置

---

**祝你复制项目顺利！** 🎉
