# 社媒平台 OAuth 授权设置指南

## 当前状态说明

⚠️ **重要提示**：当前系统处于**演示模式**，使用模拟的 OAuth 凭据。要使用真实的 OAuth 授权，需要配置各平台的真实凭据。

## 演示模式 vs 生产模式

### 演示模式（当前默认）
- ✅ 可以体验完整的授权流程
- ✅ 可以测试发布功能
- ⚠️ 使用模拟凭据，无法真实发布到平台
- ⚠️ 授权链接指向模拟端点

### 生产模式（需要配置）
- ✅ 真实的 OAuth 授权流程
- ✅ 真实的平台 API 调用
- ✅ 真实的发布功能
- ⚠️ 需要申请开发者账号和应用凭据

## 平台授权流程

### 方式 1：OAuth 授权（推荐）

#### 步骤 1：申请开发者账号

**TikTok**
- 访问：https://developers.tiktok.com/
- 创建应用：https://developers.tiktok.com/apps/
- 获取凭据：Client ID、Client Secret
- 配置回调 URL：`http://localhost:5000/api/social-media/oauth/callback`

**Instagram (Facebook)**
- 访问：https://developers.facebook.com/
- 创建应用：https://developers.facebook.com/apps/
- 添加 Instagram 产品
- 获取凭据：App ID、App Secret
- 配置回调 URL：`http://localhost:5000/api/social-media/oauth/callback`

**YouTube (Google)**
- 访问：https://console.cloud.google.com/
- 创建项目：https://console.cloud.google.com/projectcreate
- 启用 YouTube Data API v3
- 配置 OAuth 同意屏幕
- 获取凭据：OAuth 2.0 客户端 ID
- 配置回调 URL：`http://localhost:5000/api/social-media/oauth/callback`

**Facebook**
- 访问：https://developers.facebook.com/
- 创建应用：https://developers.facebook.com/apps/
- 选择业务类型：企业
- 获取凭据：App ID、App Secret
- 配置回调 URL：`http://localhost:5000/api/social-media/oauth/callback`

#### 步骤 2：配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# TikTok
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# YouTube
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# Facebook
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_PAGE_ID=your_facebook_page_id
```

#### 步骤 3：申请必要权限

**TikTok 必需权限：**
- `video.upload` - 上传视频
- `user.info.basic` - 获取用户信息

**Instagram 必需权限：**
- `instagram_basic` - 基础信息
- `instagram_content_publish` - 发布内容

**YouTube 必需权限：**
- `https://www.googleapis.com/auth/youtube.upload` - 上传视频

**Facebook 必需权限：**
- `pages_manage_posts` - 管理帖子
- `pages_read_engagement` - 读取互动数据

#### 步骤 4：完成授权

1. 访问社媒运营页面
2. 点击平台卡片上的"连接"按钮
3. 在弹出的配置窗口中，点击"打开授权页面"
4. 在新窗口中登录并授权应用
5. 授权成功后会自动跳转回系统
6. 系统会自动保存访问令牌

### 方式 2：手动配置 API 凭据

如果你已经拥有访问令牌，可以直接手动配置：

1. 访问社媒运营页面
2. 点击平台卡片上的"连接"按钮
3. 在配置窗口中选择"手动配置 API 凭据"
4. 输入以下信息：

**TikTok:**
- Access Token
- Client ID
- Client Secret

**Instagram:**
- Access Token
- Business Account ID

**YouTube:**
- Access Token
- Client ID

**Facebook:**
- Access Token
- Page ID

## 常见问题

### Q: 点击"打开授权页面"时提示"获取授权链接失败"？

**A:** 这通常是因为：
1. 没有配置 Client ID（演示模式下使用模拟凭据）
2. 网络问题导致无法访问授权端点
3. 平台配置信息错误

**解决方案：**
- 检查 `.env.local` 文件是否正确配置
- 使用"手动配置 API 凭据"方式
- 查看浏览器控制台获取详细错误信息

### Q: 授权成功后还是显示"未连接"？

**A:** 可能的原因：
1. 访问令牌没有正确保存
2. 令牌已过期
3. 权限不足

**解决方案：**
- 刷新页面重新加载配置
- 重新授权获取新的访问令牌
- 检查应用是否拥有必要的权限

### Q: 发布时提示"未配置平台凭据"？

**A:** 这是因为：
1. 没有完成 OAuth 授权
2. 访问令牌已失效
3. 配置数据丢失

**解决方案：**
- 重新连接平台
- 刷新访问令牌
- 手动配置 API 凭据

### Q: OAuth 回调失败？

**A:** 检查：
1. 回调 URL 是否正确配置（区分开发环境和生产环境）
2. 应用的 OAuth 设置中是否添加了正确的回调 URL
3. 防火墙是否阻止了回调请求

## 安全建议

1. **不要提交敏感信息到代码仓库**
   - `.env.local` 文件应该在 `.gitignore` 中
   - 使用环境变量管理敏感信息

2. **定期刷新访问令牌**
   - 大多数平台的访问令牌有时效性
   - 使用刷新令牌自动更新访问令牌

3. **使用 HTTPS**
   - 生产环境必须使用 HTTPS
   - 保护授权流程和令牌传输安全

4. **限制权限范围**
   - 只申请必要的权限
   - 遵循最小权限原则

5. **保护回调 URL**
   - 验证回调请求的来源
   - 使用 state 参数防止 CSRF 攻击

## 演示说明

在当前演示模式下：

1. **授权流程**：完整的 OAuth 流程体验
   - 生成授权链接（使用模拟凭据）
   - 打开授权窗口
   - 处理授权回调
   - 模拟令牌交换

2. **发布功能**：
   - 可以创建发布计划
   - 可以设置定时发布
   - 使用模拟数据展示效果

3. **平台配置**：
   - 可以手动输入 API 凭据进行测试
   - 配置信息仅保存在内存中（刷新后丢失）

## 开发者信息

### OAuth 流程图

```
用户点击授权
    ↓
前端调用 GET /api/social-media/oauth?platform=tiktok
    ↓
后端生成授权 URL（包含 client_id, redirect_uri, scope, state）
    ↓
前端打开授权窗口，跳转到授权 URL
    ↓
用户在平台页面授权
    ↓
平台重定向到 redirect_uri?code=xxx&state=yyy
    ↓
前端调用 POST /api/social-media/oauth (交换令牌)
    ↓
后端使用 code 换取 access_token
    ↓
保存 access_token 到数据库/环境变量
    ↓
授权完成
```

### API 端点

- `GET /api/social-media/oauth` - 获取授权 URL
- `POST /api/social-media/oauth` - 交换访问令牌
- `GET /api/social-media/oauth/callback` - OAuth 回调处理

### 相关文件

- `src/app/api/social-media/oauth/route.ts` - OAuth API 接口
- `src/app/api/social-media/oauth/callback/route.ts` - 回调处理
- `src/lib/social-media/platform-config.ts` - 平台配置
- `src/app/social-media-automation/page.tsx` - 前端页面

## 下一步

1. **测试演示模式**：体验完整的 OAuth 流程
2. **配置生产环境**：申请真实的应用凭据
3. **集成真实 API**：替换模拟数据为真实 API 调用
4. **优化用户体验**：添加更多错误处理和提示

## 技术支持

如有问题或建议，请联系技术支持团队。
