import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// 指令类型定义
type CommandType =
  | 'READ_FILE'
  | 'CREATE_FILE'
  | 'EDIT_FILE'
  | 'DELETE_FILE'
  | 'EXECUTE'
  | 'API_CALL'
  | 'QUERY'
  | 'GLOB_FILE';

interface Command {
  type: CommandType;
  params: Record<string, any>;
}

interface CommandResult {
  command: Command;
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// 项目根目录
const PROJECT_ROOT = process.env.COZE_WORKSPACE_PATH || '/workspace/projects';

// 指令执行器
class CommandExecutor {
  async execute(command: Command): Promise<CommandResult> {
    try {
      switch (command.type) {
        case 'READ_FILE':
          return await this.readFile(command);
        case 'CREATE_FILE':
          return await this.createFile(command);
        case 'EDIT_FILE':
          return await this.editFile(command);
        case 'DELETE_FILE':
          return await this.deleteFile(command);
        case 'EXECUTE':
          return await this.executeCommand(command);
        case 'API_CALL':
          return await this.apiCall(command);
        case 'QUERY':
          return await this.query(command);
        case 'GLOB_FILE':
          return await this.globFile(command);
        default:
          return {
            command,
            success: false,
            error: `未知指令类型: ${command.type}`,
          };
      }
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : '执行失败',
      };
    }
  }

  private async readFile(command: Command): Promise<CommandResult> {
    const { path: filePath, startLine, endLine } = command.params;

    if (!filePath) {
      return {
        command,
        success: false,
        error: '缺少文件路径',
      };
    }

    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath);
      
      if (!existsSync(fullPath)) {
        return {
          command,
          success: false,
          error: `文件不存在: ${fullPath}`,
        };
      }

      const content = readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      // 如果指定了行号范围，返回对应行
      if (startLine && endLine) {
        const slice = lines.slice(startLine - 1, endLine);
        return {
          command,
          success: true,
          data: slice.join('\n'),
          message: `已读取文件行 ${startLine}-${endLine}: ${filePath}`,
        };
      }

