# 官网安装入口移除验证

官网已完全移除“安装客户端”和“安装调试”入口、页面、跳转提示、命令生成器及专属文案。开发与正式环境保持同样的官网逻辑：平台卡片展示原有教程，保留教程链接及控制台入口 /app/#/devices。原 /install 和 /install/debug 均返回 404。

一键安装与调试能力只在控制台维护，参见 servers/ddns-fe/console-2026/docs/installer-test-flow.md。官网不再引入安装器测试地址，也不再识别 debug.jsx 路由。

在 servers/ddnsto-homepage-2025 运行：

```sh
npm test
npm run build
# 构建结束后再启动开发服务，避免同时写入 .next
npm run dev -- --hostname 127.0.0.1 --port 4189
# 另一个终端；需要已有 agent-browser
npm run test:browser
```

构建后自动执行产物检查，确认原教程、控制台链接存在，安装路由、入口及测试地址不出现在产物中。浏览器检查首页三种宽度，并确认两个旧地址返回 404。没有实际执行安装命令或修改控制台功能。删除内容可从 Git 历史恢复。
