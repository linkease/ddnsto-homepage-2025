# 开发进度

## 当前阶段

2026-11-18：M7 开发与自动化自检完成，三内核五项目共 135/135、Node 9/9、正式域名 23 路由 SEO 检查通过。初次产品自检通过，优化轮次 0/3。待用户验收视觉差异、实机范围与依赖风险；真实宿主迁移仍待验证，未部署。

- 执行计划：[M1–M7](MILESTONES.md)。
- 当前报告：[M7 验收记录](milestones/M7.md)；上一阶段：[M6](milestones/M6.md)、[M5](milestones/M5.md)；历史：[M3](milestones/M3.md)、[M2](milestones/M2.md)、[M1](milestones/M1.md)。
- M1 初次自检通过；优化轮次 0/3。
- M2 初次自检发现视觉差异，经 2/3 轮优化通过；用户随后确认进入 M3。
- M3：原 3/3 轮后停止；用户授权追加 2 轮专项修复。最终全量 26/26，用户随后明确确认进入 M4。
- M4：3/3 轮优化通过；全量浏览器 36/36、静态检查 7/7，用户随后确认进入 M5。

## 已建立

- 独立 Astro + React + TypeScript 工程、锁文件和本地命令。
- 页面布局、部分实现的首页、404、环境控制的 robots/canonical/sitemap。
- 按功能划分的目录与基础样式入口。
- 完整 v2 与父级 assets 参考副本及 SHA-256 清单。
- 开发规范、AI 入口、架构和功能范围说明。
- 静态产物与桌面/移动浏览器检查入口。

## 资源记录

- public/images/brand/ddnsto-logo.png ← reference/design/v2/assets/ddnsto-logo.png，用于工程入口品牌图。
- public/favicon.svg ← reference/design/assets/favicon.svg，用作站点图标。
- reference 快照仅供开发，不进入发布目录。
- M2 沿用本地品牌图；按参考重写原生 HTML/CSS/SVG 场景图形，不加载参考脚本、旧项目组件或远端设计资源。
- M4 从 simple-install.js 提取纯 HTML/CSS 图示，按平台事实修正；installation.css 提取有效 minimal 样式并限制作用域。有效参考安装区没有位图截图，不复制未生效的旧图；无新增远端资源依赖。
- M3 的 views.ts 与 scenarios.css 从 reference/design/v2/assets/scenario-tabs.js、scenario-tabs.css、ui-themes.css 提取模板、图标和 minimal 样式，改为纯渲染函数与模块内样式；控制器独立重写。品牌图沿用已复制资源，无新增图片依赖。

## 尚未实现

真实宿主上线迁移与实机验收。统计接入已完成，见 2026-11-19 埋点迁移记录。正式域名生产构建 SEO 已通过；线上行为尚未验证。首页功能说明与正式内容页已在 M6 接入；M7 为功能图示补充短动效，仍有参考细节与节奏差异，需在视觉验收中明确评估。四类场景与设备安装模块已实现，M4 全量回归已通过。

## 待核实

- 正式主域名已确认为 https://web.ddnsto.com/；旧地址清单与宿主迁移仍需核对。
- 商业展示冲突已由用户确认：使用设计 index.html，4Mbps ￥2.00/月起，8Mbps ￥6.50/月起，TCP 限时免费 20G/月/台，不编造截止日期。
- M6 已按官方说明区分 TCP 与浏览器远程桌面；活动沿用设计文案，不解释为长期有效。
- 设计预览中的主题选择器是否正式保留（当前计划仅 minimal）。

## 验证记录

- Node 22.23.4 隔离工具链；npm run validate 通过，类型 0 错误/警告，静态产物测试 2/2 通过。
- 将项目复制到 /tmp 独立目录（不含 node_modules/dist），npm ci、build 和 test 均通过，验证父项目外可运行。
- npm run test:e2e：桌面 Chromium 与 Pixel 7 模拟视口共 2/2 通过（首页 → 404 → 返回首页）；无页面运行时异常和横向溢出。Browser plugin not available，使用项目自有 Playwright。
- 另检查 1440×900 / 390×844 工程入口截图，页面身份正确、非空白、无框架错误覆盖；截图保存在 /tmp/ddnsto-2026-scaffold-desktop.png 与 /tmp/ddnsto-2026-scaffold-mobile.png。这不是正式设计稿视觉验收。
- 本地开发使用 16206；浏览器测试独立使用 16208，--ignore-lock 保持前台运行，避免 Astro 在 AI 环境自动后台启动干扰测试。
- 尚未验证 Safari/Firefox/微信、正式业务交互、生产域名配置与线上性能。
- npm audit：最新框架组合仍有 16 项依赖树告警（15 high、1 low）；主要根因为 picomatch <=4.0.7 ReDoS（本次注册表最新仍为 4.0.7），另有 esbuild 开发服务器 Windows 文件读取告警。原 Astro 6 的直接 critical 告警已通过升级移除。未盲目降级或跨主版本覆盖传递依赖；静态产物不包含构建服务器，正式发布前仍需复查并验证修复。

## M1 新增验证

- npm run reference:capture：5 种宽度、13 项参考交互记录；5 个视口均无横向溢出、页面/控制台异常和资源失败。
- reference 快照 75 个文件哈希一致；13 张截图、5 组实际样式（每组 152 个 --le-* 变量）与报告保存在 docs/milestones/m1/reference。
- npm run validate：类型/格式/构建通过，静态及独立性检查 6/6。
- npm run test:e2e：现有框架桌面/手机流程 2/2。
- 人工发现参考稿手机 TCP 活动浮层与控制台按钮区域重叠，记为 REF-001；M5 实现时修正。参考稿测试通过不等于新站业务完成。

## M2 新增验证

- 提取 minimal 变量，实现桌面导航、手机菜单、首屏文案与四组动画、关键词入口、需求导航及滚动高亮。
- npm run validate：类型 0 错误/警告、格式及构建通过，静态及独立性检查 6/6。
- npm run test:e2e：桌面 Chromium 与 Pixel 7 模拟共 10/10；包括无 JavaScript、菜单焦点、锚点、四组动画、减少动效、离屏及暂停恢复。
- node scripts/check-m2-visual.mjs：360/390/768/1024/1440px 均无横向溢出、运行时错误和资源失败；关键容器/标题/按钮坐标和尺寸均在 4px 阈值内。此项不是整页逐像素相等证明。
- 后台暂停以注入 document.hidden 和 visibilitychange 验证处理逻辑，未作为真实操作系统后台标签测试。
- 14 张截图和两个 JSON 报告保存在 docs/milestones/m2/evidence；人工检查四组首屏画面。未实现的下游区块明确标注阶段占位。
- 原设计预览条、主题选择器不进入正式页面；M5 浮层尚未实现，视觉比对仅在浏览器内移除参考这些元素以统一比较条件，未修改快照源文件。

