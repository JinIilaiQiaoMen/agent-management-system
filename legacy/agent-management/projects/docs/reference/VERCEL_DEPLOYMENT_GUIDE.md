# 🌟 Vercel 部署详细操作指南

本文档提供 Vercel 部署的**逐步骤、图文式**操作指南，即使您是第一次部署，也能轻松完成。

---

## 📋 总览

- **总耗时**：10-15 分钟
- **难度**：⭐ 非常简单
- **成本**：完全免费（个人版足够使用）
- **前提**：已拥有 GitHub 账号

---

## 🎯 准备工作（3 分钟）

### 检查清单

在开始之前，确保你已经准备好：

- [ ] **GitHub 账号** - https://github.com（免费）
- [ ] **Supabase 账号** - https://supabase.com（免费）
- [ ] **Coze 账号** - https://www.coze.cn（免费）
- [ ] **AWS 账号** - https://aws.amazon.com（免费）
- [ ] 项目已推送到 GitHub（或准备在操作中推送）

---

## 📝 Step 1: 获取必需的密钥（5 分钟）

### 1.1 获取 Supabase 数据库连接字符串

1. **创建 Supabase 项目**
   - 访问 https://supabase.com
   - 点击 `Start your project` 或 `Sign In` → `New Project`
   - 填写信息：
     - **Name**: `agent-management-db`（或任意名称）
     - **Database Password**: 记住这个密码！
     - **Region**: 选择离你最近的区域（如：Southeast Asia (Singapore)）
   - 点击 `Create new project`
   - 等待 1-2 分钟

2. **获取连接字符串**
   - 项目创建后，进入左侧菜单的 `Settings` → `Database`
   - 找到 `Connection string` 部分
   - 点击 `URI` 旁边的 `Copy`
   - 复制的内容格式类似：
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
     ```
   - **保存到记事本**，标注为 `DATABASE_URL`

### 1.2 获取 Coze API Key

1. **创建 Coze 工作区**
   - 访问 https://www.coze.cn
   - 登录或注册账号
   - 进入任意工作区

2. **获取 API Token**
   - 点击右上角的 `设置` 图标（齿轮形状）
   - 在左侧菜单选择 `API Tokens`
   - 点击 `Create new token`
   - 输入 Token 名称（如：`agent-management`）
   - 点击 `Confirm`
   - **复制生成的 Token**
   - **保存到记事本**，标注为 `COZE_API_KEY`

### 1.3 获取 AWS S3 凭证

1. **创建 S3 Bucket**
   - 访问 https://console.aws.amazon.com/s3/
   - 登录或注册 AWS 账号
   - 点击 `Create bucket`
   - 填写信息：
     - **Bucket name**: `agent-management-files-[你的名字]`（必须全局唯一）
     - **Region**: 选择 `Asia Pacific (Singapore)` 或其他区域
   - 其他选项保持默认，向下滚动
   - 点击 `Create bucket`

2. **创建 IAM 用户**
   - 访问 https://console.aws.amazon.com/iam/
   - 左侧菜单点击 `Users` → `Create user`
   - **User name**: `s3-user`
   - 勾选 `Attach policies directly`
   - 点击 `Next`
   - 在搜索框输入 `S3`
   - 选择 `AmazonS3FullAccess`
   - 点击 `Next` → `Create user`

3. **获取 Access Key**
   - 创建成功后，点击用户名称
   - 切换到 `Security credentials` 标签
   - 找到 `Access keys` 部分
   - 点击 `Create access key`
   - 选择 `Application running outside AWS`
   - 点击 `Next`
   - 勾选 `I understand...` → `Create access key`

4. **保存凭证**
   - **复制 Access key ID** → 保存为 `S3_ACCESS_KEY_ID`
   - **复制 Secret access key** → 保存为 `S3_SECRET_ACCESS_KEY`
   - **重要**：这个页面只会显示一次，请务必保存好！

5. **记录其他信息**
   - **S3_BUCKET_NAME**: 你创建的 bucket 名称
   - **S3_REGION**: `ap-southeast-1`（或你选择的区域）
   - **S3_ENDPOINT**: `https://s3.amazonaws.com`

---

## 🚀 Step 2: 推送代码到 GitHub（2 分钟）

### 2.1 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `company-agent-management`
   - **Description**: `公司智能体管理系统`
   - **Public/Private**: 选择 `Public`（推荐，Vercel 免费版需要）
