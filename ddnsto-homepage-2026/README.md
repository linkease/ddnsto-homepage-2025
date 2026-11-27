# DDNSTO Homepage 2026

独立官网工程。本轮新原型改造 M1–M6 的范围和验收见 [改造计划](docs/refresh-2026/PLAN.md)，最新测试结果和限制见 [开发进度](docs/PROGRESS.md)。正式主域名为 https://web.ddnsto.com/，尚未上线。

开发前必须阅读 [开发规范](docs/DEVELOPMENT.md)。技术决策、功能模块和目录职责见 [架构说明](docs/ARCHITECTURE.md)，接续工作见 [进度](docs/PROGRESS.md)。

完整事件、参数及统计口径见 [Google Analytics 埋点](docs/ANALYTICS.md)。

## 本地使用

在本目录执行，Node 版本见 `.nvmrc`（最低要求见 package.json）：

```sh
nvm install
nvm use
npm ci
npm run dev
```

如使用其他 Node 版本管理器，请自行切换到 `.nvmrc` 指定版本。

开发地址为 http://127.0.0.1:16206/ 。`npm run validate` 执行类型、格式、构建和静态产物检查；`npm run test:e2e` 执行浏览器测试（首次需要 `npx playwright install chromium`）。

构建输出为 `dist/`，用 `npm run preview` 预览。默认禁止搜索索引；正式构建需要显式设置 `SITE_ENV=production` 和已确认的 `SITE_URL`。M6 已登记正式内容路由；生产模式将启用这些页面的索引。正式主域名使用 https://web.ddnsto.com，示例配置已记录；发布仍需核对最新验收结果、处理发布手册中的待办并取得上线授权。

本地人工测试统一使用 **16206**，需扫码时用以下命令替代普通 dev / preview 启动（不要同时启动第二个服务）：

```sh
INSTALL_AUTH_CHECK=1 npm run dev -- --host 0.0.0.0 --port 16206 --ignore-lock
```

该模式通过独立临时会话连接正式认证后端，每次获取安装命令均需重新扫码，不影响控制台登录。正式部署还需同域隔离服务，不能只部署 dist，详见 [扫码部署契约](docs/install-auth/PLAN.md)。局域网测试地址 http://192.168.99.2:16206/；16216 已停用。普通静态 preview 不提供认证接口。下文历史视觉脚本默认 16216，使用时通过对应 M2_URL / M3_URL / M4_URL / M5_URL 指定 http://127.0.0.1:16206/，无需重启另一服务。

## 安装命令的构建环境

默认、未指定环境及 `SITE_ENV=preview` 均生成正式短命令（`run.ddnsto.com/install.sh`，不带测试参数）。只有显式执行 `SITE_ENV=test npm run build` 才使用已验证的 r6 测试脚本并添加 `--env test`；测试构建仍禁止索引、不启用正式统计。

命令配置集中于 `src/config/install-command.ts`，由 Astro 构建注入安装流程；扫码确认后，展示、剪贴板及手动复制框共用带令牌的命令。curl 与 wget / 下载后执行共用相同的构建环境；Windows 命令和 AI 提示词沿用各自的正式入口。测试脚本与正式脚本分别发布，切换候选前先核验目标地址。此开关只控制安装命令，不切换官网其他控制台链接，也不会执行安装。正式发布仍须先确认正式域名已更新为支持管道执行的小型引导脚本。

## 参考快照

`reference/design/` 保存参考 v2 及其父级 assets 的独立副本，不进入发布产物。离线查看：

```sh
python3 -m http.server 16207 --bind 127.0.0.1 --directory reference/design
```

打开 http://127.0.0.1:16207/v2/?v=install-options-1&ui=minimal#scenarios 。静态资源复制和 SHA-256 记录在 `reference/manifest.json`；此快照独立于原目录。正式资源按需复制至 public/images 或 src/assets 并登记来源。

## 里程碑与参考验收

开发顺序与逐阶段验收见 [M1–M7 计划](docs/MILESTONES.md)。每阶段自检通过后，等待用户明确确认才继续。

`npm run reference:serve` 启动独立 Node 参考服务（16207）；`npm run reference:capture` 自动启动临时本地服务，采集 5 种宽度、交互状态和实际 CSS，结束后关闭。默认输出到 `/tmp/ddnsto-2026-m1-reference`，可通过 `REFERENCE_OUTPUT` 指定其他目录。它验证的是参考稿，不是正式站点；不会操作原 6002 服务。

2026-11 新原型改造使用 [本轮 M1–M6](docs/refresh-2026/PLAN.md)。启动独立 16216 开发服务后，运行 `node scripts/check-refresh-m2.mjs` 对比新原型与首屏五种宽度、三个步骤；证据输出到 `artifacts/refresh-m2/`，可用 `M2_URL` 指定新站地址。旧 M2 结果仅作为[历史报告](docs/milestones/M2.md)保留。

新稿功能/场景、安装和套餐/FAQ/客服对照分别运行 `node scripts/check-refresh-m3.mjs`、`node scripts/check-refresh-m4.mjs`、`node scripts/check-refresh-m5.mjs`；默认使用独立 16216 新站服务和只读 6002 原型，证据输出到项目内 `artifacts/refresh-m3/` 至 `artifacts/refresh-m5/`。旧稿采集脚本已移除，历史报告保留。

M6 发布与迁移规则见 [SEO 说明](docs/SEO-PUBLISHING.md)。`node scripts/check-seo-production.mjs` 使用项目内 `artifacts/seo/` 临时目录执行生产配置验证，不部署。

M7 全站与发布准备见 [验收记录](docs/milestones/M7.md)、[发布/回滚手册](docs/RELEASE-RUNBOOK.md) 和 [依赖风险](docs/DEPENDENCY-RISK.md)。三内核回归使用 `npx playwright test --config playwright.m7.config.ts`，首次准备 Chromium/Firefox/WebKit 及运行库。测试配置可通过 `M7_WEBKIT_EXECUTABLE` 指定隔离环境启动器，默认使用 Playwright 自带浏览器。

静态预览启动后可运行 `LAB_URL=http://127.0.0.1:16206 node scripts/check-performance.mjs`；每页三轮结果默认写到 `artifacts/performance/performance.json`。`node scripts/package-release.mjs` 在临时目录生成正式域名产物，输出 `artifacts/releases/` 下的归档与 SHA-256 清单，不更改默认预览构建、不执行部署。
