# 技术架构与功能范围

## 本轮改造范围

2026-11 新原型改造见 [M1–M6](refresh-2026/PLAN.md)。保留本文技术栈、模块边界、业务功能、指南路由、SEO 与统计；本轮以新原型为视觉目标，以下 minimal/中文描述属于原实现基线。用户已确认结构以新稿为准；采用中文与扫码演示。M2 使用 Astro 静态 HeroDiagram + 原生 HeroOnboarding 控制器实现三步演示，深色变量限已迁移表面，保留指南页样式。首屏安装链接通过现有 installation 控制器选择设备；首页补充新稿 macOS 三步，暂不新增独立路由。

M3 的人群场景使用静态 Audiences 和局部 AudienceTabs，内容在 content/audiences.ts。2026-11-26 按用户人工验收要求，删除旧 ScenarioDemo、IntentNav 和手动配置流程及其展开入口；顶部导航的滚动高亮/高度计算由 Header 自身负责。23 个内容路由保持。

M4 复用 InstallationGuide 原生控制器，Installation 静态输出设备和步骤，Methods / CommandBlock 输出共享软件以外的安装面板。content/installMethods.ts 统一命令模板、AI 提示词与平台映射；扫码状态仅本地演示，复制版本号隔离过期回调。终端入口使用同一面板，旧平台、深链接和无 JS 内容保持。

M5 套餐继续由 commerce.ts 统一数据，FAQ 只保留 faqHighlights.ts 的三组七条原生 details 问答。按用户要求删除原 faqs.ts 搜索库及专用图片、FaqBrowser、由搜索无结果打开的帮助弹窗。SupportHub 继续负责微信客服及 TCP 优惠/定位；首页和指南的 AI 链接保留。

## 决策

采用 Astro 静态生成 + React 局部交互 + TypeScript strict + 原生 CSS。原因是官网主体是可缓存、可索引的内容，仅场景模拟和设备选择需要复杂状态。Astro 输出正文 HTML，React 岛按需激活，避免让整页依赖 React 启动。框架不限制实现参考动画。

采用 Astro 7.4.12 与 React 集成 7.1.9，要求 Node >=22.23.4。初次评估的 Astro 6 组合存在安全告警，最终采用新版并使用隔离 Node 工具链验证，不更换共享环境 Node。版本以 package-lock.json 为准。TypeScript 使用兼容当前检查链的 5.9 系。

CSS 优先使用 Astro scoped styles 和设计变量，React 模块使用 CSS Modules；不引入通用 UI 主题覆盖设计稿。动画先使用 CSS transform/opacity 和 Web Animations API；确实需要复杂编排时再引入动画库并说明体积收益。初期不用数据库、登录后端、支付后端或全局状态库。

官方依据：

- https://docs.astro.build/en/install-and-setup/
- https://docs.astro.build/en/concepts/islands/
- https://docs.astro.build/en/guides/framework-components/

## 功能模块与边界

以下是整体功能范围，完成情况以 PROGRESS.md 为准。

| 模块       | 具体行为                                                                   | 实现位置 / 验收重点                                      |
| ---------- | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| 页头与导航 | 品牌、功能/场景/设备/套餐/FAQ 锚点、控制台入口、手机菜单、滚动定位         | components/layout；键盘开关、焦点返回、固定导航不遮标题  |
| 首屏       | 标题、远程访问关键词轮换、关键词关联场景、免费使用及设备入口、右侧场景动画 | features/hero；初始 HTML 有标题，暂停/减少动效、手机重排 |

