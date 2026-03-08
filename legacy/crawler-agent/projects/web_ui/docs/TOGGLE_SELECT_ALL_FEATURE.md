# 全选按钮切换功能实现总结

## 功能描述

实现全选按钮的切换功能：单击"全选"选中所有格式，再次单击"取消全选"取消所有格式。

## 实现的功能

### 1. 更新全选按钮HTML ✅

为所有全选按钮添加唯一ID，便于JavaScript控制：

```html
<!-- 图片格式 -->
<a class="format-select-all" id="imageSelectAll" onclick="toggleAllFormats('image')">全选</a>

<!-- 音频格式 -->
<a class="format-select-all" id="audioSelectAll" onclick="toggleAllFormats('audio')">全选</a>

<!-- 视频格式 -->
<a class="format-select-all" id="videoSelectAll" onclick="toggleAllFormats('video')">全选</a>

<!-- 文档格式 -->
<a class="format-select-all" id="docSelectAll" onclick="toggleAllFormats('doc')">全选</a>
```

### 2. 修改toggleAllFormats函数 ✅

**优化前**：
```javascript
function toggleAllFormats(type, selectAll) {
    document.querySelectorAll(`input[name="${type}Formats"]`).forEach(cb => {
        cb.checked = selectAll;
    });
}
```

**优化后**：
```javascript
function toggleAllFormats(type) {
    const checkboxes = document.querySelectorAll(`input[name="${type}Formats"]`);
    const selectAllBtn = document.getElementById(`${type}SelectAll`);

    // 检查是否全部选中
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    // 如果全部选中，则反选；否则全选
    const shouldSelectAll = !allChecked;

    // 设置所有复选框状态
    checkboxes.forEach(cb => {
        cb.checked = shouldSelectAll;
    });

    // 更新按钮文本
    if (selectAllBtn) {
        selectAllBtn.textContent = shouldSelectAll ? '取消全选' : '全选';
    }
}
```

**功能说明**：
- 自动检测当前所有复选框的状态
- 如果全部选中，则执行反选（取消全选）
- 如果有未选中的，则执行全选
- 动态更新按钮文本（"全选" ↔ "取消全选"）

### 3. 新增updateSelectAllButton函数 ✅

```javascript
// 更新全选按钮状态
function updateSelectAllButton(type) {
    const checkboxes = document.querySelectorAll(`input[name="${type}Formats"]`);
    const selectAllBtn = document.getElementById(`${type}SelectAll`);

    if (!selectAllBtn) return;

    // 检查是否全部选中
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    // 更新按钮文本
    selectAllBtn.textContent = allChecked ? '取消全选' : '全选';
}
```

**功能说明**：
- 检查指定类型的所有复选框状态
- 根据状态更新全选按钮的文本
- 用于初始化和动态更新

### 4. 新增setupFormatCheckboxes函数 ✅

```javascript
// 监听复选框变化，更新全选按钮状态
function setupFormatCheckboxes() {
    ['image', 'audio', 'video', 'doc'].forEach(type => {
        const checkboxes = document.querySelectorAll(`input[name="${type}Formats"]`);
        const selectAllBtn = document.getElementById(`${type}SelectAll`);

        if (!selectAllBtn) return;

        // 为每个复选框添加事件监听
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // 检查是否全部选中
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);

                // 更新按钮文本
                selectAllBtn.textContent = allChecked ? '取消全选' : '全选';
            });
        });
    });
}
```

**功能说明**：
- 为所有格式的复选框添加change事件监听
- 当用户手动点击复选框时，自动更新全选按钮状态
- 确保全选按钮始终反映当前的实际状态

### 5. 更新loadDefaultConfig函数 ✅

在加载默认配置后，更新全选按钮状态：

```javascript
async function loadDefaultConfig() {
    try {
        const response = await fetch('/api/config/default');
        const config = await response.json();

        // 设置复选框格式
        setCheckboxFormats('image', config.image_types || []);
        setCheckboxFormats('audio', config.audio_types || []);
        setCheckboxFormats('video', config.video_types || []);
        setCheckboxFormats('doc', config.doc_types || []);

        // 更新全选按钮状态
        updateSelectAllButton('image');
        updateSelectAllButton('audio');
        updateSelectAllButton('video');
        updateSelectAllButton('doc');

        // ... 其他配置加载
    } catch (error) {
        console.error('加载配置失败:', error);
    }
}
```

**功能说明**：
- 加载默认配置后，更新全选按钮状态
- 确保按钮文本与实际的复选框状态一致

### 6. 更新addCustomFormat函数 ✅

在添加自定义格式后，为新复选框添加事件监听并更新全选按钮：

```javascript
function addCustomFormat(type) {
    // ... 格式验证和创建

    // 为新复选框添加事件监听
    checkbox.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll(`input[name="${type}Formats"]`);
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        const selectAllBtn = document.getElementById(`${type}SelectAll`);
        if (selectAllBtn) {
            selectAllBtn.textContent = allChecked ? '取消全选' : '全选';
        }
    });

    // 更新全选按钮状态
    updateSelectAllButton(type);

    // ... 其他处理
}
```

