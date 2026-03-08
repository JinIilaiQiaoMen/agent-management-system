# 🚀 ZAEP部署指南

**项目**：智元企业AI中台 (ZAEP)  
**部署类型**：生产环境

---

## 一、服务器准备

### 1.1 系统要求

| 组件 | 最低配置 | 推荐配置 |
|--------|-----------|-----------|
| CPU | 2核 | 4核 |
| 内存 | 4GB | 8GB |
| 硬盘 | 40GB SSD | 80GB SSD |
| 带宽 | 5M | 10M |
| 操作系统 | Ubuntu 20.04 | Ubuntu 22.04 LTS |

### 1.2 软件依赖

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
node --version  # 目标：18.x LTS

# 安装pnpm
npm install -g pnpm
pnpm --version

# 安装Docker
curl -fsSL https://get.docker.com | sh -
docker --version

# 安装Nginx（可选）
apt install nginx
```

---

## 二、项目部署

### 2.1 方式A：直接部署（推荐用于快速上线）

```bash
# 1. 克隆项目到服务器
cd /var/www
git clone <your-repo-url> zaep

# 2. 安装依赖
cd zaep/projects
pnpm install

# 3. 构建生产版本
pnpm build

# 4. 配置环境变量
cp .env.example .env
# 编辑.env，填入实际值

# 5. 启动应用
nohup pnpm start
```

### 2.2 方式B：Docker部署（推荐用于生产环境）

```bash
# 1. 创建Dockerfile
cd zaep/projects
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制项目文件
COPY package.json pnpm-lock.yaml ./
COPY . /app

# 安装依赖
RUN pnpm install --frozen-lockfile

# 创建.next目录
RUN mkdir -p .next

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["pnpm", "start"]
EOF

# 2. 构建镜像
docker build -t zaep:v1 .

# 3. 推送到镜像仓库
docker tag zaep:v1 <your-registry>/zaep:v1
docker push <your-registry>/zaep:v1

# 4. 在服务器上运行
docker run -d \
  --name zaep \
  -p 3000:3000 \
  -p 8080:8080 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  zaep:v1

# 5. 或使用Docker Compose
cat > docker-compose.yml << 'EOF'
version: '3'
services:
  zaep:
    image: zaep:v1
    container_name: zaep-app
    restart: unless-stopped
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV:production
    volumes:
      - ./data:/app/data
EOF

docker-compose up -d
```

---

## 三、环境配置

### 3.1 .env配置模板

```bash
# ===================
# 项目配置
# ===================
NEXT_PUBLIC_APP_NAME="智元企业AI中台"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# ===================
# 数据库配置
# ===================
# Supabase (AI企业系统)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# PostgreSQL (智能体管理)
PGHOST="localhost"
PGPORT="5432"
PGDATABASE="zaep"
PGUSER="postgres"
PGPASSWORD="your-password"

# Redis (缓存)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# ===================
# AI服务配置
# ===================
# AI供应商 (coze/zhipu/wenxin/tongyi)
AI_PROVIDER="coze"

# Coze
COZE_API_KEY="your-coze-api-key"
COZE_BASE_URL="https://api.coze.com/v1"

# 智谱AI
ZHIPU_API_KEY="your-zhipu-api-key"

# 阿里通义
TONGYI_API_KEY="your-tongyi-api-key"

# 百度文心
WENXIN_API_KEY="your-wenxin-api-key"

# ===================
# OpenClaw配置
# ===================
OPENCLAW_API_URL="https://your-domain.com:5000"
OPENCLAW_API_TOKEN="your-openclaw-token"

# ===================
# 认证配置
# ===================
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
API_SECRET_KEY="your-api-secret-key"
SESSION_SECRET="your-session-secret"
PASSWORD_SALT="your-password-salt"

# ===================
# CORS配置
# ===================
ALLOWED_ORIGINS="https://your-domain.com,https://www.your-domain.com"

# ===================
# 存储配置
# ===================
STORAGE_TYPE="s3"  # s3/local/oss
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_BUCKET_NAME="zaep-bucket"
AWS_REGION="us-east-1"

