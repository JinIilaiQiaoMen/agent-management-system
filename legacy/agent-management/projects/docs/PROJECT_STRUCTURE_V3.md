# 公司智能体管理系统 - 项目结构规范 V3.0

## 一、整体目录结构

```
projects/
├── src/                          # 源代码目录（核心）
│   ├── app/                      # Next.js App Router 页面和API
│   │   ├── api/                  # API路由 (53个端点)
│   │   │   ├── agents/           # 智能体管理API
│   │   │   ├── tasks/            # 任务管理API
│   │   │   ├── knowledge-bases/  # 知识库API
│   │   │   ├── conversation-boxes/ # 多智能体协作API
│   │   │   ├── ai/               # AI能力API
│   │   │   ├── openclaw/         # OpenClaw集成API
│   │   │   └── ...
│   │   ├── openclaw-integration/ # OpenClaw集成页面
│   │   ├── openclaw-diagnose/   # 诊断页面
│   │   └── ...
│   │
│   ├── components/               # React组件
│   │   ├── ui/                  # shadcn/ui基础组件
│   │   └── *.tsx               # 业务组件
│   │
│   ├── lib/                     # 核心库
│   │   ├── agent-collab/        # 多智能体协作框架
│   │   ├── api.ts              # API封装
│   │   ├── openclaw-client.ts   # OpenClaw客户端
│   │   └── ...
│   │
│   ├── storage/                 # 数据存储层
│   │   └── database/           # 数据库操作
│   │       ├── shared/         # 共享Schema
│   │       ├── agentManager.ts
│   │       ├── taskManager.ts
│   │       └── ...
│   │
│   ├── utils/                   # 工具函数
│   ├── hooks/                   # React Hooks
│   ├── middleware/               # 中间件
│   └── constants/               # 常量定义
│
├── config/                      # 配置文件目录
│   ├── .env.example            # 环境变量示例
│   ├── .env.production.example # 生产环境配置
│   ├── tsconfig.json          # TypeScript配置
│   ├── next.config.ts         # Next.js配置
│   ├── package.json            # 依赖清单
│   ├── Dockerfile              # Docker配置
│   ├── docker-compose.yml     # Docker Compose
│   └── ...
│
├── docs/                       # 项目文档
│   ├── README.md              # 项目介绍
│   ├── deployment/            # 部署文档
│   ├── api/                  # API文档
│   ├── guides/               # 使用指南
│   └── reference/             # 参考资料
│
├── scripts/                    # 脚本目录
│   ├── *.sh                  # Shell脚本
│   ├── *.bat                 # Windows脚本
│   └── database/             # 数据库脚本
│       ├── init-db.sql
│       ├── init-api-configs-tables.sql
│       └── init-conversation-boxes.sql
│
├── public/                    # 静态资源
├── assets/                    # 公共资源
├── nginx/                     # Nginx配置
├── .github/                   # GitHub配置
│   └── workflows/            # CI/CD工作流
│
├── package.json               # 根目录依赖（兼容）
├── pnpm-lock.yaml            # 锁定文件
└── README.md                 # 项目入口文档
```

## 二、模块职责划分

| 目录 | 职责 | 访问规则 |
| --- | --- | --- |
| `src/app` | Next.js页面和API路由 | 外部请求入口 |
| `src/components` | React UI组件 | 被页面引用 |
| `src/lib` | 核心业务逻辑 | 被API和组件调用 |
| `src/storage` | 数据库操作 | 被lib调用 |
| `src/utils` | 工具函数 | 通用工具 |
| `src/hooks` | React自定义Hook | 被组件使用 |
| `config` | 所有配置文件 | 所有模块可读 |

## 三、架构流程图

```
用户请求
    ↓
┌─────────────────┐
│  src/app (API)  │  ← 接收请求
└────────┬────────┘
         ↓
┌─────────────────┐
│   src/lib      │  ← 业务逻辑处理
│ (agent-collab) │
└────────┬────────┘
         ↓
┌─────────────────┐
│ src/storage    │  ← 数据持久化
│  (database)    │
└─────────────────┘
```

## 四、命名规范

- 文件名：小写+下划线 `openclaw_client.ts`
- 组件名：大驼峰 `OpenClawControlPanel.tsx`
- API路由： kebab-case `/api/openclaw-integration`
- 数据库表：snake_case `agent_manager`

## 五、部署规范

1. 开发环境：`pnpm dev`
2. 生产环境：Docker部署或Vercel
3. 环境变量：必须配置`.env`文件

---

**版本**: V3.0  
**更新时间**: 2026-03-07
