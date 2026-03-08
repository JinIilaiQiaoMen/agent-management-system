# AI 智能化企业系统

一个基于 [Next.js 16](https://nextjs.org) + [shadcn/ui](https://ui.shadcn.com) + [Supabase](https://supabase.com) 的全栈企业级应用，集成 AI 大模型能力，提供外贸业务、企业管理、智能营销三大领域的全流程 AI 解决方案。

## ✨ 核心功能

### 🌍 外贸业务模块

**客户背调**
- 对话式 AI 分析界面，支持多轮对话
- 流式响应，实时展示分析过程
- 智能推荐问题，引导深入了解
- 基于公司名称智能分析企业背景
- 自动获取企业基本信息、财务状况、信用评级
- 生成详细的背调报告
- 支持多种格式导出（Markdown、JSON、纯文本）

**谈单辅助**
- AI 实时建议回复策略
- 多语言沟通支持
- 历史对话智能分析

**邮件生成**
- 根据客户需求自动生成专业邮件
- 多模板快速切换
- 支持中英文双语生成

**线索筛选**
- AI 智能评分排序
- 自定义筛选规则
- 批量处理功能

**知识库管理**
- 支持文档、URL、对象存储 URI 导入
- 向量化存储实现语义搜索
- RAG 能力提供精准回复

### 🏢 企业管理模块

**组织架构**
- 部门、岗位管理
- 员工信息维护
- 组织架构可视化

**招聘管理**
- 简历接收与解析
- 面试安排与评估
- Offer 发放与管理

**考勤管理**
- 员工考勤记录
- 请假审批流程
- 加班管理

**绩效管理**
- KPI 设置与追踪
- 绩效评估流程
- 绩效报表生成

**薪资管理**
- 薪资结构配置
- 工资单生成
- 发放记录管理

**财务审计**
- 财务凭证管理
- 审计流程追踪
- 审计报告生成

### 📱 智能营销模块

**工厂供应链 AI 协同系统**
- **爆品预测**：基于 AI 分析历史销售数据，预测未来需求趋势，识别潜在爆品
- **库存管理**：实时监控库存状态，智能预警（缺货、危急、低库存、正常、积压），支持库存调整
- **品控分析**：记录和管理质量检查，自动计算合格率，生成质量分析报告
- **成本核算**：按成本类型（材料、人工、制造费用等）统计成本，计算产品利润率
- **产销全链路协同**：整合销售、采购、生产、库存数据，生成协同建议，自动创建生产订单
- **AI 智能建议**：基于数据分析提供库存补货、生产排产、采购处理等智能建议
- **实时数据看板**：多维度数据展示，支持多时间周期分析（30天/60天/90天）

**宠物跨境专版**
- 零成本 AI 内容生成
- 多版本质量评分对比
- 中英文对照显示

**国内全渠道发布中心**
- 支持 30+ 主流平台（淘宝、京东、抖音、小红书、微博、B站等）
- 一键发布到多个平台
- 定时发布和批量发布

**欧美线下渠道赋能系统**
- **客流热区分析**：实时监测门店客流分布，识别高/低流量区域，生成热区图，预测未来客流趋势
- **智能排班**：基于客流预测自动生成排班表，遵守欧美劳工法规（EU Working Time Directive/US FLSA/UK Working Time Regulations），最小化人力成本
- **库存动销预测**：预测产品需求，自动生成补货建议，支持EOQ最优订货量计算，降低缺货率和库存积压
- **AI远程巡店**：AI识别门店运营违规（未戴工牌、货架未整理等），实时视频分析，自动生成巡店报告和整改建议
- **会员营销**：基于RFM模型的客户价值分析，XGBoost流失预测，协同过滤个性化推荐，自动化营销活动
- **GDPR/CCPA合规**：数据去标识化处理，坐标模糊化，客户ID哈希化，视频人脸模糊处理
- **多语言支持**：英/西/德/法四种语言适配，所有UI和API返回内容支持本地化
- **真实数据库集成**：23个数据表支持真实业务数据流转，与POS/ERP/CRM系统对接

**AI 能力中台**
- **模型智能路由**：基于任务类型、复杂度、推理需求等特征自动选择最优模型（豆包、DeepSeek、Kimi等）
- **智能缓存系统**：SHA-256哈希缓存，可配置TTL，支持80%+缓存命中率
- **用量监控**：实时统计总请求量、缓存命中率、调用量压缩率、成本节省率
- **成本优化**：通过缓存和智能路由，将付费API调用量压缩80%以上
- **模型管理**：支持添加、编辑、删除模型提供商配置
- **路由规则管理**：支持自定义路由规则，基于条件和优先级进行模型选择
- **性能监控**：追踪各模型的成功率、延迟、缓存命中率等性能指标
- **数据分析**：多维度分析（按模型、任务类型、时间），支持7天/30天/90天趋势分析

#### 0. 客户背调系统升级
- **对话式分析界面**：全新的聊天式交互，支持多轮对话深度分析
- **流式响应**：AI 分析结果实时打字机式展示，提升用户体验
- **智能推荐问题**：根据公司名称动态生成 8 个推荐问题，引导用户深入了解
- **多格式导出**：支持 Markdown、JSON、纯文本三种格式导出分析报告
- **会话管理**：自动保存对话历史，支持会话归档和清理
- **问题分类**：推荐问题按类别组织（基本信息、市场分析、风险评估、合作建议等）

### 🔥 最新功能亮点

#### 1. 媒体管理增强
- **拖拽排序**：通过拖拽调整媒体文件顺序
- **URL 导入**：支持从外部 URL 导入图片
- **媒体压缩**：自动优化图片大小，支持 JPEG/PNG/WebP 格式
- **批量上传**：最多支持 9 个文件，每个最大 10MB

#### 2. AI 智能创作
- **流式生成**：实时打字机效果展示 AI 生成内容
- **多平台适配**：针对不同平台风格自动调整内容
- **多语气风格**：专业/轻松/热情/幽默 4 种风格
- **双语支持**：中文和英文内容生成
- **智能标签**：自动生成相关话题标签

#### 3. 数据分析仪表盘
- **核心指标**：支持平台数、已连接数、发布计划、累计发布
- **平台分布**：各平台发布占比可视化
- **内容分析**：不同内容类型统计
- **趋势追踪**：7天/30天/90天数据趋势
- **互动统计**：点赞、评论、分享、浏览数据

#### 4. 团队协作
- **成员管理**：邀请成员、分配角色（管理员/编辑/查看者）
- **发布任务**：创建发布任务、指派负责人
- **审批流程**：待审核、已通过、已拒绝状态管理
- **评论系统**：任务评论讨论

#### 5. 自动发布规则
- **立即发布**：内容审核通过后立即发布
- **定时发布**：指定时间自动发布
- **周期性发布**：每 N 天自动发布
- **规则管理**：创建、启用/停用、删除规则

#### 6. 模板分享
- **分享模板**：生成唯一分享链接
- **使用统计**：记录模板被使用次数
- **一键复制**：快速复制分享链接

#### 7. 发布报告导出
- **CSV 格式**：适用于 Excel、Google Sheets
- **Excel 格式**：适用于 Microsoft Excel
- **时间筛选**：支持按日期范围导出
- **数据完整**：包含发布状态、互动数据、平台信息

## 🛠️ 技术栈

### 前端框架
- **Next.js 16** (App Router) - React 全栈框架
- **React 19** - 最新 React 版本
- **TypeScript 5** - 类型安全开发
- **Tailwind CSS 4** - 原子化 CSS 框架

### UI 组件库
- **shadcn/ui** - 现代化 UI 组件库（完整预装）
- **Radix UI** - 无样式组件库
- **Lucide Icons** - 图标库

### 数据与存储
- **Supabase** - 数据库和存储解决方案
  - PostgreSQL 数据库
  - Row Level Security (RLS)
  - Real-time 订阅
- **Knowledge SDK** - 知识库向量存储与检索

### AI 能力
- **coze-coding-dev-sdk** - LLM 集成 SDK
  - 支持豆包、DeepSeek、Kimi 等大模型
  - 流式输出优先
  - 多轮对话支持
  - 多模态理解（图片/视频）

### 认证与安全
- **bcryptjs** - 密码哈希
- **jose** - JWT Token 生成和验证
- **HttpOnly Cookies** - 安全的 Token 存储

### 开发工具
- **pnpm** - 包管理器
- **ESLint** - 代码检查
- **TypeScript** - 类型检查

## 📁 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 根布局组件
│   ├── page.tsx                 # 首页（功能导航）
│   ├── globals.css              # 全局样式
│   ├── customer-due-diligence/  # 客户背调模块
│   ├── negotiation-assistant/   # 谈单辅助模块
│   ├── email-generator/         # 邮件生成模块
│   ├── lead-qualification/      # 线索筛选模块
│   ├── knowledge-base/          # 知识库管理模块
│   ├── system-monitor/          # 系统监控模块
│   ├── domestic-platforms/      # 国内全渠道发布中心
│   ├── supply-chain/            # 工厂供应链 AI 协同系统
│   └── api/                     # API 路由
│       ├── customer-analysis/    # 客户背调 API
│       │   ├── chat/             # 对话式分析接口（流式）
│       │   ├── suggestions/      # 推荐问题接口
│       │   └── export/           # 导出报告接口
│       ├── supply-chain/         # 供应链 API
│       │   ├── forecast/         # 爆品预测接口
│       │   ├── inventory/        # 库存管理接口
│       │   ├── quality/          # 品控分析接口
│       │   ├── cost/             # 成本核算接口
│       │   └── collaboration/    # 产销协同接口
│       ├── domestic-platforms/  # 发布相关 API
│       │   ├── publish/         # 发布接口
│       │   ├── templates/       # 模板管理
│       │   ├── analytics/       # 数据分析
│       │   ├── export/          # 导出报告
│       │   ├── collaboration/   # 团队协作
│       │   └── optimization/    # 媒体优化
│       └── ai/                  # AI 相关 API
│           └── generate-content/ # 内容生成
├── components/                   # React 组件
│   ├── ui/                      # shadcn/ui 基础组件
│   ├── media-uploader-enhanced.tsx  # 增强版媒体上传器
│   ├── ai-generate-button.tsx       # AI 生成按钮
│   ├── analytics-dashboard.tsx      # 数据分析仪表盘
│   ├── collaboration-panel.tsx      # 团队协作面板
│   ├── export-button.tsx            # 导出按钮
│   ├── auto-publish-rules.tsx       # 自动发布规则
│   └── share-template-dialog.tsx    # 模板分享对话框
├── lib/                          # 工具库
│   ├── social-media/            # 社媒相关工具
│   │   └── domestic-platforms.ts  # 国内平台配置
│   ├── utils.ts                 # 通用工具函数
│   └── db/                      # 数据库工具（Supabase）
└── hooks/                       # 自定义 Hooks
```

## 🚀 快速开始

### 环境要求

- Node.js 24+
- pnpm（已内置）

### 启动开发服务器

```bash
coze dev
```

启动后，在浏览器中打开 [http://localhost:5000](http://localhost:5000) 查看应用。

### 构建生产版本

```bash
coze build
```

### 启动生产服务器

```bash
coze start
```

## 📚 开发规范

### 1. 组件开发

**优先使用 shadcn/ui 基础组件**

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>标题</CardHeader>
      <CardContent>
        <Button>提交</Button>
      </CardContent>
    </Card>
  );
}
```

**可用的 shadcn 组件清单**

- 表单：`button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`
- 布局：`card`, `separator`, `tabs`, `accordion`, `collapsible`, `scroll-area`
- 反馈：`alert`, `alert-dialog`, `dialog`, `toast`, `sonner`, `progress`
- 导航：`dropdown-menu`, `menubar`, `navigation-menu`, `context-menu`
- 数据展示：`table`, `avatar`, `badge`, `hover-card`, `tooltip`, `popover`
- 其他：`calendar`, `command`, `carousel`, `resizable`, `sidebar`

### 2. 路由开发

Next.js 使用文件系统路由：

```bash
# 创建新路由 /about
src/app/about/page.tsx

# 创建动态路由 /posts/[id]
src/app/posts/[id]/page.tsx

# 创建 API 路由
src/app/api/users/route.ts
```

**动态路由示例（Next.js 16 规范）**

```tsx
// src/app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>文章 ID: {id}</div>;
}
```

### 3. 数据库操作

使用 Supabase SDK：

```tsx
import { createClient } from '@/lib/db/supabase';

const supabase = createClient();

// 查询数据
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// 插入数据
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com' });

// 更新数据
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane' })
  .eq('id', userId);
```

### 4. AI 集成

使用 LLM SDK（仅限后端）：

```tsx
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
  const config = new Config();
  const client = new LLMClient(config, customHeaders);

  const messages = [
    { role: 'user', content: '你好' }
  ];

  // 流式输出
  const stream = client.stream(messages);

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.content) {
          controller.enqueue(encoder.encode(chunk.content.toString()));
        }
      }
      controller.close();
    }
  });

  return new NextResponse(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Transfer-Encoding': 'chunked',
    },
  });
}
```

### 5. 依赖管理

**必须使用 pnpm**

```bash
# ✅ 安装依赖
pnpm install

# ✅ 添加新依赖
pnpm add package-name

# ✅ 添加开发依赖
pnpm add -D package-name

# ❌ 禁止使用 npm 或 yarn
```

### 6. 样式开发

**使用 Tailwind CSS v4**

```tsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-background">
  <Button className="bg-primary text-primary-foreground">
    主要按钮
  </Button>
</div>
```

**使用 cn() 工具函数合并类名**

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  className
)}>
  内容