## M3 原三轮验证（历史记录）

- 已实现四条模拟流程：服务发现/域名、远程桌面、NAS 文件预览/示例下载、设备链接/模拟控制台；包括键盘标签、深链接、取消、重置和状态保留。
- 独立 Astro 组件静态输出说明和初始内容；原生自定义元素管理局部状态，异步任务切换/重置时取消；样式限定于 #scenarios。
- npm run validate 全部通过：类型 0 错误/警告，格式/构建通过，静态及独立性测试 6/6。
- 原三轮末次 npm run test:e2e：22/24。新增 M3 用例 14/14；原 M2 动画用例在桌面和手机均未通过“切换减少动效后回到 computer 首帧”。当时已暂停，画面仍为 device。另在新 Chromium 页面不安装模拟时钟复核，启用减少动效后同样停在 software，未回到首帧。根因尚未确定，不能认定为测试假失败。
- M2 几何回归：五宽度无溢出、错误、超 4px 差异。M3：72 个参考/新站画面，五宽度四场景初始状态、390/1440px 完整关键状态均无溢出、运行时错误或资源失败。
- M3 人工对照包括文案、容器、字号/行高、色彩、图标、手机触摸尺寸和中间/完成状态。TCP 手机说明为区分浏览器桌面与本地 TCP 而多一行约 25.2px，属于已记录的文案差异；其余本轮采样几何差异不超过 4px。
- 优化第 1 轮修正继承样式和测试选择器，23/24；第 2 轮修正空提示间距、手机测试目标与样式作用域，23/24；第 3 轮调整媒体偏好变更后的模拟时钟等待，最终 22/24，问题未解决。
- 证据和详细结果见 docs/milestones/M3.md 与 m3/evidence。正式发布仍未授权，6002 服务未操作。

## M3 授权追加修复结果

- 用户明确回复“继续”，授权专项处理 M3-001；追加 2 轮后通过，原 3 轮记录不变。
- 定位到当前 Chromium 环境逐帧查询媒体偏好与变更回调派发的交互；改为事件更新本地偏好、sync 统一重置及暂停，浏览器缓存恢复重新同步。
- 原真实时钟最小复现通过；新增桌面/手机真实时钟用例覆盖关键词、链接、首帧和恢复播放。
- npm run validate 通过：类型 0 错误/警告、格式/构建通过、Node 6/6；npm run test:e2e 全量 26/26。
- 390/1440px 真实切换截图和错误检查通过。最终截图另发现并修正场景外层容器选择器，恢复桌面 88px/手机 56px 上下间距；场景标题也加入五宽度位置回归，原 72 张面板内部对照保留。
- 详情见 M3 报告。原 6002 服务未操作，预览仍禁止搜索索引。

## M4 新增验证

- 18 个设备入口、57 个步骤和 5 类设备的 11 个版本选项，数据保存官方来源和 2026-11-18 核实日期；27 个最终外链 HEAD 返回 200。
- 安装事实修正：通用扫码流程改为已核实令牌配置；ASUSGO、LEDE、OpenWrt、DSM、Linux 明确分支；无法核实的版本不承诺兼容。
- 参考 web.toany.net 命令不发布，改为官方 Linux 脚本 HTTPS 地址并明确适用平台；复制成功/权限拒绝/API 不存在均测试，命令从未在设备或服务器执行。
- npm run validate：类型 0 错误/警告、格式/构建通过，Node 7/7；npm run test:e2e：桌面 Chromium / Pixel 7 模拟共 36/36，包含 M1–M3 回归及 M4 全流程。
- 设备和步骤全部直接输出 HTML；无 JS 展开阅读测试通过。界面示意图本地 HTML/CSS/SVG 构成，无第三方图片请求。
- 首次发现格式与视觉差异；第 1 轮修正后仍有窄屏步骤名称换行，第 2 轮修正并移除本环境 403 的 Docker Hub 入口；第 3 轮修正参考模板中的爱快镜像/终端图示类型并增加断言。
- 五宽度 22 张参考/新站截图及 340 个设备/版本/步骤状态巡检；默认设备面板关键几何偏差 <=4px，安装命令与版本说明等有意差异单列在 M4 报告。
- 保留原服务和参考快照，未安装新依赖或修改发布索引策略。未做真实设备安装、登录、支付和跨浏览器实机验证。

## M5 新增验证

- 套餐统一数据源、39 条静态 FAQ、8 类筛选/全文搜索/查看更多、客服二维码/帮助/TCP 弹层、页脚已实现。
- 用户确认商业信息按设计代码，未采用线上首页不同价格；二维码与官方 wxqr.png 字节一致；图片全部本地化，清单见 milestones/m5/assets.json。
- npm run validate 通过：类型 0 错误/警告、格式/构建通过、Node 8/8；浏览器全量 48/48（桌面 Chromium、Pixel 7 模拟）。
- 五宽度 34 张截图无横向溢出和本地资源失败；FAQ 标题、输入、分类与参考基本对齐。套餐权益卡约 6px 高度差、手机绑定说明多一行、页脚手机列宽不同仍如实保留，不宣称逐像素一致。
- 手机客服/活动入口放在页尾，宽屏固定，修正 REF-001 遮挡。无 JS 可读全部 FAQ/套餐及二维码。
- 外链 52 个含片段 URL：48 个 HTTP 200；FAQ validate.html 404、app.linkease.com DNS 失败、两备案入口 521/405。购买入口 HTTP 200，但浏览器等待超时，改为 DOM 加载后观察仍空白，不能认定已到达登录页。
- 轮次：初检格式/FAQ 样式失败；第 1 轮修正视觉与格式，Node 计数误含脚本字符串失败；第 2 轮修正计数，格式检查失败；第 3 轮格式修正后本地通过，最终外链巡检遗留问题，按上限暂停。

## M5 授权追加结果

- 用户回复“允许”，授权追加 1 轮。修正 FAQ 验证文档到 Authentication.html，修正页脚产品入口到 www.linkease.com；两者浏览器 HTTP 200、页面身份正确。
- 实际从新首页点击购买，390/1440px 均到达官方微信扫码登录；首次专项复查无页面/控制台错误及失败请求。此前短时空白根因未确认，未修改外部控制台。
- npm run validate 通过，Node 8/8；npm run test:e2e 48/48。两备案站点访问限制保留，未声称已完成真实登录、支付或跨浏览器实机验证。
- M5 已通过官网展示及入口范围的自检，详细证据与原失败历史见 M5 报告。

## M6 新增验证

