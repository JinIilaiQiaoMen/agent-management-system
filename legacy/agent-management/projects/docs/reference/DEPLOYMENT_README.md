# 📦 部署包说明

此目录包含在其他电脑上部署智能体管理系统所需的所有配置文件。

## 📁 文件清单

### 环境配置文件
- `.env.example` - 开发环境配置示例
- `.env.production.example` - 生产环境配置示例

### Docker配置文件
- `Dockerfile` - Docker镜像构建文件
- `docker-compose.yml` - Docker Compose编排文件
- `.dockerignore` - Docker忽略文件列表

### Nginx配置
- `nginx/nginx.conf` - Nginx反向代理配置

### 数据库初始化
- `init-db.sql` - 数据库初始化脚本

### 部署脚本
- `deploy.sh` - Linux/macOS自动部署脚本
- `deploy.bat` - Windows自动部署脚本

### 部署文档
- `DEPLOYMENT.md` - 完整部署指南
- `QUICK_START.md` - 5分钟快速部署指南

## 🚀 快速开始

### Linux/macOS

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env

# 2. 一键部署
chmod +x deploy.sh
./deploy.sh install
```

### Windows

```cmd
# 1. 配置环境变量
copy .env.example .env
notepad .env

# 2. 一键部署
deploy.bat install
```

## 📖 详细文档

- [快速部署指南](./QUICK_START.md) - 5分钟快速上手
- [完整部署文档](./DEPLOYMENT.md) - 详细的部署说明

## ⚙️ 环境变量配置

### 必填配置

```env
# 数据库连接
DATABASE_URL=postgresql://postgres:password@localhost:5432/agent_management

# Coze对象存储
COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
COZE_BUCKET_NAME=your-bucket-name
COZE_BUCKET_REGION=your-region
```

### 可选配置

- Redis缓存配置
- 安全配置（JWT密钥等）
- 日志配置
- 监控配置

详见 `.env.example` 文件中的详细说明。

## 🐳 Docker服务

部署脚本会自动启动以下服务：

1. **app** - 主应用服务 (端口 5000)
2. **postgres** - PostgreSQL数据库 (端口 5432)
3. **redis** - Redis缓存 (端口 6379)
4. **nginx** - 反向代理 (端口 80/443，生产环境)

## 📝 常用命令

```bash
# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看日志
./deploy.sh logs

# 备份数据库
./deploy.sh backup

# 清理资源
./deploy.sh cleanup

# 查看帮助
./deploy.sh help
```

## 🔧 系统要求

- **操作系统**: Linux, macOS, Windows 10+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **CPU**: 2核心+
- **内存**: 4GB+
- **磁盘**: 20GB+

## 🏗️ 架构说明

```
┌─────────────┐
│   Nginx     │
│  (80/443)   │
└──────┬──────┘
       │
┌──────▼──────┐
│  App (5000) │
└──────┬──────┘
       │
       ├───────────┐
       │           │
┌──────▼──┐  ┌────▼────┐
│PostgreSQL│  │  Redis  │
│  (5432)  │  │  (6379) │
└─────────┘  └─────────┘
```

## 🔐 安全建议

1. **修改默认密码**: 修改 `.env` 中的数据库密码
2. **使用HTTPS**: 生产环境配置SSL证书
3. **启用防火墙**: 只开放必要端口
4. **定期备份**: 设置自动备份计划
5. **监控日志**: 定期检查应用日志

## 📊 性能优化

1. **启用缓存**: 确保 `ENABLE_CACHING=true`
2. **调整资源**: 修改 `docker-compose.yml` 中的资源限制
3. **使用CDN**: 将静态文件上传到CDN
4. **优化数据库**: 调整PostgreSQL配置参数

## 🐛 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
netstat -tlnp | grep 5000

# 清理并重新构建
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps postgres

# 重启数据库
docker-compose restart postgres

# 查看数据库日志
docker-compose logs postgres
```

### 端口冲突

```bash
# 修改.env中的端口
PORT=5001

# 或修改docker-compose.yml中的端口映射
ports:
  - "5001:5000"
```

## 📞 获取帮助

- 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细文档
- 查看日志: `./deploy.sh logs`
- 提交Issue到项目仓库

## 🔄 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
./deploy.sh update
```

## 📝 备份与恢复

```bash
# 备份数据库
./deploy.sh backup

# 恢复数据库
./deploy.sh restore backup.sql
```

---

**部署成功后，访问 http://localhost:5000 开始使用！** 🎉
