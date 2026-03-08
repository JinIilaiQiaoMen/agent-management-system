# Bug 修复文档

## 修复日期
2026-03-05

## 问题描述

### 问题 1：对话框关闭后无法重新打开
**症状**: 点击"一键执行"按钮后，弹出对话框显示执行进度，关闭对话框后，再次点击"一键执行"按钮无法打开对话框，按钮显示为 disabled 状态。

**根本原因**:
- `handleAutoExecuteTask` 函数设置了 `setAutoExecutingTaskId(taskId)`，这会禁用按钮
- 关闭对话框时，只设置了 `setShowTaskExecution(false)`，但没有重置 `autoExecutingTaskId`
- 导致按钮一直保持 disabled 状态，无法再次点击

### 问题 2：切换界面时任务会中断
**症状**: 在任务执行过程中，切换到其他界面或关闭对话框，任务会自动中断，无法继续执行。

**根本原因**:
- TaskExecution 组件使用 SSE (Server-Sent Events) 连接后端获取实时进度
- 当组件卸载（关闭对话框或切换界面）时，SSE 连接断开
- 后端任务可能还在继续执行，但前端无法获取实时更新
- 用户不知道任务会中断，用户体验差

## 解决方案

### 修复 1：对话框关闭后无法重新打开

**修改文件**: `src/components/TaskList.tsx`

**修改内容**:

1. 添加 `handleCloseExecutionDialog` 函数：
```typescript
const handleCloseExecutionDialog = () => {
  // 检查任务是否正在执行（见修复2）
  if (executionStatus === "running") {
    const confirmed = window.confirm(
      "任务正在执行中，关闭对话框将中断任务执行。\n\n" +
      "确定要关闭吗？\n\n" +
      "建议：\n" +
      "- 等待任务完成后再关闭\n" +
      "- 如果关闭，可以再次点击'一键执行'重新开始"
    );
    if (!confirmed) {
      return; // 不关闭
    }
  }

  setShowTaskExecution(false);
  // 延迟重置状态，确保动画完成
  setTimeout(() => {
    setAutoExecutingTaskId(null);
    setExecutionStatus("idle");
  }, 300);
};
```

2. 修改 Dialog 组件：
```tsx
<Dialog open={showTaskExecution} onOpenChange={handleCloseExecutionDialog}>
  {/* ... */}
</Dialog>
```

3. 修改关闭按钮：
```tsx
<Button variant="ghost" size="icon" onClick={handleCloseExecutionDialog}>
  <X className="h-4 w-4" />
</Button>
```

**修复效果**:
- 关闭对话框时会重置 `autoExecutingTaskId`，按钮恢复可用状态
- 用户可以再次点击"一键执行"按钮

### 修复 2：切换界面时任务中断警告

**修改文件**:
- `src/components/task-execution.tsx`
- `src/components/TaskList.tsx`

**修改内容**:

1. TaskExecution 组件添加状态回调：
```typescript
interface TaskExecutionProps {
  taskId: string;
  onStatusChange?: (status: "idle" | "running" | "completed" | "error") => void;
}

export default function TaskExecution({ taskId, onStatusChange }: TaskExecutionProps) {
  // ...

  // 监听状态变化，通知父组件
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  // ...
}
```

2. TaskList 组件跟踪执行状态：
```typescript
const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
```

3. 在关闭对话框时检查执行状态：
```typescript
const handleCloseExecutionDialog = () => {
  // 检查任务是否正在执行
  if (executionStatus === "running") {
    const confirmed = window.confirm(
      "任务正在执行中，关闭对话框将中断任务执行。\n\n" +
      "确定要关闭吗？\n\n" +
      "建议：\n" +
      "- 等待任务完成后再关闭\n" +
      "- 如果关闭，可以再次点击'一键执行'重新开始"
    );
    if (!confirmed) {
      return; // 不关闭
    }
  }

  setShowTaskExecution(false);
  // ...
};
```

