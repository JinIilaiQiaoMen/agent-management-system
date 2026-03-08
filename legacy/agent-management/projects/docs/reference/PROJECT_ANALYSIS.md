# 项目分析报告 - OpenClaw 接管方案

## 一、项目概述

### 1.1 项目定位
**公司智能体管理系统** - 一个基于 Next.js 的全栈应用，支持 CEO 任务发布、智能体管理、多智能体协作、知识库管理、任务自动化执行等功能。

### 1.2 技术栈

#### 前端技术栈
- **框架**: Next.js 16.1.1 (App Router)
- **UI 库**: React 19.2.3
- **组件库**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **状态管理**: React Hooks
- **图标**: Lucide React
- **表单**: React Hook Form + Zod

#### 后端技术栈
- **运行时**: Node.js
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **SDK**: coze-coding-dev-sdk (豆包大模型集成)
- **存储**: S3 对象存储 (@aws-sdk/client-s3)
- **搜索**: KnowledgeClient (知识库)
- **Web Search**: 联网搜索能力

#### 核心依赖
- **AI 能力**: 豆包大模型 (聊天、补全、嵌入、图像理解、联网搜索)
- **文件处理**: pdf-parse、mammoth (Word)、xlsx
- **数据库**: pg、drizzle-orm、drizzle-kit
- **表单验证**: zod、react-hook-form

### 1.3 项目结构

```
src/
├── app/                          # Next.js App Router 页面
│   ├── api/                      # API 路由 (53个端点)
│   │   ├── agents/               # 智能体管理 (CRUD、执行、学习)
│   │   ├── tasks/                # 任务管理 (创建、分配、执行)
│   │   ├── knowledge-bases/      # 知识库管理
│   │   ├── conversation-boxes/   # 多智能体协作
│   │   ├── openclaw/             # OpenClaw 集成 (新增)
│   │   └── ai/                   # AI 能力 (聊天、补全、嵌入等)
│   ├── openclaw-integration/     # OpenClaw 配置页面 (新增)
│   ├── openclaw-diagnose/        # OpenClaw 诊断页面 (新增)
│   ├── api-configs/              # API 配置管理
│   └── api-monitor/              # API 监控面板
│
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── AgentTree.tsx             # 智能体树形结构
│   ├── TaskList.tsx              # 任务列表
│   ├── ChatPanel.tsx             # 聊天面板
│   └── conversation-box-chat.tsx # 多智能体聊天
│
├── lib/
│   ├── agent-collab/             # AgentCollab 协作框架
│   │   ├── BaseAgent.ts          # Agent 基类
│   │   ├── Coordinator.ts        # 任务协调器
│   │   ├── MessageBus.ts         # 消息总线
│   │   ├── Memory.ts             # 记忆模块
│   │   └── ToolRegistry.ts       # 工具注册表
│   ├── api.ts                    # API 封装
│   ├── api-response.ts           # 统一响应格式
│   └── global-error-handler.ts   # 全局错误处理
│
└── storage/
    └── database/
        ├── shared/schema.ts      # 数据库 Schema (12个表)
        ├── agentManager.ts       # 智能体管理器
        ├── taskManager.ts        # 任务管理器
        ├── knowledgeBaseManager.ts
        └── conversationBoxManager.ts
```

## 二、核心功能模块

### 2.1 智能体管理 (Agents)
**功能**:
- 智能体 CRUD 操作
- 树形公司架构 (parent-child 关系)
- 角色管理 (leader, specialist, etc.)
- 系统提示词配置
- 知识库关联
- 能力配置 (capabilities)

**数据表**: `agents`

**关键 API**:
- `GET /api/agents` - 获取所有智能体
- `POST /api/agents` - 创建智能体
- `PUT /api/agents/[id]` - 更新智能体
- `DELETE /api/agents/[id]` - 删除智能体
- `POST /api/agents/[id]/learn` - 智能体学习
- `POST /api/agents/[id]/execute-apis` - 执行 API

### 2.2 任务管理 (Tasks)
**功能**:
- CEO 发布任务
- 任务分配给智能体
- 任务状态跟踪 (pending, assigned, in_progress, completed)
- 优先级管理 (high, medium, low)
- 自动生成智能体
- 自动执行 (单智能体 / 多智能体协作)
- 流式输出

**数据表**: `tasks`, `task_deliverables`

