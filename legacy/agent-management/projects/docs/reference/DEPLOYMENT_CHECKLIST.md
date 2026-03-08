# ✅ 部署前检查清单

在部署智能体管理系统之前，请完成以下检查：

## 🖥️ 系统环境检查

- [ ] 操作系统为 Linux (Ubuntu 20.04+) / macOS 10.15+ / Windows 10+
- [ ] CPU 至少 2 核心
- [ ] 内存至少 4GB
- [ ] 磁盘可用空间至少 20GB
- [ ] 已安装 Docker 20.10 或更高版本
- [ ] 已安装 Docker Compose 2.0 或更高版本

## 🔧 软件安装检查

```bash
# 检查 Docker 版本
docker --version
# 预期输出: Docker version 20.10.x 或更高

# 检查 Docker Compose 版本
docker-compose --version
# 或
docker compose version
# 预期输出: Docker Compose version 2.x.x 或更高

# 检查 Docker 服务状态
docker ps
# 预期输出: 列出正在运行的容器（可为空）

# 检查磁盘空间
df -h
# 预期输出: 至少 20GB 可用空间
```

## 📝 配置文件检查

- [ ] 已复制 `.env.example` 为 `.env`
- [ ] 已编辑 `.env` 文件
- [ ] 已填写数据库连接字符串 `DATABASE_URL`
- [ ] 已填写 Coze 对象存储配置
  - [ ] `COZE_BUCKET_ENDPOINT_URL`
  - [ ] `COZE_BUCKET_NAME`
  - [ ] `COZE_BUCKET_REGION`
- [ ] 已修改默认密码（生产环境必须）

## 🔑 安全配置检查（生产环境）

- [ ] 已使用强密码（至少16字符，包含大小写字母、数字、特殊字符）
- [ ] 已配置 `JWT_SECRET`（至少32字符）
- [ ] 已配置 `API_SECRET_KEY`
- [ ] 已配置 Redis 密码（如使用）
- [ ] 已配置 SSL 证书（生产环境）
- [ ] 已配置防火墙规则
- [ ] 已设置自动备份计划

## 🌐 网络配置检查

- [ ] 端口 5000 未被占用
- [ ] 端口 5432 未被占用（PostgreSQL）
- [ ] 端口 6379 未被占用（Redis）
- [ ] 端口 80 未被占用（Nginx，如使用）
- [ ] 端口 443 未被占用（Nginx HTTPS，如使用）

```bash
# 检查端口占用
netstat -tlnp | grep -E '5000|5432|6379|80|443'
# 或
ss -tlnp | grep -E '5000|5432|6379|80|443'
```

## 📦 依赖服务检查

- [ ] PostgreSQL 数据库可访问（如使用外部数据库）
- [ ] Redis 可访问（如使用外部 Redis）
- [ ] 对象存储服务可访问（S3兼容）
- [ ] 网络连接正常，可访问外部 API

## 📁 目录权限检查

- [ ] 当前用户有读写权限
- [ ] 可以创建日志目录 `logs/`
- [ ] 可以创建上传目录 `uploads/`
- [ ] 可以创建 SSL 目录 `nginx/ssl/`（如使用 Nginx）

```bash
# 检查权限
ls -la

# 创建必要目录
mkdir -p logs uploads nginx/ssl
chmod 755 logs uploads nginx/ssl
```

## 🔍 Docker 配置检查

- [ ] Docker 服务正在运行
- [ ] Docker 用户组权限已配置（Linux/macOS）
- [ ] Docker Compose 文件语法正确

```bash
# 检查 Docker Compose 语法
docker-compose config
# 预期输出: 配置信息，无错误
```

## 🚀 部署前最后检查

- [ ] 已阅读部署文档 `DEPLOYMENT.md`
- [ ] 已阅读快速部署指南 `QUICK_START.md`
- [ ] 已备份数据库（如迁移现有数据）
- [ ] 已通知团队成员维护窗口
- [ ] 已准备好回滚方案

## ✅ 开始部署

如果以上所有项目都已检查完成，可以开始部署：

```bash
# Linux/macOS
./deploy.sh install

# Windows
deploy.bat install
```

## 📊 部署后验证

部署完成后，请验证：

- [ ] 所有容器正常运行：`docker-compose ps`
- [ ] 应用可访问：`http://localhost:5000`
- [ ] 健康检查通过：`http://localhost:5000/api/health`
- [ ] 数据库连接正常
- [ ] 日志无错误信息：`docker-compose logs`

```bash
# 健康检查
curl http://localhost:5000/api/health
# 预期输出: {"status":"healthy",...}

# 查看日志
docker-compose logs -f
```

## 🔄 回滚检查清单

如果部署失败，准备回滚：

- [ ] 保留部署前的备份
- [ ] 知道如何停止服务：`./deploy.sh stop`
- [ ] 知道如何恢复数据库：`./deploy.sh restore`
- [ ] 保留完整的错误日志

## 📞 获取帮助

如果遇到问题：

1. 查看部署日志：`docker-compose logs`
2. 查看环境变量：`cat .env`
3. 查看部署文档：`DEPLOYMENT.md`
4. 提交 Issue 到项目仓库

---

**检查清单完成！祝您部署顺利！** 🎉
