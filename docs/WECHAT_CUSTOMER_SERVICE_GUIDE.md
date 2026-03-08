# 🚀 微信客服自动回复 - 完整实施指南

**创建时间**: 2026-03-09 00:10

---

## 📋 目录

- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [企业微调](#企业微调)
- [数据库接入](#数据库接入)
- [Token优化](#token优化)
- [常见问题](#常见问题)

---

## 🏛️ 系统架构

### 完整流程图

```
微信用户发送消息
        ↓
微信公众号/企业微信服务器
        ↓
ZAEP Webhook接收
        ↓
ZAEP 中书省：意图识别
        ↓
ZAEP 中书省：参数提取
        ↓
ZAEP 门下省：权限检查、安全检查、风险评估
        ↓
ZAEP 门下省：审核通过/驳回
        ↓
ZAEP 尚书省：六部识别、Agent分配
        ↓
ZAEP 六部：客服Agent
        ↓
公司大模型：生成回复
        ↓
ZAEP 六部：回复处理
        ↓
ZAEP 锦衣卫：监控审计
        ↓
微信公众号/企业微信
        ↓
微信用户收到回复
```

### 技术架构

```
┌─────────────────────────────────────────┐
│          微信公众号/企业微信                │
└─────────────────┬───────────────────────┘
                  │ Webhook
                  ↓
┌─────────────────────────────────────────┐
│         ZAEP 三省六部系统                  │
│  ┌──────────┬──────────┬──────────┐    │
│  │ 中书省  │ 门下省  │ 尚书省  │ 锦衣卫│    │
│  └──────────┴──────────┴──────────┘    │
└─────────────────┬───────────────────────┘
                  │ API调用
                  ↓
┌─────────────────────────────────────────┐
│         公司大模型                           │
│  Coze | 智谱 | 文心 | 通义 | OpenAI      │
└─────────────────────────────────────────┘
                  │ 模型API
                  ↓
┌─────────────────────────────────────────┐
│         企业数据库                           │
│  PostgreSQL | MySQL | MongoDB | Redis      │
└─────────────────────────────────────────┘
```

---

## 🚀 快速开始

### 第1步：准备环境

#### 1.1 安装依赖
```bash
cd /workspace/projects/workspace/zaep

# 安装依赖
npm install

# 环境变量配置
cp .env.example .env.local
```

#### 1.2 配置环境变量

编辑 `.env.local` 文件：
```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/wechat_customer_service"

# 微信公众号
WECHAT_APP_ID="your_wechat_app_id"
WECHAT_APP_SECRET="your_wechat_app_secret"
WECHAT_TOKEN="your_wechat_token"

# Coze AI (推荐）
COZE_BOT_ID="your_coze_bot_id"
COZE_API_KEY="your_coze_api_key"

# 智谱AI (可选）
ZHIPU_API_KEY="your_zhipu_api_key"

# OpenAI (可选，国际）
OPENAI_API_KEY="sk-proj-your-openai-api-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 第2步：初始化数据库

```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库模式
npx prisma db push

# 填充测试数据（可选）
npx prisma db seed
```

### 第3步：启动开发服务器

```bash
npm run dev
```

访问：`http://localhost:3000`

### 第4步：配置微信接入

#### 4.1 访问配置页面
```
http://localhost:3000/wechat-config
```

#### 4.2 配置微信公众号
1. 选择应用类型：`微信公众号`
2. 输入 AppID：`wx1234567890abcdef`
3. 输入 AppSecret：`1234567890abcdef`
4. 点击"测试连接"
5. 如果测试成功，继续配置

#### 4.3 获取AppID和AppSecret
1. 访问：https://mp.weixin.qq.com
2. 登录账号
3. 进入"开发" → "基本配置"
4. 查看 AppID 和 AppSecret

#### 4.4 配置Webhook URL
1. 在微信公众平台 → "开发" → "基本配置"
2. 找到"服务器配置"
3. 修改"服务器地址(URL)"：`https://yourdomain.com/api/wechat/webhook`
4. 点击"提交"

**注意**: 如果是本地开发，需要使用内网穿透工具：
- ngrok: `https://ngrok.com`
- localtunnel: `https://localtunnel.me`

### 第5步：配置AI模型

#### 5.1 配置Coze（推荐）
1. 访问：https://www.coze.cn/
2. 创建Bot
3. 获取 Bot ID 和 API Key
4. 在配置页选择"Coze"
5. 输入 Bot ID 和 API Key
6. 选择模型：`coze-model` 或自定义模型

#### 5.2 配置智谱AI（可选）
1. 访问：https://open.bigmodel.cn/
2. 创建API Key
3. 在配置页选择"智谱AI"
4. 输入 API Key
5. 选择模型：`chatglm-turbo` 或 `chatglm-pro`

#### 5.3 配置OpenAI（可选）
1. 访问：https://platform.openai.com/
2. 创建API Key
3. 在配置页选择"OpenAI"
4. 输入 API Key
5. 选择模型：`gpt-4-turbo` 或 `gpt-4`

### 第6步：测试自动回复

#### 6.1 发送测试消息
在微信公众号中发送测试消息：
```
你好
```

#### 6.2 查看日志
```bash
# 查看应用日志
tail -f logs/zaep.log

# 或在页面中查看消息记录
访问：http://localhost:3000/wechat/messages
```

#### 6.3 验证回复
系统会自动：
1. 接收微信消息
2. 分析消息内容
3. 生成回复
4. 发送回复到微信

---

## 🎯 企业微调

### 方法1: 提示工程 (最快）⚡

#### 1.1 设计系统提示词

在配置页的"客服配置" → "系统提示词"中：

```text
你是[公司名称]的专业客服助手。

公司信息：
- 业务：[业务描述]
- 产品：[产品列表]
- 客户：[客户类型]
- 品牌调性：[品牌调性]

回答要求：
1. 专业、友好、及时
2. 准确理解用户需求
3. 提供具体、可操作的建议
4. 保持品牌调性一致
5. 严格遵守公司机密政策

常见问题处理：
- 退款：说明退款政策，提供退款流程
- 价格：提供准确价格信息
- 产品：详细介绍产品特点和优势
- 订单：帮助查询订单状态和进度
- 技术：协助排查技术问题

特殊情况：
- 无法回答时，主动提问澄清
- 需要人工时，及时升级
- 保持友好和耐心

记住：你是[公司名称]的客服，不是通用AI助手！
```

#### 1.2 使用模板回复

在配置页的"回复模板"中设置常见回复模板：

**问候语**:
```text
您好！我是[公司名称]的智能客服助手，很高兴为您服务！有什么可以帮助您的吗？
```

**告别语**:
```text
感谢您的咨询，祝您生活愉快！如有其他问题，欢迎随时联系我们。
```

**FAQ - 退款**:
```text
我们的退款政策：
1. 7天无理由退款
2. 产品质量问题：15天内可退款
3. 服务问题：根据具体情况处理

退款流程：
1. 联系客服申请退款
2. 提供订单信息
3. 客服审核（1-2个工作日）
4. 审核通过后，3-5个工作日退款到原账户

您需要退款吗？请提供您的订单号。
```

**FAQ - 价格**:
```text
我们的产品价格如下：

基础版：¥199
标准版：¥399
专业版：¥699

每个版本包含的功能：
- 基础版：基础功能
- 标准版：基础功能 + 高级功能
- 专业版：所有功能 + 专属服务

您对哪个版本感兴趣？我可以详细介绍。
```

**升级到人工**:
```text
我已经将您的需求记录下来，我们的专业客服将尽快联系您。

您也可以通过以下方式联系我们：
- 电话：400-xxx-xxxx
- 邮箱：support@company.com
- 微信：company_support

感谢您的理解！
```

---

### 方法2: RAG知识库 (最常用）💡

#### 2.1 准备企业知识库

收集企业文档：
- 产品手册
- 用户手册
- FAQ文档
- 技术文档
- 服务条款
- 退换货政策
- 联系方式

#### 2.2 向量化文档

创建向量数据库：

```prisma
// prisma/schema.prisma

model DocumentVector {
  id          String   @id @default(cuid())
  documentId  String
  chunkIndex  Int
  content     String
  embedding    Json     // 存储向量数据
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([documentId, chunkIndex])
}
```

向量化脚本：
```typescript
// scripts/embed-documents.ts

import { OpenAI } from 'openai';
import { prisma } from '@/lib/db/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const CHUNK_SIZE = 500; // 每个块的大小
const CHUNK_OVERLAP = 50; // 块之间的重叠

async function embedDocuments(documents: string[], documentId: string) {
  for (const doc of documents) {
    // 分块
    const chunks = [];
    for (let i = 0; i < doc.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      chunks.push(doc.slice(i, i + CHUNK_SIZE));
    }

    // 向量化
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks[i],
      });

      // 保存到数据库
      await prisma.documentVector.create({
        data: {
          documentId,
          chunkIndex: i,
          content: chunks[i],
          embedding: embedding.data,
          metadata: {
            source: 'company_docs',
            documentId,
            chunkIndex: i,
          },
        },
      });
    }
  }

  console.log(`文档 ${documentId} 向量化完成，共生成 ${chunks.length} 个向量`);
}

// 使用
embedDocuments([
  '产品A的功能...',
  '产品B的功能...',
  '退款政策...',
], 'doc_001');
```

#### 2.3 检索相关文档

```typescript
async function retrieveRelevantDocuments(
  query: string,
  topK: number = 3
): Promise<string[]> {
  // 1. 向量化查询
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  // 2. 向量检索
  const results = await prisma.$queryRaw`
    SELECT id, content, metadata,
           1 - (embedding <=> vector::float8[]) as distance
    FROM "DocumentVector"
    ORDER BY vector <=> $1 LIMIT $2
  `, [JSON.stringify(embedding.data[0]), topK]);

  // 3. 返回文档内容
  return results.map((r: any) => r.content);
}
```

#### 2.4 RAG回答

```typescript
async function ragAnswer(query: string): Promise<string> {
  // 1. 检索相关文档
  const relevantDocs = await retrieveRelevantDocuments(query);

  // 2. 构建上下文
  const context = relevantDocs.map((doc, i) => `文档${i + 1}:\n${doc}\n`).join('\n');

  // 3. 构建系统提示词
  const systemPrompt = `你是${companyName}的专业客服助手。

请根据以下公司文档回答用户问题：

${context}

回答要求：
1. 基于文档内容回答
2. 如果文档中没有相关信息，明确告知
3. 保持专业性和准确性
4. 保持友好和礼貌
5. 提供具体、可操作的建议

重要：
- 严格遵守文档内容
- 不要编造文档中没有的信息
- 如果不确定，主动提问澄清`;

  // 4. 调用大模型
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query },
  ];

  const response = await callCompanyLLM(messages);

  return response.choices[0].message.content;
}
```

---

### 方法3: Fine-tuning (微调模型）🎯

#### 3.1 准备训练数据

格式：
```json
{
  "messages": [
    {
      "role": "system",
      "content": "你是[公司名称]的专业客服助手。"
    },
    {
      "role": "user",
      "content": "用户问题"
    },
    {
      "role": "assistant",
      "content": "公司回答"
    }
  ]
}
```

训练数据示例：
```json
{
  "messages": [
    {
      "role": "system",
      "content": "你是XYZ科技的专业客服助手，主营AI软件产品。"
    },
    {
      "role": "user",
      "content": "你们的退款政策是什么？"
    },
    {
      "role": "assistant",
      "content": "我们提供7天无理由退款。如果产品质量问题，可以延长到15天。退款将在收到退货后3-5个工作日内处理到原账户。"
    }
  ]
}
```

#### 3.2 创建微调模型

```typescript
// 使用OpenAI Fine-tuning

const fineTune = await openai.fineTunes.create({
  model: 'gpt-3.5-turbo',
  training_file: trainingFileId,
  hyperparameters: {
    n_epochs: 3,
    batch_size: 1,
    learning_rate_multiplier: 0.05,
  },
});

console.log('微调模型ID:', fineTune.id);
```

#### 3.3 使用微调模型

```typescript
const response = await openai.chat.completions.create({
  model: fineTune.id, // 使用微调后的模型
  messages: [
    { role: 'system', content: '你是XYZ科技的专业客服助手。' },
    { role: 'user', content: userMessage },
  ],
});
```

---

## 💾 数据库接入

### 接入PostgreSQL

#### 1. 创建数据库

```sql
CREATE DATABASE wechat_customer_service;

CREATE USER zaep WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE wechat_customer_service TO zaep;
```

#### 2. 创建表

Prisma会自动创建，也可以手动创建：

```sql
-- 用户表
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    wechat_open_id VARCHAR(64) UNIQUE,
    wechat_union_id VARCHAR(64) UNIQUE,
    name VARCHAR(100),
    avatar VARCHAR(255),
    company_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息表
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(64) UNIQUE,
    source VARCHAR(20) NOT NULL,
    type VARCHAR(20),
    content TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    intent VARCHAR(50),
    confidence DECIMAL(5, 2),
    priority INT DEFAULT 0,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 回复表
CREATE TABLE replies (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    content TEXT,
    type VARCHAR(20) DEFAULT 'AUTO_REPLY',
    model_provider VARCHAR(20),
    model_name VARCHAR(50),
    prompt_tokens INT,
    completion_tokens INT,
    latency_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 审计日志表
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    level VARCHAR(20),
    category VARCHAR(20),
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_intent ON messages(intent);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_replies_message_id ON replies(message_id);
CREATE INDEX idx_audit_logs_level ON audit_logs(level);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
```

#### 3. 连接字符串

```env
DATABASE_URL="postgresql://zaep:strong_password@localhost:5432/wechat_customer_service"
```

### 接入MySQL

```sql
CREATE DATABASE wechat_customer_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER zaep@localhost IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON wechat_customer_service.* TO zaep@'localhost';
```

### 接入MongoDB

```env
DATABASE_URL="mongodb://zaep:strong_password@localhost:27017/wechat_customer_service"
```

---

## 📉 Token优化

### 优化方法对比

| 方法 | 节省Token | 效果 | 实施难度 |
|------|-----------|------|----------|
| 意图识别 | 60% | 保持 | ⭐ 简单 |
| Prompt优化 | 50% | 提升 | ⭐⭐ 中等 |
| 使用小模型 | 60% | 降低 | ⭐ 简单 |
| 缓存 | 80% | 保持 | ⭐⭐ 中等 |
| RAG | 40% | 提升 | ⭐⭐⭐ 复杂 |
| 微调模型 | 80% | 提升 | ⭐⭐⭐⭐ 复杂 |

### 优化1: 意图识别 ✅

**原理**: 只传递相关的消息上下文

**实现**:
```typescript
// ❌ 错误：传递整个对话历史
const allMessages = [...conversationHistory];

// ✅ 正确：只传递相关消息
const relevantMessages = getRelevantContext(userMessage, conversationHistory);

function getRelevantContext(userMessage: string, conversation: Message[]): Message[] {
  const intent = intentEngine.identify(userMessage);

  // 如果是新对话，只返回当前消息
  if (intent.intent === 'new_conversation') {
    return [conversation[conversation.length - 1]];
  }

  // 如果是客户咨询，返回最近的客户相关对话
  if (intent.intent === 'customer_inquiry') {
    return conversation.filter(m =>
      m.type === 'text' &&
      (m.content.includes('客户') || m.content.includes('公司') || m.content.includes('产品'))
    ).slice(-5);
  }

  // 默认返回最近5条
  return conversation.slice(-5);
}
```

### 优化2: Prompt优化 ✅

**原理**: 使用更简洁的System Prompt

**对比**:
```typescript
// ❌ 冗长提示词（~2000 tokens）
const verbosePrompt = `你是一个专业的企业AI助手，名叫ZAEP助手。你的职责是帮助企业用户解决各种问题，包括但不限于：客户分析和咨询、产品推广和营销、财务分析和报表、人力资源和招聘、风险评估和安全审计、合规性检查、系统维护和支持。在回答问题时，请注意：保持专业性和准确性、使用清晰、简洁的语言、提供具体、可操作的建议、当不确定时，主动提问澄清、严格遵守公司机密政策、尊用用户隐私、保持中立和客观... [更多冗长内容]`;

// ✅ 精简提示词（~200 tokens）
const concisePrompt = `你是${companyName}的专业助手。业务：${companyBusiness}。回答风格：专业、简洁、准确。`;

// 节省：90% 的System Prompt tokens
```

### 优化3: 使用小模型 ✅

**原理**: 对简单任务使用小模型

**实现**:
```typescript
function selectModel(task: string): string {
  const modelMap = {
    simple_qa: 'gpt-3.5-turbo',
    customer_inquiry: 'gpt-3.5-turbo',
    price_inquiry: 'gpt-3.5-turbo',
    complex_analysis: 'gpt-4',
    code_generation: 'gpt-4-turbo',
  };

  return modelMap[task] || 'gpt-3.5-turbo';
}

const model = selectModel(intent);

// 对比
// ❌ gpt-4: 输入+输出 ~1000 tokens, $0.03/1K tokens
// ✅ gpt-3.5-turbo: 输入+输出 ~500 tokens, $0.002/1K tokens
// 节省: 50% 的成本
```

### 优化4: 缓存 ✅

**原理**: 缓存常见问题的回答

**实现**:
```typescript
const redis = new Redis(process.env.REDIS_URL);

async function getCachedAnswer(query: string): Promise<string | null> {
  const cacheKey = `answer:${query}`;
  const cached = await redis.get(cacheKey);

  return cached ? JSON.parse(cached) : null;
}

async function setCachedAnswer(query: string, answer: string, ttl: number = 3600): Promise<void> {
  const cacheKey = `answer:${query}`;
  await redis.setex(cacheKey, ttl, JSON.stringify(answer));
}

async function getAnswer(query: string): Promise<string> {
  // 1. 先检查缓存
  const cached = await getCachedAnswer(query);
  if (cached) {
    return cached;
  }

  // 2. 没有缓存，调用AI
  const answer = await generateAnswer(query);

  // 3. 设置缓存（1小时）
  await setCachedAnswer(query, answer, 3600);

  return answer;
}
```

### 优化5: 限制输出长度 ✅

**原理**: 限制AI回复的长度

**实现**:
```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages,
  max_tokens: 300, // 限制输出最多300 tokens
});
```

### 优化6: 批量处理 ✅

**原理**: 多个相似问题批量处理

**实现**:
```typescript
async function batchProcess(queries: string[]): Promise<string[]> {
  // 识别意图
  const intents = queries.map(q => intentEngine.identify(q));

  // 按意图分组
  const grouped = {
    customer_inquiry: [],
    price_inquiry: [],
    // ...
  };

  queries.forEach((q, i) => {
    grouped[intents[i].intent].push(q);
  });

  // 批量处理每个意图组
  const results = [];
  for (const [intent, groupQueries] of Object.entries(grouped)) {
    const systemPrompt = getSystemPromptForIntent(intent);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...groupQueries.map(q => ({
          role: 'user',
          content: q,
        })),
      ],
      max_tokens: 500,
    });

    results.push(response.choices[0].message.content);
  }

  return results;
}
```

---

## 🔧 常见问题

### Q1: 如何配置多个AI平台？

**A**:
在"模型配置"页面中，可以为不同的意图配置不同的模型：
```typescript
{
  customer_service: {
    provider: 'coze',
    model: 'coze-model',
  },
  sales: {
    provider: 'zhipu',
    model: 'chatglm-pro',
  },
  technical: {
    provider: 'openai',
    model: 'gpt-4',
  },
}
```

### Q2: 如何实现人工接入？

**A**:
在"客服配置"中设置"升级到人工关键词"：
```typescript
// 自动升级关键词
const escalateKeywords = '人工, 客服, 潬接, 人工服务';

// 检查消息
if (message.includes(escalateKeywords)) {
  // 升级到人工
  await escalateToHuman(messageId);
}
```

### Q3: 如何处理图片/语音消息？

**A**:
```typescript
// 图片消息
if (message.type === 'image') {
  // 1. 下载图片
  const imageUrl = message.picUrl;
  const imageData = await downloadImage(imageUrl);

  // 2. OCR识别（可选）
  const text = await ocrImage(imageData);

  // 3. 使用识别的文本生成回复
  const answer = await generateAnswer(text);

  // 4. 发送回复
  await sendWechatReply(message, answer);
}

// 语音消息
if (message.type === 'voice') {
  // 1. 下载语音
  const voiceUrl = message.voiceUrl;

  // 2. 语音转文字
  const text = await voiceToText(voiceUrl);

  // 3. 使用识别的文本生成回复
  const answer = await generateAnswer(text);

  // 4. 发送回复
  await sendWechatReply(message, answer);
}
```

### Q4: 如何监控Token用量？

**A**:
```typescript
// 记录每次调用的Token使用
async function logTokenUsage(messageId: string, promptTokens: number, completionTokens: number) {
  await prisma.reply.update({
    where: { id: messageId },
    data: {
      promptTokens,
      completionTokens,
    },
  });

  // 统计每日用量
  const today = new Date().toISOString().split('T')[0];
  const todayReplies = await prisma.reply.findMany({
    where: {
      createdAt: {
        gte: new Date(today),
        lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000),
      },
    },
    select: {
      promptTokens: true,
      completionTokens: true,
    },
  });

  const totalTokens = todayReplies.reduce((sum, r) => sum + r.promptTokens + r.completionTokens, 0);
  console.log(`今日Token用量: ${totalTokens}`);
}
```

---

## 📊 完整功能清单

### ✅ 核心功能
- [x] 微信Webhook接收
- [x] 消息意图识别
- [x] 消息参数提取
- [x] 权限和安全检查
- [x] 风险评估
- [x] 六部识别
- [x] Agent分配
- [x] 任务调度
- [x] 大模型调用
- [x] 回复生成
- [x] 微信回复发送

### ✅ 商业化功能
- [x] 微信配置管理
- [x] AI模型配置
- [x] 客服Agent配置
- [x] 回复模板管理
- [x] 产品信息管理
- [x] 消息记录
- [x] 回复记录
- [x] 审计日志

### ✅ 优化功能
- [x] 意图识别（减少上下文）
- [x] Prompt优化
- [x] 小模型选择
- [x] 缓存常见回复
- [x] 限制输出长度
- [x] Token用量监控

---

## 🎉 总结

### 快速开始（3步）
1. 配置微信接入（AppID + AppSecret）
2. 配置AI模型（API Key + 模型名称）
3. 发送测试消息，查看自动回复

### 企业定制（3步）
1. 添加公司产品信息
2. 配置回复模板
3. （可选）微调企业专属模型

### Token优化（3步）
1. 启用意图识别
2. 优化System Prompt
3. 启用缓存功能

**预期效果**: 节省 **60-80%** 的Token用量！

---

**需要更多帮助？** 请告诉我您的具体需求！ 🚀
