/**
 * ZAEP 尚书省 - 统一导出
 */

// 主要类
export { TaskDispatcher, taskDispatcher, executeEdict } from './dispatcher';

// 功能模块
export { MinistryIdentifier, ministryIdentifier, identifyMinistry, identifyMinistryByKeywords, intelligentRoute } from './ministry-identifier';
export { AgentAllocator, agentAllocator, allocateAgent, createTask } from './agent-allocator';
export { TaskExecutor, taskExecutor, executeTask } from './task-executor';
