# 智能体管理系统功能对比表

## 一、缺失的 API 路由

### 智能体相关
| API | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| GET/POST /api/agents | ✅ | ✅ | 已有 |
| GET/PUT/DELETE /api/agents/[id] | ✅ | ✅ | 已有 |
| POST /api/agents/[id]/execute-apis | ✅ | ❌ | **缺失** |
| POST /api/agents/[id]/learn | ✅ | ❌ | **缺失** |
| GET /api/agents/status | ✅ | ❌ | **缺失** |

### 任务相关
| API | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| GET/POST /api/tasks | ✅ | ✅ (agent-tasks) | 已有 |
| GET/PUT/DELETE /api/tasks/[id] | ✅ | ✅ | 已有 |
| POST /api/tasks/[id]/assign | ✅ | ❌ | **缺失** |
| POST /api/tasks/[id]/auto-execute | ✅ | ❌ | **缺失** |
| POST /api/tasks/[id]/complete | ✅ | ❌ | **缺失** |
| GET/POST /api/tasks/[id]/deliverables | ✅ | ✅ | 已有 |
| POST /api/tasks/[id]/generate-agents | ✅ | ✅ | 已有 |
| POST /api/tasks/[id]/start | ✅ | ❌ | **缺失** |
| POST /api/tasks/analyze | ✅ | ❌ | **缺失** |
| POST /api/generate-task-description | ✅ | ❌ | **缺失** |

### 对话相关
| API | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| POST /api/chat | ✅ | ✅ (agent-chat) | 已有 |
| GET/POST /api/conversations | ✅ | ❌ | **缺失** |
| GET/POST /api/conversation-sessions | ✅ | ❌ | **缺失** |

### 知识库相关
| API | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| GET/POST /api/knowledge-bases | ✅ | ✅ (agent-knowledge-bases) | 已有 |
| GET/PUT/DELETE /api/knowledge-bases/[id] | ✅ | ❌ | **缺失** |
| GET /api/knowledge-bases/[id]/documents | ✅ | ❌ | **缺失** |
| POST /api/knowledge-bases/add-document | ✅ | ❌ | **缺失** |
| POST /api/knowledge-bases/analyze-match | ✅ | ❌ | **缺失** |
| GET/DELETE /api/knowledge-bases/documents/[id] | ✅ | ❌ | **缺失** |
| GET /api/knowledge-bases/search | ✅ | ❌ | **缺失** |
| POST /api/knowledge-bases/upload-file | ✅ | ❌ | **缺失** |

### 文档相关
| API | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| POST /api/documents/upload | ✅ | ❌ | **缺失** |

### API配置相关
| API | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| GET/POST /api/agent-api-configs | ✅ | ✅ | 已有 |
| GET/PUT/DELETE /api/agent-api-configs/[id] | ✅ | ✅ | 已有 |
| POST /api/agent-api-configs/[id]/test | ✅ | ✅ | 已有 |
| GET /api/agent-api-configs/agent/[agentId] | ✅ | ✅ | 已有 |
| GET /api/api-execution-logs | ✅ | ❌ | **缺失** |

### 其他
| API | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| GET /api/health | ✅ | ❌ | **缺失** |
| POST /api/web-search | ✅ | ❌ | **缺失** |
| POST /api/classify-deliverable | ✅ | ❌ | **缺失** |

---

## 二、缺失的组件

| 组件 | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| AgentDialog.tsx | ✅ | ✅ | 已有 |
| AgentTree.tsx | ✅ | ✅ | 已有 |
| AgentMonitorPanel.tsx | ✅ | ❌ | **缺失** |
| ApiConfigForm.tsx | ✅ | ✅ | 已有 |
| ChatPanel.tsx | ✅ | ✅ | 已有 |
| DocumentSearch.tsx | ✅ | ❌ | **缺失** |
| DocumentUploadAndGenerate.tsx | ✅ | ❌ | **缺失** |
| DragDropUpload.tsx | ✅ | ❌ | **缺失** |
| ErrorBoundary.tsx | ✅ | ❌ | **缺失** |
| KnowledgeBasePanel.tsx | ✅ | ✅ | 已有 |
| TaskDetailDialog.tsx | ✅ | ❌ | **缺失** |
| TaskDialog.tsx | ✅ | ✅ | 已有 |
| TaskList.tsx | ✅ | ✅ | 已有 |
| Toast.tsx | ✅ | ✅ | 已有 |

---

## 三、缺失的工具模块

| 模块 | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| lib/api.ts | ✅ | ✅ | 已有 |
| lib/api-executor.ts | ✅ | ✅ | 已有 |
| lib/api-response.ts | ✅ | ✅ | 已有 |
| lib/global-error-handler.ts | ✅ | ❌ | **缺失** |
| utils/fileParser.ts | ✅ | ❌ | **缺失** |
| lib/rate-limit.ts | ✅ | ❌ | **缺失** |

---

## 四、缺失的数据库表

| 表名 | 原始项目 | 当前项目 | 状态 |
|-----|---------|---------|------|
| agents | ✅ | ✅ | 已有 |
| tasks | ✅ | ✅ (agent_tasks) | 已有 |
| conversations | ✅ | ✅ (agent_conversations) | 已有 |
| knowledge_bases | ✅ | ✅ (agent_knowledge_bases) | 已有 |
| documents | ✅ | ✅ (agent_knowledge_documents) | 已有 |
| task_deliverables | ✅ | ✅ (agent_task_deliverables) | 已有 |
| agent_api_configs | ✅ | ✅ | 已有 |
| api_execution_logs | ✅ | ✅ | 已有 |
| document_categories | ✅ | ❌ | **缺失** |

---

## 五、缺失的功能

### 1. 智能体功能
- ❌ 智能体API批量执行
- ❌ 智能体学习能力
- ❌ 智能体状态监控

### 2. 任务功能
- ❌ 任务分配
- ❌ 任务自动执行
- ❌ 任务完成
- ❌ 任务开始
- ❌ 任务分析
- ❌ 任务描述生成

### 3. 对话功能
- ❌ 对话会话管理
- ❌ 对话历史记录

### 4. 知识库功能
- ❌ 知识库详情
- ❌ 知识库文档管理
- ❌ 知识库搜索
- ❌ 知识库分析匹配
- ❌ 文件上传

### 5. 文档功能
- ❌ 文档上传解析
- ❌ 文档搜索
- ❌ 拖拽上传
- ❌ 文档生成

### 6. 其他功能
- ❌ 健康检查
- ❌ 网页搜索
- ❌ 成果分类
- ❌ API执行日志查看
- ❌ 全局错误处理
- ❌ 速率限制

---

## 六、需要迁移的文件总数

| 类型 | 缺失数量 |
|-----|---------|
| API路由 | 18个 |
| 组件 | 6个 |
| 工具模块 | 3个 |
| 数据库表 | 1个 |
| **总计** | **28个文件** |
