/**
 * 预置工作流加载脚本
 * 在应用启动时加载预置的工作流
 */

import { workflowEngine, presetWorkflows } from '@/lib/automation/workflow-engine';

/**
 * 加载预置工作流
 */
export function loadPresetWorkflows() {
  console.log('开始加载预置工作流...');

  presetWorkflows.forEach(workflow => {
    try {
      // 检查是否已存在
      const existing = workflowEngine.getWorkflow(workflow.id);
      if (existing) {
        console.log(`工作流已存在，跳过: ${workflow.name}`);
        return;
      }

      workflowEngine.registerWorkflow(workflow);
      console.log(`✓ 预置工作流已加载: ${workflow.name}`);
    } catch (error) {
      console.error(`✗ 加载工作流失败: ${workflow.name}`, error);
    }
  });

  console.log(`预置工作流加载完成，共 ${workflowEngine.getWorkflows().length} 个工作流`);
}

/**
 * 初始化自动化系统
 */
export function initAutomationSystem() {
  try {
    loadPresetWorkflows();

    // 定期清理旧的执行记录
    setInterval(() => {
      workflowEngine.cleanupOldExecutions(7);
    }, 24 * 60 * 60 * 1000); // 每天清理一次

    console.log('✓ 自动化系统初始化完成');
  } catch (error) {
    console.error('✗ 自动化系统初始化失败:', error);
  }
}

// 如果在 Node.js 环境中运行，立即初始化
if (typeof window === 'undefined') {
  // 延迟初始化，确保其他模块已加载
  setTimeout(() => {
    initAutomationSystem();
  }, 1000);
}
