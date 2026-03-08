# 布局改进文档

## 改进日期
2026-03-05

## 用户需求
用户希望任务执行进度显示在任务管理页面的右侧，而不是弹出对话框。这样可以在查看任务列表的同时监控任务执行进度。

## 改进内容

### 修改文件
- `src/components/TaskList.tsx`

### 主要变更

#### 1. 布局从垂直改为左右分栏
**之前**: 垂直布局，任务列表占据整个宽度
```tsx
<div className="space-y-4">
  {/* 任务列表 */}
</div>
```

**之后**: 左右分栏布局
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* 左侧：任务列表 */}
  <div className="lg:col-span-2 space-y-4">
    {/* 过滤器和任务列表 */}
  </div>

  {/* 右侧：任务执行面板 */}
  {showTaskExecution && autoExecutingTaskId && (
    <div className="lg:col-span-1">
      {/* TaskExecution 组件 */}
    </div>
  )}
</div>
```

#### 2. 移除对话框组件
**移除的导入**:
```typescript
// 移除
import { Dialog, DialogContent } from "@/components/ui/dialog";
```

**移除的代码**:
```typescript
// 移除整个 Dialog 组件
<Dialog open={showTaskExecution} onOpenChange={handleCloseExecutionDialog}>
  <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
    {/* ... */}
  </DialogContent>
</Dialog>
```

#### 3. 添加执行面板到右侧
**新增的导入**:
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
```

**新增的代码**:
```tsx
{showTaskExecution && autoExecutingTaskId && (
  <div className="lg:col-span-1">
    <Card className="sticky top-6 h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">任务执行监控</CardTitle>
            <CardDescription>实时查看任务执行进度</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              if (executionStatus === "running") {
                const confirmed = window.confirm(
                  "任务正在执行中，关闭面板将中断任务执行。\n\n" +
                  "确定要关闭吗？"
                );
                if (!confirmed) return;
              }
              setShowTaskExecution(false);
              setTimeout(() => {
                setAutoExecutingTaskId(null);
                setExecutionStatus("idle");
              }, 300);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2">
          <TaskExecution 
            taskId={autoExecutingTaskId} 
            onStatusChange={setExecutionStatus}
          />
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

#### 4. 移除不需要的函数
**移除的函数**:
```typescript
// 移除这个函数，因为关闭逻辑直接在按钮中处理
const handleCloseExecutionDialog = () => {
  // ...
};
```

## 布局特性

### 响应式设计
- **大屏幕 (lg+)**: 3列布局，左侧2列（任务列表），右侧1列（执行面板）
- **小屏幕**: 1列布局，任务列表和执行面板垂直排列

### 执行面板特性
- **条件显示**: 只有在有任务执行时才显示
- **固定高度**: `h-[calc(100vh-200px)]` 确保在视口内可见
- **粘性定位**: `sticky top-6` 滚动时保持在视口顶部
- **内部滚动**: 内容超出时可以独立滚动

### 用户体验优化
- **一键关闭**: 右上角关闭按钮，带执行中警告
- **实时更新**: 通过 `onStatusChange` 回调保持状态同步
- **无弹窗干扰**: 不再弹出对话框，避免遮挡任务列表

## 对比

### 之前的布局
```
┌─────────────────────────────────────┐
│           任务管理                   │
├─────────────────────────────────────┤
│  [过滤器]                           │
│  ┌───────────────────────────────┐  │
│  │ 任务1                         │  │
│  │ 任务2                         │  │
│  │ 任务3                         │  │
│  └───────────────────────────────┘  │
│                                     │
│  [点击一键执行] → 弹出对话框         │
└─────────────────────────────────────┘
```

### 之后的布局
```
┌─────────────────────────────────────┐
│           任务管理                   │
├──────────────────┬──────────────────┤
│  [过滤器]        │ 任务执行监控      │
│  ┌─────────────┐ │ ┌──────────────┐ │
│  │ 任务1       │ │ │ 进度条       │ │
│  │ 任务2       │ │ │ 执行步骤     │ │
│  │ 任务3       │ │ │ 错误提醒     │ │
│  │ [一键执行]  │ │ │              │ │
│  └─────────────┘ │ └──────────────┘ │
└──────────────────┴──────────────────┘
```

## 使用流程

### 启动任务执行
1. 在任务列表中找到要执行的任务
2. 点击"一键执行"按钮
3. 右侧自动显示任务执行监控面板
4. 任务开始执行，可以实时查看进度

### 监控任务执行
1. 查看进度条了解整体进度（0-100%）
2. 查看当前执行步骤
3. 查看任务分析、智能体执行、成果汇总等详细信息
4. 如有错误，右侧面板内部会显示错误提醒

### 关闭执行面板
1. 点击右上角的 X 按钮
2. 如果任务正在执行，会弹出警告
3. 确认后关闭面板，任务会中断
4. 可以再次点击"一键执行"重新开始

## 技术细节

### 布局系统
- 使用 CSS Grid 布局
- 响应式断点：`lg` (1024px)
- 列比例：2:1 (任务列表:执行面板)

### 样式类
```tsx
// 主容器
grid grid-cols-1 lg:grid-cols-3 gap-6

