# 社媒运营 Agent 矩阵 - 真实发布功能指南

## 功能概述

社媒运营 Agent 矩阵现已支持真实的社媒发布功能，包括：

- **立即发布**：即时发布内容到多个社媒平台
- **定时发布**：预设发布时间，自动安排发布计划
- **平台配置**：支持 TikTok、Instagram、YouTube、Facebook 等主流平台
- **OAuth 认证**：安全的 OAuth 2.0 授权流程
- **发布历史**：查看所有发布记录和状态
- **数据分析**：追踪发布效果和互动数据

## 支持的平台

| 平台 | 状态 | 内容类型 |
|------|------|----------|
| TikTok | ✅ 支持 | 视频、图片、文字 |
| Instagram | ✅ 支持 | 图片、视频、轮播图 |
| YouTube | ✅ 支持 | 视频 |
| Facebook | ✅ 支持 | 文字、图片、视频、链接 |

## API 接口

### 1. 平台配置 API

**获取平台配置**
```bash
GET /api/social-media/config
GET /api/social-media/config?platform=tiktok
```

**保存平台配置**
```bash
POST /api/social-media/config
Content-Type: application/json

{
  "platform": "tiktok",
  "credentials": {
    "accessToken": "your_access_token",
    "clientId": "your_client_id",
    "clientSecret": "your_client_secret"
  }
}
```

**删除平台配置**
```bash
DELETE /api/social-media/config?platform=tiktok
```

### 2. 发布 API

**发布内容**
```bash
POST /api/social-media/publish
Content-Type: application/json

{
  "platform": "tiktok",
  "content": "🐱 萌宠日常",
  "mediaUrls": ["https://example.com/image.jpg"],
  "hashtags": ["萌宠", "猫咪", "日常"],
  "scheduledTime": "2026-03-02T10:00:00Z"
}
```

### 3. 发布历史 API

**获取发布历史**
```bash
GET /api/social-media/history
GET /api/social-media/history?platform=tiktok
GET /api/social-media/history?status=published
GET /api/social-media/history?limit=20&offset=0
```

**删除发布记录**
```bash
DELETE /api/social-media/history?id=1
```

### 4. OAuth 授权 API

**获取授权 URL**
```bash
GET /api/social-media/oauth?platform=tiktok&redirect_uri=http://localhost:5000/api/callback
```

**处理授权回调**
```bash
POST /api/social-media/oauth
Content-Type: application/json

{
  "platform": "tiktok",
  "code": "authorization_code",
  "state": "random_state",
  "redirectUri": "http://localhost:5000/api/callback"
}
```

## 配置真实 API 凭据

### 方式 1：环境变量配置

在项目根目录创建 `.env.local` 文件：

```bash
# TikTok
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_BUS_ID=your_instagram_business_id

# YouTube
YOUTUBE_ACCESS_TOKEN=your_youtube_access_token
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# Facebook
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PAGE_ID=your_facebook_page_id
```

### 方式 2：通过页面配置

1. 访问社媒运营页面
2. 点击平台卡片上的"配置"或"连接"按钮
3. 选择 OAuth 授权或手动输入 API 凭据
4. 保存配置

## OAuth 授权流程

### 1. 申请应用

前往各平台的开发者中心创建应用：

- **TikTok**: https://developers.tiktok.com/
- **Instagram**: https://developers.facebook.com/docs/instagram/
- **YouTube**: https://console.cloud.google.com/apis/dashboard
- **Facebook**: https://developers.facebook.com/

### 2. 获取凭据

创建应用后，获取以下信息：

- **Client ID**
- **Client Secret**
- **Redirect URI** (用于 OAuth 回调)

### 3. 配置授权范围

确保应用已申请以下权限：

**TikTok:**
- `video.upload` - 上传视频
- `user.info.basic` - 获取用户信息

**Instagram:**
- `instagram_basic` - 基础信息
- `instagram_content_publish` - 发布内容

**YouTube:**
- `https://www.googleapis.com/auth/youtube.upload` - 上传视频

**Facebook:**
- `pages_manage_posts` - 管理帖子
- `pages_read_engagement` - 读取互动数据

### 4. 完成授权

1. 在页面点击"打开授权页面"
2. 在弹出的窗口中登录并授权
3. 授权成功后，系统会自动保存访问令牌

## 定时发布

定时发布功能支持预设发布时间：

```json
{
  "platform": "tiktok",
  "content": "🎉 新品上市！",
  "scheduledTime": "2026-03-02T10:00:00Z"
}
```

系统会：

1. 保存发布计划到数据库
2. 在指定时间自动执行发布
3. 返回发布结果和状态

## 发布状态

| 状态 | 说明 |
|------|------|
| `pending` | 待处理 |
| `scheduled` | 已安排定时 |
| `published` | 已发布成功 |
| `failed` | 发布失败 |

## 数据追踪

发布成功后，系统会自动追踪以下数据：

- **浏览量** (views)
- **点赞数** (likes)
- **评论数** (comments)
- **分享数** (shares)

这些数据会定期更新，可在"发布历史"标签页查看。

## 错误处理

### 常见错误及解决方案

**错误：未配置平台凭据**
```
{
  "error": "未配置平台凭据",
  "details": "请先配置 TikTok 的认证信息",
  "requiresAuth": true
}
```
**解决方案**：完成平台配置后重试

**错误：发布失败 - 媒体文件格式不支持**
```
{
  "error": "发布失败",
  "details": "媒体文件格式不支持"
}
```
**解决方案**：检查媒体文件格式，确保符合平台要求

**错误：OAuth 授权失败**
```
{
  "error": "OAuth授权失败",
  "details": "Invalid authorization code"
}
```
**解决方案**：重新发起授权流程

## 最佳实践

### 1. 内容优化

- **TikTok**: 视频时长 15-60 秒，竖屏格式
- **Instagram**: 图片推荐 1080x1080，视频 60 秒内
- **YouTube**: 视频时长建议 10-15 分钟，16:9 比例
- **Facebook**: 图片 1200x630，视频不超过 240 分钟

### 2. 话题标签

- 每个帖子 3-5 个相关话题标签
- 使用热门标签增加曝光
- 避免过度使用标签

### 3. 发布时间

根据数据分析结果，最佳发布时段：

- **10:00 - 12:00**: 85% 高互动率
- **14:00 - 16:00**: 78% 高互动率
- **19:00 - 21:00**: 72% 高互动率

### 4. 内容类型

根据热门数据，推荐内容类型：

- **产品展示**: 45%
- **用户评价**: 30%
- **使用教程**: 25%

## 注意事项

1. **API 限制**: 各平台有 API 调用频率限制，请合理安排发布节奏
2. **内容审核**: 发布前请确保内容符合平台社区规范
3. **隐私保护**: API 凭据请妥善保管，不要泄露给第三方
4. **令牌过期**: 访问令牌可能过期，需要定期刷新

## 开发计划

- [ ] 支持更多社媒平台（Twitter、LinkedIn、Pinterest 等）
- [ ] 实现多平台批量发布
- [ ] 添加发布预览功能
- [ ] 集成 AI 内容优化建议
- [ ] 实现实时互动监控
- [ ] 添加定时任务管理界面
- [ ] 支持发布模板和复用
- [ ] 集成数据导出功能

## 技术支持

如有问题或建议，请联系技术支持团队。
