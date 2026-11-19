# 搜索与发布约定

M6 实现静态正文、站内内容入口及基础搜索元信息；不执行上线。

用户于 2026-11-18 确认正式主域名为 **https://web.ddnsto.com/**。`.env.example` 已记录 SITE_URL=https://web.ddnsto.com，SITE_ENV 保持 preview。使用此域名的隔离生产构建验证已通过；现有 /app/ 控制台必须保留。

## 路由与内容

首页 /，四个场景 /scenarios/{apps,tcp,files,device}/，18 个设备 /devices/{platform.id}/。设备页面直接复用 installation.ts，避免维护两份安装事实。公开路由清单是 src/config/publishing.mjs；新页面须有真实内容、唯一标题描述及站内入口才能加入。

场景页明确能力与使用边界；首页保留套餐与完整 FAQ。结构化数据只使用页面可见的 WebPage、WebSite 和内容页面包屑，不编造评分、销量、价格有效期或富结果资格。首页新增功能图示是静态示意，不执行设备命令。

## 构建与验证

默认 npm run build 为预览，全部 HTML noindex,nofollow，robots 禁止抓取，无 canonical/sitemap/带正式域名的结构化数据。分享图为本地 1200×630 PNG。

生产构建须同时设置 SITE_ENV=production、经确认的 HTTPS SITE_URL（仅主域名，无路径/查询/凭据），然后执行 npm run build。未确认域名时只允许用保留示例域名进行隔离模拟，不视为生产 SEO 验收。

node scripts/check-seo-production.mjs 在临时目录测试生产路由、canonical、结构化数据、sitemap、robots、404 排除及非法域名拒绝，结束后清理临时产物。默认使用 seo-validation.example.com，不写入正式配置；确认主域名后可通过 SEO_TEST_ORIGIN 指定验收域名。

## 旧 URL 迁移方案（待旧 URL 清单与宿主确认）

- 首页 / 保持路径，#features/#scenarios/#devices/#pricing/#faq 和四个场景锚点保持；片段不发送给服务器，不配置服务端片段重定向。
- 已有控制台 /app/、官方文档域名维持原服务，不能由新站的通用重定向或静态文件匹配接管。
- /index.html → / 可配置一次 301；不把所有未知 URL 重定向首页。每个确需迁移的旧内容 URL 必须提供清单，逐个对应语义相同的新页，无法对应者返回真实 404。
- 根域名与 www 的首选跳转，须在主域名确认且核对现有服务后由宿主配置，避免重定向循环。
- 静态宿主应按文件 / 路径/index.html 查找，缺失返回 404 状态并显示 dist/404.html；不能使用 SPA 的 index.html 全路径回退。Astro 本地 404 测试不等于 CDN/生产宿主验证。
- 发布后检查 HTTP 状态、canonical、robots、sitemap、资源缓存与旧地址 301；再提交搜索控制台。预览若暴露公网，需额外访问控制：robots 禁抓取不等于隐藏 URL。

## 搜索与 AI 抓取边界

生产 robots 使用通用 User-agent: * Allow: /，不额外阻断正常搜索抓取。页面正文和真实链接不要求执行 JS。CDN/WAF 是否允许目标爬虫需要宿主验证；不伪造爬虫内容、不保证收录、排名或 AI 引用。

技术依据（2026-11-18 阅读）：[Google robots 指南](https://developers.google.com/search/docs/crawling-indexing/robots/intro)、[结构化数据说明](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)。结构化数据须与可见内容一致；robots.txt 不能代替访问控制或 noindex。

正式域名复核命令：`SEO_TEST_ORIGIN=https://web.ddnsto.com node scripts/check-seo-production.mjs`。该命令仅生成并检查临时产物，不请求 DNS 变更、不部署。
