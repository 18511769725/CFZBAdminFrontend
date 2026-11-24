# 项目梳理

## 1. 项目概况

- **项目名称**：朝阳企业服务平台商户端（package 名称：`zhaoshangplatform`）
- **项目类型**：基于 Vue 3 的单页 Web 应用
- **主要用途**：为商户后台用户提供订单查询与管理、产品查询与管理等功能。
- **页面形态**：包含 PC 和移动端容器；当前主要业务菜单和页面集中在 PC 端。部分移动端场景会显示“请在PC端查看”。
- **应用入口**：`index.html` 加载 `src/main.js`，根组件 `src/App.vue` 根据 Vue Router 当前路由渲染页面。

## 2. 技术栈

| 类别 | 技术 |
| --- | --- |
| 前端框架 | Vue 3，使用单文件组件及 `<script setup>` |
| 构建工具 | Vite 6 |
| 路由 | Vue Router 4，HTML5 history 模式 |
| 状态管理 | Vuex 4 |
| UI 组件 | Element Plus、Vant |
| HTTP 请求 | Axios，封装于 `src/utils/request.js` |
| 图表与样式 | ECharts、Sass |

项目脚本（`package.json`）：

```bash
npm run dev       # 启动 Vite 开发服务器
npm run build     # 构建生产静态资源
npm run preview   # 本地预览生产构建
```

仓库还提供 `build.sh`，执行 Yarn 构建并将 `dist` 打成 `dist.tar`；该脚本会先删除已有的 `dist` 和 `dist.tar`。

## 3. 目录结构

```text
.
├── index.html                 # HTML 入口
├── package.json               # 依赖及 npm scripts
├── vite.config.js             # Vite 配置（Vue 插件）
├── build.sh                   # 构建并打包 dist.tar
└── src/
    ├── main.js                # Vue 应用初始化、全局插件注册
    ├── App.vue                # 根组件，仅承载 RouterView
    ├── style.css              # 全局样式
    ├── router/index.js        # 路由、设备映射和登录守卫
    ├── store/index.js         # Vuex 用户信息、部门和文件接口配置
    ├── utils/
    │   ├── request.js         # Axios 实例、拦截器和文件处理
    │   ├── device.js          # 设备类型判断
    │   └── index.js           # 日期、时间戳转换
    ├── components/
    │   ├── HomeContainer.vue  # 按屏幕宽度选择 PC/移动端主页
    │   ├── pc/
    │   │   ├── Home.vue       # PC 后台框架、导航、改密和退出
    │   │   ├── LoginView.vue  # 商户登录
    │   │   ├── OrdersView.vue # 订单管理
    │   │   └── ProductsView.vue # 产品管理
    │   └── mobile/
    │       ├── MHome.vue      # 移动端框架
    │       └── MUsePC.vue     # 提示在 PC 端查看
    ├── views/404.vue          # 404 页面
    ├── login.vue              # 另一份登录/授权页面实现
    └── assets/                # 页面图片及 Vue 图标
```

## 4. 页面与路由

路由定义位于 `src/router/index.js`：

| 路径 | 页面/用途 |
| --- | --- |
| `/` | `HomeContainer`，根据窗口宽度切换 PC 或移动端框架 |
| `/orders` | 订单管理 |
| `/products` | 产品管理 |
| `/login` | PC 登录页 |
| `/mtopc` | 移动端“请在PC端查看”提示 |
| `/404` | 404 页面；其他未匹配路径重定向至此 |

路由守卫从 `localStorage` 读取登录标记和用户信息，要求存在登录标记、用户名及用户 ID，并按 `startTime` 检查登录有效期；有效期在当前实现中为 21,600,000 毫秒（6 小时）。验证通过后，将用户信息写入 Vuex。

路由中还定义了 PC/移动端路径映射（例如 `/mlogin`、`/games`、`/policy` 等）。这些映射目标不都能在当前路由表中找到对应页面；修改或启用相关入口前，应确认它们是否由其他部署版本或外部路由提供。

## 5. 主要业务模块

### 登录与用户会话

- PC 登录页调用后端登录接口，成功后将用户标识和登录时间保存到 `localStorage`，并跳转到订单页。
- Vuex 保存当前登录用户信息及用户列表。
- PC 首页提供修改密码和退出登录入口。

### 订单管理

- 支持按合同编号、采购方企业名称、采购人、订单状态和日期范围筛选，并可选择只显示有效订单。
- 支持分页、查看订单详情、附件/图片处理和订单数据下载。
- 业务请求通过 Axios 请求封装发往后端 API。

### 产品管理

- 支持按产品名称和品类筛选、分页及查看产品详情。
- 提供产品上架/下架、品类维护，以及图片、详情图片和视频等文件处理入口。
- 页面数据和操作由后端接口提供。

## 6. 请求与配置

- Axios 实例及 API 基础地址配置在 `src/utils/request.js`；上传相关接口地址配置在 `src/store/index.js`。
- 请求拦截器统一设置请求头，并在本地存在用户 ID 时附加该 ID；响应拦截器处理 JSON 和文件响应。
- 当前项目未在 `package.json` 中提供测试、Lint 或类型检查脚本。
- 请求头中存在直接写在源码里的访问凭据。不要将其复制到文档、提交记录或客户端可见的环境配置中；建议尽快轮换并迁移至安全的服务端代理/凭据管理方案。前端构建产物中的值无法被视为秘密。

## 7. 开发与维护提示

1. 新增页面时，检查 `src/router/index.js` 的路由定义和 `src/components/pc/Home.vue` 的菜单跳转是否同步。
2. 更改用户会话字段时，同时检查登录页、路由守卫和 Vuex 中的数据结构。
3. 更改 API 地址或上传接口时，检查 `src/utils/request.js` 与 `src/store/index.js` 两处配置。
4. 当前设备判断分布在 `src/utils/device.js`（路由守卫）与 `HomeContainer.vue`（按窗口宽度选择框架）；调整移动端断点或行为时应保持二者一致。
5. `src/login.vue` 使用 `uni` API 和小程序页面语义，但当前 `package.json` 未包含 Uni-app 工具链；该文件不属于现有 Vite 应用入口配置的一部分，需确认用途后再纳入构建。
6. `README.md` 目前仍是 Vite/Vue 初始模板说明，项目专用文档以本文为准。
