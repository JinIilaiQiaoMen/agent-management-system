# 社媒运营模块功能实现说明

## ✅ 已完成的功能

### 1. 数据库表设计

#### social_media_posts (社媒发布表)
- 存储所有社媒发布内容
- 支持定时发布和立即发布
- 记录互动数据（浏览、点赞、评论、分享）
- 支持多个平台

#### social_media_comments (评论表)
- 存储用户评论
- 支持自动回复和手动回复
- 记录回复策略（rule-based, llm, template）
- 情感分析字段

#### user_segments (用户分层表)
- 用户分层（VIP, active, dormant, new, churned）
- 互动评分和等级
- 分层规则匹配
- 统计数据

#### auto_reply_rules (自动回复规则表)
- 关键词匹配规则
- 优先级设置
- 冷却时间控制
- 回复模板

#### segment_rules (分层规则表)
- 自定义分层规则
- 条件配置
- 优先级管理

#### analytics_data (分析数据表)
- 日期级别数据记录
- 各项指标统计
- 趋势分析基础数据

---

### 2. API 端点

#### 评论管理 API

**获取评论列表**
```http
GET /api/social-media/comments?platform=tiktok&status=unreplied&limit=20
```

**回复评论**
```http
POST /api/social-media/comments
Content-Type: application/json

{
  "commentId": "comment-id",
  "replyText": "感谢您的评论！",
  "replyStrategy": "manual"
}
```

**批量自动回复**
```http
POST /api/social-media/comments/batch-auto-reply
Content-Type: application/json

{
  "platform": "tiktok",
  "postId": "post-id"
}
```

---

#### 用户分层 API

**获取用户分层列表**
```http
GET /api/social-media/users/segments?platform=tiktok&segmentType=VIP
```

**手动添加/更新用户分层**
```http
POST /api/social-media/users/segments
Content-Type: application/json

{
  "userId": "user-123",
  "platform": "tiktok",
  "segmentType": "VIP",
  "metadata": {
    "purchaseCount": 10,
    "totalSpent": 5000
  }
}
```

**批量自动分层**
```http
POST /api/social-media/users/segments/batch-classify
Content-Type: application/json

{
  "platform": "tiktok"
}
```

**获取分层统计**
```http
GET /api/social-media/users/segments/stats?platform=tiktok
```

---

#### 分层规则管理 API

**获取分层规则**
```http
GET /api/social-media/users/segment-rules?segmentType=VIP&enabled=true
```

**创建分层规则**
```http
POST /api/social-media/users/segment-rules
Content-Type: application/json

{
  "name": "VIP 用户规则",
  "segmentType": "VIP",
  "platform": "tiktok",
  "conditions": {
    "totalInteractions": { "min": 20 },
    "recentInteractions": { "min": 5 },
    "purchaseCount": { "min": 10 }
  },
  "priority": 100,
  "description": "高价值客户分层"
}
```

**更新分层规则**
```http
PUT /api/social-media/users/segment-rules
Content-Type: application/json

{
  "id": "rule-id",
  "enabled": false
}
```

**删除分层规则**
```http
DELETE /api/social-media/users/segment-rules?id=rule-id
```

---

#### 自动回复规则管理 API

**获取自动回复规则**
```http
GET /api/social-media/reply-rules?platform=tiktok&enabled=true
```

**创建自动回复规则**
```http
POST /api/social-media/reply-rules
Content-Type: application/json

{
  "platform": "tiktok",
  "name": "感谢评论规则",
  "keywords": ["谢谢", "感谢", "棒", "赞"],
  "template": "感谢您的支持！我们会继续努力💪",
  "replyType": "rule",
  "priority": 80,
  "maxReplies": 3,
  "cooldownMinutes": 60
}
```

**更新自动回复规则**
```http
PUT /api/social-media/reply-rules
Content-Type: application/json

{
  "id": "rule-id",
  "enabled": false
}
```

**删除自动回复规则**
```http
DELETE /api/social-media/reply-rules?id=rule-id
```

---

#### 趋势分析 API

**获取概览数据**
```http
GET /api/social-media/analytics?type=overview&platform=tiktok&startDate=2026-02-01&endDate=2026-03-01
```

**获取趋势数据**
```http
GET /api/social-media/analytics?type=trends&platform=tiktok&days=30
```

**获取最佳发布时段**
```http
GET /api/social-media/analytics?type=best-time&platform=tiktok
```

**获取内容类型分析**
```http
GET /api/social-media/analytics?type=content-type&platform=tiktok
```

**AI 趋势预测**
```http
POST /api/social-media/analytics/predict
Content-Type: application/json

{
  "platform": "tiktok",
  "days": 7
}
```

---

### 3. 智能回复功能

#### 自动回复流程

1. **规则匹配优先**
   - 根据关键词匹配规则
   - 按优先级排序
   - 返回匹配的模板

2. **LLM 智能回复**
   - 规则未匹配时调用 LLM
   - 生成个性化回复
   - 保持友好专业的语气

3. **回复策略**
   - `rule` - 基于规则
   - `llm` - AI 生成
   - `template` - 模板回复
   - `manual` - 手动回复

#### 示例代码