# ===================
# 第三方服务
# ===================
# 飞书 webhook
FEISHU_WEBHOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/a5900b75-5f0a576b8f5d0"

# 邮件 SMTP
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@your-domain.com"

# ===================
# 日志配置
# ===================
LOG_LEVEL="info"
LOG_FILE="/var/log/zaep/app.log"

# ===================
# 功能开关
# ===================
ENABLE_RATE_LIMIT="true"
ENABLE_CACHING="true"
ENABLE_KNOWLEDGE_BASE="true"
```

### 3.2 生产环境检查清单

```bash
# 部署前检查

echo "✅ 检查环境变量..."
[ -f .env ] && echo "❌ .env文件不存在" || echo "✅ .env文件存在"

echo "✅ 检查数据库连接..."
# pnpm db:test  # 如果配置了数据库测试脚本

echo "✅ 检查API密钥..."
# grep -q "API_KEY" .env

echo "✅ 检查Docker..."
docker --version

echo "✅ 检查端口占用..."
lsof -i :3000 || echo "✅ 端口3000可用"
lsof -i :8080 || echo "✅ 端口8080可用"

echo "✅ 检查防火墙规则..."
sudo ufw status || echo "⚠️ 未配置防火墙"
```

---

## 四、Nginx配置（反向代理）

### 4.1 Nginx配置文件

```nginx
# /etc/nginx/sites-available/zaep.conf

server {
    listen 80;
    server_name your-domain.com;
    root /var/www/zaep;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/rss+xml text/javascript image/svg+xml;
    gzip_min_length 1024;
    gzip_comp_level 6;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3000;
    }

    # SSL证书（配置HTTPS）
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
}

# 重定向HTTP到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4.2 重启Nginx

```bash
# 测试配置
sudo nginx -t

# 重启服务
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 查看日志
sudo tail -f /var/log/nginx/error.log
```

---

## 五、SSL证书配置

### 5.1 Let's Encrypt免费证书

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（交互式）
sudo certbot --nginx -d your-domain.com

# 获取证书（自动续期）
sudo certbot renew --nginx -d your-domain.com

# 测试续期
sudo certbot renew --dry-run --nginx -d your-domain.com
```

### 5.2 SSL证书自动续期配置

```bash
# 添加自动续期
sudo crontab -e

# 编辑crontab
sudo crontab -e

# 添加续期任务（每月1号凌晨2点）
0 2 * * * /usr/bin/certbot renew --quiet --nginx -d your-domain.com

# 查看定时任务
crontab -l

# 删除任务
crontab -e <job-number>
```

---

## 六、数据库配置

### 6.1 PostgreSQL配置

```bash
# 创建数据库
sudo -u postgres createdb zaep

# 连接到数据库
sudo -u postgres psql -h localhost

# 授权应用用户
sudo -u postgres psql -c "CREATE USER zaep WITH PASSWORD 'your-password';"

# 授权数据库
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE zaep TO zaep;"

# 创建表结构
sudo -u postgres psql -d zaep -f /workspace/zaep/docs/SQL/schema.sql

# 创建扩展
sudo -u postgres psql -d zaep -f /workspace/zaep/docs/SQL/extensions.sql
```

### 6.2 Redis配置

```bash
# 编辑Redis配置
sudo nano /etc/redis/redis.conf

# 绑定IP
bind 127.0.0.1

# 设置密码
requirepass your-redis-password

# 持久化配置
save 900 1

# 重启Redis
sudo systemctl restart redis

# 测试连接
redis-cli ping
```

---

## 七、启动和验证

### 7.1 启动应用

```bash
# Docker方式
cd /var/www/zaep
docker-compose up -d

# 查看日志
docker-compose logs -f zaep

# 查看服务状态
docker ps -a

# 重启服务
docker-compose restart zaep

# 停止服务
docker-compose down
```

### 7.2 健康检查

```bash
# 检查应用健康
curl http://your-domain.com/health
curl http://your-domain.com/api/customer-analysis

