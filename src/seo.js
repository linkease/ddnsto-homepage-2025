export const site = {
  name: 'DDNSTO 远程控制',
  alternateName: 'DDNSTO',
  url: 'https://web.ddnsto.com/',
  description:
    'DDNSTO 是一款内网穿透与远程访问工具，无需公网 IP 或端口转发，即可通过浏览器访问家中的 NAS、路由器和内网服务，支持远程桌面、命令行终端和文件管理。',
  logo: 'https://web.ddnsto.com/logo.png',
};

// These entities describe the existing page, without adding hidden page copy.
// Keep the product brand separate from the company that operates it.
export const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}#organization`,
      name: '深圳市易有云网络科技有限责任公司',
      url: 'https://www.linkease.com/',
      brand: { '@id': `${site.url}#brand` },
    },
    {
      '@type': 'Brand',
      '@id': `${site.url}#brand`,
      name: site.name,
      alternateName: site.alternateName,
      url: site.url,
      logo: site.logo,
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}#website`,
      name: site.name,
      alternateName: site.alternateName,
      url: site.url,
      description: site.description,
      inLanguage: 'zh-CN',
      publisher: { '@id': `${site.url}#organization` },
      about: { '@id': `${site.url}#brand` },
      image: site.logo,
    },
    {
      '@type': 'WebPage',
      '@id': `${site.url}#webpage`,
      name: site.name,
      url: site.url,
      description: site.description,
      inLanguage: 'zh-CN',
      isPartOf: { '@id': `${site.url}#website` },
      about: { '@id': `${site.url}#brand` },
    },
  ],
};
