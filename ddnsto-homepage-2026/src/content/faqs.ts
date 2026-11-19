import { commerce } from './commerce';
export interface Faq {
  id: string;
  group: string;
  question: string;
  answer: string;
  answerHtml: string;
  source: string;
  sourceLabel?: string;
  verifiedAt: string;
}
export const faqs: Faq[] = [
  {
    id: 'faq-1',
    group: '开始前想知道',
    question: '从哪里开始？需要安装在手机上吗？',
    answer:
      'DDNSTO 客户端安装在 NAS、路由器或电脑等被访问设备上；先按对应设备教程安装，再配置远程访问。',
    answerHtml:
      '<p>DDNSTO 客户端安装在 NAS、路由器或电脑等被访问设备上；先按对应设备教程安装，再配置远程访问。</p>',
    source: '#devices',
    sourceLabel: '查看相关说明',
    verifiedAt: '2026-11-18',
  },
  {
    id: 'faq-2',
    group: '开始前想知道',
    question: '快捷扫码和手动令牌配置，应该选哪种？',
    answer:
      '按你的设备和固件教程操作。具有扫码入口的平台可按提示配置；其余平台从控制台获取令牌后填入设备。',
    answerHtml:
      '<p>按你的设备和固件教程操作。具有扫码入口的平台可按提示配置；其余平台从控制台获取令牌后填入设备。</p>',
    source: '#devices',
    sourceLabel: '查看相关说明',
    verifiedAt: '2026-11-18',
  },
  {
    id: 'faq-3',
    group: '开始前想知道',
    question: '免费体验和 TCP 高级套餐有什么区别？',
    answer: `免费套餐用于体验基础远程访问。高级套餐提供 ${commerce.tcpOffer.text}。套餐与设备一一绑定，不能多台共用一份套餐。`,
    answerHtml: `<p>免费套餐用于体验基础远程访问。高级套餐提供 ${commerce.tcpOffer.text}。套餐与设备一一绑定，不能多台共用一份套餐。</p>`,
    source: '#pricing',
    sourceLabel: '查看相关说明',
    verifiedAt: '2026-11-18',
  },
  {
    id: 'faq-4',
    group: '开始前想知道',
    question: '没有公网 IP，也能使用吗？',
    answer:
      '可以。设备需要联网、正确运行 DDNSTO，并能连接你希望访问的内网服务。',
    answerHtml:
      '<p>可以。设备需要联网、正确运行 DDNSTO，并能连接你希望访问的内网服务。</p>',
    source: '#devices',
    sourceLabel: '查看相关说明',
    verifiedAt: '2026-11-18',
  },
  {
    id: 'faq-5',
    group: '开始前想知道',
    question: '网页远程桌面和本地客户端有什么区别？',
    answer:
      '网页远程桌面在浏览器中操作；本地 RDP / VNC 客户端需配置相应连接地址。被控电脑必须开机联网并开启远程桌面服务。',
    answerHtml:
      '<p>网页远程桌面在浏览器中操作；本地 RDP / VNC 客户端需配置相应连接地址。被控电脑必须开机联网并开启远程桌面服务。</p>',
    source: 'https://doc.linkease.com/zh/guide/ddnsto/remote_control.html',
    sourceLabel: '查看相关说明',
    verifiedAt: '2026-11-18',
  },
  {
    id: 'faq-6',
    group: '开始前想知道',
    question: '添加域名后，别人就能直接操作我的应用吗？',
    answer:
      '远程访问验证与应用自身登录是不同环节。请按官方教程完成访问验证，并保留应用的登录与权限设置。',
    answerHtml:
      '<p>远程访问验证与应用自身登录是不同环节。请按官方教程完成访问验证，并保留应用的登录与权限设置。</p>',
    source: 'https://doc.linkease.com/zh/guide/ddnsto/Authentication.html',
    sourceLabel: '查看相关说明',
    verifiedAt: '2026-11-18',
  },
  {
    group: '故障排查',
    question: '控制台显示设备离线',
    answerHtml:
      '<p>如果控制台显示设备状态为离线，有以下可能几种原因：</p><h3> A. 刚刚操作了切换服务器、编辑域名、更换套餐等操作，需要等待1分钟插件重新初始化，如果5分钟后仍未在线，请参照第三条</h3><h3> B. 服务器升级中，这种情况比较少，可以查看公告看最近的服务器升级安排，看当前是否处在服务器维护时段。</h3><h3> C. 插件异常</h3><p>请先检查以下情况</p><ol><li>检查插件是否正常运行\n<ul><li>令牌是否填写正确</li> <li>如已离线，请重新运行。</li> <li>如插件版本过低，请升级至最新版本插件。</li></ul></li> <li>确认设备能正常访问网络，尝试ping ddnsto.com 或kooldns.cn</li> <li>确认是否令牌对应的微信账号登录当前浏览器，或控制台内是否有其他新设备产生</li></ol>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#%E6%8E%A7%E5%88%B6%E5%8F%B0%E6%98%BE%E7%A4%BA%E8%AE%BE%E5%A4%87%E7%A6%BB%E7%BA%BF',
    answer:
      '如果控制台显示设备状态为离线，有以下可能几种原因：\n\nA. 刚刚操作了切换服务器、编辑域名、更换套餐等操作，需要等待1分钟插件重新初始化，如果5分钟后仍未在线，请参照第三条\nB. 服务器升级中，这种情况比较少，可以查看公告看最近的服务器升级安排，看当前是否处在服务器维护时段。\nC. 插件异常\n\n请先检查以下情况\n\n检查插件是否正常运行\n令牌是否填写正确\n如已离线，请重新运行。\n如插件版本过低，请升级至最新版本插件。\n确认设备能正常访问网络，尝试ping ddnsto.com 或kooldns.cn\n确认是否令牌对应的微信账号登录当前浏览器，或控制台内是否有其他新设备产生',
    id: 'faq-7',
    verifiedAt: '2026-11-18',
  },
  {
    group: '故障排查',
    question: '访问域名失败',
    answerHtml:
      '<p>请先检查以下情况</p><ol><li>确认插件是否在线</li> <li>确认插件所在设备与目标IP是否在同一网段，或该设备能否访问对应IP及端口，可以尝试ping目标IP</li> <li>确认目标地址的端口是否正确，是否填写https（如果你不确定是否要加端口或使用https，请不要添加）</li> <li>尝试访问该设备下其他域名</li> <li>如刚编辑域名，请等待生效，在1分钟后尝试</li></ol>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#%E8%AE%BF%E9%97%AE%E5%9F%9F%E5%90%8D%E5%A4%B1%E8%B4%A5',
    answer:
      '请先检查以下情况\n\n确认插件是否在线\n确认插件所在设备与目标IP是否在同一网段，或该设备能否访问对应IP及端口，可以尝试ping目标IP\n确认目标地址的端口是否正确，是否填写https（如果你不确定是否要加端口或使用https，请不要添加）\n尝试访问该设备下其他域名\n如刚编辑域名，请等待生效，在1分钟后尝试',
    id: 'faq-8',
    verifiedAt: '2026-11-18',
  },
  {
    group: '故障排查',
    question: '远程Windows桌面失败',
    answerHtml:
      '<p>先确认被控电脑支持并已开启 RDP，未进入休眠，且在局域网内能正常连接。然后检查 DDNSTO 控制台中的目标 IP、用户名和密码；具体系统配置见官方教程。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#%E8%BF%9C%E7%A8%8Bwindows%E6%A1%8C%E9%9D%A2%E5%A4%B1%E8%B4%A5',
    answer:
      '先确认被控电脑支持并已开启 RDP，未进入休眠，且在局域网内能正常连接。然后检查 DDNSTO 控制台中的目标 IP、用户名和密码；具体系统配置见官方教程。',
    id: 'faq-9',
    verifiedAt: '2026-11-18',
  },
  {
    group: '故障排查',
    question: '访问OpenWRT页面异常',
    answerHtml:
      '<p>部分使用nginx的固件通过ddnsto访问时界面可能出现菜单不显示等问题</p><p>解决方法：</p><ol><li>请使用https访问，注意端口是否被错误重定向成5000等其他端口</li> <li>请手动加上路径 <strong>/cgi-bin/luci/admin/status/overview</strong> 进行访问， 如</li></ol><div><pre><code>https://custom.ddnsto.com/cgi-bin/luci/admin/status/overview\n</code></pre></div>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#%E8%AE%BF%E9%97%AEopenwrt%E9%A1%B5%E9%9D%A2%E5%BC%82%E5%B8%B8',
    answer:
      '部分使用nginx的固件通过ddnsto访问时界面可能出现菜单不显示等问题\n\n解决方法：\n\n请使用https访问，注意端口是否被错误重定向成5000等其他端口\n请手动加上路径 /cgi-bin/luci/admin/status/overview 进行访问， 如\nhttps://custom.ddnsto.com/cgi-bin/luci/admin/status/overview\n',
    id: 'faq-10',
    verifiedAt: '2026-11-18',
  },
  {
    group: '域名类',
    question: 'ddnsto可以用自己的域名吗？',
    answerHtml: '<p>A：不可以，不支持 cname，ddnsto会提供域名。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-ddnsto%E5%8F%AF%E4%BB%A5%E7%94%A8%E8%87%AA%E5%B7%B1%E7%9A%84%E5%9F%9F%E5%90%8D%E5%90%97',
    answer: 'A：不可以，不支持 cname，ddnsto会提供域名。',
    id: 'faq-11',
    verifiedAt: '2026-11-18',
  },
  {
    group: '域名类',
    question: '域名http和https能同时访问吗？',
    answerHtml:
      '<p>A：可以，如果要同时访问，https和http地址端口不一样，可点击"显示http/https"切换查看。</p><p><img src="/images/faq/answer-6-1.jpg" alt="question" loading="lazy"><br> <img src="/images/faq/answer-6-2.jpg" alt="question" loading="lazy"></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%9F%9F%E5%90%8Dhttp%E5%92%8Chttps%E8%83%BD%E5%90%8C%E6%97%B6%E8%AE%BF%E9%97%AE%E5%90%97',
    answer:
      'A：可以，如果要同时访问，https和http地址端口不一样，可点击"显示http/https"切换查看。\n\n\n',
    id: 'faq-12',
    verifiedAt: '2026-11-18',
  },
  {
    group: '域名类',
    question: '特殊设备访问需要填写端口？',
    answerHtml:
      '<p>A：是的，比如PVE虚拟机，默认端口是8006，就必须加上端口。</p><p><img src="/images/faq/answer-7-1.jpg" alt="question" loading="lazy"></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E7%89%B9%E6%AE%8A%E8%AE%BE%E5%A4%87%E8%AE%BF%E9%97%AE%E9%9C%80%E8%A6%81%E5%A1%AB%E5%86%99%E7%AB%AF%E5%8F%A3',
    answer: 'A：是的，比如PVE虚拟机，默认端口是8006，就必须加上端口。',
    id: 'faq-13',
    verifiedAt: '2026-11-18',
  },
  {
    group: '域名类',
    question: '域名绑定后无法访问内网服务，显示错误？',
    answerHtml:
      '<p>A: 配置域名、切换套餐后需要等待1分钟左右，如长时间后仍然无法访问，请检查内网服务是否正常运行。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%9F%9F%E5%90%8D%E7%BB%91%E5%AE%9A%E5%90%8E%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AE%E5%86%85%E7%BD%91%E6%9C%8D%E5%8A%A1-%E6%98%BE%E7%A4%BA%E9%94%99%E8%AF%AF',
    answer:
      'A: 配置域名、切换套餐后需要等待1分钟左右，如长时间后仍然无法访问，请检查内网服务是否正常运行。',
    id: 'faq-14',
    verifiedAt: '2026-11-18',
  },
  {
    group: '域名类',
    question:
      '显示Forbidden Rejected request from RFC1918 IP to public server address？',
    answerHtml:
      '<p>A: 部分用户目标地址使用127.0.0.1时会遇到此问题，请使用局域网IP，如192.168开头的http://192.168.100.1 。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E6%98%BE%E7%A4%BAforbidden-rejected-request-from-rfc1918-ip-to-public-server-address',
    answer:
      'A: 部分用户目标地址使用127.0.0.1时会遇到此问题，请使用局域网IP，如192.168开头的http://192.168.100.1 。',
    id: 'faq-15',
    verifiedAt: '2026-11-18',
  },
  {
    group: '验证类',
    question:
      '易有云APP验证后，每个手机在登陆的时候都要验证还是， 有一个手机验证就可以了？',
    answerHtml:
      '<p>A: 只要访问域名的设备的公网ip未验证就需要验证。举例：如果验证了家里宽带的ip，那么家里wifi下所有设备都不需要验证。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E6%98%93%E6%9C%89%E4%BA%91app%E9%AA%8C%E8%AF%81%E5%90%8E-%E6%AF%8F%E4%B8%AA%E6%89%8B%E6%9C%BA%E5%9C%A8%E7%99%BB%E9%99%86%E7%9A%84%E6%97%B6%E5%80%99%E9%83%BD%E8%A6%81%E9%AA%8C%E8%AF%81%E8%BF%98%E6%98%AF-%E6%9C%89%E4%B8%80%E4%B8%AA%E6%89%8B%E6%9C%BA%E9%AA%8C%E8%AF%81%E5%B0%B1%E5%8F%AF%E4%BB%A5%E4%BA%86',
    answer:
      'A: 只要访问域名的设备的公网ip未验证就需要验证。举例：如果验证了家里宽带的ip，那么家里wifi下所有设备都不需要验证。',
    id: 'faq-16',
    verifiedAt: '2026-11-18',
  },
  {
    group: '验证类',
    question: '为何我连着wifi可以用DDNSTO访问群晖，用流量却不可以',
    answerHtml:
      '<p>A: 因为你的手机在试用wifi的时候和流量时，用的ip不一样。用流量时，再验证一次IP即可。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E4%B8%BA%E4%BD%95%E6%88%91%E8%BF%9E%E7%9D%80wifi%E5%8F%AF%E4%BB%A5%E7%94%A8ddnsto%E8%AE%BF%E9%97%AE%E7%BE%A4%E6%99%96-%E7%94%A8%E6%B5%81%E9%87%8F%E5%8D%B4%E4%B8%8D%E5%8F%AF%E4%BB%A5',
    answer:
      'A: 因为你的手机在试用wifi的时候和流量时，用的ip不一样。用流量时，再验证一次IP即可。',
    id: 'faq-17',
    verifiedAt: '2026-11-18',
  },
  {
    group: '验证类',
    question: 'APP验证了，为什么还要扫码登录',
    answerHtml: '<p>A: 验证IP只是给访问域名用的，登录控制台还是需要扫码</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-app%E9%AA%8C%E8%AF%81%E4%BA%86-%E4%B8%BA%E4%BB%80%E4%B9%88%E8%BF%98%E8%A6%81%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95',
    answer: 'A: 验证IP只是给访问域名用的，登录控制台还是需要扫码',
    id: 'faq-18',
    verifiedAt: '2026-11-18',
  },
  {
    group: '验证类',
    question: '为什么我把链接分享给朋友，他打不开',
    answerHtml:
      '<p>A: 目前DDNSTO的用户自定义域名不鼓励作为分享，如果你的朋友要访问，需要你的微信来帮他扫码验证。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E6%8A%8A%E9%93%BE%E6%8E%A5%E5%88%86%E4%BA%AB%E7%BB%99%E6%9C%8B%E5%8F%8B-%E4%BB%96%E6%89%93%E4%B8%8D%E5%BC%80',
    answer:
      'A: 目前DDNSTO的用户自定义域名不鼓励作为分享，如果你的朋友要访问，需要你的微信来帮他扫码验证。',
    id: 'faq-19',
    verifiedAt: '2026-11-18',
  },
  {
    group: '验证类',
    question: '如何验证',
    answerHtml:
      '<p>A: <a href="https://doc.linkease.com/zh/guide/ddnsto/Authentication.html" target="_blank" rel="noopener">验证方法</a></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%A6%82%E4%BD%95%E9%AA%8C%E8%AF%81',
    answer: 'A: 验证方法',
    id: 'faq-20',
    verifiedAt: '2026-11-18',
  },
  {
    group: '网络类',
    question: '提示域名无法访问？',
    answerHtml:
      '<p><img src="/images/faq/answer-15-1.png" alt="question" loading="lazy"></p><p>A: 网络各方面都没问题，但是就是提示域名无法访问。</p><p>可能是路由器中某些插件会改变网络规则，需要添加以下地址到白名单。</p><div><pre><code>tunnel.ddnsto.com\ntunnel.kooldns.cn\ntunnel.tocmcc.cn\nwww.kooldns.cn\nwww.tocmcc.cn\nwww.ddnsto.com\n</code></pre></div>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E6%8F%90%E7%A4%BA%E5%9F%9F%E5%90%8D%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AE',
    answer:
      'A: 网络各方面都没问题，但是就是提示域名无法访问。\n\n可能是路由器中某些插件会改变网络规则，需要添加以下地址到白名单。\n\ntunnel.ddnsto.com\ntunnel.kooldns.cn\ntunnel.tocmcc.cn\nwww.kooldns.cn\nwww.tocmcc.cn\nwww.ddnsto.com\n',
    id: 'faq-21',
    verifiedAt: '2026-11-18',
  },
  {
    group: '网络类',
    question: '登录页面无法显示二维码',
    answerHtml:
      '<p>A: 可能是电脑的证书太老了，需要升级。<a href="https://doc.linkease.com/post/2021/10/18/letsencrypt-windows-issue/" target="_blank" rel="noopener">参考此博客<span> </span></a></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E7%99%BB%E5%BD%95%E9%A1%B5%E9%9D%A2%E6%97%A0%E6%B3%95%E6%98%BE%E7%A4%BA%E4%BA%8C%E7%BB%B4%E7%A0%81',
    answer: 'A: 可能是电脑的证书太老了，需要升级。参考此博客',
    id: 'faq-22',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '为什么我的套餐看不到了',
    answerHtml:
      '<p>A：过期的套餐不会继续显示；有的用户在易有云买了套餐会误以为与ddnsto通用，请注意两者是独立的产品需要分别付费。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E7%9A%84%E5%A5%97%E9%A4%90%E7%9C%8B%E4%B8%8D%E5%88%B0%E4%BA%86',
    answer:
      'A：过期的套餐不会继续显示；有的用户在易有云买了套餐会误以为与ddnsto通用，请注意两者是独立的产品需要分别付费。',
    id: 'faq-23',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '解除设备的套餐？',
    answerHtml:
      '<p>A：登录进ddnsto控制台，绑定的设备的右边有三个点，点击解除套餐绑定。</p><p><img src="/images/faq/answer-18-1.jpg" alt="question" loading="lazy"></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E8%A7%A3%E9%99%A4%E8%AE%BE%E5%A4%87%E7%9A%84%E5%A5%97%E9%A4%90',
    answer:
      'A：登录进ddnsto控制台，绑定的设备的右边有三个点，点击解除套餐绑定。',
    id: 'faq-24',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '切换套餐服务器？',
    answerHtml:
      '<p>A：登录进ddnsto控制台，绑定的设备的右边有三个点，点击切换服务器，出来的弹窗就可以切换了。</p><p><img src="/images/faq/answer-19-1.jpg" alt="question" loading="lazy"> <img src="/images/faq/answer-19-2.png" alt="question" loading="lazy"></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%88%87%E6%8D%A2%E5%A5%97%E9%A4%90%E6%9C%8D%E5%8A%A1%E5%99%A8',
    answer:
      'A：登录进ddnsto控制台，绑定的设备的右边有三个点，点击切换服务器，出来的弹窗就可以切换了。\n\n ',
    id: 'faq-25',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '购买新套餐？',
    answerHtml:
      '<p>A：登录进ddnsto控制台，绑定设备后，右边会有“管理套餐”的图标，点击出现弹窗，点击购买新套餐，按需购买套餐。</p><p><img src="/images/faq/answer-20-1.jpg" alt="question" loading="lazy"></p><p><img src="/images/faq/answer-20-2.png" alt="question" loading="lazy"></p><ul><li><p>购买完成后，再次点击“管理套餐”，弹窗“已购套餐”里点击新套餐绑定即可。</p> <p><img src="/images/faq/answer-20-3.jpg" alt="question" loading="lazy"></p></li></ul>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E8%B4%AD%E4%B9%B0%E6%96%B0%E5%A5%97%E9%A4%90',
    answer:
      'A：登录进ddnsto控制台，绑定设备后，右边会有“管理套餐”的图标，点击出现弹窗，点击购买新套餐，按需购买套餐。\n\n购买完成后，再次点击“管理套餐”，弹窗“已购套餐”里点击新套餐绑定即可。',
    id: 'faq-26',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '切换套餐？',
    answerHtml:
      '<p>A：帐号已经买过套餐，要绑定新设备，请先解除旧设备的套餐。</p><p>登录进ddnsto控制台，绑定好新设备后，右边会有“管理套餐”的图标，弹窗“已购套餐”未绑定设备的套餐，就可以绑定至本机。</p><p><img src="/images/faq/answer-21-1.jpg" alt="question" loading="lazy"></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%88%87%E6%8D%A2%E5%A5%97%E9%A4%90',
    answer:
      'A：帐号已经买过套餐，要绑定新设备，请先解除旧设备的套餐。\n\n登录进ddnsto控制台，绑定好新设备后，右边会有“管理套餐”的图标，弹窗“已购套餐”未绑定设备的套餐，就可以绑定至本机。',
    id: 'faq-27',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '套餐续费？',
    answerHtml:
      '<div><pre><code>套餐快到期了，怎么续费呢。\n</code></pre></div><p><img src="/images/faq/answer-22-1.jpg" alt="question" loading="lazy"></p><p>A：快要过期的时候的，直接续费。</p><ul><li><p>点击“管理套餐”的图标，弹窗菜单选择“续费”，然后购买套餐。</p> <p><img src="/images/faq/answer-22-2.jpg" alt="question" loading="lazy"></p> <p><img src="/images/faq/answer-22-3.jpg" alt="question" loading="lazy"></p></li> <li><p>如果已经过期，就只能购买新套餐。点击“立即购买”——购买新套餐，选择合适的套餐套餐。</p> <p><img src="/images/faq/answer-22-4.jpg" alt="question" loading="lazy"></p> <p><img src="/images/faq/answer-22-5.jpg" alt="question" loading="lazy"></p> <p><img src="/images/faq/answer-22-6.png" alt="question" loading="lazy"></p></li> <li><p>然后，“管理套餐”的图标，弹窗“已购套餐”未绑定设备的套餐，就可以绑定至本机。</p> <p><img src="/images/faq/answer-22-7.jpg" alt="question" loading="lazy"></p> <p><img src="/images/faq/answer-22-8.jpg" alt="question" loading="lazy"></p></li></ul>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%A5%97%E9%A4%90%E7%BB%AD%E8%B4%B9',
    answer:
      '套餐快到期了，怎么续费呢。\n\n\nA：快要过期的时候的，直接续费。\n\n点击“管理套餐”的图标，弹窗菜单选择“续费”，然后购买套餐。\n\n如果已经过期，就只能购买新套餐。点击“立即购买”——购买新套餐，选择合适的套餐套餐。\n\n然后，“管理套餐”的图标，弹窗“已购套餐”未绑定设备的套餐，就可以绑定至本机。',
    id: 'faq-28',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '套餐升级？',
    answerHtml:
      '<p>现在已推出8Mbps的套餐，可从4Mbps套餐升级。</p><p>A：点击“管理套餐”的图标，弹窗菜单选择“升级至8Mbps”，然后购买套餐。</p><p><img src="/images/faq/answer-23-1.jpg" alt="question" loading="lazy"></p><p><img src="/images/faq/answer-23-2.jpg" alt="question" loading="lazy"></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%A5%97%E9%A4%90%E5%8D%87%E7%BA%A7',
    answer:
      '现在已推出8Mbps的套餐，可从4Mbps套餐升级。\n\nA：点击“管理套餐”的图标，弹窗菜单选择“升级至8Mbps”，然后购买套餐。',
    id: 'faq-29',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '套餐兑换码怎么使用？',
    answerHtml:
      '<p>A: 登录ddnsto控制台，点击头像——兑换码使用，弹窗输入兑换码激活，即可绑定套餐正常使用。。</p><p><img src="/images/faq/answer-24-1.jpg" alt="question" loading="lazy"> <img src="/images/faq/answer-24-2.jpg" alt="question" loading="lazy"></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%A5%97%E9%A4%90%E5%85%91%E6%8D%A2%E7%A0%81%E6%80%8E%E4%B9%88%E4%BD%BF%E7%94%A8',
    answer:
      'A: 登录ddnsto控制台，点击头像——兑换码使用，弹窗输入兑换码激活，即可绑定套餐正常使用。。\n\n ',
    id: 'faq-30',
    verifiedAt: '2026-11-18',
  },
  {
    group: '套餐类',
    question: '已购买套餐的设备不小心删除了怎么办？',
    answerHtml:
      '<p>A: 即使删除了设备，套餐依然还在。重新添加设备后就可以绑定已购买套餐。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E5%B7%B2%E8%B4%AD%E4%B9%B0%E5%A5%97%E9%A4%90%E7%9A%84%E8%AE%BE%E5%A4%87%E4%B8%8D%E5%B0%8F%E5%BF%83%E5%88%A0%E9%99%A4%E4%BA%86%E6%80%8E%E4%B9%88%E5%8A%9E',
    answer:
      'A: 即使删除了设备，套餐依然还在。重新添加设备后就可以绑定已购买套餐。',
    id: 'faq-31',
    verifiedAt: '2026-11-18',
  },
  {
    group: '操作类',
    question: 'ddnsto插件已配置，但用户中心一直没有出现？',
    answerHtml:
      '<p>A: 请检查token(令牌)是否配置正确，或设备是否正常连接网络。或检查设备时间，时间不正确会导致连接失败，请同步时间后等待一分钟或重启插件。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-ddnsto%E6%8F%92%E4%BB%B6%E5%B7%B2%E9%85%8D%E7%BD%AE-%E4%BD%86%E7%94%A8%E6%88%B7%E4%B8%AD%E5%BF%83%E4%B8%80%E7%9B%B4%E6%B2%A1%E6%9C%89%E5%87%BA%E7%8E%B0',
    answer:
      'A: 请检查token(令牌)是否配置正确，或设备是否正常连接网络。或检查设备时间，时间不正确会导致连接失败，请同步时间后等待一分钟或重启插件。',
    id: 'faq-32',
    verifiedAt: '2026-11-18',
  },
  {
    group: '操作类',
    question: 'Aria2 远程下载无法正确设置？',
    answerHtml:
      '<p>A: 如果是www.kooldns.cn服务器，则设置为wss www.kooldns.cn。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-aria2%E8%BF%9C%E7%A8%8B%E4%B8%8B%E8%BD%BD%E6%97%A0%E6%B3%95%E8%AE%BE%E5%A4%87%E6%AD%A3%E7%A1%AE',
    answer: 'A: 如果是www.kooldns.cn服务器，则设置为wss www.kooldns.cn。',
    id: 'faq-33',
    verifiedAt: '2026-11-18',
  },
  {
    group: '操作类',
    question: '旁路路由无法使用DDNSTO？',
    answerHtml:
      '<p>A: 确认您旁路路由的内部是否能上网，试着ping www.baidu.com试试。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E6%97%81%E8%B7%AF%E8%B7%AF%E7%94%B1%E6%97%A0%E6%B3%95%E4%BD%BF%E7%94%A8ddnsto',
    answer: 'A: 确认您旁路路由的内部是否能上网，试着ping www.baidu.com试试。',
    id: 'faq-34',
    verifiedAt: '2026-11-18',
  },
  {
    group: '操作类',
    question: '设备域名无法转发到小米路由器？',
    answerHtml:
      '<p>A: 是的，目前还无法解决。小米路由器的网页有特殊性导致无法转发WEB。</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-%E8%AE%BE%E5%A4%87%E5%9F%9F%E5%90%8D%E6%97%A0%E6%B3%95%E8%BD%AC%E5%8F%91%E5%88%B0%E5%B0%8F%E7%B1%B3%E8%B7%AF%E7%94%B1%E5%99%A8',
    answer:
      'A: 是的，目前还无法解决。小米路由器的网页有特殊性导致无法转发WEB。',
    id: 'faq-35',
    verifiedAt: '2026-11-18',
  },
  {
    group: '操作类',
    question: 'WordPress访问异常？',
    answerHtml:
      '<p>A: wordpress需要配置“站点地址”和ddnsto域名相同。</p><p><img src="/images/faq/answer-30-1.jpg" alt="question" loading="lazy"></p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-wordpress%E8%AE%BF%E9%97%AE%E5%BC%82%E5%B8%B8',
    answer: 'A: wordpress需要配置“站点地址”和ddnsto域名相同。',
    id: 'faq-36',
    verifiedAt: '2026-11-18',
  },
  {
    group: '操作类',
    question: 'ESXi 无法使用远程应用里的 SSH？',
    answerHtml:
      '<p>A: 要在/etc/ssh/sshd_config里把PasswordAuthentication 设为yes</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-exsi-%E6%97%A0%E6%B3%95%E4%BD%BF%E7%94%A8%E8%BF%9C%E7%A8%8B%E5%BA%94%E7%94%A8%E9%87%8C%E7%9A%84ssh',
    answer: 'A: 要在/etc/ssh/sshd_config里把PasswordAuthentication 设为yes',
    id: 'faq-37',
    verifiedAt: '2026-11-18',
  },
  {
    group: '操作类',
    question: 'nextcloud访问时跳转至 www.ddnsto.com',
    answerHtml:
      '<p>A: 访问域名时手动添加路径“/apps/dashboard/”至域名，如 https://abcdef.ddnsto.com/apps/dashboard/</p>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-nextcloud%E8%AE%BF%E9%97%AE%E6%97%B6%E8%B7%B3%E8%BD%AC%E8%87%B3-www-ddnsto-com',
    answer:
      'A: 访问域名时手动添加路径“/apps/dashboard/”至域名，如 https://abcdef.ddnsto.com/apps/dashboard/',
    id: 'faq-38',
    verifiedAt: '2026-11-18',
  },
  {
    group: '插件类',
    question: 'Merlin 路由器重启后ddnsto插件未运行',
    answerHtml:
      '<p>Merlin 路由器如果是 AP 模式，服务不会跟随系统启动</p><h3> 还有任何问题都可以跟帖提问！</h3>',
    source:
      'https://doc.linkease.com/zh/guide/ddnsto/question.html#q-merlin-%E8%B7%AF%E7%94%B1%E5%99%A8%E9%87%8D%E5%90%AF%E5%90%8Eddnsto%E6%8F%92%E4%BB%B6%E6%9C%AA%E8%BF%90%E8%A1%8C',
    answer:
      'Merlin 路由器如果是 AP 模式，服务不会跟随系统启动\n\n还有任何问题都可以跟帖提问！',
    id: 'faq-39',
    verifiedAt: '2026-11-18',
  },
];
export const faqGroups = [...new Set(faqs.map((f) => f.group))];