3. **不要**勾选任何初始化选项
4. 点击 `Create repository`
5. 复制仓库 URL（HTTPS 或 SSH 都可以）

### 2.2 推送代码

**在项目目录下执行：**

```bash
# 方法 1: 使用脚本（推荐）
bash scripts/push-to-github.sh https://github.com/你的用户名/company-agent-management.git

# 方法 2: 手动推送
git remote add origin https://github.com/你的用户名/company-agent-management.git
git push -u origin main
```

**示例：**
```bash
bash scripts/push-to-github.sh https://github.com/johndoe/company-agent-management.git
```

等待推送完成，你应该看到类似输出：
```
remote: Resolving deltas: 100% (xxx/xxx), done.
To https://github.com/你的用户名/company-agent-management.git
 * [new branch]      main -> main
```

---

## 🌐 Step 3: 导入到 Vercel（3 分钟）

### 3.1 创建 Vercel 账号

1. 访问 https://vercel.com/signup
2. 点击 `Continue with GitHub`
3. 授权 Vercel 访问你的 GitHub
4. 填写用户名（如：`yourname`）
5. 点击 `Continue`

### 3.2 导入项目

1. 登录后，点击 `Add New` → `Project`
2. 在 `Import Git Repository` 列表中找到 `company-agent-management`
3. 点击右侧的 `Import` 按钮

### 3.3 配置项目

Vercel 会自动检测到这是 Next.js 项目，配置如下：

| 配置项 | 值 | 说明 |
|-------|-----|------|
| **Framework Preset** | Next.js | 自动检测 |
| **Root Directory** | `./` | 保持默认 |
| **Build Command** | `pnpm install && pnpm build` | 自动生成 |
| **Output Directory** | `.next` | 自动生成 |
| **Install Command** | `pnpm install` | 自动生成 |

**确认以上配置正确后，继续下一步。**

---

## ⚙️ Step 4: 配置环境变量（3 分钟）

### 4.1 进入环境变量配置

在项目配置页面，找到 `Environment Variables` 部分。

### 4.2 添加环境变量

逐个添加以下环境变量：

| Key | Value | 从哪里获取 |
|-----|-------|-----------|
| `DATABASE_URL` | 你的 Supabase 连接字符串 | Step 1.1 |
| `COZE_API_KEY` | 你的 Coze API Token | Step 1.2 |
| `S3_ACCESS_KEY_ID` | AWS Access Key ID | Step 1.3 |
| `S3_SECRET_ACCESS_KEY` | AWS Secret Key | Step 1.3 |
| `S3_BUCKET_NAME` | 你的 S3 bucket 名称 | Step 1.3 |
| `S3_REGION` | `ap-southeast-1` 或其他区域 | Step 1.3 |
| `S3_ENDPOINT` | `https://s3.amazonaws.com` | 固定值 |

**添加方法：**

1. 点击 `Environment Variables` 下方的 `+` 按钮
2. 在 `Key` 输入框中输入变量名（如 `DATABASE_URL`）
3. 在 `Value` 输入框中粘贴对应的值
4. 点击 `Add`
5. 重复以上步骤，添加所有变量

**注意：**
- 环境变量名称必须**完全一致**（区分大小写）
- Value 值不要有多余的空格或引号
- 所有变量都必须添加，否则部署会失败

---

## 🎯 Step 5: 部署（2 分钟）

### 5.1 开始部署

1. 确认所有环境变量都已添加
2. 点击页面底部的 `Deploy` 按钮

### 5.2 等待部署

部署过程通常需要 2-3 分钟，你会看到以下步骤：

1. **Cloning repository** - 克隆代码
2. **Installing dependencies** - 安装依赖
3. **Building project** - 构建项目
4. **Deploying** - 部署到 Vercel

### 5.3 部署完成

当看到 `✅ Deployment Complete` 时，说明部署成功了！

### 5.4 访问应用

1. 点击部署成功的 URL（如：`https://company-agent-management-xxx.vercel.app`）
2. 你的应用应该能够正常打开
3. 测试核心功能：
   - ✅ 页面加载
   - ✅ 智能体管理
   - ✅ 流式对话
   - ✅ 文件上传

---

## 🔄 Step 6: 配置自动部署（可选）

### 6.1 启用 GitHub 自动部署

