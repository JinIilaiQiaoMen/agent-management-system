# 🚀 部署指南

本文档提供了将智能体管理系统部署到 Docker 和 GitHub 的完整指南。

## 📦 目录

- [GitHub 部署](#github-部署)
- [Docker 部署](#docker-部署)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## 🔗 GitHub 部署

### 步骤 1: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com/new) 创建新仓库
2. 仓库名称建议：`agent-management-system`
3. 选择 Public 或 Private（根据需要）
4. **不要**初始化 README、.gitignore 或 LICENSE（我们已经有这些文件）
5. 点击 "Create repository"

### 步骤 2: 配置 Git 远程仓库

```bash
# 进入项目目录
cd /workspace/projects

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/agent-management-system.git

# 查看远程仓库
git remote -v
```

### 步骤 3: 提交并推送代码

```bash
# 查看当前状态
git status

# 添加所有文件
git add .

# 创建初始提交
git commit -m "feat: 初始化智能体管理系统项目

- Next.js 16 + React 19 全栈应用
- 智能体管理、任务分配、知识库管理
- API 配置管理和自动化执行
- 完整的 Docker 部署配置"

# 推送到 GitHub（首次推送需要设置分支）
git branch -M main
git push -u origin main
```

### 步骤 4: 验证

访问你的 GitHub 仓库，确认代码已成功上传：
- https://github.com/YOUR_USERNAME/agent-management-system

---

## 🐳 Docker 部署

### 方式 1: 使用 Docker Compose（推荐）

#### 1. 准备环境变量

```bash
# 复制环境变量示例文件
cp .env.docker.example .env

# 编辑环境变量
nano .env
```

**重要配置项**：
```env
# 数据库密码（必须修改）
POSTGRES_PASSWORD=your_secure_password_here

# API 密钥（必须修改）
COZE_API_KEY=your_coze_api_key_here
COZE_LLM_API_KEY=your_llm_api_key_here

# 安全密钥（必须修改）
JWT_SECRET=your_jwt_secret_here_at_least_32_chars
API_SECRET_KEY=your_api_secret_key_here_at_least_32_chars

# CORS 配置
ALLOWED_ORIGINS=https://yourdomain.com
```

#### 2. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

#### 3. 访问应用

- **应用地址**: http://localhost:5000
- **数据库**: localhost:5432
- **Redis**: localhost:6379

#### 4. 常用命令

```bash
# 停止服务
docker-compose down

# 停止并删除数据（谨慎使用）
docker-compose down -v

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f app

# 进入容器
docker-compose exec app sh

# 更新代码后重新构建
git pull
docker-compose up -d --build
```

---

### 方式 2: 单独使用 Docker

#### 1. 构建镜像

```bash
docker build -t agent-management-system:latest .
```

#### 2. 运行容器

```bash
docker run -d \
  --name agent-management-system \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  -e COZE_API_KEY="your_api_key" \
  -e JWT_SECRET="your_jwt_secret" \
  agent-management-system:latest
```

#### 3. 查看日志

```bash
docker logs -f agent-management-system
```

---

### 方式 3: 部署到云服务器

#### 1. 服务器准备

```bash
# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 克隆代码

```bash
git clone https://github.com/YOUR_USERNAME/agent-management-system.git
cd agent-management-system
```

#### 3. 配置并启动

```bash
# 配置环境变量
cp .env.docker.example .env
nano .env

# 启动服务
docker-compose up -d
```

#### 4. 配置 Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 环境变量配置

### 必填变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db` |
| `COZE_API_KEY` | Coze API 密钥 | `your_api_key` |
| `COZE_LLM_API_KEY` | 大模型 API 密钥 | `your_llm_key` |
| `COZE_LLM_BASE_URL` | 大模型 API 地址 | `https://api.example.com` |
| `COZE_WEB_SEARCH_API_KEY` | 联网搜索 API 密钥 | `your_search_key` |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 | `https://s3.example.com` |
| `COZE_BUCKET_NAME` | 存储桶名称 | `my-bucket` |
| `COZE_BUCKET_REGION` | 存储区域 | `us-east-1` |
| `JWT_SECRET` | JWT 密钥（≥32字符） | `random_secret_key_here` |
| `API_SECRET_KEY` | API 密钥（≥32字符） | `random_api_key_here` |
| `SESSION_SECRET` | Session 密钥（≥32字符） | `random_session_key_here` |
| `PASSWORD_SALT` | 密码加密盐值（≥32字符） | `random_salt_here` |
| `ALLOWED_ORIGINS` | 允许的源（CORS） | `https://example.com` |

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 应用端口 | `5000` |
| `REDIS_URL` | Redis 连接字符串 | - |
| `LOG_LEVEL` | 日志级别 | `info` |
| `ENABLE_METRICS` | 启用指标 | `true` |

---

## ❓ 常见问题

### 1. Docker 构建失败

**问题**: 构建过程中出现错误

**解决方案**:
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 2. 容器启动失败

**问题**: 容器无法启动

**解决方案**:
```bash
# 查看容器日志
docker-compose logs app

# 检查环境变量
docker-compose config

# 检查端口占用
netstat -tulpn | grep 5000
```

### 3. 数据库连接失败

**问题**: 应用无法连接数据库

**解决方案**:
```bash
# 检查数据库是否运行
docker-compose ps postgres

# 进入数据库容器
docker-compose exec postgres psql -U agent_user -d agent_management

# 检查连接
\conninfo
```

### 4. Git 推送失败

**问题**: `remote: Permission denied`

**解决方案**:
```bash
# 检查远程仓库地址
git remote -v

# 更新远程仓库地址
git remote set-url origin https://github.com/YOUR_USERNAME/agent-management-system.git

# 推送时使用个人访问令牌
git push https://YOUR_TOKEN@github.com/YOUR_USERNAME/agent-management-system.git main
```

### 5. 端口冲突

**问题**: 端口 5000 已被占用

**解决方案**:
```bash
# 修改 docker-compose.yml 中的端口映射
ports:
  - "8080:5000"  # 将 8080 映射到容器的 5000
```

---

## 📊 监控和维护

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h

# 查看镜像大小
docker images | grep agent-management-system
```

### 备份数据

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U agent_user agent_management > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U agent_user agent_management < backup.sql
```

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

---

## 🔐 安全建议

1. **使用强密码**
   - 所有密钥和密码至少 32 个字符
   - 使用密码生成器生成随机字符串

2. **限制网络访问**
   - 使用防火墙限制外部访问
   - 数据库只允许内网访问

3. **定期更新**
   - 定期更新依赖包
   - 定期更新 Docker 镜像

4. **启用 HTTPS**
   - 使用 Let's Encrypt 免费证书
   - 配置 Nginx SSL/TLS

5. **备份策略**
   - 定期备份数据库
   - 备份重要配置文件

---

## 📚 参考资源

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## 🆘 获取帮助

如有问题，请：

1. 检查日志文件
2. 查看常见问题部分
3. 提交 Issue 到 GitHub 仓库
4. 联系技术支持

---

**祝部署顺利！** 🎉
