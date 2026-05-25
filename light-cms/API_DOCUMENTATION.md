# API 接口文档

## 基础信息

- **基础路径**: `light-cms`
- **响应格式**:
  ```json
  {
    "code": 100000,
    "data": {},
    "msg": "success"
  }
  ```

---

## 一、分类管理接口

### 1.1 查询分类列表（分页）

**接口地址**: `POST /V1/category/list`

**请求参数**:

| 参数名   | 类型   | 必填 | 说明                 |
| -------- | ------ | ---- | -------------------- |
| name     | String | 否   | 分类名称（模糊查询） |
| status   | Number | 否   | 状态：0-下架，1-上架 |
| page     | Number | 是   | 页码，从 1 开始      |
| pageSize | Number | 是   | 每页数量             |

**请求示例**:

```json
{
  "name": "分类名称",
  "status": 1,
  "page": 1,
  "pageSize": 10
}
```

**响应数据**:

| 字段名                    | 类型   | 说明                                  |
| ------------------------- | ------ | ------------------------------------- |
| code                      | Number | 响应码，100000 表示成功               |
| data                      | Object | 分页数据对象                          |
| data.content              | Array  | 分类列表数组                          |
| data.content[].id         | Number | 分类 ID                               |
| data.content[].name       | String | 分类名称                              |
| data.content[].priority   | Number | 优先级                                |
| data.content[].status     | Number | 状态：0-下架，1-上架                  |
| data.content[].createTime | String | 创建时间（格式：YYYY-MM-DD HH:mm:ss） |
| data.content[].updateTime | String | 更新时间（格式：YYYY-MM-DD HH:mm:ss） |
| data.content[].operatorId | String | 操作人 ID                             |
| data.number               | Number | 当前页码（从 0 开始）                 |
| data.size                 | Number | 每页数量                              |
| data.totalElements        | Number | 总记录数                              |

**响应示例**:

```json
{
  "code": 100000,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "电子产品",
        "priority": 1,
        "status": 1,
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00",
        "operatorId": "admin"
      }
    ],
    "number": 0,
    "size": 10,
    "totalElements": 1
  }
}
```

---

### 1.2 获取所有分类（不分页）

**接口地址**: `GET /V1/category/listAll`

**请求参数**: 无

**响应数据**:

| 字段名          | 类型   | 说明                    |
| --------------- | ------ | ----------------------- |
| code            | Number | 响应码，100000 表示成功 |
| data            | Array  | 分类列表数组            |
| data[].id       | Number | 分类 ID                 |
| data[].name     | String | 分类名称                |
| data[].priority | Number | 优先级                  |
| data[].status   | Number | 状态：0-下架，1-上架    |

**响应示例**:

```json
{
  "code": 100000,
  "data": [
    {
      "id": 1,
      "name": "电子产品",
      "priority": 1,
      "status": 1
    }
  ]
}
```

---

### 1.3 保存分类（新增/编辑）

**接口地址**: `POST /V1/category/save`

**请求参数**:

| 参数名   | 类型   | 必填 | 说明                              |
| -------- | ------ | ---- | --------------------------------- |
| id       | Number | 否   | 分类 ID（编辑时必传，新增时不传） |
| name     | String | 是   | 分类名称                          |
| priority | Number | 是   | 优先级                            |

**请求示例**:

```json
{
  "id": 1,
  "name": "电子产品",
  "priority": 1
}
```

**响应数据**:

| 字段名 | 类型   | 说明                    |
| ------ | ------ | ----------------------- |
| code   | Number | 响应码，100000 表示成功 |
| msg    | String | 响应消息                |

**响应示例**:

```json
{
  "code": 100000,
  "msg": "保存成功"
}
```

---

### 1.4 删除分类

**接口地址**: `POST /V1/category/delete?id={id}`

**请求参数**:

| 参数名 | 类型   | 必填 | 说明    | 位置       |
| ------ | ------ | ---- | ------- | ---------- |
| id     | Number | 是   | 分类 ID | Query 参数 |

**请求示例**:

```
POST /V1/category/delete?id=1
```

**响应数据**:

| 字段名 | 类型   | 说明                    |
| ------ | ------ | ----------------------- |
| code   | Number | 响应码，100000 表示成功 |
| msg    | String | 响应消息                |

**响应示例**:

```json
{
  "code": 100000,
  "msg": "success"
}
```

---

### 1.5 更新分类状态

**接口地址**: `POST /V1/category/updateStatus`

**请求参数**:

| 参数名 | 类型   | 必填 | 说明                 |
| ------ | ------ | ---- | -------------------- |
| id     | Number | 是   | 分类 ID              |
| status | Number | 是   | 状态：0-下架，1-上架 |

**请求示例**:

```json
{
  "id": 1,
  "status": 1
}
```

