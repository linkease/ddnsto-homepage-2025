# 官网 Google Analytics 埋点

本表覆盖 `ddnsto-homepage-2026` 当前全部 7 个自定义 Google 事件，统一以 `click_` 开头。发送 ID 为 `G-1QGR1XG068`。仅 `SITE_ENV=production` 初始化并启用；开发和本地预览不发送。百度统计保持原状，不属于本表。

## 事件与用途

所有事件均带下节公共参数，表中列出额外参数。

| 事件名                           | 触发与用途                                                                                                 | 额外参数                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `click_login_console`            | 所有控制台入口的点击，衡量进入控制台意向；包括导航、Hero、安装、套餐及教程等，排除购买链接。不是登录成功。 | 无                                        |
| `click_purchase`                 | 点击套餐购买链接，衡量购买意向；不重复发送控制台点击，不代表付款成功。批量套餐联系客服不发送。             | `plan`                                    |
| `click_windows_download`         | 点击 Windows 下载链接，衡量下载意向；包括首页下载和 Windows 教程下载目录入口，不代表下载完成。             | `platform=windows`                        |
| `click_windows_scan_open`        | Windows 终端安装入口的二维码生成、解码并展示后记录。衡量进入扫码流程的人数。                               | `platform=windows`                        |
| `click_windows_install_copy`     | Windows 终端扫码获取令牌后首次点击安装命令复制，作为约定的扫码转化指标。                                   | `platform=windows`、`command_variant`     |
| `click_macos_linux_scan_open`    | macOS / Linux 终端安装入口的二维码生成、解码并展示后记录。                                                 | `platform=macos_linux`                    |
| `click_macos_linux_install_copy` | macOS / Linux 终端扫码获取令牌后首次点击安装命令复制，作为约定的扫码转化指标。                             | `platform=macos_linux`、`command_variant` |

## 参数字典

| 参数              | 类型   | 值与含义                                                                                                 |
| ----------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| `send_to`         | string | 固定 `G-1QGR1XG068`，目标 GA 属性。                                                                      |
| `source`          | string | 固定 `website`，区别于控制台和其他外部来源。                                                             |
| `language`        | string | 固定 `zh`，当前官网语言。                                                                                |
| `section`         | string | 所有事件必带；入口区域，枚举见下文。                                                                     |
| `plan`            | string | 仅购买：`free`、`standard`、`advanced` 对应项目套餐 ID，缺少有效 ID 为 `unspecified`。                   |
| `platform`        | string | 仅下载及扫码事件：`windows` 或 `macos_linux`。                                                           |
| `command_variant` | string | 仅安装复制：`primary` 主命令、`wget` 备用 wget 命令、`download` 下载脚本命令；记录该轮第一次点击的版本。 |

`section`：`navbar_desktop` 桌面导航、`navbar_mobile` 手机导航、`hero` 首屏、`installation` 安装区、`pricing` 套餐区、`support` 客服区、`device_guide` 设备教程页正文、`guide` 通用教程正文、`footer` 页脚、`other` 其他入口。导航和页脚优先于所在页面分类。四个扫码事件固定为 `installation`。

## 统计边界与去重

- 控制台链接匹配 `web.ddnsto.com` / `www.ddnsto.com` 的 `/app` 路径。购买匹配 `#/plans` 且 hash 查询参数 `entry=purchase`；仅记购买。官网首页链接不算进入控制台。“新功能 TCP 上线”和“高级套餐专享 · 查看套餐”均为套餐定位入口，不发送自定义点击事件。
- Windows 下载匹配 `fw.koolcenter.com/binary/ddnsto/windows/` 或 `/binary/ddnsto/pc/`。链接主键点击（含键盘激活）及鼠标中键每次各记一次；不额外监听同一按钮重复计数。
- 扫码只覆盖 `terminal-windows` 和 `terminal-unix` 两个终端入口，其他设备脚本扫码不混入这两个漏斗。
- 每轮扫码最多尝试发送一次打开、一次复制。同轮二维码重试/刷新不重新计数；取消、清空令牌、切换平台或安装方式、页面刷新、重新开始会重置。去重仅在内存中，不是跨页面或账号去重。
- 二维码请求或绘制失败不算打开；认证接口成功本身不算复制转化。复制必须已获取令牌，但按点击计数，即使剪贴板拒绝、随后使用手动复制也计一次。连续复制、改用另一备用命令不重复计数；AI 提示词复制不计入。
- 安装复制是用户约定的“扫码成功”代理指标，不代表真实安装、设备上线或剪贴板写入成功。比较两个平台时应同时看打开人数、复制人数与转化率。
- 不设置账号 `user_id`，人数沿用 GA 浏览器身份统计，不能保证跨设备唯一自然人数。事件次数和人数应分别分析。
- 自定义参数不上传令牌、二维码原文、认证 proof、会话 ID、安装命令、完整跳转 URL 或原始错误。

## 无感与业务隔离

`src/lib/analytics.ts` 统一异常隔离；通过零延时任务调用 SDK，业务不等待、不依赖返回值、不使用事件回调控制跳转。SDK 缺失、同步抛错和异步拒绝均静默处理，不弹提示、不修改业务状态、不重试或补报。采集失败允许漏报，不能阻断跳转、下载、扫码和复制。页面关闭或网络拦截也可能导致漏报。

生产初始化仍由 `SiteLayout.astro` 与 `public/script` 中原 Google 脚本完成。`gtag('config', ...)` 的默认页面浏览不属于上述自定义点击事件；GA 后台增强型衡量的额外事件取决于后台配置，本次未修改或核验后台配置。

已停止发送旧 `click_free_use`、`ddnsto_outbound_click`。GA 中历史数据保留，新旧事件不能直接当成相同口径拼接。

## 实现与验证入口

- `src/lib/analytics.ts`：事件类型、参数、链接分类、发送隔离。
- `src/layouts/SiteLayout.astro`：所有页面统一安装监听器。
- `src/features/pricing/Pricing.astro`：购买套餐 ID。
- `src/features/installation/controller.ts`：二维码展示、首次复制及轮次去重。
- `tests/e2e/analytics.spec.ts`：环境开关、初始化、控制台导航及 SDK 故障。
- `tests/e2e/analytics-flows.spec.ts`：链接分类、平台漏斗、重试去重、二维码失败、剪贴板失败及 SDK 故障下真实业务动作。

自动化使用测试令牌及拦截的 Google 脚本，不发送真实统计。真实 GA 入库、后台维度注册及报表需上线后核验；分析自定义参数时按需在 GA 后台注册事件级自定义维度。测试结果记录于 [PROGRESS.md](PROGRESS.md)。
