# 宠物用品内容生成 Agent - 使用说明

## 功能介绍

这是一个基于 AI 的宠物用品内容生成工具，可以自动生成适合不同平台的营销文案和产品描述。

## 支持的平台

1. **TikTok** - 短视频文案，活泼有趣，包含话题标签
2. **Instagram** - 精致图文，温暖感性，适合品牌展示
3. **YouTube** - 视频标题和描述，SEO 优化
4. **亚马逊** - Listing 优化，包含标题、五点描述、后台关键词
5. **独立站** - 品牌化产品描述，有故事感

## 使用方法

### 方式一：快速体验（推荐）

1. 点击"填充示例数据"按钮，系统会自动填充示例产品信息
2. 选择目标平台（TikTok、Instagram、YouTube、亚马逊、独立站）
3. 选择语言和目标受众
4. 点击"生成内容"按钮
5. 等待 AI 生成完成（通常 3-5 秒）
6. 查看生成结果，可以复制或下载为文本文件

### 方式二：自定义产品

1. 手动填写产品信息：
   - 产品名称
   - 产品描述
   - 产品类别（玩具、食品、用品、服饰、医疗）
   - 目标宠物（狗、猫、鸟、小宠）
   - 产品特性（每行一个）
2. 选择发布平台和语言
3. 点击"生成内容"

## API 接口

### POST /api/pet-content/demo

快速生成演示内容，适合前端展示和测试。

**请求体：**
```json
{
  "productName": "Interactive Dog Toy",
  "description": "自动弹跳球，激发狗狗猎奇本能",
  "platform": "tiktok",
  "language": "en",
  "audience": "Dog owners who want to keep pets active"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "type": "caption",
    "platform": "tiktok",
    "language": "en",
    "content": "生成的完整内容...",
    "metadata": {
      "hashtags": ["#dogtoy", "#petlovers", ...]
    },
    "modelUsed": "doubao-lite-1.5-pro",
    "cost": 0.001,
    "cached": false
  }
}
```

### POST /api/pet-content/generate

完整的内容生成接口，支持更多自定义选项。

**请求体：**
```json
{
  "productInfo": {
    "name": "Interactive Dog Toy",
    "description": "...",
    "category": "toys",
    "targetPet": ["dog"],
    "features": ["Durable", "Interactive", "Safe"]
  },
  "platform": "tiktok",
  "language": "en",
  "audience": "Dog owners aged 25-45"
}
```

## 下载功能

生成的内容可以通过以下方式保存：

1. **复制到剪贴板**：点击"复制"按钮
2. **下载为文件**：点击"下载"按钮，会自动下载为 `.txt` 文件
   - 文件名格式：`{产品名}_{平台}_{时间戳}.txt`

## 技术实现

- **AI 模型**：使用 Doubao Seed 2.0 Pro (doubao-seed-2-0-pro-260215)
- **温度参数**：0.8（平衡创造性和准确性）
- **响应时间**：3-5 秒
- **成本**：极低（使用缓存和智能模型路由策略）

## 优化建议

1. **批量生成**：对于同一产品，可以批量生成多平台内容
2. **A/B 测试**：为同一产品生成多个版本，测试效果
3. **缓存利用**：相同参数会使用缓存，提高响应速度
4. **关键词优化**：在产品描述中包含更多关键词，提高 SEO 效果

## 常见问题

**Q: 生成的内容可以用吗？**
A: 生成的内容是高质量的初稿，建议人工审核后使用，特别是亚马逊 Listing 和重要营销文案。

**Q: 如何提高生成质量？**
A: 提供更详细的产品描述和特性，明确目标受众，系统会生成更精准的内容。

**Q: 支持哪些语言？**
A: 目前支持英语、西语、法语、德语、中文等主流语言。

**Q: 生成速度慢怎么办？**
A: 系统有缓存机制，相同请求会直接返回缓存结果。首次生成需要 3-5 秒是正常的。

**Q: 可以生成多语种吗？**
A: 可以，只需在语言选项中选择目标语言，AI 会自动生成对应语言的内容。