```typescript
import { generateAutoReply } from '@/app/api/social-media/comments/route';

// 自动回复评论
const reply = await generateAutoReply(commentId, 'tiktok');

if (reply) {
  console.log('自动回复:', reply);
}
```

---

### 4. 用户分层系统

#### 分层逻辑

```typescript
function classifyUser(userId: string, platform: string): string {
  // 计算互动数据
  const totalInteractions = getTotalInteractions(userId, platform);
  const recentInteractions = getRecentInteractions(userId, 30); // 30天

  // 计算评分
  let score = 0;
  score += Math.min(totalInteractions * 2, 50);
  score += Math.min(recentInteractions * 5, 30);
  score += getPositiveComments(userId, platform).length * 5;

  // 分层规则
  if (totalInteractions >= 20 && recentInteractions >= 5) {
    return 'VIP'; // VIP 用户
  } else if (totalInteractions >= 10 && recentInteractions >= 3) {
    return 'active'; // 活跃用户
  } else if (totalInteractions > 0 && recentInteractions === 0) {
    return 'dormant'; // 沉睡用户
  } else if (totalInteractions === 0) {
    return 'new'; // 新用户
  }

  return 'new';
}
```

#### 分层类型

| 类型 | 条件 | 说明 |
|------|------|------|
| VIP | 互动≥20次，近30天≥5次 | 高价值客户 |
| active | 互动≥10次，近30天≥3次 | 活跃用户 |
| dormant | 有互动，近30天无互动 | 沉睡用户 |
| new | 无互动记录 | 新用户 |
| churned | 长期无互动 | 流失用户 |

---

### 5. 趋势分析

#### 实时数据

- ✅ 概览数据统计
- ✅ 趋势数据（按日期）
- ✅ 最佳发布时段分析
- ✅ 内容类型分析

#### AI 趋势预测

```typescript
// 调用 AI 预测
const response = await fetch('/api/social-media/analytics/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'tiktok',
    days: 7
  })
});

const data = await response.json();

// 预测结果
{
  "trend": "上升",
  "predictions": [
    { "date": "3月3日", "views": 10000, "likes": 500, "comments": 50 },
    ...
  ],
  "insights": ["关键发现1", "关键发现2"],
  "suggestions": ["建议1", "建议2"],
  "risks": ["风险1", "风险2"]
}
```

---

### 6. 使用示例

#### 创建自动回复规则

```typescript
const response = await fetch('/api/social-media/reply-rules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'tiktok',
    name: '产品咨询回复',
    keywords: ['怎么买', '价格', '多少钱', '哪里买'],
    template: '感谢关注！您可以直接点击主页链接购买，或私信我们了解更多详情~ 🛒',
    replyType: 'rule',
    priority: 90,
    maxReplies: 5,
    cooldownMinutes: 30
  })
});
```

#### 批量自动回复评论

```typescript
const response = await fetch('/api/social-media/comments/batch-auto-reply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'tiktok',
    postId: 'post-id'
  })
});

const data = await response.json();
console.log(`成功回复 ${data.results.filter(r => r.success).length} 条评论`);
```

#### 批量用户分层

```typescript
const response = await fetch('/api/social-media/users/segments/batch-classify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'tiktok'
  })
});

const data = await response.json();
console.log(`成功分层 ${data.results.length} 个用户`);
```

#### AI 趋势预测

```typescript
const response = await fetch('/api/social-media/analytics/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'tiktok',
    days: 7
  })
});

const data = await response.json();

console.log('趋势预测:', data.prediction.trend);
console.log('关键发现:', data.prediction.insights);
console.log('建议:', data.prediction.suggestions);
```

---

## 📊 功能完成度

| 功能 | 完成度 | 说明 |
|------|--------|------|
| 自动回复评论 | ✅ 100% | 完全实现 |
| 自动回复私信 | ⚠️ 50% | API 已实现，需要前端 UI |
| LLM 集成 | ✅ 100% | 完全实现 |
| 回复模板管理 | ✅ 100% | 完全实现 |
| 用户分层系统 | ✅ 100% | 完全实现 |
| 分层规则配置 | ✅ 100% | 完全实现 |
| 分层统计 | ✅ 100% | 完全实现 |
| 实时数据 | ✅ 100% | 完全实现 |
| AI 趋势预测 | ✅ 100% | 完全实现 |
| 图表可视化 | ⚠️ 30% | API 已实现，需要前端图表 |

**总体完成度**: 约 90%

---

## 🎯 下一步工作

### 前端 UI 更新

1. **添加评论管理标签页**
   - 评论列表展示
   - 回复功能
   - 批量自动回复

2. **添加用户分层标签页**
   - 分层统计图表
   - 分层规则配置
   - 用户列表

3. **更新趋势分析标签页**
   - 添加图表可视化
   - AI 预测结果展示
   - 实时数据刷新

4. **添加自动回复规则管理**
   - 规则列表
   - 规则创建/编辑
   - 规则测试

### 推荐使用的图表库

- **Recharts** - React 生态，轻量级
- **Chart.js** - 功能强大，易用
- **ECharts** - 功能丰富，适合复杂图表

---

## 📚 相关文档

- [API 端点说明](#api-端点)
- [数据库表设计](#数据库表设计)
- [使用示例](#使用示例)

---

**完成时间**: 2026-03-02