**关键 API**:
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/[id]` - 更新任务
- `POST /api/tasks/[id]/assign` - 分配任务
- `POST /api/tasks/[id]/start` - 开始执行
- `POST /api/tasks/[id]/auto-execute` - 自动执行
- `POST /api/tasks/[id]/auto-execute-stream` - 流式自动执行

### 2.3 多智能体协作 (AgentCollab)
**功能**:
- 消息总线 (MessageBus)
- 共享记忆 (Memory)
- 工具注册 (ToolRegistry)
- 任务协调 (Coordinator)
- 流式输出
- 角色分工 (CoordinatorAgent, ExecutorAgent)

**框架组件**:
- `BaseAgent` - Agent 基类
- `CoordinatorAgent` - 协调者
- `ExecutorAgent` - 执行者
- `MessageBus` - 消息传递
- `Memory` - 对话历史
- `ToolRegistry` - 工具管理

### 2.4 知识库管理 (Knowledge Bases)
**功能**:
- 知识库 CRUD
- 文档上传 (PDF, Word, Excel, TXT, Markdown)
- 文档解析和向量化
- 语义搜索
- 文档与智能体匹配度分析
- 通用知识库 / 独立知识库

**数据表**: `knowledge_bases`, `documents`, `document_categories`

**关键 API**:
- `GET /api/knowledge-bases` - 获取知识库列表
- `POST /api/knowledge-bases` - 创建知识库
- `POST /api/knowledge-bases/upload-file` - 上传文件
- `POST /api/knowledge-bases/add-document` - 添加文档
- `GET /api/knowledge-bases/search` - 搜索文档

### 2.5 对话系统 (Conversations)
**功能**:
- 单智能体对话
- 多智能体协作对话 (Conversation Boxes)
- 会话保存 (Conversation Sessions)
- 消息历史
- Agent 响应记录

**数据表**: `conversations`, `conversation_boxes`, `conversation_box_messages`, `conversation_box_agents`, `conversation_box_agent_responses`, `conversation_sessions`

### 2.6 API 管理 (API Configs)
**功能**:
- 智能体 API 配置
- REST / GraphQL / WebSocket 支持
- 多种认证方式 (API Key, Bearer, Basic, OAuth2)
- 请求/响应模板
- 自动重试机制
- API 执行日志

**数据表**: `agent_api_configs`, `api_execution_logs`

### 2.7 AI 能力 (AI Capabilities)
**功能**:
- 聊天 (Chat)
- 文本补全 (Completion)
- 向量嵌入 (Embeddings)
- 图像理解 (Image Understand)
- 联网搜索 (Web Search)

**关键 API**:
- `POST /api/ai/chat` - AI 聊天
- `POST /api/ai/completion` - 文本补全
- `POST /api/ai/embeddings` - 向量嵌入
- `POST /api/ai/image-understand` - 图像理解
- `POST /api/ai/search` - 联网搜索

### 2.8 OpenClaw 集成 (新增)
**功能**:
- OpenClaw 配置管理
- 任务触发 API
- 任务状态查询
- Webhook 通知
- 诊断工具

**数据表**: `openclaw_configs` (新增)

**关键 API**:
- `POST /api/openclaw/trigger-task` - 触发任务
- `GET /api/openclaw/task-status/[taskId]` - 查询状态
- `POST /api/openclaw/test` - 测试连接
- `POST /api/openclaw/diagnose` - 诊断问题

## 三、数据库 Schema (12个表)

1. **agents** - 智能体表
2. **knowledge_bases** - 知识库表
3. **tasks** - 任务表
4. **conversations** - 对话记录表
5. **conversation_sessions** - 对话会话表
6. **conversation_boxes** - 多智能体协作对话容器
7. **conversation_box_agents** - 对话盒子智能体关联表
8. **conversation_box_messages** - 对话盒子消息表
9. **conversation_box_agent_responses** - 智能体响应表
10. **documents** - 文档表
11. **document_categories** - 文档分类表
12. **task_deliverables** - 任务成果表
13. **agent_api_configs** - 智能体 API 配置表
14. **api_execution_logs** - API 执行日志表
15. **openclaw_configs** - OpenClaw 配置表 (新增)

## 四、技术特点

### 4.1 优势
- ✅ 完整的 AgentCollab 多智能体协作框架
- ✅ 流式输出支持 (SSE)
- ✅ 知识库 + 向量搜索
- ✅ 多种 AI 能力集成
- ✅ API 管理和自动化执行
- ✅ PostgreSQL + Drizzle ORM
- ✅ 现代化 UI (shadcn/ui)
- ✅ TypeScript 全栈类型安全
- ✅ OpenClaw 集成准备

### 4.2 待优化项
- ⚠️ 测试覆盖率不足
- ⚠️ 缺少 CI/CD 流程
- ⚠️ 日志系统需要完善
- ⚠️ 性能监控缺失
- ⚠️ 错误处理需要统一
- ⚠️ 文档需要补充

## 五、当前问题诊断

### 5.1 OpenClaw 实例问题
- **错误**: `instance_not_found_vefaas-ve39yphh-l4ziojzipu-d6km1go2rrg56kgvnihg-sandbox`
- **原因**: Webhook URL 中的实例 ID 在 OpenClaw 平台不存在
- **影响**: OpenClaw 无法触发任务和接收通知

### 5.2 配置管理
- ⚠️ OpenClaw 配置表已创建，但需要填写正确的配置
- ⚠️ 需要测试 Webhook URL 的有效性

## 六、项目潜力

该项目具有以下扩展潜力：
1. **更多 AI 模型集成** (OpenAI, Claude, 等)
2. **更强大的工作流引擎** (类似 LangChain)
3. **实时协作** (WebSocket)
4. **任务调度** (定时任务、Cron)
5. **性能监控和分析** (APM)
6. **多租户支持**

---

**报告生成时间**: 2025-03-05
**项目版本**: 0.1.0
**技术栈版本**: Next.js 16, React 19, TypeScript 5
