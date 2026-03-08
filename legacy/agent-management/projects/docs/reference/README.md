# AI 公司智能体管理系统

基于 Next.js 和 AI 技术构建的公司级智能体管理系统，支持任务管理、智能体协作、知识库管理和成果管理等功能。

## 目录

- [系统概述](#系统概述)
- [核心功能](#核心功能)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [环境变量配置](#环境变量配置)
- [使用手册](#使用手册)
- [API 文档](#api-文档)
- [数据模型](#数据模型)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

---

## 系统概述

AI 公司智能体管理系统是一个面向企业的智能化工作流管理平台，通过模拟公司组织架构，利用 AI 智能体完成各种业务任务。

### 系统特点

- **智能体协作**：模拟公司架构，智能体之间可以协作完成任务
- **任务自动化**：支持任务自动拆解、智能体自动生成、成果自动保存
- **联网搜索**：智能体具备联网搜索能力，可获取最新信息
- **知识管理**：自动为智能体创建专属知识库，智能分类保存成果
- **成果管理**：支持多种成果类型，版本控制和状态跟踪

---

## 核心功能

### 1. 任务管理

#### 功能说明
- 创建和管理公司任务
- 任务优先级设置
- 任务状态跟踪
- 任务成果管理

#### 使用流程
1. 在任务管理页面点击"发布任务"
2. 填写任务标题、描述和优先级
3. 选择分配给智能体（可选，系统可自动分配）
4. 提交任务

### 2. 决策人任务分析

#### 功能说明
决策人（CEO 角色）智能分析任务，将任务拆解为可执行的子任务。

#### 使用流程
1. 创建任务后，点击"分析任务"
2. 系统自动分析任务需求
3. 输出任务拆解方案和智能体规划
4. 为每个子任务设计具体的提示词

#### API
```
POST /api/tasks/analyze
{
  "taskTitle": "任务标题",
  "taskDescription": "任务描述",
  "taskPriority": "high/medium/low"
}
```

### 3. 智能体管理

#### 功能说明
- 创建和管理公司智能体
- 智能体层级结构
- 智能体能力配置
- 智能体系统提示词配置

#### 使用流程
1. 在智能体管理页面点击"添加智能体"
2. 填写智能体名称、角色、部门等信息
3. 配置智能体能力和系统提示词
4. 保存智能体

### 4. 智能体自动生成

#### 功能说明
根据任务自动生成智能体团队，包括专业智能体和专属知识库。

#### 使用流程
1. 在任务列表中，选择"待分配"状态的任务
2. 点击"生成智能体"按钮
3. 系统自动分析任务并生成智能体团队
4. 自动为每个智能体创建专属知识库
5. 自动分配负责人智能体到任务

#### API
```
POST /api/tasks/[id]/generate-agents
```

### 5. 智能体对话

#### 功能说明
与智能体进行实时对话，支持联网搜索。

#### 功能特性
- 流式对话输出
- 联网搜索能力
- 任务上下文关联
- 对话复制和引用

#### 使用流程
1. 在对话页面选择智能体
2. 输入问题发送
3. 智能体回复（可能自动联网搜索）
4. 可复制或引用对话内容

#### 对话操作
- **复制**：鼠标悬停在消息上，点击复制按钮
- **引用**：鼠标悬停在消息上，点击引用按钮
- **联网搜索**：点击输入框左侧的地球图标，输入关键词搜索

### 6. 知识库管理

#### 功能说明
管理智能体的专属知识库和公司通用知识库，支持多种文件类型上传。

#### 知识库类型
- **通用知识库**：公司级别的知识共享
- **专属知识库**：智能体专属，绑定到特定智能体

#### 文件上传功能
支持上传以下文件类型到知识库：
- **文档**: .txt, .md, .pdf, .docx, .xlsx, .doc, .xls
- **图片**: .jpg, .jpeg, .png, .gif, .webp, .bmp
- **视频**: .mp4, .avi, .mov, .wmv, .mkv, .flv
- **音频**: .mp3, .wav, .flac, .aac, .m4a

#### 使用流程
1. 在知识库管理页面查看所有知识库
2. 创建新知识库（通用或专属）
3. 点击知识库右侧的"上传文件"按钮
4. 选择要上传的文件（最大 50MB）
5. 系统自动将文件上传到对象存储并导入知识库
6. 知识库自动用于智能体对话

#### API
```
POST /api/knowledge-bases/upload-file
Content-Type: multipart/form-data

参数:
- file: 文件对象
- knowledgeBaseId: 知识库ID

返回:
{
  "success": true,
  "data": {
    "fileName": "文件名",
    "fileSize": 文件大小,
    "fileType": "文件类型",
    "fileKey": "存储键",
    "docId": "文档ID"
  }
}
```

### 7. 任务成果管理

#### 功能说明
管理任务产生的所有成果，支持智能分类和自动保存。

#### 成果类型
- **conversation**：对话记录
- **code**：代码文件
- **document**：文档
- **file**：文件（图片、PDF等）
- **report**：报告
- **design**：设计稿

#### 智能分类标准
- **技能（Skill）**：可复用的代码、函数、工具类、算法
- **工作流（Workflow）**：流程描述、操作步骤、任务流程
- **对话文档（Document）**：问答、说明、解释性内容、分析报告
- **配置（Config）**：配置文件、环境设置、参数定义
- **数据（Data）**：数据结构、数据格式、示例数据
- **设计（Design）**：UI设计、架构设计、系统设计

#### 自动保存流程
1. 任务执行产生成果（对话、代码、文档等）
2. 系统自动进行智能分类
3. 自动保存到对应智能体的知识库
4. 添加分类标签和元数据

#### API
```
POST /api/tasks/[id]/deliverables
GET /api/tasks/[id]/deliverables
POST /api/classify-deliverable
```

---

## 技术架构

### 技术栈

- **前端框架**：Next.js 16 (App Router)
- **React 版本**：React 19
- **开发语言**：TypeScript 5
- **UI 组件**：shadcn/ui
- **样式方案**：Tailwind CSS 4
- **数据库**：PostgreSQL
- **ORM**：Drizzle ORM
- **AI 模型**：豆包大模型（doubao-seed-1-8-251228）
- **AI SDK**：coze-coding-dev-sdk
- **包管理器**：pnpm

### 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── agents/              # 智能体 API
│   │   ├── tasks/               # 任务 API
│   │   ├── chat/                # 对话 API
│   │   ├── knowledge-bases/     # 知识库 API
│   │   ├── documents/           # 文档 API
│   │   └── classify-deliverable/ # 成果分类 API
│   └── page.tsx                 # 主页面
├── components/
│   ├── ui/                      # shadcn/ui 组件
│   ├── AgentDialog.tsx          # 智能体对话框
│   ├── AgentTree.tsx            # 智能体树形结构
│   ├── ChatPanel.tsx            # 对话面板
│   ├── TaskDialog.tsx           # 任务对话框
│   ├── TaskList.tsx             # 任务列表
│   └── KnowledgeBasePanel.tsx   # 知识库面板
└── storage/
    └── database/
        ├── shared/
        │   └── schema.ts         # 数据库 Schema
        ├── agentManager.ts       # 智能体管理
        ├── taskManager.ts        # 任务管理
        ├── knowledgeBaseManager.ts # 知识库管理
        ├── taskDeliverableManager.ts # 任务成果管理
        └── index.ts              # 统一导出
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm
- PostgreSQL 数据库

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env` 文件：

```bash
# 复制示例文件
cp .env.example .env

# 编辑配置文件
nano .env
```

**必填环境变量**：

```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Coze Coding SDK
COZE_API_KEY=your_coze_api_key
COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
COZE_BUCKET_NAME=your-bucket-name
COZE_BUCKET_REGION=your-region

# 大模型
COZE_LLM_API_KEY=your_llm_api_key
COZE_LLM_BASE_URL=https://api.example.com

# 联网搜索
COZE_WEB_SEARCH_API_KEY=your_search_api_key

# 安全配置
JWT_SECRET=your_jwt_secret_at_least_32_characters
API_SECRET_KEY=your_api_secret_key
SESSION_SECRET=your_session_secret
PASSWORD_SALT=your_salt_value
ALLOWED_ORIGINS=http://localhost:5000
```

**验证配置**：

```bash
pnpm validate:env
```

**详细配置说明**：
- 查看 [环境变量配置完整指南](/ENV_README.md)
- 查看 [详细环境变量文档](/docs/ENVIRONMENT_VARIABLES.md)
- 查看 [快速配置指南](/ENV_SETUP.md)

### 运行开发环境

```bash
pnpm dev
```

访问 http://localhost:5000

### 构建生产版本

```bash
pnpm build
```

### 运行生产环境

```bash
pnpm start
```

---

## 环境变量配置

### 概述

本项目包含完整的环境变量配置体系，支持开发环境和生产环境的独立配置。

### 配置文件

- `.env.example` - 开发环境配置示例
- `.env.production.example` - 生产环境配置示例
- `.env` - 实际使用的开发环境配置（不应提交到版本控制）
- `.env.production` - 实际使用的生产环境配置（不应提交到版本控制）

### 快速配置

```bash
# 1. 配置开发环境
cp .env.example .env
nano .env
pnpm validate:env

# 2. 配置生产环境（如需要）
cp .env.production.example .env.production
nano .env.production
pnpm validate:env:prod
```

### 验证配置

```bash
# 验证开发环境配置
pnpm validate:env

# 验证生产环境配置
pnpm validate:env:prod
```

### 必填环境变量

以下环境变量必须配置：

- `DATABASE_URL` - PostgreSQL 数据库连接字符串
- `COZE_API_KEY` - Coze API 密钥
- `COZE_BUCKET_ENDPOINT_URL` - 对象存储端点
- `COZE_BUCKET_NAME` - 对象存储桶名
- `COZE_BUCKET_REGION` - 对象存储区域
- `COZE_LLM_API_KEY` - 大模型 API 密钥
- `COZE_LLM_BASE_URL` - 大模型 API 地址
- `COZE_WEB_SEARCH_API_KEY` - 联网搜索 API 密钥
- `JWT_SECRET` - JWT 密钥（至少32字符）
- `API_SECRET_KEY` - API 密钥
- `SESSION_SECRET` - Session 密钥
- `PASSWORD_SALT` - 密码加密盐值
- `ALLOWED_ORIGINS` - 允许的源（CORS）

### 安全建议

- ✅ 使用强随机字符串（至少32字符）作为密钥
- ✅ 不要将 `.env` 文件提交到版本控制
- ✅ 定期更换密钥
- ✅ 生产环境使用独立的生产环境密钥
- ✅ `ALLOWED_ORIGINS` 不要使用通配符 `*`

### 详细文档

- [环境变量配置完整指南](/ENV_README.md)
- [详细环境变量文档](/docs/ENVIRONMENT_VARIABLES.md)
- [快速配置指南](/ENV_SETUP.md)

---

## 使用手册

### 1. 创建任务

#### 步骤
1. 登录系统
2. 点击右上角"发布任务"按钮
3. 填写任务信息：
   - **任务标题**：简明扼要地描述任务
   - **任务描述**：详细描述任务内容和要求
   - **优先级**：选择任务优先级（高/中/低）
   - **分配给**：选择智能体（可选）
4. 点击"发布"提交任务

### 2. 分析任务（可选）

#### 步骤
1. 在任务列表中找到目标任务
2. 点击"分析任务"按钮
3. 系统自动分析任务并输出：
   - 任务核心目标
   - 关键需求
   - 约束条件
   - 预期交付物
   - 子任务拆解
   - 工作流程

### 3. 生成智能体团队

#### 步骤
1. 在任务列表中，选择"待分配"状态的任务
2. 点击"生成智能体"按钮
3. 等待生成完成（通常需要 10-30 秒）
4. 查看生成的智能体团队
5. 系统自动：
   - 创建 2-5 个智能体
   - 为每个智能体创建专属知识库
   - 分配负责人智能体到任务

### 4. 与智能体对话

#### 步骤
1. 在对话页面选择任务或智能体
2. 输入问题
3. 发送消息
4. 查看智能体回复

#### 高级功能
- **联网搜索**：点击地球图标，输入关键词搜索
- **复制内容**：鼠标悬停在消息上，点击复制按钮
- **引用内容**：鼠标悬停在消息上，点击引用按钮
- **保存对话**：点击"保存"按钮，将对话保存到知识库

### 5. 查看任务成果

#### 步骤
1. 在任务列表中选择任务
2. 点击"查看详情"
3. 查看"任务成果"标签页
4. 浏览所有类型的成果

#### 成果操作
- **查看版本**：查看成果的不同版本
- **审核成果**：批准或拒绝成果
- **下载文件**：下载代码、文档等文件

---

## API 文档

### 智能体 API

#### 获取所有智能体
```
GET /api/agents
```

#### 创建智能体
```
POST /api/agents
{
  "name": "智能体名称",
  "role": "角色",
  "department": "部门",
  "description": "描述",
  "capabilities": ["能力1", "能力2"],
  "systemPrompt": "系统提示词"
}
```

### 任务 API

#### 获取所有任务
```
GET /api/tasks
```

#### 创建任务
```
POST /api/tasks
{
  "title": "任务标题",
  "description": "任务描述",
  "priority": "high/medium/low",
  "assignedAgentId": "智能体ID（可选）"
}
```

#### 分析任务
```
POST /api/tasks/analyze
{
  "taskTitle": "任务标题",
  "taskDescription": "任务描述",
  "taskPriority": "high/medium/low"
}
```

#### 生成智能体
```
POST /api/tasks/[id]/generate-agents
```

#### 获取任务成果
```
GET /api/tasks/[id]/deliverables
```

#### 创建任务成果
```
POST /api/tasks/[id]/deliverables
{
  "agentId": "智能体ID",
  "title": "成果标题",
  "type": "code/conversation/document/etc",
  "content": "内容",
  "status": "draft/reviewing/approved/rejected"
}
```

### 对话 API

#### 发送消息
```
POST /api/chat
{
  "agentId": "智能体ID",
  "message": "用户消息",
  "taskId": "任务ID（可选）",
  "conversationHistory": []
}
```

### 知识库 API

#### 获取所有知识库
```
GET /api/knowledge-bases
```

#### 创建知识库
```
POST /api/knowledge-bases
{
  "name": "知识库名称",
  "type": "common/individual",
  "agentId": "智能体ID（专属知识库）"
}
```

#### 上传文件到知识库
```
POST /api/knowledge-bases/upload-file
Content-Type: multipart/form-data

参数:
- file: 文件对象（支持 .txt, .md, .pdf, .docx, .xlsx, .jpg, .png, .mp4, .mp3 等）
- knowledgeBaseId: 知识库ID

返回:
{
  "success": true,
  "data": {
    "fileName": "文件名",
    "fileSize": 文件大小（字节）,
    "fileType": "MIME 类型",
    "fileKey": "对象存储键",
    "docId": "知识库文档ID"
  }
}

说明:
- 文件大小限制：最大 50MB
- 支持文件类型：
  - 文档: .txt, .md, .pdf, .docx, .xlsx, .doc, .xls
  - 图片: .jpg, .jpeg, .png, .gif, .webp, .bmp
  - 视频: .mp4, .avi, .mov, .wmv, .mkv, .flv
  - 音频: .mp3, .wav, .flac, .aac, .m4a
- 文件会自动上传到对象存储并导入知识库
- 上传成功后自动更新知识库文档数量
```

### 成果分类 API

#### 智能分类
```
POST /api/classify-deliverable
{
  "title": "成果标题",
  "content": "成果内容",
  "type": "成果类型"
}
```

---

## 数据模型

### Agent（智能体）

```typescript
{
  id: string;
  name: string;
  role: string;
  department: string | null;
  parentId: string | null;
  description: string | null;
  systemPrompt: string | null;
  capabilities: string[];
  knowledgeBaseId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
```

### Task（任务）

```typescript
{
  id: string;
  title: string;
  description: string;
  assignedAgentId: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  createdBy: string;
  metadata: Record<string, any>;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}
```

### TaskDeliverable（任务成果）

```typescript
{
  id: string;
  taskId: string;
  agentId: string;
  title: string;
  type: 'conversation' | 'code' | 'document' | 'file' | 'report' | 'design';
  content: string | null;
  filePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  status: 'draft' | 'reviewing' | 'approved' | 'rejected';
  version: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date | null;
}
```

### KnowledgeBase（知识库）

```typescript
{
  id: string;
  name: string;
  type: 'common' | 'individual';
  agentId: string | null;
  description: string | null;
  documentCount: number;
  isActive: boolean;
  modifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
```

---

## 部署指南

### Docker 部署

#### 构建镜像

```bash
docker build -t ai-agent-system .
```

#### 运行容器

```bash
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  ai-agent-system
```

### Vercel 部署

1. 连接 GitHub 仓库
2. 配置环境变量
3. 部署

### 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| DATABASE_URL | PostgreSQL 连接字符串 | 是 |
| NODE_ENV | 运行环境 | 否 |

---

## 常见问题

### Q1: 智能体如何联网搜索？

A: 智能体在系统提示词中被赋予联网搜索能力。当需要最新信息时，智能体会使用 `[SEARCH: 关键词]` 格式触发搜索，系统自动执行搜索并将结果作为上下文重新生成回答。

### Q2: 如何将对话保存到知识库？

A: 与智能体对话时，如果有关联任务，对话会自动保存为任务成果。系统会智能分类对话内容，并自动保存到对应智能体的知识库中。

### Q3: 成果如何进行智能分类？

A: 系统使用大模型分析成果内容，将其分类为：技能、工作流、文档、配置、数据、设计等类型。分类结果会保存在成果的元数据中，并添加相应标签。

### Q4: 如何创建新的智能体？

A: 在智能体管理页面点击"添加智能体"，填写相关信息。或者通过任务分析功能，让系统自动生成智能体团队。

### Q5: 知识库有什么作用？

A: 知识库存储专业知识和项目文档，智能体在对话时可以参考知识库中的信息，提供更准确的回答。

### Q6: 如何查看任务的执行进度？

A: 在任务列表中查看任务状态，或在任务详情页查看任务成果。每个成果都记录了创建时间和创建者。

### Q7: 如何向知识库上传文档？

A: 在知识库管理页面，点击知识库右侧的"上传文件"按钮，选择要上传的文件。系统支持上传文档、图片、视频、音频等多种类型文件，文件大小限制为 50MB。上传的文件会自动存储到对象存储并导入到知识库中。

### Q8: 知识库支持哪些文件类型？

A: 知识库支持以下文件类型：
- **文档**: .txt, .md, .pdf, .docx, .xlsx, .doc, .xls
- **图片**: .jpg, .jpeg, .png, .gif, .webp, .bmp
- **视频**: .mp4, .avi, .mov, .wmv, .mkv, .flv
- **音频**: .mp3, .wav, .flac, .aac, .m4a

---

## 部署指南

### 快速部署

#### 5分钟快速部署（推荐）

**Linux/macOS:**

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env  # 编辑必填配置项

# 2. 一键部署
chmod +x deploy.sh
./deploy.sh install

# 3. 访问应用
# 浏览器打开: http://localhost:5000
```

**Windows:**

```cmd
# 1. 配置环境变量
copy .env.example .env
notepad .env

# 2. 一键部署
deploy.bat install

# 3. 访问应用
# 浏览器打开: http://localhost:5000
```

#### 必填配置项

编辑 `.env` 文件，至少填写以下配置：

```env
# 数据库
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/agent_management

# Coze对象存储
COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
COZE_BUCKET_NAME=your-bucket-name
COZE_BUCKET_REGION=your-region
```

### 详细部署文档

- [📖 完整部署指南](./DEPLOYMENT.md) - 详细的部署说明
- [🚀 快速部署指南](./QUICK_START.md) - 5分钟快速上手
- [📦 部署包说明](./DEPLOYMENT_README.md) - 部署文件说明

### 系统要求

- **操作系统**: Linux, macOS, Windows 10+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **CPU**: 2核心+
- **内存**: 4GB+
- **磁盘**: 20GB+

### 部署架构

```
┌─────────────┐
│   Nginx     │
│  (80/443)   │
└──────┬──────┘
       │
┌──────▼──────┐
│  App (5000) │
└──────┬──────┘
       │
       ├───────────┐
       │           │
┌──────▼──┐  ┌────▼────┐
│PostgreSQL│  │  Redis  │
│  (5432)  │  │  (6379) │
└─────────┘  └─────────┘
```

### 常用部署命令

```bash
# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看日志
./deploy.sh logs

# 备份数据库
./deploy.sh backup

# 清理资源
./deploy.sh cleanup
```

### 生产环境部署

1. 使用 `.env.production.example` 配置生产环境变量
2. 配置SSL证书（使用Let's Encrypt）
3. 启用Nginx反向代理：`docker-compose --profile production up -d`
4. 设置防火墙规则
5. 配置自动备份计划

详见 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的生产环境配置章节。

---

## 许可证

MIT License

---

## 联系方式

如有问题或建议，请联系开发团队。
