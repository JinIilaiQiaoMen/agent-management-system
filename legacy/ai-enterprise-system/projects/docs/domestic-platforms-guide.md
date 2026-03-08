# 国内全渠道发布平台配置指南

## 功能概述

国内全渠道发布中心支持一键发布到中国主流的电商平台、社交媒体、内容创作和直播平台，覆盖30+平台，包括：

- **电商平台（10个）**：淘宝、天猫、京东、拼多多、抖音电商、快手电商、小红书、唯品会、苏宁易购、当当网
- **社交媒体（10个）**：微信公众号、微信朋友圈、微信视频号、微博、QQ空间、抖音、快手等
- **内容平台（10个）**：哔哩哔哩、知乎、今日头条、百度百家号、得到、喜马拉雅、网易云音乐等
- **直播平台（4个）**：抖音直播、快手直播、淘宝直播、B站直播

## 平台分类与特性

### 电商平台

| 平台 | API类型 | 支持内容 | 开发者入口 |
|------|---------|----------|------------|
| 淘宝 | OAuth | 商品、图片、视频、文章 | [开放平台](https://open.taobao.com/) |
| 天猫 | OAuth | 商品、图片、视频、文章 | [开放平台](https://open.taobao.com/) |
| 京东 | OAuth | 商品、图片、视频、文章 | [开放平台](https://open.jd.com/) |
| 拼多多 | Open API | 商品、图片、视频 | [开放平台](https://open.pinduoduo.com/) |
| 抖音电商 | OAuth | 商品、视频、直播、短视频 | [开放平台](https://developer.open-douyin.com/) |
| 快手电商 | Open API | 商品、视频、直播、短视频 | [开放平台](https://open.kuaishou.com/) |
| 小红书 | OAuth | 文章、图片、视频、商品 | [开放平台](https://open.xiaohongshu.com/) |
| 唯品会 | Open API | 商品、图片、视频 | [开放平台](https://open.vip.com/) |
| 苏宁易购 | Open API | 商品、图片、视频 | [开放平台](https://open.suning.com/) |
| 当当网 | Open API | 商品、图片 | [开放平台](http://open.dangdang.com/) |

### 社交媒体平台

| 平台 | API类型 | 支持内容 | 开发者入口 |
|------|---------|----------|------------|
| 微信公众号 | API Key | 文章、图片、视频、音频 | [开放平台](https://mp.weixin.qq.com/) |
| 微信朋友圈 | OAuth | 图片、视频、文字、链接 | [开放平台](https://mp.weixin.qq.com/) |
| 微信视频号 | OAuth | 视频、直播、短视频 | [开放平台](https://channels.weixin.qq.com/) |
| 微博 | OAuth | 文字、图片、视频、直播 | [开放平台](https://open.weibo.com/) |
| QQ空间 | OAuth | 文字、图片、视频 | [开放平台](https://connect.qq.com/) |
| 抖音 | OAuth | 视频、直播、短视频、文章 | [开放平台](https://developer.open-douyin.com/) |
| 快手 | OAuth | 视频、直播、短视频 | [开放平台](https://open.kuaishou.com/) |

### 内容创作平台

| 平台 | API类型 | 支持内容 | 开发者入口 |
|------|---------|----------|------------|
| 哔哩哔哩 | OAuth | 视频、文章、直播、短视频 | [开放平台](https://openhome.bilibili.com/) |
| 知乎 | OAuth | 文章、回答、视频、直播 | [开发者](https://www.zhihu.com/developer) |
| 今日头条 | OAuth | 文章、图片、视频 | [开放平台](https://www.toutiao.com/open/) |
| 百度百家号 | OAuth | 文章、图片、视频 | [开放平台](https://baijiahao.baidu.com/) |
| 得到 | Open API | 文章、音频、视频 | [开放平台](https://open.dedao.cn/) |
| 喜马拉雅 | Open API | 音频、视频、文章 | [开放平台](https://open.ximalaya.com/) |
| 网易云音乐 | OAuth | 音频、文章、视频 | [开放平台](https://music.163.com/) |

### 直播平台

| 平台 | API类型 | 支持内容 | 开发者入口 |
|------|---------|----------|------------|
| 抖音直播 | OAuth | 直播、商品、视频 | [开放平台](https://developer.open-douyin.com/) |
| 快手直播 | Open API | 直播、商品、视频 | [开放平台](https://open.kuaishou.com/) |
| 淘宝直播 | OAuth | 直播、商品 | [开放平台](https://open.taobao.com/) |
| B站直播 | OAuth | 直播、视频 | [开放平台](https://openhome.bilibili.com/) |

## 平台申请与配置流程

### 1. 申请开发者账号

#### 电商平台

**淘宝/天猫**
1. 访问 https://open.taobao.com/
2. 注册开发者账号
3. 创建应用，获取 App Key 和 App Secret
4. 申请权限：商品发布、店铺管理、营销推广等

**京东**
1. 访问 https://open.jd.com/
2. 注册开发者账号
3. 创建应用，获取 App Key 和 App Secret
4. 申请权限：商品发布、订单管理等

**拼多多**
1. 访问 https://open.pinduoduo.com/
2. 注册开发者账号
3. 创建应用，获取 Client ID 和 Client Secret
4. 申请权限：商品发布、营销活动等

**抖音电商**
1. 访问 https://developer.open-douyin.com/
2. 注册开发者账号
3. 创建应用，获取 Client Key 和 Client Secret
4. 申请权限：商品发布、直播管理等

#### 社交媒体平台

**微信公众号**
1. 访问 https://mp.weixin.qq.com/
2. 注册公众号
3. 开发者设置中获取 AppID 和 AppSecret
4. 配置服务器地址和令牌

**微博**
1. 访问 https://open.weibo.com/
2. 注册开发者账号
3. 创建应用，获取 App Key 和 App Secret
4. 申请权限：发布微博、获取用户信息等

#### 内容平台

**哔哩哔哩**
1. 访问 https://openhome.bilibili.com/
2. 注册开发者账号
3. 创建应用，获取 Client ID 和 Client Secret
4. 申请权限：视频投稿、文章发布等

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# ===== 电商平台 =====

# 淘宝
TAOBAO_APP_KEY=your_taobao_app_key
TAOBAO_APP_SECRET=your_taobao_app_secret
TAOBAO_SESSION_KEY=your_taobao_session_key

# 天猫
TMALL_APP_KEY=your_tmall_app_key
TMALL_APP_SECRET=your_tmall_app_secret
TMALL_SESSION_KEY=your_tmall_session_key

# 京东
JD_APP_KEY=your_jd_app_key
JD_APP_SECRET=your_jd_app_secret
JD_ACCESS_TOKEN=your_jd_access_token

# 拼多多
PDD_CLIENT_ID=your_pdd_client_id
PDD_CLIENT_SECRET=your_pdd_client_secret

# 抖音电商
DOUYIN_CLIENT_KEY=your_douyin_client_key
DOUYIN_CLIENT_SECRET=your_douyin_client_secret
DOUYIN_ACCESS_TOKEN=your_douyin_access_token

# 快手电商
KUAISHOU_APP_ID=your_kuaishou_app_id
KUAISHOU_APP_SECRET=your_kuaishou_app_secret
KUAISHOU_ACCESS_TOKEN=your_kuaishou_access_token

# 小红书
XIAOHONGSHU_APP_ID=your_xiaohongshu_app_id
XIAOHONGSHU_APP_SECRET=your_xiaohongshu_app_secret
XIAOHONGSHU_ACCESS_TOKEN=your_xiaohongshu_access_token

# 唯品会
VIPSHOP_APP_KEY=your_vipshop_app_key
VIPSHOP_APP_SECRET=your_vipshop_app_secret

# 苏宁易购
SUNING_APP_KEY=your_suning_app_key
SUNING_APP_SECRET=your_suning_app_secret

# 当当网
DANGDANG_APP_KEY=your_dangdang_app_key
DANGDANG_APP_SECRET=your_dangdang_app_secret

# ===== 社交媒体平台 =====

# 微信公众号
WECHAT_APPID=your_wechat_appid
WECHAT_APPSECRET=your_wechat_appsecret

# 微信朋友圈
WECHAT_APPID=your_wechat_appid
WECHAT_APPSECRET=your_wechat_appsecret

# 微信视频号
WECHAT_APPID=your_wechat_appid
WECHAT_APPSECRET=your_wechat_appsecret

# 微博
WEIBO_APP_KEY=your_weibo_app_key
WEIBO_APP_SECRET=your_weibo_app_secret
WEIBO_ACCESS_TOKEN=your_weibo_access_token

# QQ
QQ_APP_ID=your_qq_app_id
QQ_APP_KEY=your_qq_app_key
QQ_ACCESS_TOKEN=your_qq_access_token

# 抖音
DOUYIN_CLIENT_KEY=your_douyin_client_key
DOUYIN_CLIENT_SECRET=your_douyin_client_secret
DOUYIN_ACCESS_TOKEN=your_douyin_access_token

# 快手
KUAISHOU_APP_ID=your_kuaishou_app_id
KUAISHOU_APP_SECRET=your_kuaishou_app_secret
KUAISHOU_ACCESS_TOKEN=your_kuaishou_access_token

# ===== 内容平台 =====

# 哔哩哔哩
BILIBILI_CLIENT_ID=your_bilibili_client_id
BILIBILI_CLIENT_SECRET=your_bilibili_client_secret
BILIBILI_ACCESS_TOKEN=your_bilibili_access_token

# 知乎
ZHIHU_CLIENT_ID=your_zhihu_client_id
ZHIHU_CLIENT_SECRET=your_zhihu_client_secret
ZHIHU_ACCESS_TOKEN=your_zhihu_access_token

# 今日头条
TOUTIAO_APP_ID=your_toutiao_app_id
TOUTIAO_APP_SECRET=your_toutiao_app_secret
TOUTIAO_ACCESS_TOKEN=your_toutiao_access_token

# 百度百家号
BAIJIAHAO_APP_ID=your_baijiahao_app_id
BAIJIAHAO_APP_SECRET=your_baijiahao_app_secret
BAIJIAHAO_ACCESS_TOKEN=your_baijiahao_access_token

# 得到
DEDAO_APP_ID=your_dedao_app_id
DEDAO_APP_SECRET=your_dedao_app_secret

# 喜马拉雅
XIMALAYA_APP_KEY=your_ximalaya_app_key
XIMALAYA_APP_SECRET=your_ximalaya_app_secret

# 网易云音乐
NETEASE_APP_ID=your_netease_app_id
NETEASE_APP_SECRET=your_netease_app_secret

# ===== 直播平台 =====

# 抖音直播
DOUYIN_CLIENT_KEY=your_douyin_client_key
DOUYIN_CLIENT_SECRET=your_douyin_client_secret
DOUYIN_ACCESS_TOKEN=your_douyin_access_token

# 快手直播
KUAISHOU_APP_ID=your_kuaishou_app_id
KUAISHOU_APP_SECRET=your_kuaishou_app_secret
KUAISHOU_ACCESS_TOKEN=your_kuaishou_access_token

# 淘宝直播
TAOBAO_APP_KEY=your_taobao_app_key
TAOBAO_APP_SECRET=your_taobao_app_secret
TAOBAO_SESSION_KEY=your_taobao_session_key

# B站直播
BILIBILI_CLIENT_ID=your_bilibili_client_id
BILIBILI_CLIENT_SECRET=your_bilibili_client_secret
BILIBILI_ACCESS_TOKEN=your_bilibili_access_token
```

### 3. 申请必要权限

根据不同平台，需要申请相应的API权限：

#### 电商平台通用权限
- 商品发布
- 店铺管理
- 订单管理
- 营销推广
- 数据统计

#### 社交媒体通用权限
- 发布内容
- 获取用户信息
- 媒体上传
- 评论管理

#### 内容平台通用权限
- 内容发布
- 媒体上传
- 数据统计
- 用户互动

## 使用说明

### 发布流程

1. **访问发布中心**
   - 点击主页面的"国内全渠道发布"卡片
   - 进入发布中心页面

2. **选择平台**
   - 在平台列表中选择要发布的平台
   - 支持按类别筛选（电商、社交、内容、直播）
   - 支持搜索功能快速查找平台

3. **创建发布计划**
   - 点击"创建发布计划"按钮
   - 选择平台和内容类型
   - 填写发布内容
   - （可选）设置定时发布时间
   - （电商平台）填写商品信息

4. **提交发布**
   - 点击"创建计划"按钮
   - 系统会验证配置和内容
   - 创建成功后会显示在发布计划列表中

### 内容类型说明

| 内容类型 | 适用平台 | 说明 |
|---------|----------|------|
| 商品 | 电商平台 | 发布商品信息，包含价格、库存等 |
| 文章 | 内容平台、电商平台 | 图文内容，适合详细介绍 |
| 视频 | 所有平台 | 视频内容，支持短视频和长视频 |
| 图片 | 所有平台 | 图片内容，支持单图和多图 |
| 直播 | 直播平台 | 直播预告和直播信息 |
| 短视频 | 社交、内容平台 | 短视频内容，15-60秒 |
| 音频 | 内容平台 | 音频内容，适合播客 |
| 文字 | 社交平台 | 纯文字内容 |

### 商品信息（电商）

发布商品时，可以填写以下信息：

- **价格**：商品销售价格
- **原价**：商品原价（用于显示折扣）
- **库存**：商品库存数量
- **分类**：商品所属分类

## API 接口说明

### 发布内容

```bash
POST /api/domestic-platforms/publish
Content-Type: application/json

{
  "platform": "taobao",
  "contentType": "product",
  "title": "商品标题",
  "content": "商品描述",
  "mediaUrls": ["https://example.com/image1.jpg"],
  "scheduledTime": "2026-03-02T10:00:00",
  "hashtags": ["宠物用品", "新品"],
  "productInfo": {
    "price": 99.00,
    "originalPrice": 199.00,
    "stock": 100,
    "category": "宠物用品"
  }
}
```

**响应示例**：

```json
{
  "success": true,
  "postId": "taobao_1738339200000_abc123",
  "platformPostId": "tb_1738339200000",
  "status": "published",
  "message": "成功发布到淘宝",
  "publishedAt": "2026-03-01T10:00:00.000Z",
  "platform": "淘宝"
}
```

## 常见问题

### Q: 提示"未配置平台凭据"？

**A:** 需要配置对应平台的环境变量：

1. 申请对应平台的开发者账号和应用
2. 获取 App ID/Key 和 App Secret
3. 在 `.env.local` 文件中配置环境变量
4. 重启服务使配置生效

### Q: 发布失败，提示"不支持的内容类型"？

**A:** 检查选择的平台是否支持该内容类型：

- 不同平台支持的内容类型不同
- 在发布前查看平台的"支持的内容类型"标签
- 选择平台支持的内容类型

### Q: 定时发布不执行？

**A:** 定时发布功能需要：

1. 正确配置定时任务系统（如 cron）
2. 确保服务持续运行
3. 检查数据库或任务队列中的定时任务
4. 查看日志确认任务执行状态

### Q: 发布后看不到内容？

**A:** 可能的原因：

1. **审核中**：平台正在审核内容
2. **时间延迟**：发布后需要一定时间才能显示
3. **权限问题**：应用权限不足
4. **内容违规**：内容可能被平台标记为违规

### Q: 如何批量发布？

**A:** 批量发布功能：

1. 准备批量发布数据（Excel/CSV）
2. 导入数据到系统
3. 选择批量发布的目标平台
4. 设置统一的发布时间
5. 执行批量发布任务

## 最佳实践

### 1. 平台选择策略

- **电商平台**：选择商品和目标用户匹配度高的平台
- **社交媒体**：根据用户画像选择合适的平台
- **内容平台**：根据内容类型选择对应平台

### 2. 内容优化建议

- **标题**：吸引人，包含关键词
- **描述**：详细但不冗长
- **图片/视频**：高质量，多角度展示
- **话题标签**：使用热门和相关的标签

### 3. 发布时间优化

- **电商平台**：工作日 10-12点，19-21点
- **社交媒体**：周末 14-16点，19-21点
- **内容平台**：根据平台用户活跃时间

### 4. 定时发布策略

- 提前1-2天创建发布计划
- 考虑平台审核时间
- 避开平台维护时间
- 批量设置多个发布时间

## 注意事项

1. **API 限制**：各平台有 API 调用频率限制
2. **内容审核**：发布前确保内容合规
3. **权限管理**：定期检查和更新应用权限
4. **令牌管理**：访问令牌可能需要定期刷新
5. **数据备份**：重要发布内容建议备份

## 开发计划

- [ ] 实现真实的平台 API 调用
- [ ] 支持批量发布功能
- [ ] 添加发布预览功能
- [ ] 实现发布效果追踪
- [ ] 支持多平台同步发布
- [ ] 添加智能发布建议
- [ ] 实现发布模板和复用
- [ ] 添加数据导出功能

## 技术支持

如有问题或建议，请联系技术支持团队。

## 相关文档

- [OAuth 授权设置指南](./oauth-setup-guide.md)
- [社媒发布功能指南](./social-media-publishing-guide.md)
