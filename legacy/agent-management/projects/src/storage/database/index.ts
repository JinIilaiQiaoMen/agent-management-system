// 导出Manager实例
export { agentManager } from "./agentManager";
export { knowledgeBaseManager } from "./knowledgeBaseManager";
export { taskManager } from "./taskManager";
export { conversationManager } from "./conversationManager";
export { conversationSessionManager } from "./conversationSessionManager";
export { documentManager } from "./documentManager";
export { taskDeliverableManager } from "./taskDeliverableManager";
export { conversationBoxManager } from "./conversationBoxManager";

// 导出数据库实例
import { getDb } from "coze-coding-dev-sdk";
import * as schema from "./shared/schema";

export const getDbInstance = async () => {
  return await getDb(schema);
};

// 导出所有类型和schema
export * from "./shared/schema";