- 新增四个场景页和十八个设备指南，设备事实复用 installation.ts。首页功能说明及阅读链接替换占位，所有正文直接输出 HTML。
- 统一 OG/Twitter、1200×630 本地分享图、按路由的 canonical/WebPage/WebSite/BreadcrumbList、正式 sitemap；预览继续 noindex，无占位域名泄漏。
- 首页功能说明修正自有域名/浏览器远程桌面/公测文件能力文案；图示为原生 HTML/CSS 静态重写，不加载设计脚本。资源 public/images/brand/share.png 为本地品牌排版截图生成。
- npm run validate：类型 0 错误/警告、格式/构建通过、Node 9/9；npm run test:e2e：52/52，含全部 M1–M5 回归和无 JS 全路由链接检查。
- node scripts/check-seo-production.mjs：23 个路由 canonical/JSON-LD/sitemap、分享图、robots、404 排除、非法生产域名拒绝通过。仅使用保留示例域名模拟，不能代替正式域名验收。
- 360/390/768/1024/1440px 首页功能/场景页/设备页共 15 个画面无溢出、无页面错误。原设计功能区静态简化和新增阅读链接的差异见 M6 报告。
- 构建预览 16209：设备页 HTTP 200，未知路由 HTTP 404。真实宿主/旧 URL 清单仍待核对，方案见 SEO-PUBLISHING.md。
- 初检格式失败，内容页活动锚点失败，测试期间改动导致部分场景重载；第 1 轮修正子页导航后浏览器 52/52，测试配置重复属性导致类型失败；第 2 轮修正后全量通过，视觉发现功能图示段落间距；第 3 轮修正间距并补齐设备步骤标题，全部检查通过。3/3 已用完。

## M6 正式域名确认

用户明确确认 https://web.ddnsto.com/。已更新 .env.example，保留 SITE_ENV=preview。执行 SEO_TEST_ORIGIN=https://web.ddnsto.com node scripts/check-seo-production.mjs，23 个页面的 canonical、JSON-LD、sitemap、分享图、robots、404 排除及非法域名拒绝全部通过。npm run validate 再次通过，Node 9/9；本次没有页面或交互变更，沿用此前浏览器 52/52 结果。

M6 内容与构建 SEO 自检通过，线上抓取/收录及发布宿主未验收。未部署，未修改现有官网及控制台 /app/。

## M7 新增验证

- 功能卡片补充 SVG 与用户触发短动效，离屏/后台/减少动态效果测试通过。标题及桌面 SVG 来源为本地 reference/design/v2 渲染内容；未引用父项目。
- 新增 Chromium/Firefox/WebKit 五项目测试配置和实验室性能、独立打包脚本。
- npm run validate 通过，Node 9/9；Chromium 54/54、Firefox 27/27、WebKit 54/54，合计 135/135。
- M2–M5 五宽度视觉回归通过；M7 功能区五宽度无溢出/页面错误。既有视觉差异不因此视为已接受。
- 最终实验室九轮：每页三轮中位数首页 LCP 728ms、TCP 416ms、iStoreOS 412ms，CLS 均为 0；真实 INP/p75 尚未测量。
- 正式域名 23 路由 SEO 自检通过；61 文件发布归档与逐文件哈希已验证，未部署。手册见 RELEASE-RUNBOOK.md。
- esbuild 更新为 0.28.2；剩余 15 high picomatch 构建依赖链告警，无已核实补丁；风险见 DEPENDENCY-RISK.md。
- 初次产品自检通过，优化轮次 0/3。真实设备、宿主迁移、视觉差异接受和构建依赖风险仍为发布前事项。

## 下一步

M7 自动化自检已完成，等待用户验收。不得直接上线；用户仍需验收视觉差异及实机测试范围。旧 URL 清单、真实宿主缓存/重定向、/app/ 路由保护待发布环境核对。原 6002 服务未操作，默认预览保持禁止索引。

## IPv4 测试预览（2026-11-19）

按用户要求启动独立静态预览，监听 0.0.0.0:16206，地址 http://192.168.99.2:16206/。通过该 IPv4 请求首页返回 HTTP 200，页面标题正确，沿用 noindex 预览产物。使用 astro preview --host 0.0.0.0 --port 16206 --ignore-lock，未修改业务代码、生产配置或原 6002 服务。当前环境已验证可访问，用户终端连通性待实际测试。

## IPv4 预览修正（2026-11-19）

用户反馈 ERR_EMPTY_RESPONSE。复查发现原 16206 进程已退出，192.168.99.2 为 codex 容器内部 IP，原端口也未发布到宿主。此前容器内 HTTP 200 不能证明用户可访问。

已创建独立 ddnsto-homepage-2026-preview 静态 Nginx 容器，将当前 dist 副本发布到宿主 192.168.9.3:16206，restart=unless-stopped，不依赖会话进程。默认 noindex/nofollow，no-store；未改动原 6002 服务或生产官网。使用宿主网络的临时 curl 容器验证新局域网 URL 首页与设备指南 HTTP 200、未知页 HTTP 404。原执行容器访问宿主 LAN 地址超时，故未将它作为外部连通性证据；用户电脑最终连通性待重新测试。新测试地址：http://192.168.9.3:16206/。

该容器提供的是当前构建快照，后续源码改动需重新构建并更新预览副本。停止预览可执行 docker stop ddnsto-homepage-2026-preview，仅影响这个独立预览。

## 原参考服务恢复（2026-11-19）

用户报告原 6002 参考链接不可达并明确要求恢复。检查确认 codex 的宿主 6002 映射存在，但容器内无 6002 监听；参考 dist/v2 文件保留。按参考目录 README.txt 已记载的 Python 静态服务方式，通过 docker exec -d 启动 python3 -m http.server 6002 --bind 0.0.0.0 --directory /projects/workspace-codex/linkease/ddnsto-meta/.site-design/ddnsto-homepage/dist，日志 /tmp/ddnsto-reference-6002.log。未重启 codex 容器、未改参考文件、未运行 build-v2.cjs。

从宿主网络请求原始带参数 /v2/ 地址返回 HTTP 200，返回 HTML SHA-256 与启动前原文件一致：48f87d3867d4405b0be2b3e24028ce22f17577331b8ffc14c1b709dc7c5d83fa。原进程退出原因尚未确定。新站预览仍为独立 16206 容器。

## 首屏动画修正（2026-11-19）

用户反馈首屏文件场景鼠标偏移，并要求检查其他首屏动画。根因：computer/files 共用从 (83,83) 平移 (-63,-62) 的固定轨迹，文件鼠标落在标题栏；灯光文字 1700ms 切换而开关按 2000ms 阶段切换；下载条固定 65%。

