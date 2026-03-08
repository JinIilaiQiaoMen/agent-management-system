// 数据库类型定义

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  isActive?: boolean;
  config?: Record<string, any>;
}

export interface AgentTask {
  id: string;
  agentId: string;
  assignedAgentId?: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  agentId: string;
  messages: Message[];
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
