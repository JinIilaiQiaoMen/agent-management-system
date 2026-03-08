/**
 * GET /api/ai
 *
 * AI API 总览
 */
export async function GET() {
  return Response.json({
    name: 'Company AI API',
    version: '1.0.0',
    description: '公司智能体管理系统 - AI 能力接口',
    baseUrl: '/api/ai',
    endpoints: [
      {
        name: 'Chat API',
        path: '/api/ai/chat',
        method: 'POST',
        description: 'AI 聊天对话接口',
        features: ['多轮对话', '流式输出', '多模型支持'],
      },
      {
        name: 'Completion API',
        path: '/api/ai/completion',
        method: 'POST',
        description: 'AI 文本补全接口',
        features: ['文本生成', '代码生成', '自动补全'],
      },
      {
        name: 'Embeddings API',
        path: '/api/ai/embeddings',
        method: 'POST',
        description: 'AI 向量嵌入接口',
        features: ['文本向量化', '批量处理', '语义搜索'],
      },
      {
        name: 'Search API',
        path: '/api/ai/search',
        method: 'POST',
        description: 'AI 联网搜索接口',
        features: ['实时搜索', '多语言支持', '智能排序'],
      },
      {
        name: 'Image Understanding API',
        path: '/api/ai/image-understand',
        method: 'POST',
        description: 'AI 图像理解接口',
        features: ['图像识别', 'OCR', '场景理解'],
      },
    ],
    authentication: {
      type: 'Bearer Token',
      description: '在 Authorization header 中提供 API Key',
      example: 'Authorization: Bearer sk-xxxxxxxxxxxxxxxx',
    },
    rateLimit: {
      default: {
        window: '1 minute',
        maxRequests: 100,
      },
    },
    supportedModels: [
      {
        id: 'doubao-pro-4k',
        name: '豆包 Pro 4K',
        type: 'text',
        contextLength: 4000,
      },
      {
        id: 'doubao-pro-32k',
        name: '豆包 Pro 32K',
        type: 'text',
        contextLength: 32000,
      },
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        type: 'text',
        contextLength: 16000,
      },
      {
        id: 'kimi-chat',
        name: 'Kimi Chat',
        type: 'text',
        contextLength: 200000,
      },
      {
        id: 'gpt-4-vision-preview',
        name: 'GPT-4 Vision',
        type: 'multimodal',
        contextLength: 128000,
      },
    ],
    quickStart: {
      chat: {
        endpoint: '/api/ai/chat',
        method: 'POST',
        example: {
          url: '/api/ai/chat',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer sk-xxxxxxxxxxxxxxxx',
            'Content-Type': 'application/json',
          },
          body: {
            messages: [
              { role: 'user', content: '你好' },
            ],
          },
        },
      },
      completion: {
        endpoint: '/api/ai/completion',
        method: 'POST',
        example: {
          url: '/api/ai/completion',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer sk-xxxxxxxxxxxxxxxx',
            'Content-Type': 'application/json',
          },
          body: {
            prompt: '写一首关于春天的诗',
          },
        },
      },
      embeddings: {
        endpoint: '/api/ai/embeddings',
        method: 'POST',
        example: {
          url: '/api/ai/embeddings',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer sk-xxxxxxxxxxxxxxxx',
            'Content-Type': 'application/json',
          },
          body: {
            input: 'Hello, world!',
          },
        },
      },
      search: {
        endpoint: '/api/ai/search',
        method: 'POST',
        example: {
          url: '/api/ai/search',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer sk-xxxxxxxxxxxxxxxx',
            'Content-Type': 'application/json',
          },
          body: {
            query: '人工智能最新进展',
            count: 5,
          },
        },
      },
    },
    documentation: {
      overview: 'GET /api/ai',
      chat: 'GET /api/ai/chat',
      completion: 'GET /api/ai/completion',
      embeddings: 'GET /api/ai/embeddings',
      search: 'GET /api/ai/search',
      imageUnderstand: 'GET /api/ai/image-understand',
    },
    support: {
      email: 'support@example.com',
      documentation: '/docs/api',
      status: '/api/ai/status',
    },
  });
}