仅修改新项目 src/features/hero/motion.ts、HeroVisual.astro，新增 tests/e2e/hero-cursor.spec.ts。鼠标按实际目标和 offsetParent 计算局部坐标，缓存测量并在场景/尺寸变化时更新；校准 SVG 尖端，增加点击反馈。文件场景补充菜单→下载进度→完成；灯光开关/状态统一时钟；路由器负载条改为连续变化。参考 hero-animation.js 和 original-modules/page.js 仅阅读，未加载参考脚本作为运行依赖。本次是纠正重写动画的空间和时序，不宣称参考稿逐像素相同。

npm run validate 通过（Node 9/9）；浏览器全量 Chromium 桌面/手机 56/56。新增测试验证图标/文件行/菜单的实际鼠标命中、灯光同步、下载完成、暂停后缩窄尺寸的重新定位。首次测试因虚拟时钟仍自动前进导致阶段漂移，改为固定暂停时钟后按确定时间推进通过。360/390/768/1024/1440 五宽度四场景共 20 状态无溢出、无页面/控制台错误、无错误覆盖层；截图在 /tmp/hero-files-1440.png、/tmp/hero-files-390.png 等。Browser 插件不可用，使用 Playwright；本次未重跑 Firefox/WebKit 和真实手机。

新构建已更新到独立 16206 预览容器，宿主请求首页 HTTP 200 且包含新菜单；6002 原参考 URL HTTP 200，参考代码与服务未修改。旧 M7 正式归档仍为历史版本，未来发布前需重新打包和验收。

## 首页刷新回顶（2026-11-19）

用户要求刷新首页展示顶部。原有行为允许浏览器恢复滚动位置，并在 load 后按 URL hash 对齐，因此刷新可能留在设备区。新增首页专用早期 reload 检测：刷新时保留查询参数、移除旧 hash，临时关闭滚动恢复，在 pageshow 后下一绘制帧回顶，再恢复正常历史策略。首次深链接、页内导航及非 reload 导航不执行此逻辑。无 JS 时沿用浏览器原生行为。

修改仅限 SiteLayout.astro 和新增 home-reload.spec.ts。初次实现直接在 pageshow 回顶仍被浏览器后续恢复覆盖，改到下一帧后，桌面/手机刷新及既有首屏导航共 10/10 通过。覆盖带 hash 刷新、无 hash 刷新、保留设备查询参数、首次深链接和刷新后页内导航。参考目录与 6002 服务未改动。

## 安装模块按原设计重新对齐（2026-11-19）

用户明确要求所有设备状态与设计稿完全对齐，覆盖此前 M4 自行调整首页流程的决定。只读访问原 6002/v2/?v=install-options-1&ui=minimal，提取 18 个设备、59 个步骤的实际标题、正文、链接、备注与静态图示到 src/content/installationDesign.json。homeInstallation.ts 将本地设计数据用于首页，保留设备 ID；恢复五个平台的扫码配置/生成域名流程，移除首页新增的版本选择栏。独立设备内容页继续使用 installation.ts 中带资料来源的详细说明，未声称参考演示流程已经逐设备实测。

所有复制图示均为纯本地 HTML/CSS，没有加载参考脚本、iframe、父项目资源或原服务运行依赖。参考代码与服务未修改。首页说明以此次用户指定的设计为准；今后发现资料冲突应明确报告，不能再自行改变已批准界面。

新增 scripts/check-install-design.mjs：默认只读原参考 URL 与本地新站，逐设备逐步骤比较文案、字体、颜色、背景、关键区块几何；支持 REFERENCE_URL/INSTALL_URL/INSTALL_OUTPUT。360/390/768/1024/1440px 共 295 状态零差异告警（几何容差 4px），截图与比较 JSON 在 /tmp/ddnsto-install-design/。OpenWrt 390/1440px 四步截图逐项保留；字体栅格与截图裁剪仍可能产生像素差，不能将此写成所有浏览器逐像素相同。

全站 Chromium 桌面/手机模拟 58/58，通过设备选择、步骤切换/复位、查询回退、无 JS 阅读、复制成功/失败、内容页与首屏回归。原测试对旧版选项/终端步骤的断言按新批准需求更新；版本信息仍留在独立指南。首次 Node 检查因旧版文字断言失败，已替换为设计流程断言；Playwright JSON 导入首次失败，添加标准 JSON import attribute 后通过。本次未做真实设备安装或 Safari/微信实机验证。

本次范围为截图中的设备选择与步骤面板；下方独立的离线包/脚本安装区域仍保留之前核实的命令与复制回退，未执行任何安装命令。旧正式发布归档不包含此次更新，后续发布需重新打包。

最终 npm run validate 通过，类型 0 错误/警告、格式/构建通过、Node 9/9。已更新独立 16206 预览，宿主 HTTP 200 并包含扫码配置内容；6002 参考页仍 HTTP 200，原 index.html SHA-256 保持 48f87d3867d4405b0be2b3e24028ce22f17577331b8ffc14c1b709dc7c5d83fa。

## 2026-11-19 安装选项区对齐设计

用户明确要求离线安装包与一键脚本区域按截图及设计代码对齐。恢复参考 simple-install.js 中的完整命令、替换“用户令牌”的说明与复制成功提示；命令只展示/复制，从未执行或请求安装脚本。此前仅保留旧官方 Linux 命令的决定由本次明确要求覆盖。恢复 pre-wrap、任意长词换行及完整等宽字体列表，使桌面两行命令与手机自适应高度和设计一致。保留复制不可用时的手动复制回退。

Browser plugin not available，使用 Playwright Chromium。新增 scripts/check-install-options.mjs，只读比较原 6002 与新站；360/390/768/1024/1440px 下可见文本、字体、颜色、背景和关键元素几何（1px 容差）均无差异告警，截图及报告在 /tmp/ddnsto-install-options。首次比对发现字体回退导致高度差 2–3px，已修复后复查通过。桌面与手机截图已人工查看。全站桌面/手机 Chromium 58/58 通过（包含复制成功、失败、无 API 与无 JS）；随后仅补齐字体列表并重建、重新视觉验证。npm run validate 通过，Node 9/9；没有真实执行安装命令或进行 Safari/微信实机验证。本次只修改 2026 项目，并更新其独立预览；原参考代码和服务未改动。正式发布归档需发布时重新生成。

## 2026-11-19 HTTP 预览复制兼容修复

用户截图显示自动复制失败并展开手动框。通过新的 installation-http-copy.spec.ts 在普通 HTTP 源复现：isSecureContext=false、navigator.clipboard 不存在，桌面和手机两个用例均收到“未能自动复制”而非成功提示。原测试只覆盖现代 API 成功及手动回退，遗漏 HTTP 一键复制。

按钮现在优先使用现代 Clipboard API；不可用或拒绝时使用用户点击内的 textarea 选择与 execCommand('copy') 兼容复制，返回成功后才显示成功提示，两种方式都失败才展开手动框。临时文本框在 finally 删除，成功恢复按钮焦点，失败保留手动选择；命令不执行。该传统 API 是针对普通 HTTP 预览的兼容方式，未来浏览器不支持时仍有手动回退。

