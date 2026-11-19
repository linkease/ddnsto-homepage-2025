# 技术架构与功能范围

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

| 模块         | 具体行为                                                                                         | 实现位置 / 验收重点                                                      |
| ------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| 页头与导航   | 品牌、功能/场景/设备/套餐/FAQ 锚点、控制台入口、手机菜单、滚动定位                               | components/layout；键盘开关、焦点返回、固定导航不遮标题                  |
| 首屏         | 标题、远程访问关键词轮换、关键词关联场景、免费使用及设备入口、右侧场景动画                       | features/hero；初始 HTML 有标题，暂停/减少动效、手机重排                 |
| 需求导航     | 了解用途、选择设备安装、已有设备去控制台，滚动状态同步                                           | components/layout；主动点击与滚动状态不互相抢占                          |
| 使用场景     | 应用发现并添加域名、TCP 远程桌面、远程文件管理、远程设备管理；标签切换、模拟步骤、重置、对应 CTA | features/scenarios；显式模拟数据，无真实网络/文件操作，键盘标签导航      |
| 设备安装     | 平台分组、设备选择、步骤/截图/命令、复制反馈、失败回退、官方教程、安装意图衔接                   | features/installation；型号/固件分支正确，命令不自动执行，数据与 UI 分开 |
| 功能说明     | 自定义域名、SSH、远程桌面、文件管理等能力说明，指向对应场景与官方文档                            | content + 首页语义化区块；区分 TCP 客户端与浏览器远程访问能力            |
| 套餐         | 免费及各带宽套餐、价格单位、权益、单套餐绑定单设备规则、购买入口、TCP 优惠                       | features/pricing；事实核实后才发布，统一数据源，不内建支付               |
| FAQ          | 分类、全文搜索、问题计数、展开/收起、查看更多、无结果状态、原文来源                              | features/faq；重要答案在静态 HTML 中可读，搜索覆盖全部数据               |
| 客服与帮助   | 浮动客服角色、二维码、服务时间、文档/AI 助手入口、TCP 活动提示                                   | features/support；手机不遮 CTA，弹层关闭/焦点正确                        |
| 页脚         | 产品/公司/合作链接、版权、备案与许可、联系方式                                                   | components/layout；沿用已核实的官方内容                                  |
| SEO 与内容页 | title/description/canonical/分享图、真实结构化数据、robots/sitemap、场景和安装说明独立 URL       | layouts、pages、content；正式域名确认后启用索引，正文不藏在客户端渲染后  |
| 质量与统计   | 响应式、减少动效、键盘操作、图片优化、延迟加载、转化事件接口                                     | styles、lib、tests；仅生产环境加载已确认的百度统计与 GA4                 |

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
│   │   ├── layout/             # Header / Footer / IntentNav
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

M2 已实现 features/hero、Header、IntentNav 和导航配置。M3 已接入 features/scenarios：Scenarios.astro 静态输出初始内容，state.ts 定义状态与场景数据，views.ts 提供无副作用模板，controller.ts 用原生自定义元素管理事件、状态和任务取消，scenarios.css 限定模块样式。当前这些模块无需加载 React 岛。M4 新增 features/installation：Installation.astro 静态输出全部平台步骤，controller.ts 在已有 DOM 中选择设备/版本/步骤并处理复制，illustration.ts 提供纯图示模板，事实数据统一放 src/content/installation.ts 并记录来源日期。无 JavaScript 时完整说明可读，不依赖旧工程或参考服务。M5 新增 pricing、faq、support 与 Footer：commerce.ts 统一套餐及客服信息，faqs.ts 输出全部问题，footer.ts 管理外链。FAQ 和客服使用原生自定义元素管理筛选与弹层，静态正文不依赖 JS。正式图片存于 public/images/faq 和 support。features 模块自行管理局部状态，通过明确 props/events 联动，公共内容来自 content；pages 负责装配，lib 不反向依赖 UI。

后续独立内容路由拟为 /scenarios/[slug]/ 和 /devices/[slug]/；价格与 FAQ 独立页按内容深度决定。当前不生成空页面供搜索收录，详细安装文档与现有官方文档分工，避免复制出两套不一致内容。

M6 已实现 /scenarios/[slug]/ 四页和 /devices/[slug]/ 十八页。场景事实来自 scenarioGuides.ts，设备内容复用 installation.ts；GuideLayout 提供静态阅读布局和面包屑。Features.astro 提供首页功能说明及可抓取的指南入口。SiteLayout 统一元信息与 JSON-LD，publishedPaths 同时约束页面索引及 sitemap；check-seo-production.mjs 验证二者一致。旧占位 UpcomingSections 已删除。正式域名由发布环境提供，确认状态见 PROGRESS；不硬编码假域名到公开页面。

统计沿用 2025 站点 ID，仅 SITE_ENV=production 时由 SiteLayout 加载 public/script 下的普通脚本并输出 data-analytics-enabled。Google 全局 gtag 使用原生 arguments 入队，src/lib/analytics.ts 读取服务端输出的开关，不读取客户端不可见的 SITE_ENV。Header 桌面/手机与 Hero 免费使用保留原事件口径；IntentNav 进入控制台使用 click_login_console 与 ddnsto_outbound_click，section 为 intent_nav；其他入口暂不增加自定义事件。全部公开控制台链接带 website UTM，普通入口进入 devices，购买保留 plans 路由。
