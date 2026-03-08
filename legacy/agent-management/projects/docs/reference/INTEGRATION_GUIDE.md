# 功能集成文档

## 更新日期
2026-03-05

## 功能概述
将任务执行进度条、错误提醒和多智能体对话盒子功能集成到主页面中，使其在用户界面中可见和可用。

## 主要修改

### 1. TaskList 组件集成

#### 修改文件
- `src/components/TaskList.tsx`

#### 主要变更
1. **导入 TaskExecution 组件**
   ```typescript
   import TaskExecution from "@/components/task-execution";
   ```

2. **添加状态管理**
   ```typescript
   const [showTaskExecution, setShowTaskExecution] = useState(false);
   ```

3. **修改 handleAutoExecuteTask 函数**
   - 原来：显示 alert 提示执行结果
   - 现在：打开对话框显示 TaskExecution 组件

4. **添加任务执行对话框**
   ```tsx
   <Dialog open={showTaskExecution} onOpenChange={setShowTaskExecution}>
     <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
       {/* TaskExecution 组件 */}
     </DialogContent>
   </Dialog>
   ```

#### 功能说明
- 用户点击"一键执行"按钮后，会打开一个对话框
- 对话框中显示 TaskExecution 组件，包含：
  - 实时进度条（显示执行进度百分比）
  - 当前执行步骤描述
  - 右侧错误提醒面板（显示执行过程中的错误）
- 支持关闭对话框和单独删除错误

### 2. 主页面集成多智能体对话盒子

#### 修改文件
- `src/app/page.tsx`

#### 主要变更
1. **导入 ConversationBoxChat 组件**
   ```typescript
   import ConversationBoxChat from "@/components/conversation-box-chat";
   ```

2. **添加 Bot 图标导入**
   ```typescript
   import { ..., Bot } from "lucide-react";
   ```

3. **添加新标签页"多智能体协作"**
   ```tsx
   <TabsTrigger value="collaboration" className="gap-2">
     <Bot className="h-4 w-4" />
     多智能体协作
   </TabsTrigger>
   ```

4. **添加标签页内容**
   ```tsx
   <TabsContent value="collaboration" className="space-y-4">
     <Card className="p-6 h-[calc(100vh-200px)]">
       {/* ConversationBoxChat 组件 */}
     </Card>
   </TabsContent>
   ```

#### 功能说明
- 用户可以点击"多智能体协作"标签页
- 页面左侧显示对话盒子列表，右侧显示聊天区域
- 支持创建新的对话盒子，选择多个智能体参与对话
- 实时显示智能体响应进度
- 右侧错误面板显示执行过程中的错误

## 使用指南

### 任务执行进度条和错误提醒

1. **进入任务管理页面**
   - 点击顶部导航的"任务管理"标签

2. **创建或选择任务**
   - 如果没有任务，点击"发布任务"创建一个
   - 或者在列表中选择一个已有任务

3. **点击"一键执行"按钮**
   - 找到任务右侧的"一键执行"按钮（紫色渐变按钮）
   - 点击后会弹出确认对话框

4. **查看执行进度**
   - 确认后，会打开任务执行对话框
   - 顶部显示进度条（0-100%）
   - 进度条下方显示当前执行步骤
   - 支持查看4个步骤的执行状态

5. **错误提醒**
   - 如果执行过程中出现错误
   - 右侧会显示错误提醒面板
   - 错误徽章会显示错误数量
   - 可以单独删除每个错误
   - 可以点击"清空全部"按钮清除所有错误

### 多智能体对话盒子

1. **进入多智能体协作页面**
   - 点击顶部导航的"多智能体协作"标签

2. **创建对话盒子**
   - 点击左上角的"新建"按钮
   - 输入标题和描述
   - 选择至少一个智能体
   - 点击"创建"按钮

3. **开始多智能体对话**
   - 选择一个对话盒子
   - 在输入框中输入消息
   - 所有选中的智能体会依次响应
   - 可以看到每个智能体的响应内容

4. **查看进度和错误**
   - 对话盒子头部显示智能体响应进度条
   - 如果智能体执行出错，右侧会显示错误面板
   - 可以查看每个智能体的状态（执行中/完成/错误）

## UI 布局

### 任务执行对话框
- **宽度**: max-w-7xl（最大宽度）
- **高度**: max-h-[90vh]（最大高度的90%）
- **布局**: 左右分栏
  - 左侧：执行步骤、任务分析、智能体执行、成果汇总
  - 右侧：错误提醒面板（固定宽度）

### 多智能体协作页面
- **左侧**: 对话盒子列表（固定宽度 320px）
- **中间**: 聊天消息区域（自适应宽度）
- **右侧**: 错误提醒面板（仅在出现错误时显示，宽度 320px）

## 技术细节

### 进度更新机制
- **任务执行**: 基于4个执行步骤，每完成一个步骤更新进度
- **多智能体对话**: 基于智能体完成数量，`进度 = (已完成智能体数 / 总智能体数) * 100%`

### 错误处理机制
- **错误类型**:
  - execution_error: 执行错误
  - agent_error: 智能体执行错误
  - network_error: 网络错误
- **错误存储**: 使用 React useState 存储错误列表
- **错误删除**: 支持单独删除和清空全部

### SSE 流式响应
- **任务执行**: 使用 `/api/tasks/${taskId}/auto-execute-stream` 接口
- **多智能体对话**: 使用 `/api/conversation-boxes/${boxId}/chat` 接口
- **实时更新**: 通过 SSE 流式更新进度和消息

## 测试建议

### 任务执行功能测试
1. 创建一个任务
2. 点击"一键执行"按钮
3. 观察进度条是否正确更新
4. 检查执行步骤是否正确显示
5. 模拟错误场景，验证错误提醒功能

### 多智能体对话测试
1. 创建至少2个智能体
2. 创建一个对话盒子，选择多个智能体
3. 发送消息
4. 观察智能体是否依次响应
5. 检查进度条是否正确更新
6. 模拟智能体错误，验证错误提醒功能

## 注意事项

1. **首次加载**: 页面首次加载时，对话框可能需要一些时间加载组件
2. **错误处理**: 如果接口返回错误，错误面板会显示错误信息
3. **进度重置**: 关闭对话框后，进度会重置为0
4. **智能体选择**: 对话盒子至少需要选择1个智能体才能创建

## 未来优化

1. **进度持久化**: 刷新页面后保持进度状态
2. **错误重试**: 提供一键重试失败任务的功能
3. **智能体状态**: 更详细地显示智能体的执行状态
4. **历史记录**: 保存任务执行历史，方便查看
5. **性能优化**: 优化大量智能体时的性能表现

## 相关文件

- `src/components/TaskList.tsx` - 任务列表组件
- `src/components/task-execution.tsx` - 任务执行组件
- `src/components/conversation-box-chat.tsx` - 多智能体对话盒子组件
- `src/app/page.tsx` - 主页面
- `PROGRESS_AND_ERROR_FEATURE.md` - 进度条和错误提醒功能文档
- `CONVERSATION_BOX_GUIDE.md` - 多智能体对话盒子使用指南