1. 回到 Vercel Dashboard
2. 进入你的项目
3. 点击 `Settings` → `Git`
4. 确保 `Automatic Deployments` 已启用

### 6.2 自动部署说明

启用后，当你推送代码到 GitHub 的 `main` 分支时，Vercel 会自动重新部署。

**示例工作流：**
```bash
# 修改代码
# 提交更改
git add .
git commit -m "fix: 修复一个问题"

# 推送到 GitHub
git push origin main

# Vercel 自动开始部署，无需手动操作
```

---

## 🎨 Step 7: 配置自定义域名（可选）

### 7.1 添加域名

1. 进入 Vercel 项目 → `Settings` → `Domains`
2. 输入你的域名（如：`agents.yourcompany.com`）
3. 点击 `Add`

### 7.2 配置 DNS

Vercel 会提供两条 DNS 记录，你需要在你的域名服务商（如阿里云、腾讯云）中添加：

```
类型: CNAME
主机记录: agents
记录值: cname.vercel-dns.com
```

配置完成后，等待 10-30 分钟，DNS 生效后即可通过自定义域名访问。

---

## ✅ 部署验证清单

部署完成后，请逐项检查：

- [ ] 应用 URL 可以访问
- [ ] 页面样式正常显示
- [ ] 智能体管理功能可用
- [ ] 可以创建新智能体
- [ ] 流式对话功能正常
- [ ] 文档上传功能正常
- [ ] 没有明显的错误或异常

---

## 📊 部署状态监控

### 查看部署日志

1. 进入 Vercel Dashboard
2. 进入你的项目
3. 点击 `Deployments` 标签
4. 选择任意一次部署
5. 点击 `View logs`

### 实时日志

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 查看实时日志
vercel logs
```

---

## 🔧 常见问题排查

### 问题 1: 部署失败 - "Build failed"

**可能原因：**
- 环境变量未正确配置
- 依赖安装失败

**解决方法：**
1. 检查 `Environment Variables` 是否全部配置
2. 查看部署日志中的具体错误信息
3. 确保所有必需的环境变量都已添加

### 问题 2: 数据库连接失败

**可能原因：**
- DATABASE_URL 格式错误
- 数据库未启动
- IP 白名单未配置

**解决方法：**
1. 检查 DATABASE_URL 格式是否正确
2. 确认 Supabase 项目状态为 `Active`
3. 检查 Supabase 的 Database Settings → IPv4 allowlist

### 问题 3: 文件上传失败

**可能原因：**
- S3 凭证错误
- Bucket 权限配置问题

**解决方法：**
1. 确认 S3_ACCESS_KEY_ID 和 S3_SECRET_ACCESS_KEY 正确
2. 检查 S3 bucket 的权限设置
3. 确认 S3_REGION 和 S3_ENDPOINT 正确

### 问题 4: 页面加载缓慢

**解决方法：**
1. 检查数据库连接速度
2. 确认 S3 存储区域选择合理
3. 考虑启用 Vercel 的 Edge Network

---

## 💡 优化建议

### 性能优化

1. **启用 Vercel Analytics**
   - 项目设置 → Integrations → Vercel Analytics
   - 帮助了解访问数据和性能

2. **配置缓存策略**
   - 在 `vercel.json` 中配置缓存头
   - 提升静态资源加载速度

3. **使用 Vercel Edge Functions**
   - 对于高频访问的 API 路由
   - 使用 Edge Functions 提升响应速度

### 安全加固

1. **启用 HTTPS** - Vercel 自动启用
2. **配置环境变量** - 不要硬编码敏感信息
3. **定期更新依赖** - `pnpm update`
4. **启用 IP 白名单** - 在数据库设置中

---

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Supabase 快速开始](https://supabase.com/docs/guides/getting-started)
- [Coze API 文档](https://www.coze.cn/docs/developer_guides)

---

## 🎉 完成！

恭喜你成功部署了公司智能体管理系统！现在你可以：

1. 🌐 分享你的应用 URL 给团队成员
2. 📊 在 Vercel Dashboard 中查看访问统计
3. 🔄 通过 GitHub 自动更新应用
4. 🎨 配置自定义域名提升专业度

**需要帮助？**
- 查看部署日志定位问题
- 查看 [常见问题](#常见问题排查) 部分
- 提交 Issue 获取支持

**祝你使用愉快！** 🚀
