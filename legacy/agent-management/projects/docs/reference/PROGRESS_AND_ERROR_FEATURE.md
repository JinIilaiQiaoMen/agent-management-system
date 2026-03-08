# 任务执行进度条与错误提醒功能

## 功能概述

为公司智能体管理系统的任务执行和多智能体对话盒子添加了进度条显示和错误提醒功能，提升用户体验和问题排查效率。

## 功能细节

### 1. 任务执行组件 (TaskExecution)

#### 进度条功能
- **位置**: 组件头部，标题下方
- **显示内容**:
  - 总体进度百分比 (0-100%)
  - 当前执行步骤描述
  - 执行状态（执行中/已完成/执行失败）
- **进度更新**:
  - 步骤1: 生成智能体团队 (0-25%)
  - 步骤2: 分析任务 (25-50%)
  - 步骤3: 专业智能体执行 (50-75%)
  - 步骤4: 汇总成果 (75-100%)

#### 错误提醒面板
- **位置**: 右侧独立面板，使用 lg:col-span-1 布局
- **功能特性**:
  - 实时显示错误和警告信息
  - 错误徽章显示错误数量
  - 支持单独删除每个错误
  - 支持一键清空所有错误
  - 错误详情可展开查看
  - 显示错误时间戳
- **错误类型**:
  - execution_error: 执行错误
  - warning: 警告信息
- **交互设计**:
  - 错误卡片右上角有关闭按钮
  - 点击"清空全部"按钮可一次性清除所有错误
  - 展开详情可查看错误堆栈或详细信息

### 2. 多智能体对话盒子组件 (ConversationBoxChat)

#### 进度条功能
- **位置**: 盒子头部，智能体列表下方
- **显示内容**:
  - 智能体响应进度百分比
  - 基于已完成的智能体数量计算
- **进度计算**:
  - `进度 = (已完成智能体数 / 总智能体数) * 100%`
  - 每完成一个智能体，进度自动更新
- **状态显示**:
  - 执行中显示蓝色加载动画
  - 完成后显示绿色勾选标记
  - 错误显示红色叉号

#### 错误提醒面板
- **位置**: 消息区域右侧，仅在出现错误时显示
- **功能特性**:
  - 错误徽章显示错误数量
  - 实时显示执行过程中的错误
  - 支持单独删除错误
  - 支持清空所有错误
  - 显示错误时间戳
- **错误类型**:
  - agent_error: 智能体执行错误
  - execution_error: 全局执行错误
  - network_error: 网络错误
- **交互设计**:
  - 仅在有错误时显示，不占用空间
  - 错误信息紧凑展示
  - 展开详情查看错误堆栈

## 技术实现

### 状态管理

#### TaskExecution 组件
```typescript
const [progress, setProgress] = useState(0); // 进度百分比
const [errors, setErrors] = useState<ErrorInfo[]>([]); // 错误列表

interface ErrorInfo {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  details?: any;
}
```

#### ConversationBoxChat 组件
```typescript
const [progress, setProgress] = useState(0); // 进度百分比
const [errors, setErrors] = useState<ErrorInfo[]>([]); // 错误列表
```

### 进度更新逻辑

#### TaskExecution
```typescript
case "step":
  setCurrentStep(event.data.step);
  const stepProgress = (event.data.step / 4) * 100;
  setProgress(stepProgress);
  break;
```

#### ConversationBoxChat
```typescript
case "agent_complete":
  completedAgents++;
  const progressPercent = (completedAgents / totalAgents) * 100;
  setProgress(progressPercent);
  break;
```

### 错误处理逻辑

#### TaskExecution
```typescript
case "error":
  const newError: ErrorInfo = {
    id: `error-${Date.now()}`,
    type: event.data.errorType || "execution_error",
    message: event.data.message || "Unknown error",
    timestamp: Date.now(),
    details: event.data.details,
  };
  setErrors((prev) => [...prev, newError]);
  break;
```

#### ConversationBoxChat
```typescript
case "agent_error":
  const newError: ErrorInfo = {
    id: `error-${Date.now()}-${event.data.agentId}`,
    type: "agent_error",
    message: event.data.message || "智能体执行失败",
    timestamp: Date.now(),
    details: event.data.details,
  };
  setErrors((prev) => [...prev, newError]);
  break;
```

### UI 组件

#### 进度条
使用 shadcn/ui 的 `Progress` 组件:
```tsx
<Progress value={progress} className="h-2" />
```

#### 错误提醒
使用 shadcn/ui 的 `Alert` 组件:
```tsx
<Alert variant="destructive">
  <AlertTitle>错误</AlertTitle>
  <AlertDescription>{error.message}</AlertDescription>
</Alert>
```

## 用户体验优化

### 1. 视觉反馈
- 进度条清晰显示当前执行进度
- 错误徽章在顶部醒目位置显示错误数量
- 不同类型错误使用不同颜色区分

### 2. 交互设计
- 错误可单独删除，方便用户管理
- 支持一键清空，快速重置
- 错误详情可展开，不影响主界面

### 3. 空状态处理
- 无错误时显示友好的空状态提示
- 错误面板只在有错误时显示

## 使用示例

### 任务执行
1. 点击"开始执行"按钮
2. 观察顶部进度条更新
3. 如遇错误，右侧会实时显示错误信息
4. 可点击关闭按钮删除单个错误
5. 点击"清空全部"可清除所有错误

### 多智能体对话
1. 发送消息后，观察智能体响应进度
2. 进度条显示已完成的智能体数量
3. 如智能体执行出错，右侧会显示错误面板
4. 错误信息包含智能体ID和错误详情

## 未来优化

1. **错误分类**: 更细致的错误分类和颜色编码
2. **错误重试**: 提供一键重试失败任务的功能
3. **进度持久化**: 刷新页面后保持进度状态
4. **错误导出**: 支持导出错误日志
5. **进度预估**: 基于历史数据预估剩余时间

## 相关文件

- `src/components/task-execution.tsx` - 任务执行组件
- `src/components/conversation-box-chat.tsx` - 多智能体对话盒子组件
- `src/components/ui/progress.tsx` - 进度条组件
- `src/components/ui/alert.tsx` - 警告组件
