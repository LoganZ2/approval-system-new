FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括devDependencies）
RUN npm install

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 开发模式启动（支持热重载）
CMD ["npm", "run", "start:dev"]