新增普通 HTTP 桌面/手机回归，检查真实非安全上下文、copy 事件中的完整选区、成功提示、手动框隐藏与焦点恢复；现有失败用例显式模拟两种方式均失败。Browser plugin not available，采用 Playwright；尚未做 Safari/微信真机剪贴板验证。改动仅限新项目，参考代码及 6002 服务保持不变。

最终验证：npm run validate 通过（类型无错误/警告，传统 execCommand 与相关类型存在弃用提示；Node 9/9），全站 Chromium 桌面/手机 60/60 通过，包含先失败后修复通过的两条 HTTP 回归。独立 16206 预览已更新，宿主访问 HTTP 200。

## 2026-11-19 功能卡片动画及教程悬停对齐

按用户要求先定位文件、分析影响并说明方案。修改仅涉及 features/Features.astro、该模块新建的 FeatureVisual.astro、motion.ts 的说明注释及 feature-motion.spec.ts。原简化示意图缺少地址栏、路由侧栏、状态面板、锁图标，且只在 hover/focus 时短暂播放；参考是持续循环示意与整卡教程覆盖层。现按只读设计 page.js 和实际页面重建四张卡片的局部结构、文案和尺寸，未引入 original-modules 或父工程依赖。

路由负载按参考六个关键值循环（CPU 4 秒、内存 5 秒）；桌面鼠标往返 112/40px（3 秒运动加 0.5 秒停顿）；文件鼠标 120→80→120px、菜单在 4 秒周期的 45%–85% 显示；日志复制两组实现 15 秒连续滚动。图标 SVG 与示意文案来自本地设计参考；不进行真实远程连接。动画仍离屏/后台暂停，减少动效时静止。桌面 hover 和 focus-within 显示整卡浅色覆盖层及居中“查看教程”；原站内四个教程 URL 和下方阅读指南保持可访问。触屏端为可发现性显示普通教程按钮，因此手机卡片比纯参考额外增加按钮高度，这是已在本轮说明的触屏适配。

Browser plugin not available，使用 Playwright Chromium。桌面 1440px 卡片宽 578px，首排高 376.5px、次排高 326px，与只读参考相同；截图检查了正常、悬停和 390px 触屏状态。360/390/768/1024/1440px 无页面横向溢出或 pageerror，报告及截图 /tmp/features-qa/。没有宣称所有动画时刻逐像素相同；参考 Framer 动画时钟与新 CSS 动画时钟独立。

npm run validate 最终通过，类型无错误/警告（原剪贴板兼容 API 弃用提示保留）、Node 9/9；全站 Chromium 桌面/手机 64/64，通过后补齐负载关键值和桌面图标细节，相关 6/6 再次通过。覆盖可见循环、后台暂停、减少动效、hover/focus 教程覆盖层和链接跳转、桌面/文件鼠标关键位置、文件菜单时机、终端滚动及横向溢出。Safari/微信及真实手机未验证。仅更新新站独立 16206 预览，未改动参考代码或 6002 服务；正式归档仍需发布时重建。

## 2026-11-19 四张功能卡片教程地址修正

用户指出上一轮保留站内教程地址不符合设计。本轮只修改 Features.astro 四个卡片链接和对应交互测试：按本地设计 page.js 恢复 start.html、remote_control.html、cloudapp.html 的远程 SSH 锚点、ddnstofile.html 的文件管理锚点；统一 target=_blank、rel=noopener noreferrer。卡片画面、动画及下方站内阅读指南不变。前一轮“原站内四个教程 URL 保持”的记录由本次明确要求覆盖。

Playwright 桌面/手机全站 64/64，通过逐个点击四个链接创建新标签、准确 URL（含锚点）、opener=null、首页 URL 不变，以及原悬停/聚焦效果。测试拦截外部教程响应，仅验证浏览器跳转行为，不将此结果视为外站内容可用性验证。首次格式检查发现测试文件需二次格式化，修正后重新运行完整 validate。改动限定 2026 项目，参考代码和 6002 服务不变。

最终 npm run validate 通过，Node 9/9；独立 16206 预览已更新，宿主访问 HTTP 200。

## 2026-11-19 教程返回后遮罩残留修复

用户反馈打开新标签教程后返回，鼠标不在卡片上仍显示遮罩。新增真实点击→新标签→关闭返回→移开鼠标的回归用例，修改前桌面测试在预期 opacity=0 处失败，确认链接仍持有焦点时 :focus-within 导致残留。

仅将 Features.astro 的两处显示/缩放选择器从卡片 :focus-within 改为教程链接 :focus-visible。保留鼠标 hover、键盘 Tab 焦点提示、真实链接焦点、教程地址/新标签行为、动画及触屏常显按钮，不用 blur 强行清除键盘焦点。回归逐个覆盖四个卡片，确认鼠标返回移开隐藏，同时 Tab/Shift+Tab 回到链接重新显示。触屏不使用悬停遮罩，该专项桌面用例在触屏项目显式跳过。

验证完成：npm run validate 通过，Node 9/9；Chromium 全站 65 passed、1 skipped（上述触屏非适用用例）。新增桌面回归由失败转为通过，四张卡片均验证返回后遮罩隐藏及键盘可访问。独立 16206 预览已更新并返回 HTTP 200。改动仅限新项目，参考代码和 6002 服务未改动；Safari/微信实机未验证。

## 2026-11-19 传统手动配置流程补齐

用户要求将原阅读指南区对齐设计中的折叠式流程演示。先说明文件、方案及影响；在 Features.astro 移出原阅读指南，新增独立 workflow/Workflow.astro、controller.ts，并在 index.astro 的 Features 后挂载。原四个场景与所有设备指南完整保留在流程末尾独立折叠入口内，更新对应 SEO 导航回归。没有改动功能卡片、安装模块、商业信息或教程跳转。

外观按只读参考 legacy-flow 与 original-modules/page.js：默认收起“传统手动配置流程参考”，展开显示说明、标题、三步图标、编号和中央 672×300px 演示区。步骤包括安装客户端、创建域名、随处访问；每 3 秒切换，可悬停/点击/键盘选择。实现令牌与域名显示、服务停止到运行、模拟按钮按下/鼠标移动、浏览器加载和连接成功的动画；演示全部本地模拟，不提交令牌或发起连接。关闭、离屏、后台暂停，悬停/键盘操作暂停轮播；减少动效下停止自动轮播和装饰动画，仍可手动选步骤。

