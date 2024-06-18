FROM node:16

# 创建应用目录
WORKDIR /usr/src/app

# 安装应用依赖
COPY package*.json ./

RUN npm install

# 将应用源代码拷贝到容器中
COPY . .

# 暴露端口
EXPOSE 3000

# 运行应用
CMD [ "node", "index.js" ]
