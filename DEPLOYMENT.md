# 部署说明

## 🐳 Docker 部署

### Dockerfile

```dockerfile
# Base image
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S -u 1001 nodejs

# Copy necessary files
COPY --from=builder /app/public ./public
# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown -R nodejs:nodejs /app/.next

# Automatically leverage output traces to reduce image size
# https://mode.com/blog/nextjs-bundle-optimization/
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
# Copy other files
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://zaep:zaep@postgres:5432/zaep
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - WECHAT_APP_ID=${WECHAT_APP_ID}
      - WECHAT_APP_SECRET=${WECHAT_APP_SECRET}
      - ALIPAY_APP_ID=${ALIPAY_APP_ID}
      - ALIPAY_PRIVATE_KEY=${ALIPAY_PRIVATE_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=zaep
      - POSTGRES_PASSWORD=zaep
      - POSTGRES_DB=zaep
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zaep"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

## 📋 环境变量

创建 `.env.local`:

```env
# Database
DATABASE_URL="postgresql://zaep:zaep@localhost:5432/zaep"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# WeChat OAuth
WECHAT_APP_ID="your-wechat-app-id"
WECHAT_APP_SECRET="your-wechat-app-secret"

# Stripe (International payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."

# Alipay (Domestic payments)
ALIPAY_APP_ID="your-alipay-app-id"
ALIPAY_PRIVATE_KEY="your-alipay-private-key"
```

## 🚀 本地开发

### 1. 安装依赖
```bash
npm install
```

### 2. 设置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 文件
```

### 3. 运行数据库迁移
```bash
npx prisma generate
npx prisma db push
```

### 4. 启动开发服务器
```bash
npm run dev
```

## 🚀 生产部署

### 1. 构建项目
```bash
npm run build
```

### 2. 运行Docker
```bash
docker-compose up -d
```

### 3. 访问应用
```
http://localhost:3000
```

## 📋 部署检查清单

- [ ] 环境变量配置完成
- [ ] 数据库连接测试
- [ ] Redis连接测试
- [ ] SSL证书配置
- [ ] 域名DNS配置
- [ ] CDN配置
- [ ] 监控告警配置
- [ ] 备份策略配置
- [ ] 日志收集配置

## 🔒 安全建议

1. **环境变量保护**
   - 生产环境不要提交 .env 文件
   - 使用 Docker secrets 或云平台的环境变量管理
   - 定期轮换密钥

2. **数据库安全**
   - 使用强密码
   - 启用SSL连接
   - 定期备份数据
   - 限制数据库访问IP

3. **API安全**
   - 启用 HTTPS
   - 实施 CORS 策略
   - 使用 rate limiting
   - 实施输入验证

4. **支付安全**
   - 使用支付平台提供的签名验证
   - 不要在前端存储敏感信息
   - 使用 webhook 验证支付状态
   - 定期对账

## 📊 监控配置

### 1. 应用监控
- 使用 PM2 或 Docker logs
- 配置日志级别
- 配置错误日志

### 2. 数据库监控
- 监控连接数
- 监控慢查询
- 监控数据库大小
- 配置自动备份

### 3. 性能监控
- 监控 API 响应时间
- 监控数据库查询时间
- 监控缓存命中率
- 监控内存使用

### 4. 业务监控
- 监控用户注册数
- 监控订阅数量
- 监控支付成功/失败率
- 监控 API 调用量

## 🔄 CI/CD

建议使用 GitHub Actions 或 GitLab CI/CD：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v2
        with:
          context: ${{ secrets.DOCKER_CONTEXT }}
          push: true

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /app
            git pull
            docker-compose down
            docker-compose pull
            docker-compose up -d
            npm run migrate
```

## 📞 技术支持

如有部署问题，请联系：
- 邮箱: support@zaep.com
- 电话: +86 400-888-8888
- 微信: ZAEP_Support