      // 否则返回全部内容（最多200行）
      const truncated = lines.slice(0, 200).join('\n');
      return {
        command,
        success: true,
        data: truncated,
        message: `已读取文件: ${filePath}`,
      };
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : '读取文件失败',
      };
    }
  }

  private async createFile(command: Command): Promise<CommandResult> {
    const { path: filePath, content, append = false } = command.params;

    if (!filePath || content === undefined) {
      return {
        command,
        success: false,
        error: '缺少文件路径或内容',
      };
    }

    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath);
      const dir = path.dirname(fullPath);

      // 确保目录存在
      if (!existsSync(dir)) {
        execSync(`mkdir -p ${dir}`, { encoding: 'utf-8' });
      }

      if (append) {
        writeFileSync(fullPath, content, { flag: 'a' });
      } else {
        writeFileSync(fullPath, content);
      }

      return {
        command,
        success: true,
        message: append ? `已追加内容到: ${filePath}` : `已创建文件: ${filePath}`,
      };
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : '创建文件失败',
      };
    }
  }

  private async editFile(command: Command): Promise<CommandResult> {
    const { path: filePath, oldContent, newContent, limit = 1 } = command.params;

    if (!filePath || !oldContent || newContent === undefined) {
      return {
        command,
        success: false,
        error: '缺少必要参数',
      };
    }

    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath);
      
      if (!existsSync(fullPath)) {
        return {
          command,
          success: false,
          error: `文件不存在: ${fullPath}`,
        };
      }

      const content = readFileSync(fullPath, 'utf-8');
      let newContentStr = content;

      // 替换内容
      const maxLimit = limit === -1 ? Infinity : limit;
      let count = 0;
      let index = content.indexOf(oldContent);

      while (index !== -1 && count < maxLimit) {
        newContentStr = newContentStr.slice(0, index) + newContent + newContentStr.slice(index + oldContent.length);
        count++;
        index = newContentStr.indexOf(oldContent);
      }

      if (count === 0) {
        return {
          command,
          success: false,
          error: '未找到要替换的内容',
        };
      }

      writeFileSync(fullPath, newContentStr);

      return {
        command,
        success: true,
        message: `已修改文件: ${filePath} (替换了 ${count} 处)`,
      };
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : '修改文件失败',
      };
    }
  }

  private async deleteFile(command: Command): Promise<CommandResult> {
    const { path: filePath } = command.params;

    if (!filePath) {
      return {
        command,
        success: false,
        error: '缺少文件路径',
      };
    }

    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath);
      
      if (!existsSync(fullPath)) {
        return {
          command,
          success: false,
          error: `文件不存在: ${fullPath}`,
        };
      }

      unlinkSync(fullPath);

      return {
        command,
        success: true,
        message: `已删除文件: ${filePath}`,
      };
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : '删除文件失败',
      };
    }
  }

  private async executeCommand(command: Command): Promise<CommandResult> {
    const { command: cmd, background = false, timeout = 30000 } = command.params;

    if (!cmd) {
      return {
        command,
        success: false,
        error: '缺少命令',
      };
    }

    try {
      const fullCmd = background ? `${cmd} &` : cmd;
      const output = execSync(fullCmd, {
        encoding: 'utf-8',
        timeout,
        maxBuffer: 1024 * 1024 * 10, // 10MB
      });

      return {
        command,
        success: true,
        data: output,
        message: `已执行命令: ${cmd}`,
      };
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : '执行命令失败',
      };
    }
  }

  private async apiCall(command: Command): Promise<CommandResult> {
    const { method, endpoint, body } = command.params;

    if (!method || !endpoint) {
      return {
        command,
        success: false,
        error: '缺少方法或端点',
      };
    }

    try {
      const url = `http://localhost:5000${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      return {
        command,
        success: response.ok,
        data,
        message: `API 调用完成: ${method} ${endpoint}`,
      };
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : 'API 调用失败',
      };
    }
  }

  private async query(command: Command): Promise<CommandResult> {
    const { type, params } = command.params;

    if (!type) {
      return {
        command,
        success: false,
        error: '缺少查询类型',
      };
    }

    try {
      const queryMap: Record<string, string> = {
        agent: '/api/agents',
        agents: '/api/agents',
        task: '/api/tasks',
        tasks: '/api/tasks',
        'knowledge-base': '/api/knowledge-bases',
        'knowledge-bases': '/api/knowledge-bases',
      };

      const endpoint = queryMap[type];
      if (!endpoint) {
        return {
          command,
          success: false,
          error: `不支持的查询类型: ${type}`,
        };
      }

      const url = new URL(`http://localhost:5000${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      return {
        command,
        success: response.ok,
        data,
        message: `查询完成: ${type}`,
      };
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : '查询失败',
      };
    }
  }

  private async globFile(command: Command): Promise<CommandResult> {
    const { pattern, basePath } = command.params;

    if (!pattern) {
      return {
        command,
        success: false,
        error: '缺少文件匹配模式',
      };
    }

    try {
      const searchPath = basePath ? path.join(PROJECT_ROOT, basePath) : PROJECT_ROOT;
      const files: string[] = [];

      // 递归搜索文件
      const searchDir = (dir: string, pattern: string) => {
        try {
          const items = readdirSync(dir);
          
          for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = statSync(fullPath);
            
            if (stat.isDirectory()) {
              // 递归搜索子目录
              searchDir(fullPath, pattern);
            } else {
              // 检查文件名是否匹配模式
              const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
              if (regex.test(item)) {
                files.push(fullPath.replace(PROJECT_ROOT + '/', ''));
              }
            }
          }
        } catch (error) {
          // 忽略无法访问的目录
        }
      };

      searchDir(searchPath, pattern);

      return {
        command,
        success: true,
        data: files.slice(0, 200), // 最多返回200个结果
        message: `找到 ${files.length} 个文件`,
      };
    } catch (error) {
      return {
        command,
        success: false,
        error: error instanceof Error ? error.message : '查找文件失败',
      };
    }
  }
}

// POST /api/openclaw/execute - 执行 OpenClaw 指令
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commands, apiKey } = body;

    // 验证 API Key
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 API Key',
        },
        { status: 401 }
      );
    }

    if (!commands || !Array.isArray(commands)) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少指令列表或格式不正确',
        },
        { status: 400 }
      );
    }

    // 创建执行器
    const executor = new CommandExecutor();
    const results: CommandResult[] = [];

    // 执行所有指令
    for (const command of commands) {
      const result = await executor.execute(command);
      results.push(result);

      // 如果某个指令失败，可以选择停止执行或继续
      if (!result.success) {
        console.error(`指令执行失败: ${command.type}`, result.error);
      }
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });
  } catch (error) {
    console.error('执行 OpenClaw 指令失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '执行失败',
      },
      { status: 500 }
    );
  }
}
