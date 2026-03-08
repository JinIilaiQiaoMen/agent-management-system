# 🤖 AI API 接口文档

本文档提供了公司智能体管理系统中内置大模型的 API 接口说明，供外部 AI 系统调用。

---

## 📖 目录

- [快速开始](#快速开始)
- [认证方式](#认证方式)
- [限流策略](#限流策略)
- [API 接口](#api-接口)
  - [聊天对话](#聊天对话)
  - [文本补全](#文本补全)
  - [向量嵌入](#向量嵌入)
  - [联网搜索](#联网搜索)
  - [图像理解](#图像理解)
- [错误码](#错误码)
- [SDK 示例](#sdk-示例)

---

## 🚀 快速开始

### 1. 获取 API Key

联系管理员获取 API Key，格式为：`sk-xxxxxxxxxxxxxxxx`

### 2. 基础请求示例

```bash
curl -X POST https://your-domain.com/api/ai/chat \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

### 3. 响应示例

```json
{
  "id": "chatcmpl-1234567890",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "doubao-pro-4k",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！我是 AI 助手，有什么可以帮你的吗？"
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "totalTokens": 50,
    "promptTokens": 10,
    "completionTokens": 40
  }
}
```

---

## 🔐 认证方式

所有 API 请求都需要在请求头中包含 API Key。

### 方式 1: Authorization Header（推荐）

```bash
Authorization: Bearer sk-xxxxxxxxxxxxxxxx
```

### 方式 2: X-API-Key Header

```bash
X-API-Key: sk-xxxxxxxxxxxxxxxx
```

### 方式 3: 查询参数

```bash
/api/ai/chat?api_key=sk-xxxxxxxxxxxxxxxx
```

---

## ⚡ 限流策略

### 默认限流

- **时间窗口**: 1 分钟
- **最大请求次数**: 100 次
- **超出限制**: 返回 429 错误

### 响应头

```http
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

### 429 错误响应

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "resetTime": 1234567890
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📡 API 接口

### 💬 聊天对话

**接口地址**: `POST /api/ai/chat`

**功能描述**: AI 聊天对话，支持多轮对话和流式输出

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| messages | Array | 是 | - | 对话消息数组 |
| model | String | 否 | doubao-pro-4k | 使用的模型 |
| temperature | Number | 否 | 0.7 | 温度参数（0-1） |
| maxTokens | Number | 否 | - | 最大生成 token 数 |
| stream | Boolean | 否 | false | 是否流式输出 |

#### 消息格式

```typescript
{
  role: 'user' | 'assistant' | 'system',
  content: string
}
```

#### 请求示例

```bash
curl -X POST https://your-domain.com/api/ai/chat \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "你是一个有用的助手"},
      {"role": "user", "content": "介绍一下人工智能"}
    ],
    "model": "doubao-pro-4k",
    "temperature": 0.7
  }'
```

#### 流式输出示例

```bash
curl -X POST https://your-domain.com/api/ai/chat \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "写一首诗"}],
    "stream": true
  }'
```

#### 支持的模型

| 模型 ID | 名称 | 上下文长度 | 适用场景 |
|---------|------|-----------|---------|
| doubao-pro-4k | 豆包 Pro 4K | 4000 | 日常对话 |
| doubao-pro-32k | 豆包 Pro 32K | 32000 | 长文本 |
| deepseek-chat | DeepSeek Chat | 16000 | 编程、逻辑 |
| kimi-chat | Kimi Chat | 200000 | 超长文本 |

---

### ✍️ 文本补全

**接口地址**: `POST /api/ai/completion`

**功能描述**: AI 文本补全，用于生成文本、代码等

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| prompt | String | 是 | - | 待补全的文本 |
| model | String | 否 | doubao-pro-4k | 使用的模型 |
| temperature | Number | 否 | 0.7 | 温度参数 |
| maxTokens | Number | 否 | - | 最大 token 数 |
| suffix | String | 否 | - | 补全后缀 |

#### 请求示例

```bash
curl -X POST https://your-domain.com/api/ai/completion \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "写一个 Python 函数，计算斐波那契数列：\n",
    "temperature": 0.3
  }'
```

#### 响应示例

```json
{
  "id": "cmpl-1234567890",
  "object": "text_completion",
  "created": 1234567890,
  "model": "doubao-pro-4k",
  "choices": [
    {
      "index": 0,
      "text": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
      "finishReason": "stop"
    }
  ],
  "usage": {
    "totalTokens": 45,
    "promptTokens": 15,
    "completionTokens": 30
  }
}
```

---

### 🔢 向量嵌入

**接口地址**: `POST /api/ai/embeddings`

**功能描述**: 将文本转换为向量表示，用于语义搜索、相似度计算

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| input | String/String[] | 是 | - | 待嵌入的文本 |
| model | String | 否 | text-embedding-ada-002 | 嵌入模型 |

#### 请求示例

**单个文本**:

```bash
curl -X POST https://your-domain.com/api/ai/embeddings \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "人工智能正在改变世界"
  }'
```

**批量文本**:

```bash
curl -X POST https://your-domain.com/api/ai/embeddings \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "input": [
      "人工智能技术",
      "机器学习算法",
      "深度学习模型"
    ]
  }'
```

#### 响应示例

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.0023, -0.0152, 0.0087, ...],
      "index": 0
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "promptTokens": 8,
    "totalTokens": 8
  }
}
```

#### 能力

- **嵌入维度**: 1536
- **批量处理**: 最多 100 个文本
- **支持语言**: 中文、英文、日文、韩文

---

### 🔍 联网搜索

**接口地址**: `POST /api/ai/search`

**功能描述**: 实时搜索互联网信息

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| query | String | 是 | - | 搜索查询 |
| count | Number | 否 | 10 | 结果数量（1-50） |
| language | String | 否 | zh-CN | 搜索语言 |

#### 请求示例

```bash
curl -X POST https://your-domain.com/api/ai/search \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "人工智能最新进展 2024",
    "count": 5,
    "language": "zh-CN"
  }'
```

#### 响应示例

```json
{
  "query": "人工智能最新进展 2024",
  "results": [
    {
      "title": "2024年人工智能十大突破",
      "url": "https://example.com/article1",
      "snippet": "2024年，人工智能技术取得了多项重大突破...",
      "publishedDate": "2024-01-15",
      "source": "example.com"
    }
  ],
  "totalCount": 5,
  "metadata": {
    "language": "zh-CN",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 能力

- **搜索源**: Web、新闻、图片
- **支持语言**: 中文、英文、日文、韩文
- **最大结果**: 每次搜索 50 条

---

### 🖼️ 图像理解

**接口地址**: `POST /api/ai/image-understand`

**功能描述**: 识别和理解图片内容

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| image | String | 是 | - | 图片（base64 或 URL） |
| prompt | String | 否 | 请详细描述这张图片的内容 | 提示词 |
| model | String | 否 | gpt-4-vision-preview | 模型 |

#### 请求示例

**Base64 图片**:

```bash
curl -X POST https://your-domain.com/api/ai/image-understand \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "/9j/4AAQSkZJRg...",
    "prompt": "图片中有哪些物体？"
  }'
```

**图片 URL**:

```bash
curl -X POST https://your-domain.com/api/ai/image-understand \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "https://example.com/image.jpg",
    "prompt": "描述这张图片"
  }'
```

#### 响应示例

```json
{
  "id": "imgund-1234567890",
  "object": "image.understanding",
  "created": 1234567890,
  "model": "gpt-4-vision-preview",
  "content": "这张图片展示了一个现代办公室的场景，可以看到多台电脑、桌椅和植物...",
  "usage": {
    "totalTokens": 150,
    "promptTokens": 100,
    "completionTokens": 50
  }
}
```

#### 能力

- **支持格式**: JPEG、PNG、GIF、WebP
- **最大尺寸**: 20MB
- **最大分辨率**: 2048x2048
- **支持任务**: 图像描述、OCR、物体检测、场景理解、颜色分析

---

## ❌ 错误码

### 错误响应格式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误码列表

| 错误码 | HTTP 状态码 | 说明 |
|--------|-----------|------|
| UNAUTHORIZED | 401 | 未提供认证信息 |
| INVALID_API_KEY | 401 | API Key 无效 |
| RATE_LIMIT_EXCEEDED | 429 | 超出限流 |
| INVALID_REQUEST | 400 | 请求参数无效 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务不可用 |

---

## 💻 SDK 示例

### JavaScript/TypeScript

```typescript
// 安装依赖
// npm install axios

import axios from 'axios';

const client = axios.create({
  baseURL: 'https://your-domain.com/api/ai',
  headers: {
    'Authorization': 'Bearer sk-xxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json',
  },
});

// 聊天对话
async function chat(messages: Array<{role: string, content: string}>) {
  const response = await client.post('/chat', { messages });
  return response.data;
}

// 文本补全
async function completion(prompt: string) {
  const response = await client.post('/completion', { prompt });
  return response.data;
}

// 向量嵌入
async function embeddings(text: string) {
  const response = await client.post('/embeddings', { input: text });
  return response.data;
}

// 联网搜索
async function search(query: string) {
  const response = await client.post('/search', { query });
  return response.data;
}

// 使用示例
const result = await chat([
  { role: 'user', content: '你好' }
]);
console.log(result.choices[0].message.content);
```

### Python

```python
# 安装依赖
# pip install requests

import requests

class AIClient:
    def __init__(self, api_key: str, base_url: str = "https://your-domain.com/api/ai"):
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def chat(self, messages: list):
        response = requests.post(
            f"{self.base_url}/chat",
            json={"messages": messages},
            headers=self.headers
        )
        return response.json()

    def completion(self, prompt: str):
        response = requests.post(
            f"{self.base_url}/completion",
            json={"prompt": prompt},
            headers=self.headers
        )
        return response.json()

    def embeddings(self, text: str):
        response = requests.post(
            f"{self.base_url}/embeddings",
            json={"input": text},
            headers=self.headers
        )
        return response.json()

    def search(self, query: str):
        response = requests.post(
            f"{self.base_url}/search",
            json={"query": query},
            headers=self.headers
        )
        return response.json()

# 使用示例
client = AIClient("sk-xxxxxxxxxxxxxxxx")

result = client.chat([
    {"role": "user", "content": "你好"}
])
print(result["choices"][0]["message"]["content"])
```

### Node.js (原生)

```javascript
const https = require('https');

const API_KEY = 'sk-xxxxxxxxxxxxxxxx';
const BASE_URL = 'your-domain.com';

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: BASE_URL,
      port: 443,
      path: `/api/ai${path}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 使用示例
async function main() {
  const result = await makeRequest('/chat', {
    messages: [{ role: 'user', content: '你好' }],
  });
  console.log(result.choices[0].message.content);
}

main();
```

---

## 📚 更多资源

- [API 总览](https://your-domain.com/api/ai)
- [完整功能清单](PROJECT_COPY_CHECKLIST.md)
- [快速参考](QUICK_REFERENCE.md)
- [部署指南](MULTI_PLATFORM_DEPLOYMENT.md)

---

## 📞 技术支持

- 📧 Email: support@example.com
- 📖 文档: /docs/api
- 📊 状态: /api/ai/status

---

**最后更新**: 2024-01-01
