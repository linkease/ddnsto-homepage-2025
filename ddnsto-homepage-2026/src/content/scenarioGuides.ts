export const scenarioGuides = [
  {
    id: 'apps',
    title: '远程访问家中的应用',
    summary:
      '通过 DDNSTO 域名映射，在外访问家中路由器、NAS 或局域网中的 Web 应用。',
    requirements: [
      '家中设备保持开机联网，并安装或启用 DDNSTO。',
      '先确认设备可以在局域网访问目标应用，记录 IP 地址和端口。',
    ],
    steps: [
      '在官方控制台确认设备在线，选择需要映射的服务。',
      '填写服务的局域网地址和端口，创建域名映射。',
      '从外网打开生成的链接，按提示完成访问验证，再登录应用。',
    ],
    limits:
      '域名映射不替代应用账号和权限。这里的自定义域名指 DDNSTO 提供的域名前缀，不承诺自有域名 CNAME 接入。',
    source: 'https://doc.linkease.com/zh/guide/ddnsto/question.html',
  },
  {
    id: 'tcp',
    title: '连接远处电脑的桌面',
    summary:
      '了解 DDNSTO 远程桌面的准备条件，以及浏览器访问和本地 RDP / VNC 客户端的区别。',
    requirements: [
      '被控电脑开机联网，系统支持并开启对应远程桌面服务。',
      '确认账户权限、远程桌面凭据和局域网连接可用。',
    ],
    steps: [
      '先在局域网确认 RDP 或 VNC 服务正常，再配置远程访问。',
      '按控制台提供的连接方式配置地址与端口；本地客户端使用 TCP 入口，浏览器方式按远程应用教程配置。',
      '完成访问验证并登录远程电脑；使用结束后断开会话。',
    ],
    limits:
      '浏览器远程应用与本地客户端连接方式不同。TCP 活动与套餐权益请查看首页套餐说明；本页演示不建立真实远程连接。',
    source: 'https://doc.linkease.com/zh/guide/ddnsto/remote_control.html',
  },
  {
    id: 'files',
    title: '远程取用设备上的文件',
    summary:
      '离开家也能按需访问设备文件，了解网页版文件管理的准备、使用与权限边界。',
    requirements: [
      '设备在线，文件管理功能和适用套餐已启用。',
      '确认需要访问的目录与账号权限，重要文件保留备份。',
    ],
    steps: [
      '登录控制台并选择在线设备，打开相应文件管理入口。',
      '浏览目录，找到需要预览或下载的文件。',
      '确认文件与目标目录后操作；涉及覆盖或删除时先检查备份。',
    ],
    limits:
      '网页版文件管理按设计套餐标注为公测功能。不同设备与版本的实际能力以控制台为准；首页下载仅为本地生成的演示文件。',
    source:
      'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
  },
  {
    id: 'device',
    title: '远程管理路由器与 NAS',
    summary:
      '将设备管理页面接入 DDNSTO，在外查看和处理路由器、NAS 的管理事项。',
    requirements: [
      '路由器或 NAS 已启用 DDNSTO，管理页面在局域网可访问。',
      '准备设备管理账户，保留独立的登录认证与权限。',
    ],
    steps: [
      '按设备型号与固件选择安装指南，完成令牌配置。',
      '在控制台确认设备在线，配置管理页面的域名映射。',
      '打开远程链接并完成验证，使用设备原有管理账户登录。',
    ],
    limits:
      '远程链接不等于管理员授权。修改网络、重启设备等操作可能中断当前连接，操作前确认恢复方式。',
    source: 'https://doc.linkease.com/zh/guide/ddnsto/',
  },
] as const;
