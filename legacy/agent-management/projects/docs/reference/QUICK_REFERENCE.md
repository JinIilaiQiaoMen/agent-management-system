# 🚀 快速参考 - 项目配置速查表

用于在另一个扣子编程项目中快速复制配置。

---

## 📋 一键复制清单

### ✅ 核心配置（必须）

#### 1. package.json
```json
{
  "name": "your-project-name",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "bash ./scripts/build.sh",
    "dev": "bash ./scripts/dev.sh",
    "start": "bash ./scripts/start.sh",
    "ts-check": "tsc -p tsconfig.json"
  },
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
  },
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
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "pnpm": ">=9.0.0"
  }
}
```

#### 2. 环境变量 (.env)
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

#### 3. Vercel 配置 (vercel.json)
```json
{
  "version": 2,
  "buildCommand": "pnpm install && pnpm build",
  "outputDirectory": ".next",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

#### 4. Netlify 配置 (netlify.toml)
```toml
[build]
  command = "pnpm install && pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### 5. Docker 配置
```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

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

---

## 🔧 必需的文件结构

```
src/
├── app/
│   ├── api/                    # API 路由
│   │   ├── agents/
│   │   ├── tasks/
│   │   ├── chat/
│   │   └── knowledge-bases/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                     # shadcn/ui 组件
├── lib/
│   ├── db.ts                   # 数据库连接
│   └── schema.ts               # 数据库 Schema
└── styles/
    └── globals.css

scripts/
├── build.sh
├── dev.sh
├── start.sh
├── deploy-vercel.sh
└── deploy-docker.sh

.github/
└── workflows/
    ├── deploy-vercel.yml
    └── deploy-docker.yml
```

---

## 📊 核心功能 API

### 智能体
```
GET    /api/agents
POST   /api/agents
GET    /api/agents/[id]
PUT    /api/agents/[id]
DELETE /api/agents/[id]
```

### 任务
```
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/[id]
PUT    /api/tasks/[id]
DELETE /api/tasks/[id]
POST   /api/tasks/[id]/assign
POST   /api/tasks/[id]/start
POST   /api/tasks/[id]/auto-execute
POST   /api/tasks/[id]/complete
```

### 对话
```
POST   /api/chat                 # SSE 流式
GET    /api/conversations
POST   /api/conversations
```

### 知识库
```
GET    /api/knowledge-bases
POST   /api/knowledge-bases
POST   /api/knowledge-bases/upload-file
POST   /api/knowledge-bases/add-document
POST   /api/knowledge-bases/search
```

---

## 🗄️ 数据库表（必需）

```sql
-- 智能体
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  role TEXT,
  department TEXT,
  capabilities JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 任务
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT,
  assignee_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 对话
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  agent_id UUID,
  user_message TEXT,
  assistant_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 知识库
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 文档
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  knowledge_base_id UUID,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  s3_key TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 快速开始命令

```bash
# 1. 初始化项目
coze init /workspace/projects/new-project --template nextjs

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
nano .env

# 4. 运行开发服务器
pnpm dev

# 5. 构建
pnpm build

# 6. 部署到 Vercel
bash scripts/deploy-vercel.sh

# 7. 部署到 Docker
bash scripts/deploy-docker.sh
```

---

## 📚 集成服务

### Coze SDK 使用

```typescript
import { LLMClient } from 'coze-coding-dev-sdk';

const llm = new LLMClient({
  apiKey: process.env.COZE_API_KEY,
  apiSecret: process.env.COZE_API_SECRET,
  workspaceId: process.env.COZE_WORKSPACE_ID
});

// 聊天
const response = await llm.chat({
  messages: [{ role: 'user', content: '你好' }]
});
```

### S3 使用

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  }
});

await s3.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: 'file.pdf',
  Body: fileBuffer
}));
```

### 数据库使用

```typescript
import { db } from './lib/db';
import { agents } from './lib/schema';

const allAgents = await db.query.agents.findMany();

const newAgent = await db.insert(agents).values({
  name: '新智能体',
  role: '开发者'
}).returning();
```

---

## ✅ 复制检查清单

### 基础配置
- [ ] 复制 package.json
- [ ] 复制 tsconfig.json
- [ ] 复制 tailwind.config.ts
- [ ] 复制 .env.example

### 部署配置
- [ ] 复制 vercel.json
- [ ] 复制 netlify.toml
- [ ] 复制 Dockerfile
- [ ] 复制 docker-compose.yml
- [ ] 复制 .github/workflows/

### 数据库
- [ ] 创建数据库 Schema
- [ ] 配置 Drizzle ORM
- [ ] 创建数据库连接
- [ ] 配置环境变量

### 集成服务
- [ ] 配置 Coze SDK
- [ ] 配置 S3 SDK
- [ ] 配置数据库
- [ ] 配置知识库

### API 路由
- [ ] 智能体 API
- [ ] 任务 API
- [ ] 对话 API
- [ ] 知识库 API
- [ ] 文档上传 API

### 前端页面
- [ ] 智能体管理页面
- [ ] 任务管理页面
- [ ] 对话页面
- [ ] 知识库管理页面

### 测试
- [ ] 开发服务器运行
- [ ] 构建成功
- [ ] API 测试通过
- [ ] 部署成功

---

## 📖 完整文档

查看 `PROJECT_COPY_CHECKLIST.md` 获取详细的完整配置清单。

---

**快速复制开始！** 🚀
