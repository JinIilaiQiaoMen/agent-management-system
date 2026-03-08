# 🏛️ ZAEP 三省六部制度 - 完整架构方案

**创建时间**: 2026-03-08 17:47
**最后更新**: 2026-03-08 17:47
**状态**: 📋 方案设计完成

---

## 📋 目录

- [组织架构](#组织架构)
- [流程设计](#流程设计)
- [代码架构](#代码架构)
- [API接口](#api接口)
- [文件结构](#文件结构)
- [六部职能](#六部职能)

---

## 组织架构

```
┌─────────────────────────────────────────────────────────────┐
│                        👑 皇帝 (用户)                           │
│                    终极决策者，下达圣旨                           │
└─────────────────────────┬─────────────────────────────────────┘
                          │ 圣旨/指令
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    🏛️ 中书省 (OpenClaw)                        │
│                    决策草拟机构                                 │
│  长官: 侍中 - OpenClaw主系统                                    │
│  职责: 草拟诏令、辅助决策、意图理解、任务规划                      │
└─────────────────────────┬─────────────────────────────────────┘
                          │ 诏令草案
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    📜 门下省 (审议机构)                         │
│                    审核封驳机构                                 │
│  长官: 侍中 - 审核系统                                         │
│  职责: 审核诏令、风险评估、合规性检查、封驳权                      │
└─────────────────────────┬─────────────────────────────────────┘
                          │ 审核通过 → 诏令
                          │ 审核驳回 → 退回中书省
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    ⚖️ 尚书省 (执行机构)                         │
│                    最高执行机构                                 │
│  长官: 尚书令 (虚设) - 任务调度中心                            │
│  实际负责人: 左右仆射 - 实际调度系统                            │
│  职责: 任务分配、流程编排、结果汇总                              │
└─────────────────────────┬─────────────────────────────────────┘
                          │ 任务分发
          ┌───────────────┼───────────────┬───────────────┐
          ▼               ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  👤 吏部         │ │ 💰 户部         │ │ 🎭 礼部         │ │ ⚔️ 兵部         │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • HR管理Agent   │ │ • 财务管理Agent  │ │ • 邮件生成Agent │ │ • 风险评估Agent │
│ • 招聘面试Agent │ │ • 客户分析Agent  │ │ • 营销内容Agent │ │ • 安全审计Agent │
│ • 绩效考核Agent │ │ • 背调分析Agent  │ │ • 外贸对接Agent │ │ • 数据安全Agent │
│ • 薪资计算Agent │ │ • 成本分析Agent  │ │ • 社交管理Agent │ │ • 监控预警Agent │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
                           │                   │                   │
                           └───────────────────┴───────────────────┘
                                           │
                                           ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ ⚖️ 刑部         │ │ 🏗️ 工部         │ │                 │ │                 │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ • 合规审核Agent │ │ • 系统运维Agent │ │                 │ │                 │
│ • 内容审查Agent │ │ • 数据采集Agent │ │                 │ │                 │
│ • 风控管理Agent │ │ • 工具开发Agent │ │                 │ │                 │
│ • 法律咨询Agent │ │ • 知识库管理Agent│ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    🦅 锦衣卫 (御史台)                          │
│                    监察监督机构 (独立于三省)                      │
│  长官: 都御史 - 监控审计系统                                    │
│  职责: 全流程监控、审计日志、异常告警、绩效评估                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 流程设计

### 正常流程 (诏令通过)

```
皇帝: 圣旨内容
  │
  ├─→ 【中书省】OpenClaw
  │     ├─ 意图识别
  │     ├─ 参数提取
  │     ├─ 草拟诏令
  │     └─ 提交门下省审核
  │
  ├─→ 【门下省】审核系统
  │     ├─ 权限检查
  │     ├─ 安全检查
  │     ├─ 逻辑检查
  │     ├─ 风险评估
  │     └─ 审核通过 → 颁发诏令
  │
  ├─→ 【尚书省】调度中心
  │     └─ 分配给对应六部
  │
  ├─→ 【六部】Agent执行
  │     └─ 执行具体任务
  │
  ├─→ 【锦衣卫】监控系统
  │     ├─ 记录日志
  │     ├─ 检查合规性
  │     └─ 生成审计报告
  │
  └─→ 返回结果给皇帝
```

### 封驳流程 (诏令驳回)

```
皇帝: 高风险圣旨
  │
  ├─→ 【中书省】OpenClaw
  │     ├─ 草拟诏令
  │     └─ 提交门下省审核
  │
  ├─→ 【门下省】审核系统
  │     ├─ 权限检查: ✓
  │     ├─ 安全检查: ❌ 高风险
  │     ├─ 影响评估: 严重
  │     └─ 封驳回驳 → 退回中书省
  │
  └─→ 【中书省】OpenClaw
        ├─ 收到驳回原因
        ├─ 向皇帝说明风险
        └─ 提供替代方案
```

---

## 代码架构

### 中书省 (决策层)

```typescript
/**
 * 中书省 - 决策草拟机构
 * 负责理解皇帝圣意，草拟诏令，辅助决策
 */

export class ZhongshuSheng {
  private shizhong: Shizhong;

  constructor() {
    this.shizhong = new Shizhong();
  }

  /**
   * 草拟诏令
   * @param imperialDecree - 皇帝的圣旨（用户输入）
   * @param context - 请求上下文
   */
  async draftEdict(
    imperialDecree: string,
    context: RequestContext
  ): Promise<EdictDraft> {
    // 1. 理解圣意（意图识别）
    const intent = await this.shizhong.understandIntent(imperialDecree);

    // 2. 提取参数
    const params = await this.shizhong.extractParameters(imperialDecree, intent);

    // 3. 草拟诏令
    const edictDraft = await this.shizhong.createEdict(intent, params, context);

    return edictDraft;
  }

  /**
   * 处理封驳
   * @param edictDraft - 被驳回的诏令
   * @param rejectionReason - 驳回原因
   */
  async handleRejection(
    edictDraft: EdictDraft,
    rejectionReason: RejectionReason
  ): Promise<ResponseToEmperor> {
    return this.shizhong.createResponse(edictDraft, rejectionReason);
  }
}

/**
 * 侍中 - 中书省长官
 */
class Shizhong {
  async understandIntent(decree: string): Promise<Intent>;
  async extractParameters(decree: string, intent: Intent): Promise<Params>;
  async createEdict(intent: Intent, params: Params, context: RequestContext): Promise<EdictDraft>;
  async createResponse(edict: EdictDraft, reason: RejectionReason): Promise<ResponseToEmperor>;
}
```

### 门下省 (审核层)

```typescript
/**
 * 门下省 - 审核封驳机构
 * 负责审核诏令，如有不妥可驳回
 */

export class MenxiaSheng {
  private shizhong: ShizhongAuditor;

  /**
   * 审核诏令
   * @param edictDraft - 诏令草案
   */
  async reviewEdict(edictDraft: EdictDraft): Promise<ReviewResult> {
    const checks = await Promise.all([
      this.shizhong.checkPermission(edictDraft),
      this.shizhong.checkSafety(edictDraft),
      this.shizhong.checkLogic(edictDraft),
      this.shizhong.assessRisk(edictDraft),
    ]);

    const passed = checks.every(check => check.passed);

    return {
      passed,
      checks,
      reason: passed ? null : this.shizhong.getRejectionReason(checks)
    };
  }
}

/**
 * 侍中 - 门下省长官
 */
class ShizhongAuditor {
  async checkPermission(edict: EdictDraft): Promise<CheckResult>;
  async checkSafety(edict: EdictDraft): Promise<CheckResult>;
  async checkLogic(edict: EdictDraft): Promise<CheckResult>;
  async assessRisk(edict: EdictDraft): Promise<CheckResult>;
  getRejectionReason(checks: CheckResult[]): RejectionReason;
}
```

### 尚书省 (执行层)

```typescript
/**
 * 尚书省 - 执行机构
 * 负责贯彻经过审核的政令
 */

export class ShangshuSheng {
  private puoye: PuoyeDispatcher;

  /**
   * 执行诏令
   * @param edict - 审核通过的诏令
   */
  async executeEdict(edict: Edict): Promise<ExecutionResult> {
    // 1. 调度到对应六部
    const targetMinistry = this.puoye.identifyMinistry(edict);

    // 2. 创建任务
    const task = await this.puoye.createTask(edict, targetMinistry);

    // 3. 分配给Agent
    const agent = await this.puoye.assignAgent(task);

    // 4. 执行任务
    const result = await this.puoye.executeTask(agent, task);

    return {
      success: result.success,
      data: result.data,
      logs: result.logs
    };
  }
}

/**
 * 左右仆射 - 实际调度系统
 */
class PuoyeDispatcher {
  identifyMinistry(edict: Edict): Ministry;
  createTask(edict: Edict, ministry: Ministry): Promise<Task>;
  assignAgent(task: Task): Promise<Agent>;
  executeTask(agent: Agent, task: Task): Promise<TaskResult>;
}
```

### 六部 (功能层)

```typescript
/**
 * 六部 - 具体执行层
 */

export enum Ministry {
  LIBU = "吏部",
  HUBU = "户部",
  LIBU_LI = "礼部",
  BINGBU = "兵部",
  XINGBU = "刑部",
  GONGBU = "工部"
}

export interface MinistryAgent {
  ministry: Ministry;
  name: string;
  capabilities: string[];
  execute(task: Task): Promise<Result>;
}

// 六部Agent注册表
export const MINISTRY_AGENTS: MinistryAgent[] = [
  // 吏部
  {
    ministry: Ministry.LIBU,
    name: "HR管理Agent",
    capabilities: ["招聘", "绩效考核", "薪资计算"],
    execute: async (task) => { /* ... */ }
  },

  // 户部
  {
    ministry: Ministry.HUBU,
    name: "客户分析Agent",
    capabilities: ["背调", "信用评估", "客户画像"],
    execute: async (task) => { /* ... */ }
  },

  // 礼部
  {
    ministry: Ministry.LIBU_LI,
    name: "邮件生成Agent",
    capabilities: ["邮件生成", "双语翻译", "模板选择"],
    execute: async (task) => { /* ... */ }
  },

  // ... 其他六部Agent
];
```

### 锦衣卫 (监控层)

```typescript
/**
 * 锦衣卫 (御史台) - 监察监督机构
 * 独立于三省，直接对皇帝负责
 */

export class JinyiWei {
  private duyushi: DuyushiMonitor;

  /**
   * 监控全流程
   * @param processId - 流程ID
   * @param flow - 流程数据
   */
  async monitorProcess(
    processId: string,
    flow: ProcessFlow
  ): Promise<MonitorReport> {
    const report: MonitorReport = {
      processId,
      timestamp: Date.now(),
      completeness: 0,
      compliance: 0,
      efficiency: 0,
      accuracy: 0,
      anomalies: []
    };

    // 监控三省六部
    await this.duyushi.monitorZhongshu(flow.zhongshu, report);
    await this.duyushi.monitorMenxia(flow.menxia, report);
    await this.duyushi.monitorShangshu(flow.shangshu, report);
    await this.duyushi.monitorLiubu(flow.liubu, report);

    return this.duyushi.generateAuditReport(report);
  }

  /**
   * 实时告警
   * @param report - 监控报告
   */
  async alertIfAnomaly(report: MonitorReport): Promise<void> {
    if (report.anomalies.length > 0) {
      await this.duyushi.sendAlert(report);
    }
  }
}

/**
 * 都御史 - 锦衣卫长官
 */
class DuyushiMonitor {
  async monitorZhongshu(data: any, report: MonitorReport): Promise<void>;
  async monitorMenxia(data: any, report: MonitorReport): Promise<void>;
  async monitorShangshu(data: any, report: MonitorReport): Promise<void>;
  async monitorLiubu(data: any, report: MonitorReport): Promise<void>;
  generateAuditReport(report: MonitorReport): AuditReport;
  sendAlert(report: MonitorReport): Promise<void>;
}
```

---

## API接口

### 统一入口API

```typescript
/**
 * POST /api/zhongshu/dispatch
 * 皇帝发布圣旨的统一入口
 */

interface ImperialDecree {
  message: string;              // 皇帝的指令
  sessionId: string;           // 会话ID（用于上下文）
  userId: string;               // 皇帝ID
  options?: {
    priority?: "normal" | "urgent";
    requireAudit?: boolean;     // 是否要求审计
  };
}

interface ImperialResponse {
  success: boolean;
  edictId: string;
  result?: any;

  // 流程信息
  flow: {
    zhongshu?: {
      intent: string;
      parameters: any;
      decisionTime: number;
    };
    menxia?: {
      passed: boolean;
      checks: any[];
      rejectionReason?: string;
    };
    shangshu?: {
      ministry: string;
      agent: string;
      executionTime: number;
    };
  };

  // 审计信息
  audit?: {
    processId: string;
    reportUrl: string;
  };

  // 如果被驳回
  rejection?: {
    reason: string;
    suggestions: string[];
  };
}
```

---

## 文件结构

```
/workspace/projects/workspace/zaep/
├── lib/
│   ├── zhongshusheng/          # 中书省
│   │   ├── index.ts
│   │   ├── decider.ts          # 决策系统
│   │   ├── shizhong.ts         # 侍中
│   │   └── intent-engine.ts    # 意图识别引擎
│   │
│   ├── menxiasheng/            # 门下省
│   │   ├── index.ts
│   │   ├── auditor.ts          # 审核系统
│   │   ├── shizhong.ts         # 侍中
│   │   ├── safety-checker.ts   # 安全检查
│   │   ├── permission-checker.ts
│   │   └── risk-assessor.ts    # 风险评估
│   │
│   ├── shangshusheng/          # 尚书省
│   │   ├── index.ts
│   │   ├── dispatcher.ts       # 调度中心
│   │   ├── puoye.ts            # 左右仆射
│   │   └── task-orchestrator.ts
│   │
│   ├── liubu/                  # 六部
│   │   ├── index.ts
│   │   ├── ministries.ts       # 六部定义
│   │   ├── agents/
│   │   │   ├── libu/           # 吏部
│   │   │   ├── hubu/           # 户部
│   │   │   ├── libu-li/        # 礼部
│   │   │   ├── bingbu/         # 兵部
│   │   │   ├── xingbu/         # 刑部
│   │   │   └── gongbu/         # 工部
│   │   └── registry.ts         # Agent注册表
│   │
│   ├── jinyiwei/               # 锦衣卫
│   │   ├── index.ts
│   │   ├── monitor.ts          # 监控系统
│   │   ├── duyushi.ts          # 都御史
│   │   ├── logger.ts           # 日志记录
│   │   ├── auditor.ts          # 审计系统
│   │   └── alert-system.ts     # 告警系统
│   │
│   └── san-sheng-system.ts     # 三省系统统一入口
│
├── docs/
│   ├── THREE_PROVINCES.md      # 架构文档 (本文档)
│   ├── SAN_SHENG_PROGRESS.md   # 实现进度
│   └── SAN_SHENG_IMPLEMENTATION_LOG.md  # 实施日志
│
└── projects/
    ├── src/
    │   └── app/
    │       └── (智能体管理)/
    │           ├── san-sheng/  # 三省管理页面
    │           │   ├── page.tsx
    │           │   ├── zhongshu/
    │           │   ├── menxia/
    │           │   └── shangshu/
    │           └── jinyiwei/   # 锦衣卫监控页面
    └── api/
        ├── zhongshu/
        └── jinyiwei/
```

---

## 六部职能

### 👤 吏部 (人事管理)

**职能**:
- 管官员任免、考核
- 招聘面试辅助
- 绩效评估
- 薪资计算

**对应Agent**:
- HR管理Agent
- 招聘面试Agent
- 绩效考核Agent
- 薪资计算Agent

**对应现实部门**:
- 组织部 + 人社部

---

### 💰 户部 (财务管理)

**职能**:
- 管土地、户籍、赋税、财政
- 客户背调分析
- 信用评估
- 成本分析

**对应Agent**:
- 财务管理Agent
- 客户分析Agent
- 背调分析Agent
- 成本分析Agent

**对应现实部门**:
- 财政部 + 民政部

---

### 🎭 礼部 (外交文化)

**职能**:
- 管礼仪、祭祀、科举、外交
- 邮件生成
- 营销内容
- 外贸对接

**对应Agent**:
- 邮件生成Agent
- 营销内容Agent
- 外贸对接Agent
- 社交管理Agent

**对应现实部门**:
- 教育部 + 外交部 + 文化部

---

### ⚔️ 兵部 (国防安全)

**职能**:
- 管武官选用、兵籍、军械
- 风险评估
- 安全审计
- 数据安全

**对应Agent**:
- 风险评估Agent
- 安全审计Agent
- 数据安全Agent
- 监控预警Agent

**对应现实部门**:
- 国防部 (但无直接调兵权)

---

### ⚖️ 刑部 (司法监察)

**职能**:
- 管法律、刑狱
- 合规审核
- 内容审查
- 风控管理

**对应Agent**:
- 合规审核Agent
- 内容审查Agent
- 风控管理Agent
- 法律咨询Agent

**对应现实部门**:
- 司法部 + 公安部部分职能

---

### 🏗️ 工部 (工程建设)

**职能**:
- 管工程、水利、屯田
- 系统运维
- 数据采集
- 工具开发
- 知识库管理

**对应Agent**:
- 系统运维Agent
- 数据采集Agent
- 工具开发Agent
- 知识库管理Agent

**对应现实部门**:
- 住建部 + 水利部

---

## 监控机制

### 锦衣卫监控指标

```typescript
interface MonitorMetrics {
  // 操作完整性
  completeness: {
    score: number;           // 0-100
    details: string[];       // 具体细节
  };

  // 权限合规性
  compliance: {
    score: number;           // 0-100
    violations: string[];    // 违规记录
  };

  // 时效性
  efficiency: {
    score: number;           // 0-100
    responseTime: number;    // 响应时间(ms)
    executionTime: number;   // 执行时间(ms)
  };

  // 可追溯性
  traceability: {
    score: number;           // 0-100
    logCompleteness: number; // 日志完整度
  };

  // 准确性
  accuracy: {
    score: number;           // 0-100
    errorCount: number;      // 错误数量
  };
}
```

---

## 实现优先级

### 阶段一: 核心框架 (P0)
- [ ] 创建目录结构
- [ ] 定义基础类型和接口
- [ ] 实现三省系统统一入口
- [ ] 实现基本的API路由

### 阶段二: 中书省 (P0)
- [ ] 意图识别引擎
- [ ] 参数提取系统
- [ ] 诏令草拟系统
- [ ] 对话历史管理

### 阶段三: 门下省 (P0)
- [ ] 权限检查器
- [ ] 安全检查器
- [ ] 风险评估系统
- [ ] 封驳机制

### 阶段四: 尚书省 (P1)
- [ ] 任务调度中心
- [ ] 六部识别系统
- [ ] Agent分配逻辑
- [ ] 任务编排引擎

### 阶段五: 六部 (P1)
- [ ] Agent注册表
- [ ] 吏部Agents
- [ ] 户部Agents
- [ ] 礼部Agents
- [ ] 兵部Agents
- [ ] 刑部Agents
- [ ] 工部Agents

### 阶段六: 锦衣卫 (P0)
- [ ] 日志系统
- [ ] 审计系统
- [ ] 监控指标计算
- [ ] 异常告警系统

### 阶段七: UI界面 (P2)
- [ ] 三省管理页面
- [ ] 锦衣卫监控页面
- [ ] 流程可视化
- [ ] 审计报告展示

---

## 设计原则

### 1. 职责分离
- 中书省: 决策
- 门下省: 审核封驳
- 尚书省: 执行
- 锦衣卫: 监督

### 2. 安全第一
- 门下省封驳权保证操作安全
- 锦衣卫独立监控保证真实可靠
- 所有操作可追溯

### 3. 智能化
- 意图识别理解皇帝圣意
- 智能风险评估
- 自动Agent分配

### 4. 可扩展
- 六部Agents可随时添加
- 新功能可轻松接入
- 监控指标可自定义

---

## 下一步

查看 `SAN_SHENG_PROGRESS.md` 了解当前实现进度
查看 `SAN_SHENG_IMPLEMENTATION_LOG.md` 了解实施日志
