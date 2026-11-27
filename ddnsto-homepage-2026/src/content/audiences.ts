/** Chinese content from the user-approved original-preview Scenarios.jsx. */
export const audiences = [
  {
    id: 'nas',
    label: 'NAS 用户',
    title: '随处访问您的私有云',
    description:
      '无论是 Synology DSM、QNAP QTS 还是 Unraid，无需暴露在公网即可安全访问您的文件服务器。',
    tags: ['Photo Backup', 'File Management', 'Media Streaming'],
    mode: 'NAS 用户模式',
    window: 'File Station',
    colors: 'oklch(0.623 0.214 259.815), oklch(0.715 0.143 215.221)',
    icon: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path>',
  },
  {
    id: 'it',
    label: 'IT 工程师',
    title: '远程维护变得简单',
    description:
      '管理服务器、SSH 进入远程机器，无需复杂的 VPN 设置即可访问内部仪表板。',
    tags: ['SSH Access', 'RDP/VNC', 'Internal Web Apps'],
    mode: 'IT 工程师模式',
    window: 'root@server:~',
    colors: 'oklch(0.627 0.265 303.9), oklch(0.656 0.241 354.308)',
    icon: '<path d="M12 19h8"></path><path d="m4 17 6-6-6-6"></path>',
  },
  {
    id: 'home',
    label: '智能家居',
    title: '远程控制您的家',
    description:
      '从家庭网络外部安全访问 Home Assistant、Node-RED 或您的路由器管理面板。',
    tags: ['Home Assistant', 'Router Admin', 'IoT Dashboard'],
    mode: '智能家居模式',
    window: 'Home Assistant',
    colors: 'oklch(0.723 0.219 149.579), oklch(0.696 0.17 162.48)',
    icon: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
  },
  {
    id: 'ai',
    label: 'AI 工具使用者',
    title: '你的 AI 工具，出门也能用',
    description:
      '把家中电脑或 NAS 上的 AI 网页工具添加为访问链接，出门也能用浏览器打开。安装 DDNSTO 时，还可让具备终端能力的 Agent 帮你完成。',
    tags: ['自建 AI 网页', '远程工作台', 'Agent 辅助安装'],
    mode: '',
    window: 'AI Workspace · DDNSTO',
    colors: 'oklch(0.715 0.143 215.221), oklch(0.623 0.214 259.815)',
    icon: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle>',
  },
] as const;
