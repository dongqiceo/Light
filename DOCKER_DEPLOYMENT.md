# Docker Deployment for Light Project

## 目录
- `docker-compose.yml`：统一启动后端、前端和 CMS 3 个服务
- `service-java/Dockerfile`：构建 Spring Boot 后端镜像
- `light-vite/Dockerfile`：构建并使用 Nginx 发布前端静态网站
- `light-cms/Dockerfile`：构建并使用 Nginx 发布后台管理页面
- `light-vite/nginx.conf`：前端静态资源及 API 代理配置
- `light-cms/nginx.conf`：CMS 静态资源及 API 代理配置

## 运行步骤

1. 在项目根目录执行：
```bash
docker compose build
```

2. 启动并测试：
```bash
docker compose up -d
```

3. 访问服务：
- 前端：`http://localhost:8080`
- 管理后台：`http://localhost:8081`
- 后端 API：`http://localhost:3001`

## Aliyun 部署建议

1. 将当前仓库推送到 Git 或打包为 ZIP 上传。
2. 在阿里云应用服务中选择 Docker 或容器镜像部署。
3. 使用 `docker compose` 或 CI/CD 构建镜像。
4. 需要暴露端口时，请确保安全组允许 `3001` / `8080` / `8081`。

## 数据目录说明

- `./assets`：后端静态资源目录，直接挂载到容器 `/app/assets`
- `./service-java/data`：SQLite 数据库目录，挂载到容器 `/app/data`

## 注意

- 上传接口返回相对路径（如 `/uploads/2026-08-27/xxx.jpg`），前端通过 `resolveImageUrl` 按当前域名拼接，无需配置上传域名。
- `light-cms` 静态图片 URL 优先使用浏览器当前域名；本地 dev 可通过 `STATIC_BASE` 指向后端。