| 使用场景 | NAS / IT / 智能家居 / AI 人群标签，自动轮换、键盘和安装入口 | features/scenarios；减少动效、后台/离屏暂停与手动选择保留 |
| 设备安装 | 平台分组、设备选择、步骤/截图/命令、复制反馈、失败回退、官方教程、安装意图衔接 | features/installation；型号/固件分支正确，命令不自动执行，数据与 UI 分开 |
| 功能说明 | 自定义域名、SSH、远程桌面、文件管理等能力说明，指向对应场景与官方文档 | content + 首页语义化区块；区分 TCP 客户端与浏览器远程访问能力 |
| 套餐 | 免费及各带宽套餐、价格单位、权益、单套餐绑定单设备规则、购买入口、TCP 优惠 | features/pricing；事实核实后才发布，统一数据源，不内建支付 |
| FAQ | 新稿三组七条原生折叠问答及 AI 链接 | content/faqHighlights.ts、features/faq；静态正文及键盘展开 |
| 客服与帮助 | 浮动客服角色、二维码、服务时间、文档/AI 助手入口、TCP 活动提示 | features/support；手机不遮 CTA，弹层关闭/焦点正确 |
| 页脚 | 产品/公司/合作链接、版权、备案与许可、联系方式 | components/layout；沿用已核实的官方内容 |
| SEO 与内容页 | title/description/canonical/分享图、真实结构化数据、robots/sitemap、场景和安装说明独立 URL | layouts、pages、content；正式域名确认后启用索引，正文不藏在客户端渲染后 |
| 质量与统计 | 响应式、减少动效、键盘操作、图片优化、延迟加载、转化事件接口 | styles、lib、tests；仅生产环境加载已确认的百度统计与 GA4 |

第一阶段正式页面以中文及 minimal 单一视觉版本为基线；参考中的主题选择器属于设计预览工具，是否进入官网需单独决定。多语言、CMS、用户中心、真实远程连接不在本期范围。

## 目录职责

```text
ddnsto-homepage-2026/
├── AGENTS.md                    # AI 开发入口
├── README.md                    # 人类启动入口
├── docs/
│   ├── DEVELOPMENT.md           # 开发前必读规范（权威入口）
│   ├── ARCHITECTURE.md          # 本文：选型、范围、目录职责
│   ├── PROGRESS.md              # 当前完成状态与待办
│   ├── MILESTONES.md            # M1–M7 与用户确认规则
│   └── milestones/             # 各阶段报告及固定基准
├── reference/
│   ├── manifest.json           # 参考来源与文件校验值
│   └── design/{v2,assets}/      # 完整独立参考快照，不发布
├── public/
│   ├── favicon.svg
│   └── images/brand/            # 正式站点按需复制的资源
├── src/
│   ├── pages/                  # Astro 路由，页面装配与静态生成
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   └── robots.txt.ts
│   ├── layouts/SiteLayout.astro # HTML、SEO、全局样式入口
│   ├── components/
│   │   ├── layout/             # Header / Footer
│   │   └── ui/                 # 真实复用的基础控件
│   ├── features/
│   │   ├── hero/               # 首屏与动画
│   │   ├── scenarios/          # 四类场景演示及状态
│   │   ├── installation/       # 设备选择与安装流程
│   │   ├── pricing/            # 套餐展示
│   │   ├── faq/                # FAQ 搜索与展开
│   │   └── support/            # 客服/帮助/活动浮层
│   ├── content/                # 已核实内容，保留来源与核实日期
│   ├── config/site.ts          # 站点身份、外链和环境规则
│   ├── lib/                    # 无 UI 的工具，按实际需求添加
│   ├── assets/                 # 经构建处理的资源
│   └── styles/                 # 设计变量和全局基础样式
├── scripts/                    # 独立参考服务、基准采集工具
├── tests/
│   ├── static-output.test.mjs  # HTML 与发布边界检查
│   └── e2e/                    # 浏览器行为、响应式验收
├── astro.config.mjs
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── package-lock.json
```

当前首页模块由 Astro 输出静态正文，原生自定义元素负责首屏、人群标签、安装和客服的局部状态。原交互演示/手动流程/FAQ 搜索库及专用代码已按人工验收要求删除。features 自行管理局部状态，公共内容来自 content，pages 负责装配，lib 不反向依赖 UI；共享的导航高亮属于 Header，FAQ 七条问答无需 JS 控制器。

后续独立内容路由拟为 /scenarios/[slug]/ 和 /devices/[slug]/；价格与 FAQ 独立页按内容深度决定。当前不生成空页面供搜索收录，详细安装文档与现有官方文档分工，避免复制出两套不一致内容。

