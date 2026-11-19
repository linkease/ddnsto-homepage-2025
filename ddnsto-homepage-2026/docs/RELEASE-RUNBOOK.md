# 静态官网发布与回滚准备

目标域名：https://web.ddnsto.com/。本文不构成上线授权；当前没有执行远端写入或切换。

## 发布前必须补齐的环境信息

宿主类型、当前站点根目录/发布方式、CDN 与 WAF 配置、现有 /app/ 控制台路由、旧 URL 清单和运维回滚入口尚未提供。不得根据本地路径猜测生产目录或替换整份服务器配置。

确认新站不会覆盖 /app/ 及其静态资源/接口；同域控制台应保留当前路由和缓存策略。官网只交付本项目静态产物。真实 iOS/Android/微信等验证条件、残留依赖风险及视觉差异应在发布前明确处理。

## 生成可审阅产物

1. 在独立项目根目录使用规定 Node 版本，npm ci。
2. npm run validate；npx playwright test --config playwright.m7.config.ts。
3. SEO_TEST_ORIGIN=https://web.ddnsto.com node scripts/check-seo-production.mjs。
4. node scripts/package-release.mjs。脚本在临时目录生产构建，生成 artifacts/releases 下 tar.gz 与 manifest.json，记录 lockfile 和每个文件的 SHA-256；不改变预览 dist，不上传、不部署。可用 RELEASE_OUTPUT 指定输出目录。
5. 检查 manifest 域名、文件数和哈希，解压到新的隔离 release 目录验证；不要解压覆盖当前线上目录。产物不包含源码、node_modules、.env、参考副本、SSR 服务或 /app/ 路由。

## 宿主规则（确认现状后适配）

- HTTPS 和证书覆盖 web.ddnsto.com；其他域名是否重定向须先核对现有业务，不擅自移动 www 或控制台。
- /app/、接口和已有独立服务优先匹配并维持原配置；官网匹配文件或路径/index.html，未知地址返回 404 状态与 404.html，不做 SPA 全路径回退。
- /index.html 可单跳 301 到 /；其他旧地址按确认的清单逐条迁移，不能全跳首页。保留现有首页锚点。
- HTML、robots.txt、sitemap*.xml 采用短缓存或 revalidate；带内容哈希的 /_astro/ 可长期 immutable。public/images 下未哈希文件采用短缓存，发布时刷新这些资源与 HTML。
- 启用文本 gzip/Brotli；M7 本地实验室数据没有假设 CDN 缓存或压缩。配置正确 MIME，避免以 HTML 返回 JS/CSS。
- 生产页面允许搜索抓取，预览应单独配置访问控制及 noindex；不要把生产 robots 和预览文件混用。
- 不在没有验证的情况下加通用 CSP/COOP 等可能影响外部控制台或微信登录的响应头。各子系统策略分别核对。

## 切换与上线检查（需要后续明确上线指令）

保存当前 release 标识、配置、缓存规则与旧 URL 响应样本。新 release 验证后使用宿主支持的原子目录/版本切换；CDN 更新 HTML 及非哈希资源。立即检查：

- 首页、四个场景、各设备指南 HTTP 200；未知路径 404；重定向无环且不跳控制台。
- canonical、分享图片、JSON-LD、robots 与 sitemap 同域；404 不索引。
- 从首页走场景 → 设备指南 → 官方控制台；套餐/FAQ/客服正常，/app/ 登录页及其资源正常。
- 无错误 MIME、断图、控制台异常、缓存混用；从外网与真实手机分别检查。
- 按需提交搜索控制台 sitemap；不承诺立即收录或排名。

## 回滚

切换前记录可恢复的前一 release 与配置。若出现关键流程阻断、/app/ 受影响、持续 5xx、错误索引策略或关键资源失败，恢复上一 release 和原路由配置，刷新 HTML/robots/sitemap/非哈希资源缓存，再重复上述检查。不要删除失败产物及其 manifest；保留日志定位。只有静态内容切换，不涉及数据库迁移。

## 上线后性能观察

在统计接入获确认后再接入真实用户监测，不预装未经确认的第三方脚本。按移动/桌面及页面类型记录 LCP、CLS、INP 第 75 百分位，观察至少完整流量周期；目标 LCP≤2.5s、CLS≤0.1、INP≤200ms。实验室长任务时长不是 INP；本地加载快不能证明用户网络性能。监测仅需指标和路由类别，避免收集令牌、查询参数或用户输入。