**功能说明**：
- 为新添加的自定义格式复选框添加change事件监听
- 确保新格式也能正常触发全选按钮状态更新
- 添加后立即更新全选按钮状态

### 7. 初始化设置 ✅

在页面初始化时调用setupFormatCheckboxes：

```javascript
// 初始化
setupTabs();
loadDefaultConfig();
setupFormatCheckboxes(); // 设置格式复选框监听
updateStatus();
setInterval(updateStatus, 2000); // 每2秒更新状态
```

**功能说明**：
- 在页面加载完成后初始化格式复选框监听
- 确保所有复选框的change事件都能被正确捕获

## 功能特点

### 1. 智能切换 ✅

- 自动检测当前状态
- 全选 ↔ 取消全选智能切换
- 无需手动指定操作类型

### 2. 实时反馈 ✅

- 按钮文本动态更新
- 始终反映当前实际状态
- 用户体验清晰明了

### 3. 双向同步 ✅

- 通过全选按钮改变状态，复选框同步更新
- 通过点击复选框改变状态，全选按钮同步更新
- 状态始终保持一致

### 4. 完整覆盖 ✅

- 覆盖四种格式类型（图片、音频、视频、文档）
- 覆盖默认配置加载
- 覆盖自定义格式添加
- 覆盖所有复选框交互

## 使用场景

### 场景1：全选所有格式

```
用户操作：点击"全选"按钮
系统响应：
  1. 检测到当前有未选中的格式
  2. 选中所有格式
  3. 按钮文本变为"取消全选"
```

### 场景2：取消全选

```
用户操作：再次点击"取消全选"按钮
系统响应：
  1. 检测到当前所有格式都已选中
  2. 取消选中所有格式
  3. 按钮文本变为"全选"
```

### 场景3：手动点击复选框

```
用户操作：手动点击某个格式复选框
系统响应：
  1. 触发change事件
  2. 重新检查所有格式状态
  3. 更新全选按钮文本
```

### 场景4：添加自定义格式

```
用户操作：添加自定义格式
系统响应：
  1. 创建新的复选框
  2. 为新复选框添加事件监听
  3. 更新全选按钮状态
```

## 对比

### 优化前

```
功能：只能全选，不能反选
操作：单击全选按钮 → 所有格式选中
     再次单击 → 无反应或需要重新点击
用户体验：不直观，容易混淆
```

### 优化后

```
功能：全选 ↔ 取消全选智能切换
操作：单击"全选" → 所有格式选中
     再次单击"取消全选" → 取消所有格式
     点击单个复选框 → 全选按钮自动更新
用户体验：直观清晰，操作便捷
```

## 技术亮点

### 1. 状态自动检测

使用 `Array.every()` 方法检测是否全部选中：

```javascript
const allChecked = Array.from(checkboxes).every(cb => cb.checked);
```

### 2. 事件监听统一管理

使用 `setupFormatCheckboxes` 函数统一管理所有复选框的事件监听：

```javascript
setupFormatCheckboxes();
```

### 3. 动态更新机制

在多个关键点更新全选按钮状态：
- 初始化时
- 加载默认配置后
- 添加自定义格式后
- 复选框状态改变时

### 4. 代码复用

提取 `updateSelectAllButton` 函数，在多处复用，避免重复代码。

## 测试要点

### 功能测试

- ✅ 点击"全选"按钮，所有格式被选中
- ✅ 再次点击"取消全选"，所有格式被取消
- ✅ 手动取消某个格式，按钮文本变为"全选"
- ✅ 手动选择所有格式，按钮文本变为"取消全选"
- ✅ 添加自定义格式后，全选按钮正常工作
- ✅ 加载默认配置后，按钮状态正确

### 边界测试

- ✅ 没有选中任何格式时，点击全选
- ✅ 全部选中时，点击取消全选
- ✅ 部分选中时，点击全选
- ✅ 只有一个格式时的全选/取消全选
- ✅ 添加自定义格式后的全选/取消全选

## 文件修改清单

- ✅ `web_ui/templates/index.html`
  - 更新所有全选按钮的HTML，添加ID
  - 修改 toggleAllFormats 函数
  - 新增 updateSelectAllButton 函数
  - 新增 setupFormatCheckboxes 函数
  - 更新 loadDefaultConfig 函数
  - 更新 addCustomFormat 函数
  - 更新初始化代码

## 总结

成功实现了全选按钮的切换功能：

- ✅ 单击"全选"选中所有格式
- ✅ 再次单击"取消全选"取消所有格式
- ✅ 按钮文本动态更新
- ✅ 复选框状态实时同步
- ✅ 支持手动点击复选框
- ✅ 支持自定义格式
- ✅ 覆盖所有格式类型
- ✅ 代码结构清晰，易于维护

所有功能已实现并测试通过！🎉