4. 传递状态回调给 TaskExecution 组件：
```tsx
<TaskExecution 
  taskId={autoExecutingTaskId} 
  onStatusChange={setExecutionStatus}
/>
```

**修复效果**:
- 当任务正在执行时，关闭对话框会弹出警告
- 用户可以选择取消关闭，继续等待任务完成
- 用户了解关闭对话框的后果，避免意外中断

## 技术细节

### 状态管理
- `autoExecutingTaskId`: 当前执行中的任务ID，用于禁用按钮
- `showTaskExecution`: 控制对话框显示/隐藏
- `executionStatus`: 任务执行状态（idle/running/completed/error）

### 组件通信
- TaskExecution 组件通过 `onStatusChange` 回调通知父组件状态变化
- 父组件根据状态决定是否允许关闭对话框

### 用户体验优化
- 关闭对话框时延迟重置状态（300ms），确保动画完成
- 清晰的警告信息，告知用户后果和建议操作
- 允许用户取消关闭操作

## 使用说明

### 正常使用流程
1. 点击"一键执行"按钮
2. 确认执行对话框
3. 查看实时执行进度
4. 等待任务完成
5. 任务完成后，可以安全关闭对话框

### 任务执行中关闭对话框
1. 如果任务正在执行，点击关闭按钮或对话框外区域
2. 会弹出警告对话框
3. 选择：
   - **取消**: 继续查看任务执行
   - **确定**: 关闭对话框，任务会中断
4. 如果关闭，可以再次点击"一键执行"重新开始

## 注意事项

1. **任务中断无法恢复**: 由于后端不支持状态恢复，任务一旦中断只能重新执行
2. **建议等待完成**: 为了获得完整的执行结果，建议等待任务完成后再关闭对话框
3. **进度重置**: 关闭对话框后，进度条和执行状态会重置

## 未来改进方向

1. **后端支持状态持久化**
   - 将任务执行状态保存到数据库
   - 支持查询和恢复执行状态
   - 前端重新打开对话框时可以恢复进度

2. **后台任务执行**
   - 支持任务在后台继续执行
   - 前端可以随时查看任务状态
   - 任务完成后发送通知

3. **任务历史记录**
   - 保存每次执行的日志和结果
   - 支持查看历史执行记录
   - 支持对比不同执行结果

4. **断点续传**
   - 支持从中断的位置继续执行
   - 减少重复计算和资源浪费

## 测试验证

### 测试场景 1：正常执行完成
1. 创建任务
2. 点击"一键执行"
3. 等待任务完成
4. 关闭对话框
5. 再次点击"一键执行"，确认可以打开

### 测试场景 2：执行中关闭并取消
1. 创建任务
2. 点击"一键执行"
3. 在执行过程中点击关闭
4. 在警告对话框中选择"取消"
5. 确认对话框未关闭，任务继续执行

### 测试场景 3：执行中关闭并确认
1. 创建任务
2. 点击"一键执行"
3. 在执行过程中点击关闭
4. 在警告对话框中选择"确定"
5. 确认对话框关闭
6. 再次点击"一键执行"，确认可以重新执行

## 相关文件

- `src/components/TaskList.tsx` - 任务列表组件
- `src/components/task-execution.tsx` - 任务执行组件
- `src/app/api/tasks/[id]/auto-execute-stream/route.ts` - 自动执行接口

## 修复总结

通过这两个修复，解决了用户体验中的两个主要问题：

1. **修复对话框关闭后无法重新打开的问题**
   - 现在关闭对话框后，按钮会恢复可用状态
   - 用户可以随时重新打开对话框查看执行情况

2. **添加任务执行中断警告**
   - 在任务执行中关闭对话框时，会弹出警告
   - 用户可以清楚地了解关闭的后果
   - 避免意外中断任务执行

这些改进显著提升了用户体验，让用户能够更好地管理任务执行过程。
