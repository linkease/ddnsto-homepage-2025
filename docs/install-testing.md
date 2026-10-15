# 安装页本地验证

所有命令均在 `servers/ddnsto-homepage-2025` 执行。本功能没有新增 npm 依赖，不需要部署、提交或推送即可验证。

## 当前环境边界

一键安装流程目前**只在 `npm run dev` 调试环境启用**，以 Next.js 的构建期 `NODE_ENV === 'development'` 判定，不提供可由 URL、域名或浏览器存储打开的开关。

| 运行方式 | 行为 |
| --- | --- |
| `npm run dev` | 首页显示新安装入口和平台预选链接，`/install?platform=macos` 可复制测试版命令 |
| `npm run build`，发布 `out/` | 保留原平台卡片切换、原内嵌安装教程、原文档链接、原相对控制台 `/app/#/devices`；不包含一键安装入口或安装页 |

调试路由文件为 `src/app/install/page.debug.jsx`，`next.config.js` 只在开发模式识别 `debug.jsx` 页面扩展；生产路由图中排除该页。路由内部另有 404 防护，命令生成器在非开发模式返回 null，测试发布地址也不注入生产值。原有官网教程未改写，测试站脚本不会因官网发布而删除或重发。

`npm run build` 自动执行 `postbuild` 检查：确认首页旧逻辑、没有导出的 `install.html` / `install/index.html`，并扫描产物 HTML/JS/JSON/TXT 中不存在测试安装地址。检查失败会使构建命令返回非零，不能继续发布。

```sh
npm test
npm run lint
```

`npm test` 使用 Node 内置测试和项目已有 Next JSX 编译器，覆盖安装命令安全检查、剪贴板结果、平台参数、SSR 页面、客户端版本/架构、校验信息及双语文案。Shell 测试用本地下载夹具，不下载或执行真实安装器。

本次修改前，全量 lint 已有 36 个错误，集中于旧组件的 `react/prop-types`、`LanguageContext` 的 `set-state-in-effect` 和统计脚本的 `dataLayer`。可单独检查本次前端文件：

```sh
npx --no-install eslint src/install src/app/install src/i18n/install.js src/i18n/translations.js src/components/Hero.jsx src/components/Navbar.jsx next.config.js
```

## 浏览器验证

启动本地开发服务后访问 `/install?platform=linux`，也可替换为 `windows`、`macos`、`openwrt` 或教程平台：

```sh
npm run dev -- --hostname 127.0.0.1 --port 4189
```

另一个终端运行：

```sh
npm run test:browser
# 自定义预览端口：
DDNSTO_PREVIEW_URL=http://127.0.0.1:4189 npm run test:browser
```

浏览器测试复用机器已有的 `agent-browser`，不自动安装工具。它创建独立会话，测试结束后关闭；覆盖复制失败与手动全选、成功提示、平台切换和异步结果清理、教程入口、无效参数、320/375/768/1280 宽度的中英文布局及无自动设备状态请求。剪贴板接口在该隔离会话内模拟，不安装客户端或提交 Token。

## 静态构建与边界

停止本项目的 Next dev 后再运行 `npm run build`，避免同时读写 `.next`；也可在独立源码副本中构建。配置保留原 `output: 'export'` 和原 URL 布局，不再为调试安装页给生产构建设置 `trailingSlash: true`。首页产物为 `out/index.html`，不生成安装页。

可用标准静态 HTTP 服务预览构建产物：

```sh
python3 -m http.server 4190 --bind 127.0.0.1 --directory out
```

访问 `http://127.0.0.1:4190/` 应显示原官网逻辑，`/install` 和 `/install/` 应返回 404。新安装流程的 `npm run test:browser` 仅对开发服务运行，不能再用生产静态预览验收新功能。

固定安装器版本、构建地址与 SHA256 集中在 `src/install/release.js`。测试脚本独立分发，官网不得将 `install.sh` / `install.ps1` 复制到 `public/` 或 `out/`。后续未确认地址应设 `ready: false`；命令生成器也会拒绝 `PENDING`、HTTP、错误版本和不安全 URL。

页面测试通过不代表客户端各平台实机验收或云端绑定通过。测试范围以安装页的平台说明为准；账号 Token 仅在目标设备或对应教程指定的位置配置，官网不收集或保存。

## 2026-10-15 环境隔离验证

- `npm test`：20 项通过，包含生产恢复原逻辑、开发保留功能、生产直接访问拒绝及页面扩展隔离。
- 调试服务浏览器回归：11 项通过；修改文件定向 ESLint 通过。
- 独立源码副本执行 `npm run build`：生产路由仅首页和 404，`postbuild` 产物扫描通过。额外把旧含安装页的 `out/` 放入构建副本后重建，确认旧安装页不会残留。
- 普通静态服务器上 `/install`、`/install/` 实测 404；生产浏览器无新安装入口，点击 Linux 平台仍在首页切换为原安装教程，控制台链接仍为 `/app/#/devices`。
- 未部署官网、未提交推送 Git、未修改测试站脚本。需要测试新流程时使用开发服务，不使用生产静态预览。

## 2026-10-15 历史验证（环境隔离之前）

以下记录保留此前测试事实；不代表当前生产构建仍输出安装页，当前规则以上述“当前环境边界”为准。

同日 macOS `launchctl disable` 后重装修复已切换到安装器 **0.1.10**，构建 `20261015-6c624972f4c9`，旧 0.1.9 不覆盖。刷新本地开发页即可复制新命令；静态预览需重新构建。新版本入口 HTTPS 摘要回读成功；修复详情见工作区 `scripts/zsetup-scripts/docs/macos-disabled-fix-2026-10-15.md`。

切换后重新完成 16 项测试、11 项浏览器检查及生产构建。生产构建在临时源码副本中运行，不与用户正在运行的 Next dev 共用 `.next`；未停止或重启用户的开发服务。浏览器实际确认 macOS 命令指向上述新版本，不表示原生 macOS 安装已验收。

- `npm test`：16/16 通过，包含目录式静态导出断言。
- `npm run build`：通过，确认生成 `out/install/index.html`。
- 在上述 Python 静态服务上执行 `npm run test:browser`：11 项通过；`/install?platform=macos` 返回 301，目标为 `/install/?platform=macos`，保留预选参数。
- 本次修改的前端文件与 `next.config.js` 定向 ESLint 检查通过；全量 lint 的 36 个历史错误未在本次任务中修复。
- 官网仅本地预览，未部署、提交或推送。测试域名脚本发布及 Linux 隔离安装证据见 `scripts/zsetup-scripts/docs/test-site-2026-10-15.md`（工作区根目录相对路径）。
