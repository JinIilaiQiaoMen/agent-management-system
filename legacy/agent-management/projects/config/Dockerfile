# ============================================
# 多阶段构建 Dockerfile
# 用于生产环境部署
# ============================================

# ============================================
# 阶段 1: 依赖安装
# ============================================
FROM node:24-alpine AS deps

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 复制包管理文件
COPY package.json pnpm-lock.yaml* ./

# 安装 pnpm
RUN corepack enable pnpm && pnpm version

# 安装依赖
RUN pnpm install --frozen-lockfile

# ============================================
# 阶段 2: 构建器
# ============================================
FROM node:24-alpine AS builder

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用
RUN pnpm build

# ============================================
# 阶段 3: 生产运行
# ============================================
FROM node:24-alpine AS runner

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat dumb-init

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置工作目录
WORKDIR /app

# 从 builder 阶段复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 5000

# 环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# 使用 dumb-init 启动
ENTRYPOINT ["dumb-init", "--"]

# 启动命令
CMD ["node", "server.js"]