Browser plugin not available，使用 Playwright Chromium。参考与新站桌面截图对照后校准标题 32px/44.8px、72px 上下留白、内容宽度及图标；360/390/768/1024/1440px 检查无页面横向溢出与 pageerror，桌面三步、手机三步和折叠截图 /tmp/workflow-qa/，最终桌面 /tmp/workflow-qa/final-desktop.png。与参考明确差异：展开末尾额外保留原站指南折叠入口；无真实安装或跨设备浏览器验证。

全站 Chromium 桌面/手机 69 passed、1 skipped（既有桌面 hover 专项在触屏不适用）；新增测试验证默认折叠、三步/键盘选择、每 3 秒轮播、关闭/后台/减少动效暂停及恢复、原指南入口。最终微调字体/间距后 npm run validate 再次通过，类型无错误/警告，Node 9/9。仅更新新项目独立 16206 预览，原参考代码与 6002 服务未改动；正式归档发布时需重建。

## 2026-11-19 手动流程过渡与轮播停留修复

用户要求步骤转换更平滑、移除模拟鼠标，反馈同一步重复播放。先新增点击步骤后保持焦点/鼠标再推进时间的回归，修复前桌面与手机均失败。原因是轮播计时器受整个组件 hover 和 contains(activeElement) 阻断，而内部动画仍循环。

最小修改限定 workflow/controller.ts、Workflow.astro 及 workflow.spec.ts：取消鼠标停留/焦点保留的无限暂停，选择后重新计时 3 秒继续；关闭、离屏、后台、减少动效仍暂停。移除两处模拟鼠标及其样式/关键帧。步骤切换采用旧画面 300ms 淡出上移，随后新画面 300ms 淡入上移；600ms 后清理旧场景。快速切换先清理上次过渡，暂停/卸载清理过渡定时器，避免残留叠层。

npm run validate 通过，Node 9/9；Chromium 桌面/手机全站 71 passed、1 skipped（既有桌面悬停专项）。新增鼠标/焦点保留回归由失败转通过。另用真实时间浏览器采样：150ms 旧场景 opacity≈0.73、新场景 0；450ms 旧场景 0、新场景≈0.94；700ms 仅新场景显示。持续保留鼠标/焦点后自动由第二步到第三步再回第一步，快速连续选择最终仅一幅画面，鼠标节点数为 0。结果 /tmp/workflow-smooth-qa.json。未测试 Safari/微信实机。仅更新新站独立预览，原参考代码和 6002 服务未改动。

## 2026-11-19 统一步骤选中态并消除过渡空白

用户反馈三步选中样式不一致、切换仍生硬。定位到图标只对缩放/边框/阴影过渡，而底色、图标颜色、编号和标题颜色直接跳变；600ms 串行退入场在中点两幅画面均透明。新增中途透明度采样回归，修改前桌面/手机均失败。

局部修正 Workflow.astro：图标/底色/边框/光晕/编号/标题统一 360ms 过渡，编号统一加粗，选中底色和光晕统一。步骤场景采用相同缓动的 450ms 同步交叉淡入淡出，去掉 300ms 入场等待，位移从 20px 缩小为 6px；controller.ts 过渡清理同步改为 450ms。保留无模拟鼠标、每三秒轮播、焦点不阻塞轮播、关闭/后台/离屏/减少动效暂停与快速切换清理。

验证：npm run validate 通过，Node 9/9；Chromium 全站 75 passed、1 skipped。新增过渡 100/225/300ms 采样均为两幅画面同步可见且透明度和 >=0.95；三步选中后图标、编号及标题共享视觉属性一致（标题文本宽度除外）。既有连续轮播、快速选择和暂停恢复回归仍通过。390px/1440px 三个选中态截图 /tmp/workflow-blend/，无页面横向溢出，桌面截图人工查看。动画顺滑程度仍需用户在实际设备确认，Safari/微信实机未测试。修改仅限新项目流程文件、测试和本记录；原参考代码及 6002 服务未改动。

## 2026-11-19 删除设计稿之外的流程底部指南区域

按用户截图明确要求，删除 Workflow.astro 中“按需求阅读指南”、四个场景链接及“查看所有设备安装指南”整个额外区域，同时清理其专用样式与未使用的内容导入。覆盖此前保留此入口的决定；三个步骤、轮播控制器和独立指南页面保持原样。流程测试改为确认额外区域不存在，设备指南测试直接访问内容页并验证返回交互指南。

验证：npm run validate 通过，Node 9/9；全站 Chromium 桌面/手机 75 passed、1 skipped（既有触屏不适用的悬停专项）。日志 /tmp/workflow-remove-guides-validate.log 与 /tmp/workflow-remove-guides-e2e.log。构建同步到新站独立 16206 预览；参考代码与 6002 服务未改动。

## 2026-11-19 文字跳转链接取消下划线

按用户 FAQ 截图要求，global.css 基础 a 样式改为 text-decoration: none，沿用原有悬停颜色和 160ms 颜色过渡；移除 faq.css 中覆盖全局悬停色的重复链接颜色规则。链接地址、打开方式、键盘焦点提示及按钮专用样式不变。

Browser plugin not available，使用 Playwright：打开首页、展开首个 FAQ、悬停官方常见问题及答案来源链接。360/390/768/1024/1440px 均无下划线，悬停颜色从 rgb(0,88,235) 变为 rgb(0,78,214)，无横向溢出、页面/控制台错误或框架错误遮罩，页面标题正常。截图 /tmp/faq-links-390.png、/tmp/faq-links-1440.png。npm run validate 通过，Node 9/9；全站 Chromium 桌面/手机 75 passed、1 skipped。未验证 Safari/微信实机。更新独立 16206 预览，原参考文件及 6002 服务未改动。

## 2026-11-19 增强 FAQ 文字链接悬停反馈

用户反馈蓝色变化不明显，仅在 faq.css 为 FAQ 标题区和答案内文字链接增加深蓝文字 #003a9e、淡蓝底色 #dceaff 及 3px 外扩背景；悬停和键盘焦点共用提示。无下划线，不修改尺寸、字重、链接地址或按钮样式。

Browser plugin not available，Playwright 检查 390/1440px 两种链接悬停后的文字/背景色、无下划线及尺寸保持不变，无 pageerror；截图 /tmp/faq-highlight-390.png、/tmp/faq-highlight-1440.png。npm run validate 通过，完整 Chromium 回归 75 passed、1 skipped。更新新站 16206 预览，参考代码和 6002 服务未改动。

## 2026-11-19 链接恢复纯文字高亮

按用户最新要求，移除 FAQ 文字链接悬停背景色、外扩阴影及不再需要的圆角，仅保留 #003a9e 文字颜色变化。无下划线，保留键盘焦点提示。仅修改 faq.css。

