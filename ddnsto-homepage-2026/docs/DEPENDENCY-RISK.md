# M7 依赖风险核查

日期：2026-11-18。原审计 16 项（15 high、1 low），更新兼容的 esbuild 补丁到 0.28.2 后剩余 **15 high**。未使用 npm audit fix --force，未降级 Astro 或 React。package-lock.json 已更新，npm run validate 和 Chromium 回归通过；后续跨浏览器结果见 M7 报告。

## 已修复

esbuild >=0.27.3、<0.28.1 的 Windows 开发服务器路径读取问题，补丁为 0.28.1。本项目更新为 0.28.2。当前环境为 Linux，且交付静态文件，但仍完成可兼容修复。[官方项目安全公告记录](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr)。

## 保留的风险

picomatch <=4.0.7 的重复 extglob 可触发正则拒绝服务；查询注册表最新仍为 4.0.7，公告未给出修复版本。[安全公告](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)。npm 记录的 15 个 high 节点包含 picomatch 及其受影响的构建/开发工具依赖链，不代表发现了 15 个不同漏洞。

本项目的构建配置和 glob 来自受控源码；正式产物是静态 HTML/CSS/JS/图片，不带 node_modules 或 Node 服务。因而当前静态交付中没有将 npm 依赖树作为服务端运行时暴露给访客。这不等于漏洞已修复：构建机/开发服务器处理不可信源码、插件、模式或任务时仍有风险。

约束：开发服务器只绑定回环地址；不要暴露开发/构建 API；CI 不向不可信贡献提供发布凭据，不执行来源不明的构建配置或 glob。上线前重新执行 npm audit 并检查补丁；有兼容修复后更新锁文件并运行类型、构建、静态与浏览器回归。

原始审计摘要和各节点路径见 milestones/m7/dependency-audit.json。不能把静态部署风险较低写成“全部依赖安全”；发布决策需要明确接受当前构建环境风险或等候上游修复。
