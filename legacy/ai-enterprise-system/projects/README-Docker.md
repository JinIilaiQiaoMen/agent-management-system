# Docker 部署指南

本指南帮助你将 AI 智能化企业系统部署到本地 Docker 环境。

## 前置要求

### 1. 安装 Docker 和 Docker Compose

确保你的系统已安装以下软件：

- **Docker**: 版本 20.10 或更高
- **Docker Compose**: 版本 2.0 或更高

#### macOS
```bash
# 使用 Homebrew 安装
brew install --cask docker
```

#### Ubuntu/Debian
```bash
# 更新包列表
sudo apt-get update

# 安装依赖
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组（免 sudo 运行）
sudo usermod -aG docker $USER
newgrp docker
```

#### Windows
下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

### 2. 验证安装

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker compose version
```

## 快速开始

### 1. 克隆或准备项目

```bash
# 如果项目在本地，进入项目目录
cd /path/to/your/project

# 确保所有配置文件存在
ls -la Dockerfile docker-compose.yml .env.docker
```

### 2. 配置环境变量

复制环境变量示例文件并修改：

```bash
# 复制示例文件
cp .env.docker .env

# 编辑配置（根据需要修改密码等敏感信息）
nano .env
```

**重要配置项说明：**

```bash
# 数据库密码（必须修改）
POSTGRES_PASSWORD=your_secure_password_change_this

# JWT 密钥（必须修改，使用强密码）
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# 如果使用 Supabase，填写真实配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 如果有 ComfyUI 服务，填写实际地址
NEXT_PUBLIC_COMFYUI_ENDPOINT=http://host.docker.internal:8188
```

### 3. 构建并启动服务

```bash
# 构建镜像并启动所有服务
docker compose up -d --build

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f app
```

### 4. 访问应用

服务启动后，可以通过以下地址访问：

- **Web 应用**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 常用命令

### 启动服务

```bash
# 启动所有服务
docker compose up -d

# 启动特定服务
docker compose up -d app

# 重新构建并启动
docker compose up -d --build
```

### 停止服务

```bash
# 停止所有服务
docker compose down

# 停止并删除所有数据（谨慎使用）
docker compose down -v
```

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f app
docker compose logs -f postgres

# 查看最近 100 行日志
docker compose logs --tail=100 app
```

### 进入容器

```bash
# 进入应用容器
docker compose exec app sh

# 进入 PostgreSQL 容器
docker compose exec postgres psql -U postgres -d ai_system

# 进入 Redis 容器
docker compose exec redis redis-cli
```

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart app
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build

# 清理旧镜像
docker image prune -f
```

## 数据持久化

### PostgreSQL 数据

数据存储在 Docker volume 中，即使容器删除也不会丢失：

```bash
# 查看所有 volumes
docker volume ls

# 备份 PostgreSQL 数据
docker compose exec postgres pg_dump -U postgres ai_system > backup.sql

# 恢复 PostgreSQL 数据
docker compose exec -T postgres psql -U postgres ai_system < backup.sql

# 导出 volume
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-data-backup.tar.gz -C /data .

# 导入 volume
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-data-backup.tar.gz -C /data
```

### 应用日志

日志持久化到宿主机：

```bash
# 查看日志文件
ls -la logs/

# 清空日志
> logs/app.log
> logs/console.log
```

## 故障排查

### 1. 端口冲突

如果端口 5000 已被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "5001:5000"  # 使用 5001 端口
```

### 2. 服务无法启动

```bash
# 查看详细日志
docker compose logs app

# 检查健康状态
docker compose ps

# 重启服务
docker compose restart app
```

### 3. 数据库连接失败

```bash
# 检查 PostgreSQL 是否正常运行
docker compose ps postgres

# 测试数据库连接
docker compose exec postgres psql -U postgres -d ai_system -c "SELECT 1;"

# 检查网络连接
docker compose exec app ping postgres
```

### 4. 应用构建失败

```bash
# 清理构建缓存
docker compose down
docker system prune -a

# 重新构建
docker compose up -d --build --no-cache
```

### 5. 内存不足

如果遇到内存不足，可以限制容器资源使用：

```yaml
# 在 docker-compose.yml 中添加
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

## 生产环境部署建议

### 1. 使用 HTTPS

使用 Nginx 或 Caddy 反向代理：

```bash
# 安装 Caddy
sudo apt install -y caddy

# 配置 Caddyfile
echo "your-domain.com {
    reverse_proxy localhost:5000
}" | sudo tee /etc/caddy/Caddyfile

# 重启 Caddy
sudo systemctl restart caddy
```

### 2. 数据库安全

- 修改默认密码
- 使用强密码
- 限制数据库只允许应用容器访问
- 定期备份数据

### 3. 监控和日志

- 使用 Docker 健康检查
- 配置日志轮转
- 设置告警机制

### 4. 性能优化

- 使用多阶段构建减小镜像大小
- 启用缓存
- 配置适当的资源限制

## 升级和迁移

### 升级应用版本

```bash
# 停止服务
docker compose down

# 备份数据
docker compose exec postgres pg_dump -U postgres ai_system > backup-$(date +%Y%m%d).sql

# 拉取新代码
git pull

# 重新构建和启动
docker compose up -d --build
```

### 迁移到新服务器

```bash
# 导出 volumes
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/all-volumes.tar.gz -C /data .

# 在新服务器导入
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/all-volumes.tar.gz -C /data

# 启动服务
docker compose up -d
```

## 常见问题

### Q: 如何查看容器资源使用情况？

```bash
docker stats
```

### Q: 如何清理未使用的资源？

```bash
docker system prune -a --volumes
```

### Q: 如何在容器外访问数据库？

```bash
# 端口已映射到 5432
psql -h localhost -p 5432 -U postgres -d ai_system
```

### Q: 如何配置自动启动？

```bash
# 编辑 docker-compose.yml，添加 restart 策略
services:
  app:
    restart: always
```

## 支持

如有问题，请：

1. 查看日志：`docker compose logs app`
2. 检查服务状态：`docker compose ps`
3. 参考本部署文档
4. 联系技术支持

## 附录

### 项目结构

```
.
├── Dockerfile              # 应用镜像构建文件
├── docker-compose.yml      # 服务编排配置
├── .env.docker            # Docker 环境变量示例
├── .dockerignore          # Docker 忽略文件
├── logs/                  # 日志持久化目录
├── uploads/               # 上传文件持久化目录
└── README-Docker.md       # 本文档
```

### 服务说明

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| app | node:24-alpine | 5000 | Next.js 应用 |
| postgres | postgres:16-alpine | 5432 | PostgreSQL 数据库 |
| redis | redis:7-alpine | 6379 | Redis 缓存 |

### 默认账号

- **PostgreSQL**
  - 用户名: `postgres`
  - 密码: `.env` 中配置的 `POSTGRES_PASSWORD`
  - 数据库: `ai_system`
