/**
 * ZAEP - 环境配置
 */

export const ZAEP_CONFIG = {
  // 项目信息
  project: {
    name: '智元企业AI中台',
    shortName: 'ZAEP',
    version: '1.0.0',
    description: '企业级AI智能化管理平台',
  },
  
  // 功能开关
  features: {
    // 外贸业务
    customerDueDiligence: true,
    negotiationAssistant: true,
    emailGenerator: true,
    leadQualification: true,
    
    // 企业管理
    hrSystem: true,
    financeAudit: true,
    assetManagement: true,
    
    // 智能营销
    supplyChain: true,
    domesticPlatforms: true,
    offlineEmpowerment: true,
    
    // 智能体管理
    agentSystem: true,
    taskCenter: true,
    openclawIntegration: true,
    
    // 数据获取
    dataCrawler: true,
    batchCrawl: true,
    
    // 支撑系统
    knowledgeBase: true,
    monitoring: true,
    complianceCheck: true,
    
    // AI中台
    aiHub: true,
  },
  
  // 第三方服务配置
  services: {
    // AI供应商
    ai: {
      defaultProvider: process.env.AI_PROVIDER || 'coze',
      providers: ['coze', 'zhipu', 'wenxin', 'tongyi'],
    },
    
    // 数据库
    database: {
      primary: process.env.PRIMARY_DB || 'supabase', // supabase | postgresql
    },
    
    // OpenClaw
    openclaw: {
      enabled: true,
      apiUrl: process.env.OPENCLAW_API_URL || 'http://localhost:5000',
    },
  },
  
  // UI配置
  ui: {
    theme: 'light',
    primaryColor: '#3b82f6',
    sidebarCollapsed: false,
  },
};

export default ZAEP_CONFIG;
