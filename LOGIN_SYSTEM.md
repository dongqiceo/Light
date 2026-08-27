# CMS 登录系统完整文档

## 系统架构

### 前端 (light-cms)
- 登录页面：`src/pages/Login/index.tsx`
- 获取初始状态：`src/app.ts` 的 `getInitialState()`
- 请求拦截器：在 `app.ts` 的 `request` 配置中自动添加 `Authorization` header

### 后端 (service-java)
- 用户实体：`entity/User.java`
- 用户仓储：`repository/UserRepository.java`  
- 用户服务：`service/UserService.java`
- 登录控制器：`web/LoginController.java`
- 认证拦截器：`interceptor/AuthInterceptor.java`
- 用户表初始化：`config/UserTableInitializer.java`

## 工作流程

### 1. 初始化（应用启动）
- `UserTableInitializer` 在启动时创建 `users` 表
- 初始化默认用户：`admin` / ``

### 2. 登录流程
```
1. 用户在登录页输入用户名和密码
2. 前端 POST /api/v1/login { username, password }
3. 后端 LoginController 验证用户
4. 用户有效，生成 UUID token，存储在 UserService 的内存 map
5. 返回 { code: 100000, data: { token, user } }
6. 前端保存 token 到 localStorage
7. 前端重定向到 /welcome
```

### 3. 后续请求（自动鉴权）
```
1. 前端发送任何请求时，请求拦截器自动添加 Authorization header
2. 格式：Authorization: Bearer {token}
3. 后端 AuthInterceptor 验证 token 有效性
4. token 无效或过期，返回 401，前端清除 localStorage 中的 token 并跳转到登录页
```

### 4. 获取当前用户信息
```
POST /api/v1/user/current
Header: Authorization: Bearer {token}
返回：{ code: 100000, data: { id, username, name, nickName, gender } }
```

### 5. 登出流程
```
1. 用户点击退出按钮
2. 前端 POST /api/v1/logout，带上 Authorization header
3. 后端从 token map 中删除该 token
4. 前端清除 localStorage token，跳转到登录页
```

## API 端点

### POST /api/v1/login
**请求体：**
```json
{
  "username": "admin",
  "password": "1413241"
}
```

**成功响应（code: 100000）：**
```json
{
  "code": 100000,
  "message": "登录成功",
  "data": {
    "token": "xxxxxxxxxxxxxxxx",
    "user": {
      "id": 1,
      "name": "Admin",
      "nickName": "Admin",
      "gender": "MALE"
    }
  }
}
```

**失败响应（code: 401）：**
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

### POST /api/v1/logout
**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 100000,
  "message": "登出成功",
  "data": null
}
```

### POST /api/v1/user/current
**请求头：**
```
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 100000,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "Admin",
    "nickName": "Admin",
    "gender": "MALE"
  }
}
```

## CMS 端点保护

所有 `/light-cms/**` 和 `/api/**` 路由都由 `AuthInterceptor` 保护，除了：
- `/api/v1/login` - 登录接口
- `/api/v1/logout` - 登出接口
- `/health` - 健康检查接口

请求这些保护的接口时，必须在 header 中包含有效的 token。

## Token 机制

### 简单 Token（当前实现）
- 使用 UUID 随机生成
- 存储在内存 `ConcurrentHashMap` 中
- 过期时间：7天
- **限制**：重启后 token 失效，不支持分布式部署

### 改进建议（未来）
1. **使用 JWT**
   - token 包含用户信息，不需要存储
   - 支持分布式部署
   - 依赖：`io.jsonwebtoken:jjwt`

2. **使用 Redis**
   - token 存储到 Redis，支持多实例
   - 可设置过期时间
   - 依赖：`spring-boot-starter-data-redis`

## 默认用户与首次改密

| 用户名 | 密码 | 备注 |
|--------|------|------|
| admin  | admin123 | 首次登录后必须修改 |

用户表中的 `must_change_password` 字段用于记录是否必须首次设置密码。已有 SQLite 数据库启动时会自动增加该字段，旧账号默认需要首次改密；密码修改成功后该字段变为 `0`。

密码接口均需要 `Authorization: Bearer {token}`：

- `POST /api/v1/user/password/initial`：首次设置密码，请求体为 `newPassword`、`confirmPassword`。
- `POST /api/v1/user/password/change`：普通修改密码，请求体为 `currentPassword`、`newPassword`、`confirmPassword`。

密码至少 8 位。修改成功后当前 token 失效，需要重新登录。

## 密码安全建议

当前使用明文密码存储，**不安全**。生产环境应该：
1. 使用 BCrypt 或 Argon2 加密密码
2. 添加盐值
3. 验证时使用密码匹配而不是相等比较

## 依赖项

后端登录系统只依赖已有的 Spring Boot 基础依赖，无需额外添加。

## 测试步骤

1. 构建并运行后端：
```bash
docker compose build backend
docker compose up backend
```

2. 打开 CMS：`http://localhost:8081`

3. 使用默认用户登录：
   - 用户名：`admin`
   - 密码：``

4. 成功登录后会看到 Welcome 欢迎页

5. 点击退出按钮进行登出

## 常见问题

### Q: Token 过期了怎么办？
A: 重新登录即可。token 有效期为 7 天。

### Q: 如何修改用户密码？
A: 首次使用临时密码登录后，系统会强制进入首次设置密码页面。正常登录后可从 CMS 侧栏进入“修改密码”，需要输入当前密码和两次新密码。

### Q: 如何添加新用户？
A: 在 `UserRepository.save()` 基础上实现一个注册或管理员添加用户的接口。

### Q: 能否关闭认证检查？
A: 在 `WebMvcConfig.addInterceptors()` 中修改 `excludePathPatterns()` 来排除需要的路径。
