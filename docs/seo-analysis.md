# DDNSTO 官网 SEO 分析与实施建议

分析日期：2026 年 10 月 10 日。目标官网：https://web.ddnsto.com/ 。以下问题表记录修改前的检查结果，已实施范围见文末。

无需整体重构。当前范围是只优化 https://web.ddnsto.com/，旧站不修改内容、配置、链接或跳转。新站通过技术 SEO、准确元数据和站长平台工作争取品牌词与相关场景词曝光，并按确认的设计在首屏增加 DDNSTO 品牌文字、调整标题排版；其余产品文案与交互保留。不能保证所有引擎、所有用户、所有关键词都排第一，也不能保证所有 AI 立即更新答案。下文涉及扩展正文、语言或独立内容页的建议仅为后续可选方案，不属于当前已实施范围。

## 已核实的问题

检查范围包括仓库路由、元数据、页面组件、文案、语言逻辑、教程入口、静态资源，以及公网 HTTP 响应和两个官网的页面内容。没有站长后台、搜索流量、反向链接或服务器日志数据，因此不能据此确定旧站排名更高的全部原因。排名顺序来自用户截图，不是本次跨地区排名测量。

| 位置 | 实际情况 | 建议 |
| --- | --- | --- |
| `src/app/layout.jsx:4` | title 是 `DDNSTO`，线上一致 | 改为 `DDNSTO 远程控制`，与可见品牌统一 |
| `src/app/layout.jsx:5` | description 是 `DDNS management homepage`，线上一致 | 改为准确的中文产品介绍 |
| 首页元数据 | 代码与线上未见 canonical、Open Graph 或 JSON-LD | 增加规范网址、分享信息、真实站点和运营主体信息 |
| `src/components/Hero.jsx:72`、`src/i18n/translations.js` | H1 只有“远程访问，如此简单” | H1 加上 DDNSTO 远程控制，口号可保留为副标题 |
| `src/components/Navbar.jsx`、`src/components/Footer.jsx` | 可见品牌主要是 DDNSTO | 统一关键位置的完整品牌名称 |
| `/robots.txt`、`/sitemap.xml` | 线上均为 404，仓库无对应文件 | 补齐；robots 缺失不等于禁止抓取，sitemap 缺失也不等于无法收录 |
| `public/favicon.svg` | 已存在，线上 200 | 不是“没有图标”；补充 PNG/ICO 和独立品牌 Logo，分别处理搜索展示 |
| `src/contexts/LanguageContext.jsx:11` | 同一 URL 在加载后按浏览器语言换正文，HTML lang 固定 zh-CN | 中文首页保持稳定；需要英语 SEO 时新增 `/en/` 和对应语言元数据 |
| `src/components/Hero.jsx:27` | 初始只有 OpenWrt 教程，其他教程靠切换 | 重要教程使用真实可抓取链接，按需新增独立内容页 |
| `src/components/FAQ.jsx` | 折叠答案仍在 HTML 中 | 保留这种可抓取实现；若以后允许内容扩展，可补官网入口与场景问答 |
| `src/components/Footer.jsx:24` | 官网链接指向 www.ddnsto.com | 当前该地址已 301 到 web.ddnsto.com；建议直接链接最终地址以减少跳转 |
| `next.config.js:3`、`src/App.jsx` | Next.js 静态导出，App 是 Client Component | 不必因此推倒重写；线上原始 HTML 已有中文正文和 FAQ |

本次公网检查还确认：

- `https://web.ddnsto.com/` 返回 200，原始 HTML 约 106 KB，包含产品正文；未发现首页 noindex。
- `https://www.ddnsto.com/` 和 `https://ddnsto.com/` 均返回 301，直接指向目标官网。
- `https://www.kooldns.com/` 与 `https://kooldns.com/` 均仍返回 200；前者标题为 `DDNSTO远程控制`，没有迁移到新站。
- `https://web.ddnsto.com/app/` 是另一个控制台入口，返回应用 HTML，发布时应保留其独立路由。
- 抽查的不存在 URL 返回真实 404，没有发现该 URL 被错误回退为首页。
- HTTP 非加密入口在当前检查环境连接失败，不能据此确定全国用户或爬虫访问状况，应从部署侧复核 HTTP 到 HTTPS 的跳转。

