/**
 * 公司预定义岗位列表
 * 按照公司架构层级分类
 */

export interface Position {
  id: string;
  name: string;
  department?: string;
  level: "decision" | "executive" | "core" | "support" | "special";
  description?: string;
}

export const POSITIONS: Position[] = [
  // 顶层决策层
  {
    id: "chairman",
    name: "董事长",
    level: "decision",
    description: "公司最高权力机构负责人",
  },
  {
    id: "vice-chairman",
    name: "副董事长",
    level: "decision",
  },
  {
    id: "director",
    name: "董事",
    level: "decision",
  },
  {
    id: "supervisor",
    name: "监事长",
    level: "decision",
  },

  // 核心高管层
  {
    id: "ceo",
    name: "CEO",
    level: "executive",
    description: "首席执行官，公司最高执行负责人",
  },
  {
    id: "coo",
    name: "COO",
    level: "executive",
    description: "首席运营官，统筹公司整体运营",
  },
  {
    id: "cto",
    name: "CTO",
    level: "executive",
    description: "首席技术官，统筹技术研发和技术战略",
    department: "研发中心",
  },
  {
    id: "cpo",
    name: "CPO",
    level: "executive",
    description: "首席产品官，统筹产品全生命周期",
    department: "产品中心",
  },
  {
    id: "cfo",
    name: "CFO",
    level: "executive",
    description: "首席财务官，统筹财务、融资、投资",
    department: "财务部",
  },
  {
    id: "cmo",
    name: "CMO",
    level: "executive",
    description: "首席市场官，统筹品牌、市场推广",
    department: "市场与增长中心",
  },
  {
    id: "cho",
    name: "CHO",
    level: "executive",
    description: "首席人力资源官，统筹人才招聘、培养",
    department: "人力资源部",
  },
  {
    id: "cso",
    name: "CSO",
    level: "executive",
    description: "首席战略官，统筹公司长期战略",
  },
  {
    id: "clo",
    name: "CLO",
    level: "executive",
    description: "首席法务官，统筹法务、合规",
  },
  {
    id: "cio",
    name: "CIO",
    level: "executive",
    description: "首席信息官，统筹企业信息化",
  },
  {
    id: "cro",
    name: "CRO",
    level: "executive",
    description: "首席风险官，统筹经营、技术风险",
  },

  // 研发中心
  {
    id: "algorithm-director",
    name: "算法总监",
    level: "core",
    department: "研发中心",
  },
  {
    id: "algorithm-engineer",
    name: "算法工程师",
    level: "core",
    department: "研发中心",
  },
  {
    id: "development-director",
    name: "开发总监",
    level: "core",
    department: "研发中心",
  },
  {
    id: "frontend-engineer",
    name: "前端开发工程师",
    level: "core",
    department: "研发中心",
  },
  {
    id: "backend-engineer",
    name: "后端开发工程师",
    level: "core",
    department: "研发中心",
  },
  {
    id: "test-director",
    name: "测试总监",
    level: "core",
    department: "研发中心",
  },
  {
    id: "test-engineer",
    name: "测试工程师",
    level: "core",
    department: "研发中心",
  },
  {
    id: "ops-director",
    name: "运维总监",
    level: "core",
    department: "研发中心",
  },
  {
    id: "devops-engineer",
    name: "DevOps工程师",
    level: "core",
    department: "研发中心",
  },
  {
    id: "data-director",
    name: "数据总监",
    level: "core",
    department: "研发中心",
  },
  {
    id: "data-analyst",
    name: "数据分析师",
    level: "core",
    department: "研发中心",
  },

  // 产品中心
  {
    id: "product-director",
    name: "产品总监",
    level: "core",
    department: "产品中心",
  },
  {
    id: "product-manager",
    name: "产品经理",
    level: "core",
    department: "产品中心",
  },
  {
    id: "design-director",
    name: "设计总监",
    level: "core",
    department: "产品中心",
  },
  {
    id: "ui-designer",
    name: "UI设计师",
    level: "core",
    department: "产品中心",
  },
  {
    id: "ux-designer",
    name: "UX设计师",
    level: "core",
    department: "产品中心",
  },
  {
    id: "product-operations",
    name: "产品运营",
    level: "core",
    department: "产品中心",
  },

  // 市场与增长中心
  {
    id: "brand-director",
    name: "品牌总监",
    level: "core",
    department: "市场与增长中心",
  },
  {
    id: "marketing-director",
    name: "市场总监",
    level: "core",
    department: "市场与增长中心",
  },
  {
    id: "sales-director",
    name: "销售总监",
    level: "core",
    department: "市场与增长中心",
  },
  {
    id: "sales-manager",
    name: "销售经理",
    level: "core",
    department: "市场与增长中心",
  },
  {
    id: "growth-director",
    name: "增长总监",
    level: "core",
    department: "市场与增长中心",
  },

  // 运营中心
  {
    id: "user-operations-director",
    name: "用户运营总监",
    level: "core",
    department: "运营中心",
  },
  {
    id: "customer-success-director",
    name: "客户成功总监",
    level: "core",
    department: "运营中心",
  },

  // 职能支撑部门
  {
    id: "finance-director",
    name: "财务总监",
    level: "support",
    department: "财务部",
  },
  {
    id: "hr-director",
    name: "HR总监",
    level: "support",
    department: "人力资源部",
  },
  {
    id: "hr-specialist",
    name: "HR专员",
    level: "support",
    department: "人力资源部",
  },
  {
    id: "legal-director",
    name: "法务总监",
    level: "support",
    department: "法务部",
  },
  {
    id: "admin-director",
    name: "行政总监",
    level: "support",
    department: "行政部",
  },
];

// 按层级分类
export const POSITIONS_BY_LEVEL = {
  decision: POSITIONS.filter((p) => p.level === "decision"),
  executive: POSITIONS.filter((p) => p.level === "executive"),
  core: POSITIONS.filter((p) => p.level === "core"),
  support: POSITIONS.filter((p) => p.level === "support"),
  special: POSITIONS.filter((p) => p.level === "special"),
};

// 层级显示名称
export const LEVEL_NAMES = {
  decision: "顶层决策层",
  executive: "核心高管层",
  core: "核心业务部门",
  support: "职能支撑部门",
  special: "专项岗位",
};
