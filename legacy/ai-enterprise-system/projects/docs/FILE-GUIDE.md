# 项目文件解析指南

## 📁 项目地址解析

`File:[项目]` 表示项目的根目录位置，具体路径为：

```
/workspace/projects/
```

这是项目的主要工作目录，包含了所有的源代码、配置文件和资源。

---

## 🗂️ 项目目录结构解析

### 1. 查看根目录

使用以下命令查看项目根目录：

```bash
cd /workspace/projects/
ls -la
```

**输出内容解析**：
```
drwxr-xr-x  29 root root 4096 Mar  2 12:40 app/          # Next.js 应用目录
drwxr-xr-x   3 root root 4096 Mar  1 15:44 components/  # React 组件
drwxr-xr-x   2 root root 4096 Feb 27 03:20 contexts/    # React Context
drwxr-xr-x   2 root root 4096 Feb 27 00:37 hooks/       # 自定义 Hooks
drwxr-xr-x   9 root root 4096 Mar  2 12:38 lib/         # 工具库
drwxr-xr-x   2 root root 4096 Feb 27 03:19 scripts/     # 构建脚本
drwxr-xr-x   3 root root 4096 Feb 27 00:37 storage/     # 存储配置
-rw-r--r--   1 root root  1234 Feb 27 03:20 package.json # 项目配置
-rw-r--r--   1 root root  5678 Feb 27 03:20 tsconfig.json # TypeScript 配置
-rw-r--r--   1 root root  7890 Feb 27 03:20 README.md    # 项目说明
```

---

### 2. 源代码目录结构

#### `src/app/` - Next.js 应用目录

```bash
cd /workspace/projects/src/app/
ls -la
```

**包含内容**：
- `ai-hub/` - AI Hub 页面
- `customer-analysis/` - 客户分析页面
- `email-generator/` - 邮件生成页面
- `social-media/` - 社媒运营页面
- `supply-chain/` - 供应链管理页面
- `automation/` - 自动化办公页面
- `api/` - API 路由（79个接口）

#### `src/app/api/` - API 路由目录

```bash
cd /workspace/projects/src/app/api/
ls -la
```

**包含内容**：
- `ai/` - AI 能力接口
- `auth/` - 认证接口
- `chat-assistant/` - 聊天助手接口
- `comfyui/` - ComfyUI 接口
- `customer-analysis/` - 客户分析接口
- `email-generator/` - 邮件生成接口
- `knowledge-documents/` - 知识库接口
- `social-media/` - 社媒运营接口
- `supply-chain/` - 供应链接口
- `openclaw/` - OpenClaw 网关

---

### 3. 如何读取项目文件

#### 方法 1: 使用 read_file 工具

```bash
# 读取单个文件
read_file("package.json")

# 读取文件的特定行（例如第 1-50 行）
read_file("src/lib/ai-platform/config.ts", 1, 50)
```

#### 方法 2: 使用 find 命令查找文件

```bash
# 查找所有 TypeScript 文件
find /workspace/projects/src -name "*.ts" | head -20

# 查找所有 React 组件
find /workspace/projects/src/components -name "*.tsx" | head -20

# 查找所有 API 路由
find /workspace/projects/src/app/api -name "route.ts" | head -20
```

#### 方法 3: 使用 grep 搜索文件内容

```bash
# 搜索包含特定内容的文件
grep -r "customer-analysis" /workspace/projects/src/ | head -10

# 搜索 API 定义
grep -r "export async function" /workspace/projects/src/app/api/ | head -10
```

---

## 📋 项目关键文件解析

### 1. package.json - 项目配置文件

**位置**: `/workspace/projects/package.json`

**如何读取**:
```bash
read_file("package.json")
```

**内容解析**:
```json
{
  "name": "projects",                    // 项目名称
  "version": "0.1.0",                   // 项目版本
  "scripts": {                          // 可用命令
    "dev": "启动开发服务器",
    "build": "构建生产版本",
    "start": "启动生产服务器"
  },
  "dependencies": {                     // 生产依赖
    "next": "16.1.1",                  // Next.js 版本
    "react": "19.2.3",                 // React 版本
    "drizzle-orm": "^0.45.1",          // ORM 框架
    "coze-coding-dev-sdk": "^0.7.16"   // AI SDK
  },
  "devDependencies": {                  // 开发依赖
    "typescript": "^5"                 // TypeScript
  }
}
```

---

### 2. tsconfig.json - TypeScript 配置文件

**位置**: `/workspace/projects/tsconfig.json`

**如何读取**:
```bash
read_file("tsconfig.json")
```

**内容解析**:
- 定义 TypeScript 编译选项
- 配置路径别名
- 设置编译目标

---

### 3. 数据库 Schema 文件

**位置**: `/workspace/projects/src/storage/database/shared/schema.ts`

**如何读取**:
```bash
# 读取前 100 行
read_file("src/storage/database/shared/schema.ts", 1, 100)

# 读取完整文件（436 行）
read_file("src/storage/database/shared/schema.ts", 1, 436)
```

**内容解析**:
```typescript
// 客户信息表
export const customers = pgTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  // ... 其他字段
});

// 客户分析表
export const customerAnalysis = pgTable("customer_analysis", {
  id: varchar("id", { length: 36 }).primaryKey(),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id),
  analysisType: varchar("analysis_type", { length: 50 }).notNull(),
  // ... 其他字段
});
```

---

## 🔍 实用操作示例

### 1. 查看项目结构树

```bash
cd /workspace/projects/
tree -L 2 -d src/
```