**响应数据**:

| 字段名 | 类型   | 说明                    |
| ------ | ------ | ----------------------- |
| code   | Number | 响应码，100000 表示成功 |
| msg    | String | 响应消息                |

**响应示例**:

```json
{
  "code": 100000,
  "msg": "success"
}
```

---

## 二、产品管理接口

### 2.1 查询产品列表（分页）

**接口地址**: `POST /V1/product/list`

**请求参数**:

| 参数名     | 类型   | 必填 | 说明                 |
| ---------- | ------ | ---- | -------------------- |
| name       | String | 否   | 产品名称（模糊查询） |
| categoryId | Number | 否   | 分类 ID              |
| page       | Number | 是   | 页码，从 1 开始      |
| pageSize   | Number | 是   | 每页数量             |

**请求示例**:

```json
{
  "name": "产品名称",
  "categoryId": 1,
  "page": 1,
  "pageSize": 10
}
```

**响应数据**:

| 字段名                      | 类型   | 说明                                  |
| --------------------------- | ------ | ------------------------------------- |
| code                        | Number | 响应码，100000 表示成功               |
| data                        | Object | 分页数据对象                          |
| data.content                | Array  | 产品列表数组                          |
| data.content[].id           | Number | 产品 ID                               |
| data.content[].name         | String | 产品名称                              |
| data.content[].price        | Number | 产品价格（保留 2 位小数，单位：美元） |
| data.content[].categoryName | String | 分类名称                              |
| data.content[].image        | String | 产品图片 URL                          |
| data.content[].description  | String | 产品描述                              |
| data.content[].createTime   | String | 创建时间（格式：YYYY-MM-DD HH:mm:ss） |
| data.content[].updateTime   | String | 更新时间（格式：YYYY-MM-DD HH:mm:ss） |
| data.content[].operatorId   | String | 操作人 ID                             |
| data.number                 | Number | 当前页码（从 0 开始）                 |
| data.size                   | Number | 每页数量                              |
| data.totalElements          | Number | 总记录数                              |

**响应示例**:

```json
{
  "code": 100000,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "iPhone 15",
        "price": 999.99,
        "categoryName": "电子产品",
        "image": "https://example.com/image.jpg",
        "description": "最新款iPhone",
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00",
        "operatorId": "admin"
      }
    ],
    "number": 0,
    "size": 10,
    "totalElements": 1
  }
}
```

---

### 2.2 保存产品（新增/编辑）

**接口地址**: `POST /V1/product/save`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | Number | 否 | 产品 ID（编辑时必传，新增时不传） |
| name | String | 是 | 产品名称 |
| price | Number | 是 | 产品价格（保留 2 位小数，最小值 0，单位：美元） |
| categoryId | Number | 是 | 分类 ID |
| image | String | 是 | 产品图片 URL（通过上传接口获取） |
| description | String | 否 | 产品描述 |

**请求示例**:

```json
{
  "id": 1,
  "name": "iPhone 15",
  "price": 999.99,
  "categoryId": 1,
  "image": "https://example.com/image.jpg",
  "description": "最新款iPhone"
}
```

**响应数据**:

| 字段名 | 类型   | 说明                    |
| ------ | ------ | ----------------------- |
| code   | Number | 响应码，100000 表示成功 |
| msg    | String | 响应消息                |

**响应示例**:

```json
{
  "code": 100000,
  "msg": "保存成功"
}
```

---

### 2.3 删除产品

**接口地址**: `POST /V1/product/delete?id={id}`

**请求参数**:

| 参数名 | 类型   | 必填 | 说明    | 位置       |
| ------ | ------ | ---- | ------- | ---------- |
| id     | Number | 是   | 产品 ID | Query 参数 |

**请求示例**:

```
POST /V1/product/delete?id=1
```

**响应数据**:

| 字段名 | 类型   | 说明                    |
| ------ | ------ | ----------------------- |
| code   | Number | 响应码，100000 表示成功 |
| msg    | String | 响应消息                |

**响应示例**:

```json
{
  "code": 100000,
  "msg": "success"
}
```

---

## 三、通用说明

### 3.1 状态码说明

- `100000`: 操作成功
- 其他: 操作失败，具体错误信息见 `msg` 字段

### 3.2 分页说明

- 分页参数从 1 开始（前端传递）
- 后端返回的 `number` 字段从 0 开始（Spring Data JPA 标准）
- 前端显示时需要将 `number + 1` 作为当前页码

### 3.3 时间格式

所有时间字段统一使用格式：`YYYY-MM-DD HH:mm:ss`

### 3.4 图片上传

产品图片上传接口：`POST /light-cms/upload`

上传成功后返回图片 URL，将该 URL 作为 `image` 字段值传递给保存产品接口。
