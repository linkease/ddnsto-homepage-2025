# DDNSTO Homepage 2026

独立官网工程，已完成 M1–M7 开发与发布准备，并持续按设计稿修正交互和响应式样式。最新 Chromium 桌面/手机回归 83 项通过、1 项跳过，静态测试 9/9；最新改动尚未重新覆盖所有浏览器实机。正式主域名为 https://web.ddnsto.com/，尚未上线。阶段验收见 [M7 记录](docs/milestones/M7.md)，最新状态和限制见 [开发进度](docs/PROGRESS.md)。

开发前必须阅读 [开发规范](docs/DEVELOPMENT.md)。技术决策、功能模块和目录职责见 [架构说明](docs/ARCHITECTURE.md)，接续工作见 [进度](docs/PROGRESS.md)。

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

## 安装命令的构建环境

默认、未指定环境及 `SITE_ENV=preview` 均生成正式短命令（`run.ddnsto.com/install.sh`，不带测试参数）。只有显式执行 `SITE_ENV=test npm run build` 才使用已验证的 r6 测试脚本并添加 `--env test`；测试构建仍禁止索引、不启用正式统计。

命令配置集中于 `src/config/install-command.ts`，由 Astro 构建同时注入 HTML 和复制逻辑。测试脚本与正式脚本分别发布，切换候选前先核验目标地址。此开关只控制安装命令，不切换官网其他控制台链接，也不会执行安装。正式发布仍须先确认正式域名已更新为支持管道执行的小型引导脚本。

## 参考快照

`reference/design/` 保存参考 v2 及其父级 assets 的独立副本，不进入发布产物。离线查看：

```sh
python3 -m http.server 16207 --bind 127.0.0.1 --directory reference/design
```

打开 http://127.0.0.1:16207/v2/?v=install-options-1&ui=minimal#scenarios 。静态资源复制和 SHA-256 记录在 `reference/manifest.json`；此快照独立于原目录。正式资源按需复制至 public/images 或 src/assets 并登记来源。

## 里程碑与参考验收

开发顺序与逐阶段验收见 [M1–M7 计划](docs/MILESTONES.md)。每阶段自检通过后，等待用户明确确认才继续。

`npm run reference:serve` 启动独立 Node 参考服务（16207）；`npm run reference:capture` 自动启动临时本地服务，采集 5 种宽度、交互状态和实际 CSS，结束后关闭。默认输出到 `/tmp/ddnsto-2026-m1-reference`，可通过 `REFERENCE_OUTPUT` 指定其他目录。它验证的是参考稿，不是正式站点；不会操作原 6002 服务。

M2 结果见 [验收报告](docs/milestones/M2.md)。启动开发服务后，运行 `node scripts/check-m2-visual.mjs` 比较 5 种宽度的参考与新页面；默认证据输出到 `/tmp/ddnsto-2026-m2`，可用 `M2_OUTPUT` 指定目录、`M2_URL` 指定新站地址。

M3 当前状态与修复记录见 [M3 验收记录](docs/milestones/M3.md)。启动开发服务后可运行 `node scripts/check-m3-visual.mjs`，生成参考与新站五种宽度、关键交互状态的截图和测量报告；默认输出 `/tmp/ddnsto-2026-m3`，可设置 `M3_OUTPUT` 与 `M3_URL`。

M4 结果见 [安装模块验收报告](docs/milestones/M4.md)。`node scripts/check-m4-visual.mjs` 采集 5 种宽度参考/新站对照，默认输出 `/tmp/ddnsto-2026-m4`，支持 `M4_OUTPUT` 和 `M4_URL`。

M6 发布与迁移规则见 [SEO 说明](docs/SEO-PUBLISHING.md)。`node scripts/check-seo-production.mjs` 使用临时目录执行生产配置验证，不部署。

M7 全站与发布准备见 [验收记录](docs/milestones/M7.md)、[发布/回滚手册](docs/RELEASE-RUNBOOK.md) 和 [依赖风险](docs/DEPENDENCY-RISK.md)。三内核回归使用 `npx playwright test --config playwright.m7.config.ts`，首次准备 Chromium/Firefox/WebKit 及运行库。测试配置可通过 `M7_WEBKIT_EXECUTABLE` 指定隔离环境启动器，默认使用 Playwright 自带浏览器。

静态预览启动后可运行 `LAB_URL=http://127.0.0.1:16206 node scripts/check-performance.mjs`；每页三轮结果默认写到 `/tmp/ddnsto-m7/performance.json`。`node scripts/package-release.mjs` 在临时目录生成正式域名产物，输出 `artifacts/releases/` 下的归档与 SHA-256 清单，不更改默认预览构建、不执行部署。
