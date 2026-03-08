# 📦 部署配置文件清单

已为您创建了完整的部署环境配置，可以在其他电脑上快速部署智能体管理系统。

## 📁 新增文件列表

### 1. 环境配置文件（3个）

- **`.env.example`** - 开发环境配置示例
  - 包含所有可配置的环境变量
  - 详细的中文注释说明

- **`.env.production.example`** - 生产环境配置示例
  - 生产环境最佳实践配置
  - 安全配置模板

- **`.env.dockerignore`** - Docker忽略文件
  - 排除不必要的文件和目录

### 2. Docker配置文件（3个）

- **`Dockerfile`** - Docker镜像构建文件
  - 多阶段构建优化
  - 最小化镜像体积
  - 安全用户配置
  - 健康检查

- **`docker-compose.yml`** - Docker Compose编排文件
  - 应用服务配置
  - PostgreSQL数据库
  - Redis缓存
  - Nginx反向代理（可选）
  - 网络和卷配置

- **`.dockerignore`** - Docker忽略文件列表
  - 排除开发文件
  - 减小镜像体积
  - 提高构建速度

### 3. Nginx配置（1个）

- **`nginx/nginx.conf`** - Nginx反向代理配置
  - HTTP和HTTPS支持
  - 静态文件缓存
  - API代理配置
  - 上传大小限制
  - 健康检查端点

### 4. 数据库配置（1个）

- **`init-db.sql`** - 数据库初始化脚本
  - 创建必要的扩展
  - 创建用户和数据库
  - 权限配置

### 5. 部署脚本（2个）

- **`deploy.sh`** - Linux/macOS自动部署脚本
  - 一键安装部署
  - 服务管理（启动/停止/重启）
  - 数据库备份/恢复
  - 日志查看
  - 资源清理

- **`deploy.bat`** - Windows自动部署脚本
  - 与deploy.sh功能相同
  - 适配Windows命令

### 6. 部署文档（5个）

- **`DEPLOYMENT.md`** - 完整部署指南
  - 系统要求
  - 详细部署步骤
  - 环境配置说明
  - 常用操作
  - 故障排查
  - 生产环境配置

- **`QUICK_START.md`** - 5分钟快速部署指南
  - 简化的部署步骤
  - 快速上手

- **`DEPLOYMENT_README.md`** - 部署包说明
  - 文件清单
  - 快速开始
  - 架构说明
  - 常用命令

- **`DEPLOYMENT_CHECKLIST.md`** - 部署前检查清单
  - 系统环境检查
  - 配置文件检查
  - 安全配置检查
  - 网络配置检查
  - 部署验证

- **`README.md`** - 更新了部署章节
  - 添加了快速部署说明
  - 链接到详细文档

### 7. 应用配置（2个）

- **`next.config.ts`** - 更新了Next.js配置
  - 添加了 `output: 'standalone'` 优化Docker部署
  - 启用了性能优化选项

- **`src/app/api/health/route.ts`** - 健康检查API
  - 用于Docker健康检查
  - 返回系统状态信息

## 🚀 使用方法

### 快速部署（5分钟）

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env  # 编辑必填配置项

# 2. 一键部署
chmod +x deploy.sh
./deploy.sh install

# 3. 访问应用
# 浏览器打开: http://localhost:5000
```

### Windows部署

```cmd
# 1. 配置环境变量
copy .env.example .env
notepad .env

# 2. 一键部署
deploy.bat install

# 3. 访问应用
# 浏览器打开: http://localhost:5000
```

## 📋 必填配置项

编辑 `.env` 文件，至少填写以下配置：

```env
# 数据库
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/agent_management

# Coze对象存储
COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
COZE_BUCKET_NAME=your-bucket-name
COZE_BUCKET_REGION=your-region
```

## 📖 详细文档

1. [快速部署指南](./QUICK_START.md) - 5分钟快速上手
2. [完整部署指南](./DEPLOYMENT.md) - 详细部署说明
3. [部署包说明](./DEPLOYMENT_README.md) - 部署文件说明
4. [部署前检查清单](./DEPLOYMENT_CHECKLIST.md) - 部署前准备

## 🐳 Docker服务架构

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

## 🔧 常用命令

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

# 恢复数据库
./deploy.sh restore backup.sql

# 清理资源
./deploy.sh cleanup

# 查看帮助
./deploy.sh help
```

## ⚙️ 系统要求

- **操作系统**: Linux, macOS, Windows 10+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **CPU**: 2核心+
- **内存**: 4GB+
- **磁盘**: 20GB+

## 🔐 安全建议

1. 修改默认密码
2. 使用HTTPS（生产环境）
3. 启用防火墙
4. 定期备份数据
5. 监控日志

## 📞 获取帮助

- 查看部署文档：`DEPLOYMENT.md`
- 查看快速指南：`QUICK_START.md`
- 查看日志：`./deploy.sh logs`
- 提交Issue到项目仓库

---

**所有配置文件已创建完成，可以开始部署！** 🎉
