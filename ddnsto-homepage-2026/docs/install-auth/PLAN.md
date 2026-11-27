# 官网真实扫码登录接入

正式入口 https://web.ddnsto.com/（www 跳转至此），使用正式后端；console-2026 只读。所有实现留在本项目，不执行安装、不创建设备、不部署生产。M1 真人扫码取令牌已通过，M2 首页接入已通过，M3 正式域名及微信内验收尚未开始。

## 2026-11-27 最新要求：每次扫码，保留控制台登录

用户明确不保留安装入口登录状态，并选择独立临时会话。这取代此前复用已登录账号的方案。不得调用控制台退出登录、删除其 Cookie，或在隔离服务失败时退回共享登录接口。

任务树：隔离会话接口 → 首页每次新建 → 成功/取消/超时清理 → 自动化和真实扫码验收 → 正式部署契约。

验收标准：

- 每次获取命令均新建会话，必须获得并扫描新二维码；刷新或再次点击不能复用旧登录。
- 浏览器认证请求 credentials: omit；既有控制台 Cookie 不上传、不改写，不调用 logout。
- OAuth proof 仅用于 signal_login；设备令牌仍从该次独立会话的 profile 读取。
- Cookie 仅存服务端内存；浏览器只有本轮内存会话 ID，不进 URL、日志或持久存储。
- 成功读取设备令牌即销毁本地隔离会话，取消/错误主动清理，断网或关页清理失败由 240 秒 TTL 兜底。这里销毁的是隔离服务的会话记录及 Cookie，不注销控制台、不撤销设备令牌；上游遗留会话由其自身过期机制处理。
- 设备令牌仅供当前页面展示/复制；切换平台/方式、清除及离开页面同步清空。
- 6002 参考服务保持正常，本地官网只运行 16206。

## 实现边界

- server/install-auth.mjs：固定上游的隔离中间件。只允许 create/status/qr/poll/confirm/profile/close；每次 create 用随机 256 位 ID，新建空 Cookie 容器。仅保留业务 sessionid/csrftoken，SSO 请求不携带 Cookie，其响应 Cookie 丢弃；任意浏览器 Cookie 均忽略，响应不含 Set-Cookie。
- 会话 state、event_id、是否收到扫码事件及登录确认在服务端绑定，不接受任意转发 URL。必须收到扫码事件并核实登录才能读取 profile；只返回 id/token，不转发其他账号资料。每会话串行操作、最多 200 活跃会话、请求体 8KB、上游 35 秒超时；错误不回显上游正文。
- src/features/install-auth/api.ts、session.ts：每轮创建独立 API 实例，删除已登录免扫码及浏览器 JSONP/CSRF 逻辑；失败不回退共享会话。commands.mjs 和命令 UI 保持原规则。
- scripts/install-auth-dev.mjs：仅 opt-in 开发服务器挂载同一中间件及诊断页，删除旧 /api/、/__install-sso/ 共享代理。

本地运行（项目要求 Node >=22.23.4）：

```sh
INSTALL_AUTH_CHECK=1 npm run dev -- --host 0.0.0.0 --port 16206 --ignore-lock
```

人工入口 http://192.168.99.2:16206/#devices 。诊断页 /__install-auth/ 仅供开发，隐藏令牌原文，不进入静态构建。只保留此官网服务，不重新启用 16216。

## 正式部署契约（M3，尚未部署）

**纯 dist 静态文件已不足以支持独立临时扫码。** 正式环境必须同时部署 server/install-auth.mjs 和 server/start.mjs，并把同域 /__install-auth-api/ 转发到隔离进程。官网正文仍是静态 Astro，不必改变控制台代码或其 /api/ 路由。

```sh
INSTALL_AUTH_ORIGIN=https://web.ddnsto.com INSTALL_AUTH_PORT=16209 node server/start.mjs
```

此进程默认仅监听 127.0.0.1，由现有 HTTPS 入口反向代理；生产必须由进程管理器托管，不能使用 Astro dev。不启动第二个对用户开放的官网地址。本次仅提供入口与契约，没有修改正式服务器配置，也没有在本地额外启动该进程。

反向代理仅匹配 /__install-auth-api/，保留 Origin、X-Install-Request 和 X-Install-Session，禁止缓存，长轮询读取超时至少 45 秒。不要记录请求体或会话头；可禁用该 location 的 access log。建议入口配置请求体大小和频率限制。服务不提供 CORS，也不开放任意上游代理。

会话存于单进程内存：M3 部署须使用单实例，或另行设计会话亲和/共享存储；不可将同一扫码轮次随机分发到不同实例。重启会使未完成二维码失效，用户重新扫码即可。现有仅打包 dist 的发布归档不能单独用于本功能上线，发布流程必须一并纳入 server 文件和运行配置。

M3 验收仍需正式域名 HTTPS/反代、真人连续两次扫码取令牌、控制台已登录页保持可用、微信内长按识别、关页及服务重启恢复。自动化模拟与匿名二维码探测不能替代这些实测。