</div>
```

## 🔐 安全规范

### 1. API 密钥管理

- 所有 API 密钥通过环境变量配置
- 永远不要在前端代码中暴露密钥
- LLM SDK 只能在后端 API 路由中使用

### 2. 数据验证

- 所有用户输入必须验证
- 使用 TypeScript 类型检查
- API 路由必须验证请求数据

### 3. 认证授权

- 使用 JWT + HttpOnly Cookie 存储用户令牌
- 敏感操作需要身份验证
- 使用 Row Level Security (RLS) 保护数据库

## 📊 性能优化

### 1. 代码分割

Next.js 自动进行代码分割，按路由加载。

### 2. 图片优化

使用 Next.js Image 组件：

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority
/>
```

### 3. 数据库查询优化

- 使用 Supabase 的索引功能
- 避免 N+1 查询
- 合理使用分页

### 4. 缓存策略

- 使用 Next.js 的数据缓存
- 静态资源使用 CDN
- API 响应适当缓存

## 🧪 测试

### 类型检查

```bash
npx tsc --noEmit
```

### 构建检查

```bash
coze build
```

### API 测试

```bash
curl -X POST http://localhost:5000/api/ai/generate-content \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "你好"}'
```

## 📝 更新日志

### v2.0.0 (2026-03-01)