M6 已实现 /scenarios/[slug]/ 四页和 /devices/[slug]/ 十八页。场景事实来自 scenarioGuides.ts，设备内容复用 installation.ts；GuideLayout 提供静态阅读布局和面包屑。Features.astro 提供首页功能说明及可抓取的指南入口。SiteLayout 统一元信息与 JSON-LD，publishedPaths 同时约束页面索引及 sitemap；check-seo-production.mjs 验证二者一致。旧占位 UpcomingSections 已删除。正式域名由发布环境提供，确认状态见 PROGRESS；不硬编码假域名到公开页面。

统计沿用 2025 站点 ID，仅 SITE_ENV=production 时由 SiteLayout 加载 public/script 下的普通脚本并输出 data-analytics-enabled。Google 全局 gtag 使用原生 arguments 入队，src/lib/analytics.ts 读取服务端输出的开关，不读取客户端不可见的 SITE_ENV。所有公开页面通过统一链接监听记录控制台、购买和 Windows 下载；两个终端安装入口单独记录二维码展示和首次复制，容器弹窗单独记录二维码展示和首次复制令牌，全部 9 个事件以 click_ 开头。发送异常与业务隔离，详情见 [埋点字典](ANALYTICS.md)。全部公开控制台链接带 website UTM，普通入口进入 devices，购买保留 plans 路由。

2026-11-27 安装扫码采用独立临时会话，替代 M1/M2 初期复用控制台 Cookie 的实现。server/install-auth.mjs 以每轮随机会话 ID 隔离服务端 Cookie，固定上游并限定端点；浏览器不携带或接收认证 Cookie，每次开始必须重新扫码。成功取令牌、取消或 TTL 到期清除隔离记录，不退出控制台。features/install-auth 的 API 工厂与状态机管理每轮请求，installation 控制器负责命令展示和清理，commands.mjs 统一 POSIX/PowerShell 转义，qrcode 按需加载。AI 提示词保持手填占位令牌。

本地 INSTALL_AUTH_CHECK=1 在 16206 挂载同一隔离中间件及开发诊断页。正式静态站需要同域 /__install-auth-api/ 反代至 server/start.mjs；仅部署 dist 不足以支持扫码。正式部署、单实例/会话亲和、日志与超时约束详见 docs/install-auth/PLAN.md，M3 尚未执行。其他首页模块、控制台源码、原 6002 均不变。

2026-11-27 首页安装教程对齐新稿：ContainerGuide.astro 静态输出飞牛 Compose/常规 Docker 与通用 Docker 命令教程；platform-guides.css 管理新增群晖、威联通及 Compose 图示样式。installation 控制器按平台显示可用方式，键盘只遍历可见标签，模板复制与真实扫码命令复制分离，不进入扫码成功统计。逐平台核对与有意保留差异见 [安装核对记录](refresh-2026/INSTALLATION-AUDIT.md)。

同日第二轮安装样式同步：ContainerGuide 扩展到 Unraid、铁威马、极空间、绿联，并按平台/方式静态输出；TemplateCode 转义纯文本且避免格式化缩进进入复制内容。方式选择仍由原控制器管理，平台原 URL 不变，爱快卡片复用现有教程 URL；新增原型扫码弹窗不纳入本次展示修改。

容器令牌入口按最新要求改为 TokenScanDialog.astro / token-scan-dialog.ts 管理的单例原生 dialog。它复用 InstallAuthSession 与独立会话 API，但和脚本命令面板各自持有会话实例；每次打开重新扫码，关闭/导航取消会话、清空显示和手动复制字段，并用版本号隔离二维码绘制和剪贴板的过期回调。该模块不记录原始令牌，不写持久存储，不调用控制台退出接口，不纳入终端命令埋点。

容器令牌埋点使用入口静态 platform/method 枚举，打开时快照；二维码实际展示和首次点击复制分别记 click_token_scan_open / click_token_copy，每次弹窗打开为一轮，重试不重复计数，统一走 analytics.ts 的非阻塞异常隔离。