参考：[新官网](https://web.ddnsto.com/)、[旧官网](https://www.kooldns.com/)。Next.js 静态导出可以预生成页面 HTML，Client Component 不等于初始页面只有空壳：[Next.js 官方说明](https://nextjs.org/docs/app/guides/static-exports)。

## 第一阶段 修正品牌和基础配置

建议首页文案：

```text
title：DDNSTO 远程控制

description：DDNSTO 远程控制提供内网穿透与远程访问，无需公网 IP 或端口转发，即可从外网访问 NAS、路由器管理后台和内网服务。支持自定义域名访问、浏览器 VNC & RDP 远程桌面、Web SSH 终端，以及 WebDAV、Samba、SFTP 远程文件管理。

H1：DDNSTO 远程控制
副标题：无需公网 IP，随时访问 NAS、路由器和远程桌面。

canonical：https://web.ddnsto.com/
站点名称：DDNSTO 远程控制
```

先使用用户指定的准确标题，不反复修改或堆叠同义词。若后续希望标题同时表达品类，可评估 `DDNSTO 远程控制官网｜内网穿透与 NAS 远程访问`。description 是摘要候选，搜索引擎也可能选择更匹配查询的正文；不能要求搜索结果逐字采用配置。标题也由搜索引擎综合页面及外部信号生成：[Google 标题说明](https://developers.google.com/search/docs/appearance/title-link)。

实现清单：

1. 在 layout 设置 metadataBase；首页设置自己的 canonical，未来子页必须各自设置，避免全部继承首页 canonical。
2. 设置中文 description、Open Graph 标题/描述/网址/品牌图片。OG 主要服务分享与内容识别，不保证百度富展示。
3. 在首页加入 `WebSite` JSON-LD，name 为完整品牌、alternateName 可为 DDNSTO、url 为目标官网。
4. 使用 `Organization` 表达真实运营公司，品牌与公司主体分开表达；Logo 使用稳定可抓取 URL，关联真正属于公司的官方渠道。
5. 准备方形 PNG 图标，例如 96×96，另备较大品牌 Logo；保留现有 SVG。需要分享卡片时再准备横版图片。
6. 静态导出可直接提供 `public/robots.txt` 和 `public/sitemap.xml`；也可用经构建验证的 Next 元数据路由。sitemap 只列正式上线、返回 200、允许索引的规范页面，不列锚点、控制台状态或设想中的路径。
7. robots 中标明 sitemap，允许公开页面和渲染资源抓取。不要把 robots 当权限保护或可靠的删除索引手段。
8. 将新站页脚产品入口直接指向目标官网。首屏增加 DDNSTO 品牌文字，保留原宣传语和 FAQ 文案，不添加替代旧站或完成迁移的声明。
9. 发布时确认静态文件正确复制、Content-Type 正确、CDN 缓存更新，无验证码或 WAF 阻拦正常爬虫。

`WebSite`、`Organization`、favicon 分别解决不同识别问题，不能把结构化数据解释为排名加分开关，也不能套用 Google 规则承诺百度展示：[站点名称](https://developers.google.com/search/docs/appearance/site-names)、[组织信息](https://developers.google.com/search/docs/appearance/structured-data/organization)、[favicon](https://developers.google.com/search/docs/appearance/favicon-in-search)。

## 第二阶段 新站独立参与排名

旧站完整保留，不配置 301，不修改旧站 canonical、robots、内容或链接，也不提交网站迁移。新站 self-canonical 仅声明新站自己的首选地址，不代表排他性官方认证，也不能强制搜索引擎让新站超过旧站。

针对新站执行抓取诊断、URL 与 sitemap 提交、品牌与 Logo 展示配置，持续观察各引擎对品牌词和场景词的曝光、点击和排名。对新站的外部推广可作为独立运营事项，例如发布有实际使用价值的介绍与教程并链接新站；本次不修改任何外部站点或账号，不购买垃圾外链。

## 百度截图中的展示元素

红色箭头指向的是可点击的搜索结果标题，首先修正 HTML title 和首页品牌文字。不要将它与摘要下方的站点品牌名称混淆。

| 展示元素 | 优化手段 | 边界 |
| --- | --- | --- |
| 可点击标题 | title、H1、可见品牌统一 | 抓取后可能仍被引擎改写 |
| 详细介绍 | description 与准确清晰的正文 | 摘要会随查询变化 |
| 大 Logo / 配图 | 可抓取品牌图片，百度站点 Logo 工具 | 改 favicon 不等于出现大图 |
| 摘要下方名称与头像 | 百度站点属性中的品牌展现 | 与标题不同，受账户权限和审核影响 |
| 下方多个子链接 | 有价值页面、清晰导航、百度可用的子链工具 | 不能靠 CSS 或 schema 指定完整结果布局 |

百度公开工具手册列出了站点 Logo、品牌展现和子链等能力，品牌展现文档提到 VIP 权限与策略筛选。Logo 文档列 PC 121×75、移动 200×133，但应以当前后台要求为准。不要承诺所有账号都有入口或提交后一定显示。[百度平台工具手册](https://zy.baidu.com/cse/wiki/index?category_id=7&id=3125)

Google 子链接由系统自动决定；可通过有意义的站点结构与链接帮助理解，但不能手工指定整套样式。[Google 子链接说明](https://developers.google.com/search/docs/appearance/sitelinks)

## 关键词和内容页规划

以下为基于代码功能和用户意图的候选词，不是搜索量、竞争度或转化率测量结果。上线前结合百度及其他站长平台实际查询数据排序。

| 优先级 | 关键词 | 承接方式 |
| --- | --- | --- |
| P0 品牌入口 | ddnsto、DDNSTO 官网、DDNSTO 远程控制、ddnsto 官方网站 | 首页 |
| P1 使用需求 | ddnsto 下载、ddnsto 安装教程、ddnsto 怎么用、ddnsto 收费、ddnsto 套餐 | 下载/入门/套餐页 |
| P1 登录需求 | ddnsto 登录、ddnsto 控制台 | 清晰的官方登录入口，避免将官网和控制台描述为同一页面 |
| P1 设备教程 | ddnsto OpenWrt、ddnsto iStoreOS、ddnsto Docker、群晖 ddnsto、威联通 ddnsto | 经验证的设备教程 |
| P2 功能场景 | NAS 远程访问、无公网 IP 访问 NAS、路由器远程管理、Web SSH、浏览器远程桌面、RDP/VNC 远程访问 | 对应场景/功能页 |
| P2 问题解答 | ddnsto 与 DDNS 区别、ddnsto 与端口转发区别、ddnsto 无法访问 | 原理解释与真实排障文档 |
| 长期品类词 | 内网穿透、远程控制、远程访问 | 以具体场景内容积累，不承诺首页短期排名第一 |

可逐步增加 `/download/`、`/pricing/`、`/guides/`、`/guides/docker/`、`/guides/openwrt/`、`/solutions/nas/`、`/faq/`、`/about/`。这些是建议路径，目前未实现。

每个页面都应解决独立问题，有自己的 title、H1、正文、canonical 和可点击内链。不生成只是替换设备名称的批量薄内容。现有 doc.linkease.com 文档继续发挥作用，不为增加页面数而原样复制。本次不新增内容页或迁移文档。

不要把关键词工作理解为填满 meta keywords，不采购垃圾外链或隐藏堆词。涉及“免费”、带宽和支持平台的内容必须符合当前产品事实。

### 全站文案对应的追加关键词

依据 `src/i18n/translations.js` 中的 hero、workflow、features、scenarios、faq、pricing，中英文页面组件及 `src/guides/` 平台指引梳理。下列优先级表示产品匹配度与内容承接程度，没有经过搜索量或竞争度测量，不代表这些词已经获得曝光。

| 优先级 | 主题 | 追加关键词候选 | 现有文案依据 |
| --- | --- | --- | --- |
| P0 | 品牌 | DDNSTO 远程访问、DDNSTO 内网穿透、DDNSTO 远程桌面 | 产品标题、FAQ 与功能区 |
| P1 | 内外网访问 | 外网访问内网、远程访问内网、内网远程访问、内网设备远程访问、无公网 IP 内网穿透、无需端口转发远程访问 | hero、workflow 与 faq.a1/a2 |
| P1 | 路由器 | 路由器远程访问、远程访问路由器、外网访问路由器、远程管理路由器、路由器管理后台远程访问 | hero.description、features.card_1_desc、scenarios.home_desc |
| P1 | NAS 与私有云 | NAS 远程访问、NAS 外网访问、无公网 IP 访问 NAS、群晖远程访问、群晖外网访问、威联通远程访问、Unraid 远程访问、私有云远程访问 | hero、scenarios.nas_desc、设备指引 |
| P1 | 桌面 | 浏览器远程桌面、网页远程桌面、RDP 远程访问、VNC 远程访问、Windows 远程桌面、Linux 远程桌面 | features.card_2_title/desc；仍需被控端服务及权限正确配置 |
| P1 | 安装平台 | DDNSTO OpenWrt 安装、DDNSTO iStoreOS 安装、DDNSTO Docker 部署、DDNSTO 群晖安装、DDNSTO 威联通安装、DDNSTO Windows 安装、DDNSTO Linux 安装 | Hero 平台选择和 src/guides |
| P2 | SSH 与运维 | Web SSH、网页 SSH、浏览器 SSH、SSH 远程连接、服务器远程管理、内网服务器远程访问 | features.card_3_desc、scenarios.it_desc |
| P2 | 文件 | 远程文件管理、NAS 文件远程访问、网页文件管理、WebDAV 文件访问、SFTP 文件管理、Samba 文件管理 | features.card_4_desc；不等于把 SMB 等协议原生端口任意暴露到公网 |
| P2 | 智能家居 | Home Assistant 远程访问、Home Assistant 外网访问、Node-RED 远程访问、智能家居远程访问 | faq.a1、scenarios.home_desc |
| P2 | Web 服务与域名 | 内网 Web 服务远程访问、自托管服务远程访问、内网管理后台远程访问、自定义域名访问 NAS、自定义域名访问内网服务 | workflow.step_2_desc、features.card_1_desc、faq.a1 |
| P2 | 使用与计费 | DDNSTO 使用教程、DDNSTO 套餐、DDNSTO 收费标准、DDNSTO 免费套餐、DDNSTO 设备绑定 | pricing 与 FAQ；不加入未经确认的价格或免费条件 |

“内网访问”也可能指同一局域网内部访问，优先组合成“外网访问内网”或“内网远程访问”。“远程穿透”作为观察词，主要使用产品定位更清楚的“内网穿透”，不凭直觉声称前者搜索量低。“远程访问设备”较泛，优先按路由器、NAS、服务器拆分。

首批建议监测十个查询：`ddnsto`、`DDNSTO 远程控制`、`DDNSTO 内网穿透`、`无公网 IP 访问 NAS`、`NAS 远程访问`、`外网访问路由器`、`路由器远程管理`、`浏览器远程桌面`、`外网访问内网`、`Web SSH`。之后用站长平台的实际曝光、点击及转化数据增删，不将此清单当作排名承诺。

不追加无依据的卖点：永久免费内网穿透、不限速、零延迟、支持所有设备、完全免安装、macOS 原生客户端下载。项目只说明访问端远程桌面无需安装客户端；设备端仍有安装步骤。`src/guides/macos.js` 明确当前指引为 Docker 方案，不支持宣传已提供原生 macOS 客户端。

“远程开机”“游戏联机”“任意 TCP/UDP 穿透”“爱快原生插件”等不能仅因旧站或截图出现相关词就当作本项目已验证功能，本轮不加。

### 当前约束下的关键词落点

本轮保留 title 为 `DDNSTO 远程控制`，更新 `src/seo.js` 的 description，以通顺介绍覆盖内网穿透、远程访问、外网访问 NAS、路由器管理后台、内网服务及四项主要功能：自定义域名访问、VNC & RDP 远程桌面、Web SSH 终端、文件管理。同时自然包含 WebDAV、Samba、SFTP 协议名称。该描述同步用于 metadata、Open Graph、分享卡片和 JSON-LD；不是把完整词库逐项写入页面。

四项主要功能原本就是 `translations.js` 的中文功能卡片标题，在首页初始 HTML 中有对应标题和解释；本轮补齐搜索描述中的准确表述，并在 llms.txt 中补充与现有正文一致的功能说明。没有改变可见文案，也没有通过隐藏文本追加同义词。检索时不要求用户逐字输入 `&` 或相同空格，但关键词出现本身不保证收录或排名。

没有添加 meta keywords。Google 明确不使用它进行索引或排名，不能把一串关键词配置当作曝光方案；也不据此推断百度或 360 的具体算法。[Google 支持的 meta 标签](https://developers.google.com/search/docs/crawling-indexing/special-tags)

描述是供搜索引擎选择的摘要来源，可能被截断或被正文替换，并非直接提高排名的保证。标题仍保持简洁，不堆叠所有目标词。[摘要说明](https://developers.google.com/search/docs/appearance/snippet)、[标题说明](https://developers.google.com/search/docs/appearance/title-link)

`Hero.jsx` 初始只渲染 OpenWrt 教程，`Scenarios.jsx` 初始只渲染 NAS 场景正文；其他内容需要客户端切换才能出现。因此，源文件中存在某个词，不代表每次抓取都能读取对应完整解释。Home Assistant 在 FAQ 中也有静态正文依据，Node-RED 主要依赖动态场景。本轮保持交互不变，不隐藏堆词或伪装爬虫页面。

只优化元数据能改善主题表达和搜索展示，但无法让单个首页充分回答每一个泛词。未来如果允许新增独立内容页，可以保持现有首页布局不变，为路由器、NAS、远程桌面等提供真正可浏览、可链接的教程/场景页；本次仅列为后续选项，不创建这些页面。

## AI 正确认识官网

首页/关于/FAQ 增加自然可见的权威说明，例如：

> DDNSTO 远程控制的官方网站是 https://web.ddnsto.com/ ，由深圳市易有云网络科技有限责任公司运营。

在当前不改可见内容的范围内，该信息通过新站元数据、结构化数据和 llms.txt 表达，不向页面额外添加正文。官网、控制台、文档分别标清用途，不声明旧站失效、被替代或已迁移。

检查 CDN/WAF 和 robots 是否允许目标搜索爬虫访问公开内容。ChatGPT 搜索的 `OAI-SearchBot` 与用于潜在训练数据收集的 `GPTBot` 设置独立；无需为了搜索曝光而默认开放训练抓取。`ChatGPT-User` 是用户触发访问，不能代替搜索爬虫。[OpenAI 爬虫官方说明](https://developers.openai.com/api/docs/bots)

`llms.txt` 可作低优先级补充，不是通用 AI 收录标准或保证。Google 当前指南明确它不影响 Google Search 的排名或可见度，不要求特殊 AI schema；不要将这一结论泛化为所有其他 AI 产品的规则。[Google AI 搜索指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

联网 AI 可在重新检索后发现新证据，离线模型已有知识不能由网站配置即时更新。没有单一提交入口能使所有 AI 都回答同一个网址。

## 语言 性能和渲染

先保持 `/` 为稳定中文。需要英语自然搜索时，再增加 `/en/`、各自的 lang/title/description/self-canonical 与双向 hreflang，语言切换使用真实链接。避免同一 URL 根据浏览器语言自动替换主要内容。[Google 多语言网站说明](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

首屏动画存在初始 opacity 0。正文虽在 HTML，但仍需验证禁用 JavaScript、低性能手机、慢网和脚本失败时的重要内容可见性。必要时让关键标题/介绍默认可见，装饰动画独立运行。针对移动端测量 LCP、INP、CLS 后再优化，无实测数据不能宣称性能已达标或造成现有排名。

短期不要求把所有组件转成服务端组件。后续如测量发现 JS 开销明显，可逐步缩小客户端交互边界，保留静态正文与必要互动。

## 发布与验收

浏览器和搜索引擎是两个层次。Chrome、Edge、Safari、Firefox 用户使用什么搜索服务，取决于其设置；应按百度、360、Google、Bing 分别验证。

实施顺序：

1. 建立基线：记录品牌词与场景词展示、点击、CTR、排名、新旧域名占比和官网到控制台的转化。
2. 发布元数据、图标、canonical、robots、sitemap 修正及已确认的首屏品牌排版。
3. 核对新站内部官网链接及所有机器可读配置一致，旧站保持原样。
4. 验证站长平台，提交新 URL / sitemap，使用当前账号可用的抓取和品牌工具，不使用网站迁移工具。
5. 根据真实查询需求逐步增加内容页，观察覆盖与转化，避免频繁无依据更改标题。

平台入口：[百度搜索资源平台](https://zy.baidu.com/)、[360 站长平台](https://zhanzhang.so.com/)、[Google Search Console](https://search.google.com/search-console/)、[Bing Webmaster Tools](https://www.bing.com/webmasters/)。360 不应照搬已下线的旧 JS 自动收录教程，以当前后台为准。[360 官方公告](https://bbs.360.cn/thread-15979727-1-1.html)

Bing 可提交 sitemap，并通过 IndexNow 通知实际发生的 URL 更新；通知不保证收录或排名。[Bing sitemap](https://www.bing.com/webmasters/help/Sitemaps-3b5cf6ed)、[IndexNow](https://www.bing.com/indexnow)

技术验收：

- 构建成功，导出 HTML 不执行 JS 就能读到准确 title、description、canonical、正文与 JSON-LD。
- 图标、robots、sitemap 返回正确状态及类型，XML 中只有真实规范 URL。
- 登录/下载/API 不受影响，未知 URL 保持真实 404，不改旧站的响应行为。
- 独立子页和英语页不错误 canonical 到中文首页。
- 核对真实爬虫请求日志、CDN/WAF 放行情况和站长平台抓取结果，不能只伪造 User-Agent 就认定抓取成功。
- 抽查移动端、慢网、无 JS 情况及关键登录/语言/FAQ 交互。

发布后可按第 1、2、4、8 周复盘，作为工作节奏，不是保证出排名的期限。排名与富展示不能作为代码发布当天的验收条件。

## 已实施的 SEO 与首屏调整

本次修改元数据、机器可读信息、静态资源和官网链接，并按确认的设计在 H1 中增加 DDNSTO 品牌名、调整首屏字号与响应式排版。不扩展产品正文、不改变语言切换、不新增内容页。

| 文件 | 已实施内容 |
| --- | --- |
| `src/seo.js` | 统一品牌名称、官网 URL 和描述；定义 WebSite、WebPage、Brand、Organization 信息，区分产品品牌与运营公司 |
| `src/app/layout.jsx` | 品牌标题、中文描述、metadataBase 和图标声明 |
| `src/app/page.jsx` | 首页 canonical、Open Graph、分享卡片和静态 JSON-LD；首页 canonical 不传给 404 或未来子页 |
| `src/components/Footer.jsx` | 产品官网链接直接使用 web.ddnsto.com，链接文字和样式不变 |
| `src/components/Hero.jsx` | H1 增加青色 DDNSTO 标识及两侧渐隐线；品牌字号桌面端 24px、手机端 20px，线长分别为 64px、48px；宣传语在大屏横排、手机分行，优化说明文字间距 |
| `public/robots.txt` | 保持公开抓取，声明 sitemap，不修改原有开放抓取的训练政策 |
| `public/sitemap.xml` | 只列实际存在的官网首页，没有虚构页面或更新时间 |
| `public/favicon-96.png`、`public/apple-touch-icon.png`、`public/logo.png` | 从现有 favicon.svg 转换出 96、180、512 像素 PNG，沿用原图形，没有重新设计品牌 |
| `public/llms.txt` | 补充准确的官网、控制台和文档入口说明；不承诺 AI 采用或因此提升排名 |

首屏以外的页面布局、产品文案、语言逻辑和交互保持原样；浏览器标签页标题变为 DDNSTO 远程控制。首屏品牌及排版变化与技术 SEO 配置分别实施，不将字号、装饰线等视觉调整描述为排名保证。

### 验证结果

- 初次 SEO 配置阶段，修改前与修改后均完成 `npm run build -- --no-lint` 生产静态导出。
- 初次 SEO 配置阶段，自动对比导出 HTML：剔除不显示的 script 后，body 除官网链接目标外完全一致，导出 CSS 的 SHA-256 哈希一致。后续首屏排版是明确要求的可见变化，不再适用整页 HTML/CSS 完全一致的判断。
- 验证 title、description、canonical、OG、JSON-LD 实体引用与 Logo 地址、PNG 尺寸、robots 和 sitemap；全部通过。
- 404 页面仍包含 noindex，不包含首页 canonical。
- ESLint 全量对比：修改前 42 条问题、修改后 36 条，没有新增问题。标准 `npm run build` 在修改前就因 ESLint 失败；剩余问题主要是现有组件 prop-types、语言 effect 和统计脚本规则问题，尚未修复。本次没有关闭仓库的 lint 规则。
- 首屏调整已使用 Playwright 检查 1440px 桌面和 390px 手机视口，检查标题显示、横向溢出及移动菜单开合；关键排版阶段已查看截图。未进行性能测量，未发布线上、配置旧站跳转或操作站长账户。

### 发布时需要落实

1. 发布本次生成的 `out/` 静态产物以及新增 PNG、robots、sitemap、llms 文件，更新 CDN 缓存。现有 `/app/` 是另一个在线控制台，部署不得用清空整个站点目录的方式误删它或覆盖其路由。
2. 发布后检查首页原始 HTML 中的 title、canonical 和 JSON-LD，检查新增文件均返回 200 且类型正确。Next.js 15 会把元数据中的根地址输出为不带末尾斜杠的 `https://web.ddnsto.com`，它与 `https://web.ddnsto.com/` 表示同一个根页面。
3. 在百度、360、Google、Bing 站长平台验证网站并提交 `https://web.ddnsto.com/sitemap.xml`；按账户实际权限申请百度 Logo 与品牌展现。这里没有站长凭据，不生成虚假的验证标签，也不把提交密钥放入前端。
4. 旧站保持现状，不配置跳转、不改内容或链接、不使用网站迁移工具。只对新站执行抓取诊断与品牌展示配置。
5. 复查 WAF/CDN 对真实搜索爬虫的访问情况，并跟踪 DDNSTO 品牌词的新旧站展示占比。用户报告 Google 当前第一、百度第二；本次配置不能保证保住或提升任何特定排名。
