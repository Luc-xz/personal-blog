FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package*.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN pnpm prisma:generate

# 构建应用
RUN pnpm build

# 创建必要的目录
RUN mkdir -p data uploads logs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]