**新增功能：**
- ✨ 国内全渠道发布中心
  - 支持 30+ 主流平台
  - 一键发布到多个平台
  - 定时发布和批量发布
- ✨ AI 智能创作
  - 流式内容生成
  - 多平台、多风格适配
  - 自动话题标签
- ✨ 数据分析仪表盘
  - 核心指标可视化
  - 平台分布分析
  - 趋势追踪
- ✨ 团队协作
  - 成员管理
  - 发布任务
  - 审批流程
- ✨ 自动发布规则
  - 定时发布
  - 周期性发布
  - 规则管理
- ✨ 媒体管理增强
  - 拖拽排序
  - URL 导入
  - 媒体压缩
- ✨ 模板分享
  - 分享链接生成
  - 使用统计
- ✨ 发布报告导出
  - CSV 格式
  - Excel 格式

**优化：**
- 🎨 UI/UX 全面升级
- ⚡ 性能优化
- 🐛 Bug 修复

### v1.0.0 (2026-02-01)

**初始发布：**
- 外贸业务模块（客户背调、谈单辅助、邮件生成、线索筛选）
- 企业管理模块（组织架构、招聘、考勤、绩效、薪资、财务审计）
- 智能营销模块（宠物跨境专版）
- 知识库管理
- 系统监控

## 📄 许可证

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至 support@example.com

---

**由扣子编程 CLI 创建** | **Next.js 16 + shadcn/ui + Supabase** | **AI 赋能企业数字化转型**
