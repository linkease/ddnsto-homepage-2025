// User-approved original prototype translations.zh.faq; checked 2026-11-26.
export const faqHighlights = [
  {
    title: '产品与原理',
    items: [
      {
        question: 'DDNSTO 是什么，解决了什么问题？',
        answer:
          'DDNSTO 是一个无需公网 IP 的远程访问工具。它允许您从任何地方访问您的家庭 NAS、路由器仪表板、Home Assistant 和自托管服务。',
      },
      {
        question: '它与端口转发 / DMZ / VPN 有什么不同？',
        answer:
          '无需公网 IP，无需开放端口（更安全），配置简单，无需更改家庭网络结构，无需折腾动态 DNS 或反向代理。',
      },
      {
        question: '访问速度快吗？',
        answer:
          '在典型的家庭宽带环境中，速度取决于您的上传带宽。DDNSTO 不限制流量，但套餐有带宽上限（4 Mbps 或 8 Mbps）。',
      },
    ],
  },
  {
    title: '套餐与计费',
    items: [
      {
        question: '计费是按账户还是按设备？',
        answer:
          '计费是按**设备**进行的。每个设备需要单独绑定一个套餐。如果您解绑设备，套餐保留在您的账户中，可以绑定到新设备。',
      },
      {
        question: '我为客户设置了设备，如果他们停止使用怎么办？',
        answer:
          '您可以随时在控制台解绑设备。套餐归您所有，可用于下一个客户设备。非常适合 IT 工程师。',
      },
    ],
  },
  {
    title: '隐私与安全',
    items: [
      {
        question: '我可以通过手机访问吗？',
        answer:
          '是的，所有访问都可通过 HTTPS 域名进行，因此它适用于任何带有浏览器的设备，包括手机。如果你的第三方 APP 支持 指定http 服务器地址 也可以通过域名访问。',
      },
      {
        question: 'DDNSTO 会读取我的数据吗？',
        answer:
          '不会。您的页面数据在您的浏览器中渲染。DDNSTO 不存储您的 NAS/路由器内容。整个链接通过加密隧道保护。',
      },
    ],
  },
];