# 检查Next.js页面
curl -I http://your-domain.com
curl -I http://your-domain.com/ai-hub
curl -I http://your-domain.com/customer-due-diligence
```

### 7.3 检查日志

```bash
# 查看应用日志
docker-compose logs -f zaep --tail 100

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log

# 查看系统资源
htop
df -h

# 查看端口占用
netstat -tulpn | grep :3000
```

---

## 八、故障排查

### 8.1 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 网站打不开 | 防火墙/Nginx | 检查防火墙规则，重启Nginx |
| 数据库连接失败 | 密码错误/端口 | 检查.env配置，检查数据库状态 |
| 页面空白 | 静态资源未加载 | 检查next build输出，检查路径 |
| API报错 | CORS/认证 | 检查ALLOWED_ORIGINS配置 |
| 登录失败 | JWT密钥/Session | 检查.env中的密钥配置 |

### 8.2 重置管理

```bash
# 重置.env.example（清除敏感信息）
cp .env.example .env.clean

# 查看Docker容器状态
docker-compose ps -a

# 重启容器
docker-compose restart zaep

# 完全重置
docker-compose down
docker-compose up -d --force-recreate

# 清理Docker缓存
docker system prune -a

# 重启Nginx
sudo systemctl restart nginx
```

---

## 九、安全加固

### 9.1 防火墙配置

```bash
# UFW基本规则
sudo ufw allow 22          # SSH
sudo ufw allow 80          # HTTP
sudo ufw allow 443         # HTTPS
sudo ufw enable

# 高级规则（可选）
sudo ufw allow from <trusted-ip> to any port 80,443

# 查看规则
sudo ufw status verbose
```

### 9.2 SSH安全

```bash
# 禁用密码登录（可选）
# 编辑 /etc/ssh/sshd_config
PasswordAuthentication no

# 使用SSH密钥（推荐）
ssh-keygen -t rsa -b 4096

# 配置密钥
mkdir -p ~/.ssh
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# 重启SSH
sudo systemctl restart sshd
```

### 9.3 数据库安全

```bash
# PostgreSQL安全配置
# 编辑 /etc/postgresql/*/main/pg_hba.conf
# 限制本地连接
host    all    all    127.0.0.1/32    md5
host    all    all    ::1/128    md5

# 重启PostgreSQL
sudo systemctl restart postgresql

# Redis安全配置
# 编辑 /etc/redis/redis.conf
# 禁用危险命令
rename-command FLUSHDB ""
rename-command CONFIG ""
rename-command SHUTDOWN ""
rename-command SAVE ""
```

### 9.4 应用安全

```bash
# 环境变量安全
chmod 600 .env

# 限制文件权限
find . -type f -exec chmod 644 {} \;

# 运行非root用户
useradd -m -s /bin/bash zaepapp

# 限制sudo权限
zaepapp ALL=(root) NOPASSWD: /usr/bin/pnpm, /usr/bin/node

# 查看进程
ps aux | grep zaep
```

---

## 十、性能优化

### 10.1 Next.js优化

```bash
# 构建优化
pnpm build

# 静态资源优化
# 使用next/image组件
# 配置CDN

# 缓存策略
# 使用Redis
# 启用SWR
```

### 10.2 Nginx优化

```bash
# 配置缓冲区
proxy_buffer_size 4k;
proxy_buffers 8 8k;
proxy_busy_buffers_size 16 16k;

# 启用缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=static max_size=10m inactive=60m use_temp_path=off;

# 配置工作进程
worker_processes auto;
worker_connections 1024;
```

### 10.3 数据库优化

```bash
# PostgreSQL连接池
max_connections = 100;
shared_buffers = 256MB;

# Redis配置
maxmemory 2gb;
maxclients 10000;

# 慢查询日志
slowlog_log_threshold = 200ms;
log_min_duration = 10ms;
```

---

## 十一、监控和告警

### 11.1 应用监控

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start /var/www/zaep/projects

# 设置开机自启
pm2 startup

# 监控
pm2 monit

# 查看日志
pm2 logs
```

### 11.2 日志收集

