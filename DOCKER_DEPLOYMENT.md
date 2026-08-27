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

- `light-cms` 静态图片 URL 现在会优先使用浏览器当前域名，如果没有设置 `STATIC_BASE`，则回退到 `http://localhost:3001`。
- 若要在生产环境中使用自定义域名，可修改 `docker-compose.yml` 中的环境变量 `LIGHT_UPLOAD_BASE_URL`。

## 运行docker容器命令
$Env:http_proxy="http://127.0.0.1:7890";$Env:https_proxy="http://127.0.0.1:7890"
docker-compose up -d --build

## 打包全部镜像和运行数据

在项目根目录执行：

```bash
bash ./package-docker.sh
```

PowerShell 使用：

```powershell
.\package-docker.ps1
```

脚本会先构建 `backend`、`web`、`cms` 三个镜像，然后生成 `light-deployment.tar`。压缩包内包含：

- 三个 Docker 镜像（内部文件名为 `images.tar`）
- `service-java/light/public` 静态资源和上传文件
- `service-java/data` SQLite 数据库目录
- `docker-compose.yml`

也可以指定输出文件：

```bash
bash ./package-docker.sh /tmp/light-deployment.tar
```

PowerShell 也可以指定输出文件：

```powershell
.\package-docker.ps1 .\light-deployment.tar
```

在目标机器恢复镜像：

```bash
tar -xf light-deployment.tar images.tar
docker load -i images.tar
```
- 上传接口返回相对路径（如 `/uploads/2026-08-27/xxx.jpg`），前端通过 `resolveImageUrl` 按当前域名拼接，无需配置上传域名。
- `light-cms` 静态图片 URL 优先使用浏览器当前域名；本地 dev 可通过 `STATIC_BASE` 指向后端。
