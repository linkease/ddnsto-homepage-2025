const tcpMonthlyQuota = '20G';
export const commerce = {
  verifiedAt: '2026-11-18',
  source: 'reference/design/v2/index.html; owner confirmation 2026-11-18',
  terms: 'https://doc.linkease.com/zh/guide/ddnsto/pay.html',
  purchase:
    'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/plans?entry=purchase',
  // Owner confirmed on 2026-11-18: design code is authoritative for commercial display.
  reviewStatus: 'owner-confirmed-design',
  tcpOffer: {
    enabled: true,
    text: `TCP，限时免费${tcpMonthlyQuota}/月/台`,
    headline: `每台设备每月 ${tcpMonthlyQuota} TCP 流量！`,
    validUntil: '',
    source: 'https://web.ddnsto.com/app/#/plans?entry=purchase',
  },
  plans: [
    {
      id: 'free',
      title: '免费套餐',
      description: '无需付费即可体验DDNSTO',
      price: '￥0/周',
      action: '购买',
      benefits: ['添加设备即赠送', '5个自定义域名', 'SSH远程应用'],
    },
    {
      id: 'standard',
      title: '4Mbps套餐',
      description: '最适合普通用户',
      price: '￥2.00/月起',
      action: '购买',
      benefits: [
        '4Mbps峰值带宽',
        '12个自定义域名',
        'SSH/RDP/VNC等远程应用',
        '网页版文件管理（公测中）',
      ],
    },
    {
      id: 'advanced',
      title: '8Mbps套餐',
      description: '适合对带宽要求更高的用户',
      price: '￥6.50/月起',
      action: '购买',
      benefits: [
        '8Mbps峰值带宽',
        '20个自定义域名',
        'SSH/RDP/VNC等远程应用',
        '网页版文件管理（公测中）',
      ],
    },
    {
      id: 'bulk',
      title: '批量购买',
      description: '适合管理大批量设备的用户',
      price: '更低折扣',
      action: '购买',
      benefits: [],
    },
  ],
};
export const support = {
  verifiedAt: '2026-11-18',
  source: 'https://web.ddnsto.com/',
  hours: '工作日 13:30–18:00',
  qr: '/images/support/wechat-qr.png',
  docs: 'https://doc.linkease.com/zh/guide/ddnsto/',
  faq: 'https://doc.linkease.com/zh/guide/ddnsto/question.html',
  ai: 'https://ai.koolcenter.com/',
  company: '深圳市易有云网络科技有限责任公司',
  address: '深圳市南山区高新南环路29号留学生创业大厦一期 2001',
  phone: '13316474667',
  email: 'admin@linkease.com',
};
