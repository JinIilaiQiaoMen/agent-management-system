# 国内全渠道发布 - 高级功能文档

## 新增功能概述

本次更新添加了以下高级功能，极大提升了发布效率和用户体验：

1. ✅ **发布预览功能** - 实时预览发布效果
2. ✅ **图片/视频上传** - 支持多媒体内容
3. ✅ **话题标签推荐** - 智能标签建议
4. ✅ **批量发布** - 一次发布到多个平台
5. ✅ **发布模板** - 保存和复用发布模板
6. ✅ **草稿保存** - 自动保存未完成的发布
7. ✅ **发布历史详情** - 查看详细发布记录
8. ✅ **发布效果追踪** - 追踪发布效果数据

## 功能详解

### 1. 发布预览功能

**组件**：`PublishPreview`

**功能**：
- 实时预览发布内容在平台上的展示效果
- 支持不同平台样式的预览
- 展示商品信息、图片、视频、话题标签等
- 显示平台特性和支持的内容类型

**使用方式**：
```tsx
<PublishPreview
  platformId="taobao"
  contentType="product"
  title="商品标题"
  content="商品描述"
  mediaUrls={["image1.jpg", "image2.jpg"]}
  hashtags={["好物", "推荐"]}
  productInfo={{ price: "99", originalPrice: "199" }}
/>
```

### 2. 图片/视频上传

**组件**：`MediaUploader`

**功能**：
- 支持图片和视频上传
- 最多上传9个文件
- 单个文件最大10MB
- 本地预览上传的媒体
- 支持删除已上传的媒体
- 自动识别图片和视频类型

**使用方式**：
```tsx
<MediaUploader
  mediaUrls={mediaUrls}
  onMediaChange={(urls) => setMediaUrls(urls)}
  maxCount={9}
  maxSize={10}
  accept="image/*,video/*"
/>
```

### 3. 话题标签推荐

**组件**：`HashtagSuggester`

**功能**：
- 智能推荐相关话题标签
- 根据平台和内容类型推荐
- 支持手动输入标签
- 自动完成建议
- 显示已选标签，支持删除
- 标签去重处理

**推荐标签逻辑**：
- 基础标签：热门、推荐、新品、优惠等
- 平台标签：根据不同平台推荐特定标签
- 内容类型标签：根据内容类型推荐相关标签

**使用方式**：
```tsx
<HashtagSuggester
  selectedHashtags={hashtags}
  onHashtagChange={(tags) => setHashtags(tags)}
  platform="taobao"
  contentType="product"
/>
```

### 4. 批量发布

**API端点**：`POST /api/domestic-platforms/batch-publish`

**功能**：
- 一次发布到多个平台
- 单次最多支持20个平台
- 返回每个平台的发布结果
- 统计成功和失败数量

**请求示例**：
```json
{
  "items": [
    {
      "platform": "taobao",
      "contentType": "product",
      "title": "商品标题",
      "content": "商品描述",
      "hashtags": ["好物"],
      "productInfo": { "price": "99" }
    },
    {
      "platform": "jd",
      "contentType": "product",
      "title": "商品标题",
      "content": "商品描述",
      "hashtags": ["好物"],
      "productInfo": { "price": "99" }
    }
  ]
}
```

**响应示例**：
```json
{
  "success": true,
  "total": 2,
  "successCount": 2,
  "failedCount": 0,
  "results": [
    {
      "success": true,
      "index": 0,
      "platform": "taobao",
      "postId": "taobao_123",
      "status": "published",
      "message": "成功发布到淘宝"
    },
    {
      "success": true,
      "index": 1,
      "platform": "jd",
      "postId": "jd_456",
      "status": "published",
      "message": "成功发布到京东"
    }
  ]
}
```

### 5. 发布模板

**API端点**：
- `GET /api/domestic-platforms/templates` - 获取模板列表
- `POST /api/domestic-platforms/templates` - 创建模板
- `DELETE /api/domestic-platforms/templates?id=xxx` - 删除模板

**功能**：
- 保存常用发布内容为模板
- 支持按平台和内容类型筛选
- 快速使用模板创建发布
- 管理和删除模板

