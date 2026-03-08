# 使用官方 Node.js 24 镜像作为基础镜像
FROM node:24-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm@9.0.0

# 设置工作目录
WORKDIR /app

# 复制 pnpm 锁定文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段
FROM node:24-alpine AS production

# 安装 pnpm
RUN npm install -g pnpm@9.0.0

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=5000

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制构建产物
COPY --from=base --chown=nextjs:nodejs /app/.next ./.next
COPY --from=base --chown=nextjs:nodejs /app/node_modules/.cache ./node_modules/.cache
COPY --from=base --chown=nextjs:nodejs /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/src ./src
COPY --from=base --chown=nextjs:nodejs /app/.coze ./.coze
COPY --from=base --chown=nextjs:nodejs /app/next.config.* ./

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["pnpm", "start"]
