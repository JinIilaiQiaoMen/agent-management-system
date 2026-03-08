import {
  Tool,
  ToolRegistry as IToolRegistry,
} from "./types";

/**
 * 工具注册表实现
 * 用于管理Agent可用的工具（搜索、代码执行、文件操作等）
 */
export class ToolRegistry implements IToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    // 注册默认工具
    this.registerDefaultTools();
  }

  /**
   * 注册工具
   */
  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * 注销工具
   */
  unregister(toolName: string): void {
    this.tools.delete(toolName);
  }

  /**
   * 获取工具
   */
  get(toolName: string): Tool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * 获取所有工具
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 按类型获取工具
   */
  getByType(type: Tool["type"]): Tool[] {
    return Array.from(this.tools.values()).filter(tool => tool.type === type);
  }

  /**
   * 调用工具
   */
  async call(toolName: string, params: any): Promise<any> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      throw new Error(`Tool "${toolName}" not found`);
    }

    // 参数验证
    this.validateParams(tool, params);

    try {
      const result = await tool.execute(params);
      return result;
    } catch (error) {
      throw new Error(`Tool execution failed: ${error}`);
    }
  }

  /**
   * 验证参数
   */
  private validateParams(tool: Tool, params: any): void {
    const requiredParams = Object.entries(tool.parameters)
      .filter(([_, param]) => param.required)
      .map(([name]) => name);

    for (const paramName of requiredParams) {
      if (!(paramName in params)) {
        throw new Error(`Missing required parameter: ${paramName}`);
      }
    }
  }

  /**
   * 注册默认工具
   */
  private registerDefaultTools(): void {
    // 注册网络搜索工具（占位符，需要对接实际搜索SDK）
    this.register({
      name: "web_search",
      description: "在网络上搜索信息",
      type: "search",
      parameters: {
        query: {
          type: "string",
          description: "搜索查询",
          required: true,
        },
        numResults: {
          type: "number",
          description: "返回结果数量",
          required: false,
          default: 10,
        },
      },
      execute: async (params) => {
        // 实际实现需要对接搜索SDK
        return {
          results: [],
          query: params.query,
        };
      },
    });

    // 注册代码执行工具（占位符）
    this.register({
      name: "code_execute",
      description: "执行代码并返回结果",
      type: "code",
      parameters: {
        code: {
          type: "string",
          description: "要执行的代码",
          required: true,
        },
        language: {
          type: "string",
          description: "代码语言（python, javascript等）",
          required: false,
          default: "javascript",
        },
      },
      execute: async (params) => {
        // 实际实现需要对接代码执行环境
        return {
          output: "",
          error: null,
        };
      },
    });

    // 注册文件读取工具
    this.register({
      name: "file_read",
      description: "读取文件内容",
      type: "file",
      parameters: {
        path: {
          type: "string",
          description: "文件路径",
          required: true,
        },
      },
      execute: async (params) => {
        // 实际实现需要对接文件系统
        return {
          content: "",
        };
      },
    });

    // 注册文件写入工具
    this.register({
      name: "file_write",
      description: "写入内容到文件",
      type: "file",
      parameters: {
        path: {
          type: "string",
          description: "文件路径",
          required: true,
        },
        content: {
          type: "string",
          description: "文件内容",
          required: true,
        },
      },
      execute: async (params) => {
        // 实际实现需要对接文件系统
        return {
          success: true,
        };
      },
    });

    // 注册知识库搜索工具
    this.register({
      name: "knowledge_search",
      description: "在知识库中搜索相关信息",
      type: "search",
      parameters: {
        query: {
          type: "string",
          description: "搜索查询",
          required: true,
        },
        knowledgeBaseId: {
          type: "string",
          description: "知识库ID",
          required: true,
        },
        topK: {
          type: "number",
          description: "返回结果数量",
          required: false,
          default: 5,
        },
      },
      execute: async (params) => {
        // 实际实现需要对接知识库SDK
        return {
          results: [],
          query: params.query,
        };
      },
    });
  }

  /**
   * 获取工具描述（用于LLM上下文）
   */
  getToolDescriptions(): string {
    const tools = this.getAll();
    return tools
      .map(
        (tool) =>
          `- ${tool.name}: ${tool.description}\n  参数: ${JSON.stringify(tool.parameters)}`
      )
      .join("\n");
  }

  /**
   * 清空所有工具
   */
  clear(): void {
    this.tools.clear();
  }
}

// 创建全局ToolRegistry实例
let globalToolRegistry: ToolRegistry | null = null;

export function getToolRegistry(): ToolRegistry {
  if (!globalToolRegistry) {
    globalToolRegistry = new ToolRegistry();
  }
  return globalToolRegistry;
}

export function resetToolRegistry(): void {
  globalToolRegistry = null;
}