**模板结构**：
```typescript
{
  id: string;
  name: string;
  platform: string;
  contentType: string;
  title?: string;
  content: string;
  hashtags: string[];
  productInfo?: {
    price?: string;
    originalPrice?: string;
    stock?: string;
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

**使用场景**：
- 重复使用的商品描述
- 标准化的推广文案
- 节日活动模板
- 品牌宣传模板

### 6. 草稿保存

**API端点**：
- `GET /api/domestic-platforms/drafts` - 获取草稿列表
- `POST /api/domestic-platforms/drafts` - 保存或更新草稿
- `DELETE /api/domestic-platforms/drafts?id=xxx` - 删除草稿

**功能**：
- 自动保存未完成的发布内容
- 支持编辑和删除草稿
- 按更新时间排序
- 从草稿快速创建发布

**草稿结构**：
```typescript
{
  id: string;
  platform: string;
  contentType: string;
  title?: string;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  productInfo?: { ... };
  scheduledTime?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 7. 发布历史详情

**功能**：
- 查看详细的发布记录
- 支持按平台、状态、时间筛选
- 显示发布内容和结果
- 支持重新发布失败的内容

**使用方式**：
1. 在发布计划列表中点击记录
2. 查看详细信息弹窗
3. 可以复制内容重新发布

### 8. 发布效果追踪

**功能**：
- 追踪发布后的效果数据
- 显示浏览量、点赞数、评论数等
- 分析发布效果趋势
- 生成效果报告

**数据指标**：
- 浏览量 (Views)
- 点赞数 (Likes)
- 评论数 (Comments)
- 分享数 (Shares)
- 转化率 (Conversion Rate)
- ROI (Return on Investment)

## 使用指南

### 创建发布（增强版）

1. **选择平台**
   - 单个发布：选择一个平台
   - 批量发布：选择多个平台

2. **填写内容**
   - 标题（电商商品必填）
   - 内容描述
   - 商品信息（价格、库存、分类）

3. **上传媒体**
   - 点击上传区域或拖拽文件
   - 支持图片和视频
   - 最多9个文件

4. **添加标签**
   - 从推荐标签中选择
   - 手动输入自定义标签
   - 标签会自动添加 # 前缀

5. **预览效果**
   - 点击"预览"按钮
   - 查看实际展示效果
   - 调整内容直到满意

6. **保存为模板**（可选）
   - 点击"保存为模板"
   - 输入模板名称
   - 模板会保存到模板库

7. **设置定时**（可选）
   - 选择发布时间
   - 支持精确到分钟

8. **发布**
   - 立即发布：点击"立即发布"
   - 批量发布：选择多个平台后点击"批量发布"

### 批量发布流程

1. 点击"批量发布"按钮
2. 选择要发布的平台（最多20个）
3. 填写统一的内容
4. 可以为每个平台自定义内容
5. 点击"开始批量发布"
6. 查看发布进度和结果
7. 处理失败的发布

### 使用模板

1. 点击"使用模板"
2. 从模板列表中选择模板
3. 模板内容会自动填充
4. 可以修改内容
5. 完成发布

### 管理草稿

1. 点击"草稿箱"
2. 查看所有草稿
3. 点击草稿继续编辑
4. 完成后发布
5. 可以删除不需要的草稿

## API 接口汇总

### 发布相关
- `POST /api/domestic-platforms/publish` - 单个发布
- `POST /api/domestic-platforms/batch-publish` - 批量发布

### 模板管理
- `GET /api/domestic-platforms/templates` - 获取模板列表
- `POST /api/domestic-platforms/templates` - 创建模板
- `DELETE /api/domestic-platforms/templates` - 删除模板

### 草稿管理
- `GET /api/domestic-platforms/drafts` - 获取草稿列表
- `POST /api/domestic-platforms/drafts` - 保存草稿
- `DELETE /api/domestic-platforms/drafts` - 删除草稿

### 历史记录
- `GET /api/domestic-platforms/history` - 获取发布历史
- `DELETE /api/domestic-platforms/history` - 删除历史记录

### 数据统计
- `GET /api/domestic-platforms/analytics` - 获取统计数据
- `GET /api/domestic-platforms/analytics/{id}` - 获取单个发布详情

## 最佳实践

### 1. 内容优化

- **标题**：简洁明了，包含关键词
- **描述**：详细但不冗长，突出卖点
- **图片**：高质量，多角度展示
- **标签**：3-5个相关标签
- **价格**：有竞争力的价格策略

### 2. 批量发布策略

- **统一内容**：适合简单商品推广
- **差异化内容**：根据平台特点调整
- **时间安排**：错峰发布，避免平台限制
- **数量控制**：单次不超过20个平台

### 3. 模板使用

- **标准化**：建立内容模板库
- **分类管理**：按产品类型分类
- **定期更新**：保持模板时效性
- **测试优化**：不断优化模板效果

### 4. 草稿管理

- **及时保存**：避免内容丢失
- **定期清理**：删除无用草稿
- **命名规范**：便于查找
- **批量操作**：提高效率

## 注意事项

1. **媒体限制**：
   - 单个文件最大10MB
   - 最多9个文件
   - 支持格式：图片（jpg, png, gif, webp）、视频（mp4, webm, ogg, mov）

2. **批量限制**：
   - 单次最多20个平台
   - 需要考虑API调用频率限制
   - 建议分批发布大量内容

3. **模板限制**：
   - 模板数量无限制（演示模式）
   - 模板内容可编辑后发布
   - 模板删除后不可恢复

4. **草稿限制**：
   - 草稿数量无限制（演示模式）
   - 草稿保存时间无限制
   - 建议定期清理

## 常见问题

### Q: 上传的媒体可以修改顺序吗？

**A**: 当前版本暂不支持修改媒体顺序，建议按顺序上传。后续版本会添加拖拽排序功能。

### Q: 批量发布时可以为不同平台设置不同内容吗？

**A**: 可以。在批量发布界面，可以选择为每个平台单独设置内容。

### Q: 模板和草稿有什么区别？

**A**:
- **模板**：保存的是可复用的内容模板，不包含特定发布信息
- **草稿**：保存的是未完成的发布内容，包含所有发布信息

### Q: 发布失败的数据会保存吗？

**A**: 不会。建议使用草稿功能保存重要内容，避免数据丢失。

### Q: 可以设置定时批量发布吗？

**A**: 可以。在批量发布时，可以为每个平台单独设置发布时间。

## 开发计划

- [ ] 支持拖拽排序媒体文件
- [ ] 添加媒体编辑功能
- [ ] 支持从URL导入图片
- [ ] 添加模板分享功能
- [ ] 实现AI自动生成内容
- [ ] 添加数据分析图表
- [ ] 支持导出发布报告
- [ ] 添加团队协作功能

## 技术支持

如有问题或建议，请联系技术支持团队。
