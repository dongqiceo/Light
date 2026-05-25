# Light CMS 接口文档

本文档描述 **CMS 后台** 调用的管理接口，以及与 **H5 前端** 使用的公开接口的对应关系。后端需实现 CMS 管理接口，并对外提供 H5 所需接口（可与 CMS 同域不同 path 或由网关转发）。

---

## 一、通用说明

| 项目         | 说明                             |
| ------------ | -------------------------------- |
| CMS 基础路径 | 建议 `/light-cms` 或 `/api/cms`  |
| H5 基础路径  | `/api`（见 light 项目 `API.md`） |
| 数据格式     | JSON                             |
| 编码         | UTF-8                            |
| 请求头       | `Content-Type: application/json` |

### 通用响应结构

**成功：**

```json
{
  "code": 100000,
  "message": "success",
  "data": {}
}
```

**失败：**

```json
{
  "code": 100001,
  "message": "错误描述",
  "data": null
}
```

### 分页列表响应（CMS 列表接口）

```json
{
  "code": 100000,
  "data": {
    "content": [],
    "number": 0,
    "size": 10,
    "total": 100
  }
}
```

- `number`: 当前页（从 0 开始）
- `size`: 每页条数
- `total`: 总条数
- `content`: 当前页数据列表

---

## 二、CMS 管理接口（后台使用）

以下为 light-cms 前端调用的接口，用于增删改查各模块数据。

### 2.1 分类管理（对应 H5 产品分类 + 产品详情）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/light-cms/category/list` | 分页查询，body 含 `page`, `pageSize`, `name`, `status` 等 |
| GET | `/light-cms/category/listAll` | 全部分类（不分页），用于下拉等 |
| POST | `/light-cms/category/save` | 新增/更新 |
| POST | `/light-cms/category/delete?id=xxx` | 删除 |
| POST | `/light-cms/category/updateStatus` | 更新状态，body 含 `id`, `status` |

**保存/列表单条数据结构：**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 更新时 | 主键 |
| name | string | 是 | 分类名称（中文/内部），如「磁吸轨道射灯」 |
| nameEn | string | 否 | 英文名称，如 Magnetic Track Spotlights |
| displayNameKey | string | 否 | 多语言 key，如 products.magneticTrackSpotlights |
| folderName | string | 是 | 图片目录名，用于拼接 `/无主灯清晰图片/{folderName}/{文件名}` |
| images | string[] | 否 | 该分类下图片文件名列表，如 ["0907ff2ea383...jpg"] |
| priority | number | 是 | 排序优先级，越小越靠前 |
| status | number | 否 | 0 下架 1 上架，默认 1 |

---

### 2.2 产品管理（单品，可用于精选等）

| 方法 | 路径                               | 说明      |
| ---- | ---------------------------------- | --------- |
| POST | `/light-cms/product/list`          | 分页查询  |
| GET  | `/light-cms/product/listAll`       | 全部      |
| POST | `/light-cms/product/save`          | 新增/更新 |
| POST | `/light-cms/product/delete?id=xxx` | 删除      |
| POST | `/light-cms/product/updateStatus`  | 更新状态  |

**单条数据结构：** id, categoryId, name, image, description, priority, status 等。

---

### 2.3 轮播图管理

| 方法 | 路径                                | 说明      |
| ---- | ----------------------------------- | --------- |
| POST | `/light-cms/carousel/list`          | 分页查询  |
| POST | `/light-cms/carousel/save`          | 新增/更新 |
| POST | `/light-cms/carousel/delete?id=xxx` | 删除      |
| POST | `/light-cms/carousel/updateStatus`  | 更新状态  |

**单条数据结构：** id, title, description, image, link, priority, status。

---

### 2.4 精选产品管理

| 方法 | 路径                                | 说明      |
| ---- | ----------------------------------- | --------- |
| POST | `/light-cms/featured/list`          | 分页查询  |
| POST | `/light-cms/featured/save`          | 新增/更新 |
| POST | `/light-cms/featured/delete?id=xxx` | 删除      |

**单条数据结构（与 H5 首页精选区块一致）：**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | number | 更新时 | 主键 |
| name | string | 是 | 名称或 i18n key，如 products.magneticTrackSpotlights |
| desc | string | 否 | 简短描述 |
| image | string | 是 | 图片路径，如 /无主灯清晰图片/磁吸轨道射灯/xxx.jpg |
| category | string | 否 | 分类标识，如 magnetic-track-spotlights |
| priority | number | 是 | 排序 |

---

### 2.5 网站设置

| 方法 | 路径                       | 说明                 |
| ---- | -------------------------- | -------------------- |
| GET  | `/light-cms/settings`      | 获取站点配置（单条） |
| POST | `/light-cms/settings/save` | 保存                 |

**数据结构：** siteName, siteTitle, siteDescription, contactEmail, contactPhone, address, facebook, instagram, twitter 等。

---

## 三、H5 端公开接口（前端调用）

H5 页面使用的接口定义见 **light 项目根目录 `API.md`**。此处仅列出与 CMS 数据源的对应关系，便于后端从 CMS 库表/配置生成以下接口。

### 3.1 首页

| H5 接口 | 数据来源 | 说明 |
| --- | --- | --- |
| GET /api/products/featured?limit=6 | CMS 精选产品表，按 priority 排序取前 limit 条，只返回 id, name, desc, image, category | 首页精选区块 |
| GET /api/carousels | CMS 轮播图表，status=1，按 priority 排序，返回 [{ id, title, description, image, link }] | 首页轮播（若使用） |

### 3.2 产品

| H5 接口 | 数据来源 | 说明 |
| --- | --- | --- |
| GET /api/product-categories | CMS 分类表，status=1，按 priority 排序，返回 id, name, displayNameKey, folderName, images | 产品页分类与图片网格 |
| GET /api/products/:categoryId | CMS 分类表 id=categoryId 的单条，返回 id, name, displayNameKey, folderName, images, price?, specifications? | 产品详情页 |

### 3.3 关于 / 联系 / 通用

| H5 接口                         | 数据来源            |
| ------------------------------- | ------------------- |
| GET /api/about                  | 关于我们配置或 i18n |
| GET /api/company-info           | 公司信息配置        |
| GET /api/team-members           | 团队成员表          |
| POST /api/contact               | 联系表单提交        |
| GET /api/settings               | CMS 网站设置        |
| GET /api/translations?locale=xx | 多语言文案          |

---

## 四、字段对照速查

| H5 页面/接口 | CMS 模块 | 关键字段对应 |
| --- | --- | --- |
| Home 精选 | 精选产品 | name, desc, image, category |
| Home 轮播 | 轮播图 | title, description, image, link |
| Products 分类列表 | 分类管理 | id, name, displayNameKey, folderName, images |
| ProductDetail | 分类管理（同分类） | folderName, images；可选 price, specifications |

---

## 五、错误码建议

| 错误码 | 说明       |
| ------ | ---------- |
| 100000 | 成功       |
| 100001 | 通用错误   |
| 100002 | 参数错误   |
| 100006 | 资源不存在 |

---

后端实现时：

- CMS 管理接口按第二节路径与 body 实现即可与 light-cms 前端联调。
- H5 接口按 light/API.md 的路径与响应格式实现，数据从上述 CMS 表/配置中查询并组装。