// 左侧任务列表
lg:col-span-2 space-y-4

// 右侧执行面板
lg:col-span-1
sticky top-6 h-[calc(100vh-200px)]
```

### 状态管理
- `showTaskExecution`: 控制执行面板显示
- `autoExecutingTaskId`: 当前执行的任务ID
- `executionStatus`: 任务执行状态

## 优势

1. **更好的空间利用**
   - 不再弹出对话框占用整个屏幕
   - 可以同时查看任务列表和执行进度

2. **更流畅的用户体验**
   - 不需要在不同界面之间切换
   - 执行面板始终可见，方便监控

3. **更清晰的上下文**
   - 可以看到任务列表中的其他任务
   - 不会丢失任务管理的上下文

4. **更灵活的布局**
   - 响应式设计适应不同屏幕尺寸
   - 执行面板可以独立滚动

## 注意事项

1. **执行面板高度**
   - 固定高度确保内容可见
   - 内部滚动避免页面整体滚动

2. **关闭警告**
   - 执行中关闭会中断任务
   - 需要用户明确确认

3. **状态同步**
   - 使用 `onStatusChange` 回调保持状态
   - 确保面板和组件状态一致

## 未来优化方向

1. **可调整面板宽度**
   - 允许用户拖动调整左右分栏宽度
   - 保存用户的宽度偏好

2. **多任务并行监控**
   - 支持同时监控多个任务执行
   - 使用 Tab 或分屏显示

3. **迷你进度指示器**
   - 在任务列表中显示小进度条
   - 方便快速查看所有任务状态

4. **历史执行记录**
   - 保存历史执行记录
   - 可以查看之前的执行结果

## 测试验证

### 测试场景 1：正常执行
1. 创建任务
2. 点击"一键执行"
3. 验证右侧面板显示
4. 验证进度条更新
5. 验证任务完成后可以关闭面板

### 测试场景 2：响应式布局
1. 在大屏幕上验证左右分栏
2. 调整窗口到小屏幕
3. 验证布局变为垂直排列
4. 调整回大屏幕，验证恢复左右分栏

### 测试场景 3：关闭面板
1. 启动任务执行
2. 在执行中点击关闭按钮
3. 验证弹出警告
4. 取消关闭，验证面板保持显示
5. 确认关闭，验证面板消失

## 相关文件

- `src/components/TaskList.tsx` - 任务列表组件
- `src/components/task-execution.tsx` - 任务执行组件
- `PROGRESS_AND_ERROR_FEATURE.md` - 进度条和错误提醒功能文档

## 总结

通过将任务执行面板从对话框改为右侧固定面板，显著提升了用户体验：

- ✅ 不再弹出对话框，避免遮挡任务列表
- ✅ 可以同时查看任务列表和执行进度
- ✅ 执行面板固定位置，滚动时保持可见
- ✅ 响应式设计适应不同屏幕尺寸
- ✅ 保持执行中警告功能，避免意外中断

这种布局更适合长时间监控任务执行，用户可以一边查看任务列表，一边监控执行进度，大大提升了工作效率。
