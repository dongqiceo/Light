FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .npmrc ./
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install -g pnpm@10.0.0
RUN pnpm config set registry https://registry.npmmirror.com/
RUN pnpm install
COPY . .
RUN pnpm build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