```bash
# 配置日志轮转
# 编辑next.config.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/var/log/zaep/app.log' })
  ]
});

module.exports = logger;
```

### 11.3 性能监控

```bash
# 使用Prometheus + Grafana
# 或使用APM解决方案
# New Relic
# DataDog
```

---

## 十二、备份和恢复

### 12.1 数据库备份

```bash
# PostgreSQL自动备份
# 编辑 /etc/postgresql/*/main/pg_hba.conf
# 或使用cron
0 2 * * * /usr/bin/pg_dump zaep | gzip > /backup/zaep/postgres-$(date +\%Y\%m\%d).sql.gz

# 保留7天
find /backup/zaep -name "*.sql.gz" -mtime +7 -delete

# 同步到云存储
# 使用rclone同步到阿里云OSS或腾讯云COS
```

### 12.2 应用代码备份

```bash
# Git备份
cd /var/www/zaep
git init
git add .
git commit -m "Initial deployment"

# 推送到GitHub
git remote add origin <your-repo>
git push -u origin main

# 定期备份
git push origin main --force
```

### 12.3 配置文件备份

```bash
# 备份配置文件
cp /var/www/zaep/.env /backup/zaep/.env.$(date +%Y%m%d)

# 备份Nginx配置
sudo cp /etc/nginx/sites-available/zaep.conf /backup/zaep/zaep.conf.$(date +%Y%m%d)

# 备份Docker配置
cp /var/www/zaep/docker-compose.yml /backup/zaep/docker-compose.yml.$(date +%Y%m%d)
```

---

## 十三、更新部署

### 13.1 零停部署更新

```bash
# 1. 更新代码
cd /var/www/zaep
git pull origin main

# 2. 构建新版本
docker build -t zaep:v2 .

# 3. 推送到镜像仓库
docker push <your-registry>/zaep:v2

# 4. 在服务器上拉取镜像
docker pull <your-registry>/zaep:v2

# 5. 停止旧容器
docker-compose down

# 6. 启动新容器
docker-compose up -d --pull-always
```

### 13.2 蓝绿部署（可选）

```bash
# 准备两个环境
# 蓝色：当前运行版本（green）
# 蓝色：新版本（blue）

# 更新路由（Nginx）
# 使用蓝色环境提供者配置蓝绿部署
# 50%流量到新版本，50%到旧版本

# 回滚策略
# 如果新版本出问题，可以快速切换回旧版本
```

---

## 十四、故障处理

### 14.1 自动恢复脚本

```bash
# 创建自动恢复脚本
cat > /var/www/zaep/rollback.sh << 'EOF'
#!/bin/bash

# 停止服务
docker-compose down

# 回滚到上一个版本
docker run --rm zaep:v1

# 检查数据库完整性
# 重新构建
docker build -t zaep:v1

# 启动服务
docker-compose up -d

# 发送告警
# 通过邮件或飞书发送告警信息
EOF

chmod +x /var/www/zaep/rollback.sh
```

### 14.2 监控和报警

```bash
# 配置监控告警
# 使用监控工具自动检测问题
# 规则：CPU使用率>80%持续5分钟
# 规则：内存使用率>90%持续3分钟
# 规则：磁盘使用率>85%立即告警
# 规则：应用无法访问连续3次
# 规则：数据库连接失败立即告警

# 告警方式
# 邮件通知
# 飞书消息
# 短信通知（重要告警）
```

---

## 十五、联系方式

### 技术支持

- 项目文档：`/workspace/projects/workspace/zaep/docs/`
- API文档：`/workspace/projects/workspace/zaep/docs/API.md`
- 部署指南：`/workspace/projects/workspace/zaep/docs/DEPLOY.md`

### 需要帮助？

如遇到部署问题，请提供以下信息：

1. 服务器IP地址
2. 服务器操作系统版本
3. 错误日志内容（`docker-compose logs zaep`）
4. Nginx错误日志（`sudo tail -f /var/log/nginx/error.log`）
5. 当前.env配置（去掉敏感信息）

---

**文档版本**：v1.0  
**更新日期**：2026-03-07  
**部署状态**：待执行