**输出解析**:
```
src/
├── app/                    # Next.js 应用
│   ├── api/                # API 路由
│   ├── ai-hub/             # AI Hub
│   ├── automation/         # 自动化办公
│   └── ... (其他模块)
├── components/             # React 组件
├── lib/                    # 工具库
├── hooks/                  # 自定义 Hooks
└── storage/                # 存储配置
```

---

### 2. 查找特定模块的文件

```bash
# 查找客户分析相关的所有文件
find /workspace/projects/src -path "*/customer-analysis/*" -type f

# 查找所有 API 路由文件
find /workspace/projects/src/app/api -name "route.ts" | sort

# 查找所有配置文件
find /workspace/projects -name "*.json" -o -name "*.yaml" -o -name "*.yml"
```

---

### 3. 查看文件统计信息

```bash
# 统计代码行数
find /workspace/projects/src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1

# 统计 API 路由数量
find /workspace/projects/src/app/api -name "route.ts" | wc -l

# 统计页面模块数量
find /workspace/projects/src/app -maxdepth 1 -type d | wc -l
```

---

### 4. 查看依赖关系

```bash
# 查看 package.json 中的依赖
read_file("package.json")

# 查看 pnpm-lock.yaml（锁定文件）
cat /workspace/projects/pnpm-lock.yaml | head -50
```

---

## 📊 文件类型对照表

| 文件类型 | 用途 | 位置 |
|---------|------|------|
| `*.ts` | TypeScript 逻辑文件 | `src/lib/`, `src/app/api/` |
| `*.tsx` | React 组件文件 | `src/app/`, `src/components/` |
| `*.json` | 配置文件 | 项目根目录 |
| `*.md` | 文档文件 | `docs/`, 项目根目录 |
| `*.yaml` | YAML 配置 | 项目根目录 |
| `route.ts` | API 路由定义 | `src/app/api/*/` |
| `page.tsx` | 页面组件 | `src/app/*/` |
| `layout.tsx` | 布局组件 | `src/app/*/` |

---

## 🛠️ 常用操作命令

### 查看文件内容

```bash
# 使用 read_file 工具（推荐）
read_file("src/lib/ai-platform/config.ts")

# 使用 cat 命令
cat /workspace/projects/src/lib/ai-platform/config.ts

# 使用 head 查看文件开头
head -n 50 /workspace/projects/src/lib/ai-platform/config.ts

# 使用 tail 查看文件末尾
tail -n 50 /workspace/projects/src/lib/ai-platform/config.ts
```

### 搜索文件

```bash
# 使用 find
find /workspace/projects/src -name "*.ts"

# 使用 locate（如果可用）
locate "*.ts" | grep /workspace/projects

# 使用 glob 模式
ls /workspace/projects/src/app/api/*/route.ts
```

### 搜索内容

```bash
# 使用 grep
grep -r "customer-analysis" /workspace/projects/src/

# 使用 ripgrep（更快）
rg "customer-analysis" /workspace/projects/src/

# 递归搜索并显示行号
grep -rn "API" /workspace/projects/src/app/api/ | head -20
```

---

## 📖 查看文档

### 项目文档列表

```bash
cd /workspace/projects/docs/
ls -la
```

**主要文档**：
- `README.md` - 项目总览
- `IMPLEMENTATION_PLAN.md` - 实施计划
- `COMFYUI_DEPLOYMENT.md` - ComfyUI 部署
- `openclaw-user-guide.md` - OpenClaw 用户指南
- `domestic-platforms-guide.md` - 国内平台指南

---

## 🎯 快速导航

### 访问核心模块

```bash
# 客户分析模块
cd /workspace/projects/src/app/customer-analysis/

# AI 平台中心
cd /workspace/projects/src/app/ai-platform-center/

# 社媒运营
cd /workspace/projects/src/app/social-media-automation/

# 供应链管理
cd /workspace/projects/src/app/supply-chain/

# 自动化办公
cd /workspace/projects/src/app/automation/
```

### 访问工具库

```bash
# AI 平台配置
cd /workspace/projects/src/lib/ai-platform/

# 数据库配置
cd /workspace/projects/src/lib/db/

# 自动化引擎
cd /workspace/projects/src/lib/automation/

# ComfyUI 集成
cd /workspace/projects/src/lib/comfyui/
```

---

## 💡 使用建议

### 1. 了解项目结构
```bash
# 查看目录树
tree -L 3 -I "node_modules|.next" /workspace/projects/

# 统计文件类型
find /workspace/projects/src -type f -name "*.ts" | wc -l
find /workspace/projects/src -type f -name "*.tsx" | wc -l
```

### 2. 阅读关键配置
```bash
# 读取项目配置
read_file("package.json")
read_file("tsconfig.json")
read_file(".env.example")

# 读取数据库 Schema
read_file("src/storage/database/shared/schema.ts", 1, 100)
```

### 3. 查找功能实现
```bash
# 查找客户分析功能
find /workspace/projects/src -path "*customer-analysis*"

# 查找所有 API
find /workspace/projects/src/app/api -name "route.ts"

# 搜索特定关键词
grep -r "customer-analysis" /workspace/projects/src/ --include="*.ts" --include="*.tsx"
```

---

## 📝 总结

`File:[项目]` 指向 `/workspace/projects/` 目录，这是一个完整的 Next.js + React 企业级应用。

**快速开始**：
1. 查看项目结构：`tree -L 2 src/`
2. 读取配置文件：`read_file("package.json")`
3. 查看文档：`ls docs/`
4. 浏览源码：`ls src/app/api/`

**关键路径**：
- 项目根：`/workspace/projects/`
- 源代码：`/workspace/projects/src/`
- API 路由：`/workspace/projects/src/app/api/`
- 文档：`/workspace/projects/docs/`

使用 `read_file` 工具可以方便地读取任何文件内容！