npm run validate 通过；完整 Chromium 回归 75 passed、1 skipped。Playwright 在 390/1440px 检查两种 FAQ 链接，悬停文字色正确、背景透明、box-shadow 为 none、无下划线。已同步新站 16206 预览；原参考代码和服务不变。

## 2026-11-19 移除页脚底部额外三个入口

按用户红框要求，删除 Footer.astro 法务信息下方“商务洽谈、微信客服、使用帮助”一行及其专用样式。contact 锚点移到 footer，保留已有锚点目标；上方栏目商务链接、浮动客服与 FAQ 帮助弹窗不变。帮助弹窗回归改从 FAQ 无搜索结果入口触发。

npm run validate 通过，Node 9/9；全站 Chromium 75 passed、1 skipped。Playwright 390/1440px 检查额外入口已移除、页脚保留 15 个原有链接、无横向溢出；截图 /tmp/footer-trim-390.png、/tmp/footer-trim-1440.png。同步独立 16206 预览，原参考文件及 6002 服务未改动。

## 2026-11-19 刷新保留当前浏览位置

用户最新要求覆盖此前“刷新回顶部”的行为。只读验证参考页滚动 1500px 后刷新仍为 1500px。移除 SiteLayout.astro 中首页 reload 清除 hash、manual scrollRestoration 及强制 scrollTo(0) 的整段脚本；IntentNav.astro 的 load 锚点对齐仅用于首次 navigate，避免 reload/back_forward 被再次拉到锚点。采用浏览器原生位置恢复，无额外存储或页面局部加载机制。

更新 home-reload.spec.ts：首次锚点导航、刷新保留 URL、无 hash 时恢复 1500px、导航点击、保留 hash 但手动滚到 800px 后刷新仍恢复 800px。新要求回归在原实现桌面/手机均失败；最终全站 Chromium 75 passed、1 skipped，npm run validate 通过，Node 9/9。测试禁用平滑滚动并等待锚点定位结束，避免测试滚动动作互相覆盖；另以默认动效在 390/1440px 构建预览实测刷新前后均为 800px。未验证 Safari/微信实机。同步独立 16206 预览，原参考代码和 6002 服务未改动。

## 2026-11-19 礼盒悬停动画与无罩浮层对齐

对照用户截图及只读 reference/design/v2/assets/hero-refresh.js、css，定位礼盒缺少 pointerenter/leave、动画 transition 被重复规则清零，优惠卡与客服错误使用 showModal，以及优惠卡越界伪元素产生横向滚动条。

仅修改 support 模块和相关测试：礼盒桌面悬停打开、160ms 移出延迟关闭，移入卡片取消关闭；恢复 400ms 盒盖及光点过渡；悬停不抢焦点，点击仍可打开并通过关闭按钮/Esc 关闭。优惠卡和客服改用非模态 dialog.show，页面可交互、点外部关闭，不锁定 Tab；使用帮助保留模态与焦点约束。移除优惠卡越界伪元素，按设计显示两行标题及“高级套餐专享 · 点击了解”，保留既有套餐跳转目标。768px 以上恢复右下固定入口，手机保留此前不遮挡主操作的页尾入口。减少动效规则仍生效。

验证：npm run validate 通过，Node 9/9；新增悬停开盒/移出关闭、非模态状态、页面点击与无横向滚动条回归，全站 Chromium 77 passed、1 skipped。390/1024/1440px 构建预览无 pageerror、无横向溢出，卡片 scrollWidth 等于 clientWidth；截图 /tmp/support-offer-{390,1024,1440}.png 与 /tmp/support-customer-1440.png。未测试 Safari/微信实机。同步独立 16206 预览，原参考代码和 6002 服务未修改。

## 2026-11-19 移动端客服与 TCP 入口改为底部工具栏

用户反馈页脚末尾两个大图标位置不合适。仅调整 support.css 的 <768px 样式：两列固定底部工具栏，缩小机器人/礼盒并横排文字，44px 最小点击高度，常规高度 61px；添加安全区及页面底部留白。客服与优惠卡显示在工具栏上方，无遮罩；768px 以上保留原桌面入口和悬停动画。控制器与链接行为不变。

npm run validate 通过，Node 9/9；全站 Chromium 77 passed、1 skipped。更新移动端回归验证固定工具栏、高度及触摸目标；另在 360/390/767/768/1440px 检查无横向溢出、移动卡片与工具栏不重叠，二维码成功加载。截图 /tmp/mobile-support-footer.png、/tmp/mobile-support-customer.png、/tmp/mobile-support-gift.png。未验证 iOS 实机安全区，使用 CSS env 适配。同步独立 16206 预览；原参考代码和 6002 服务未变。

## 2026-11-19 移动端工具栏随页尾滚动

用户确认双入口样式，但要求取消固定。仅将移动端 support-launchers 改为正常文档流，移除固定定位及专门预留的底部空间；保持双列图标文字、点击区域、安全区内边距和无遮罩卡片。桌面布局不变。

npm run validate 通过，Node 9/9；全站 Chromium 77 passed、1 skipped。回归验证移动端首页顶部看不到入口、滚动页尾后可见；360/390px 实测页尾栏高 61px，完整显示，截图 /tmp/mobile-inline-360.png、/tmp/mobile-inline-390.png。同步独立 16206 预览，原参考代码和服务不变。

## 2026-11-19 TCP 上线标题新标签页打开控制台

按用户箭头所指，将优惠卡“新功能 TCP 上线”从文本改为链接，复用 site.consoleUrl（https://web.ddnsto.com/app/），target=_blank、rel=noopener noreferrer；保持原字号和间距。下方套餐链接与礼盒开关不变。

npm run validate 通过，Node 9/9；全站 Chromium 77 passed、1 skipped。390/1440px 实际点击均产生新标签页、目标 URL 正确、原页面 URL 不变且 opener 为 null；测试拦截控制台响应，不涉及真实登录操作。同步独立 16206 预览，参考代码及服务未改动。

## 2026-11-19 控制台链接点击后收起礼盒浮层

用户反馈打开控制台后返回官网，优惠浮层仍显示。新增桌面/手机真实 popup 回归，在原实现均复现失败。为 TCP 上线链接添加 data-offer-console，在现有点击处理器中调用 close(false)，同步关闭卡片、清理定时器、复位礼盒与 aria-expanded，不阻止原生新标签页导航、不主动抢回焦点。

npm run validate 通过，Node 9/9；全站 Chromium 79 passed、1 skipped。回归验证新标签页目标正确、返回原页后浮层隐藏且礼盒复位、再次点击仍可打开；控制台响应由测试拦截。同步独立 16206 预览，原参考文件和服务不变。

## 2026-11-19 首页滚动入场动效

用户要求参考设计稿下滑入场效果。只读原 original-modules/page.js 确认功能卡片 opacity 0→1、y 20→0、500ms、once 模式及延迟。新增 src/lib/scrollReveal.ts，由首页单独初始化，使用 IntersectionObserver + Web Animations API；区块标题、场景/安装主体、套餐/功能卡片、FAQ 与页脚分组首次进入视口时淡入上移，卡片按序延迟 80ms。无新增依赖，不修改业务控制器或原设计文件。

采用渐进增强：正文默认可见，脚本禁用/不支持 API 时正常阅读；初始视口、刷新恢复位置处的内容不额外隐藏；减少动效时直接显示，偏好变化/页面后台/键盘进入时取消正在播放的效果。动画结束清理，不重复播放；pagehide 清理观察及动画，pageshow 恢复未播放元素观察。

npm run validate 通过，Node 9/9；全站 Chromium 83 passed、1 skipped。新增桌面/手机回归验证 500ms/20px 入场、首次播放、最终可见及减少动效；既有刷新保留位置、锚点导航、无 JS 正文和业务流程通过。390/1440px 实际采样进入中透明度约 0.28–0.40、后续卡片错峰等待，结束后完整显示，无 pageerror/横向溢出；截图 /tmp/reveal-{390,1440}-{enter,done}.png。Safari/微信实机未测试。同步独立 16206 预览，参考代码和 6002 服务不变。

## 2026-11-19 免费使用新标签页打开

按用户要求，Hero.astro 的“免费使用”链接增加 target=_blank 与 rel=noopener noreferrer，控制台地址和其他首屏链接保持不变。npm run validate 通过，Node 9/9；全站 Chromium 83 passed、1 skipped。390/1440px 实际点击验证产生新标签页、目标 https://web.ddnsto.com/app/、原页面保留、opener 为 null；测试拦截外部响应。同步独立 16206 预览，参考代码和服务未改动。

## 2026-11-19 首次纳入 Git

检查当前未跟踪的独立 2026 官网工程，保留源码、资源、锁文件、测试、开发文档和已登记设计/验收快照。依赖、构建产物、测试结果与发布归档沿用已有忽略规则；补充日志、系统元数据和 TypeScript 增量缓存忽略规则，不删除本地文件。扫描未发现私钥或常见访问令牌格式；README 更新为实际 M7 后维护状态。提交范围仅新项目目录，不包含旧官网改动。最近业务校验 npm run validate 通过、Node 9/9、Chromium 83 passed/1 skipped；本次仅补充文档与忽略规则。

## 2026-11-19 迁移旧官网统计与全站控制台来源参数

按用户确认沿用百度 ID 5f1bc900ab954d0d1e03eb7f29aba601、GA4 G-1QGR1XG068，仅 SITE_ENV=production 加载。公共布局覆盖首页、指南页与 404；普通脚本定义全局 gtag，使用原生 arguments 入队，先初始化队列再异步加载 Google SDK。客户端从服务端输出的 data-analytics-enabled 读取开关，避免直接读取不可见的 SITE_ENV 导致跳过事件。

Header 顶部/手机菜单保留 click_login_console 和 navbar_desktop/navbar_mobile；Hero 免费使用保留 click_free_use、hero；language 固定 zh。三个入口均额外上报 ddnsto_outbound_click，send_to/source/type 沿用旧值；单个统计失败不会阻断跳转或菜单关闭。其他入口的自定义事件仍待用户确认。

全站公开控制台入口补齐 utm_source=website&utm_medium=website，普通入口进入 #/devices，套餐购买保留 #/plans?entry=purchase。覆盖共享控制台 URL、首页安装设计数据、设备指南和场景指南的控制台链接；商业事实来源元数据保留原 URL。没有修改参考文件、旧官网、依赖版本或共享预览服务，未部署。

验证：npm run validate 通过，Node 12/12，类型 0 错误/警告（已有 execCommand 弃用提示 2 项）。生产构建通过，SITE_ENV=production node --test tests/analytics.test.mjs 3/3，检查全站每页脚本恰好加载一次及链接参数；生产模式 analytics.spec.ts 桌面/手机 2/2，覆盖原生 Arguments、每次两个事件、无 SDK 响应及 SDK 抛错时导航与菜单关闭。

Browser plugin not available，使用 Playwright。本地生产静态产物 http://127.0.0.1:16211/ 加载真实 Google SDK，拦截 collect 请求避免污染正式数据；三个按钮各生成一次对应事件和一次 ddnsto_outbound_click，Measurement ID 正确，page_view 恰好一次。1440×900、390×844 页面正常，无控制台错误；截图 /tmp/ddnsto-analytics-desktop.png、/tmp/ddnsto-analytics-mobile.png。实际后台到账、Safari/微信实机未验证；测试服务已停止。

初次全量出现教程弹窗返回焦点失败，后续通过；并行构建/修改文件期间另一次运行出现动画与安装流程超时，安装用例日志含导航和 DOM 替换。停止构建和修改文件后独立执行 npm run test:e2e -- --workers=2，85 passed、1 skipped（移动端不适用的悬停测试）。没有修改无关动画或焦点实现。

下一步：用户确认新增入口自定义事件范围；正式部署后验收统计后台接收。当前 dist 已恢复默认预览构建，未更新 16206 共享预览。

## 2026-11-19 启动最新本地预览

按用户要求将当前预览 dist 同步到既有 ddnsto-homepage-2026-preview Nginx 容器并启动，IPv4 地址 http://192.168.9.3:16206/。宿主网络请求 HTTP 200，首页正文与 UTM 参数存在；默认预览不启用真实统计，data-analytics-enabled 未开启。保留 noindex/no-store，不修改原 6002 服务或正式站点。用户终端访问待实测。

## 2026-11-19 需求导航控制台入口补齐事件

按用户要求为 IntentNav “进入控制台”接入 click_login_console、ddnsto_outbound_click，复用 analytics.ts，section 使用 intent_nav；Google ID 与其他参数保持一致。仍仅生产环境启用。事件调用逐个 try/catch，不阻止默认跳转、不等待网络响应；原生链接、新标签页与菜单行为保持。

npm run validate 通过，Node 12/12；生产模式 analytics.spec.ts 桌面/手机 2/2，检查新入口每次两个事件及全部已埋点按钮在 gtag 缺失或抛错时仍打开正确 URL，手机菜单正常关闭，无 pageerror。初次测试尝试把全局函数重定义为 getter 被浏览器禁止，调整为对可写函数值模拟缺失/抛错，未修改业务实现规避测试。最终全站 npm run test:e2e -- --workers=2：85 passed、1 skipped。沿用 Playwright（Browser plugin not available）。

同步最新默认预览产物到 http://192.168.9.3:16206/，宿主网络 HTTP 200 且新入口标记存在；预览不发真实统计，未部署生产。未改旧官网或无关业务。其余新增入口自定义事件仍待用户确认。
