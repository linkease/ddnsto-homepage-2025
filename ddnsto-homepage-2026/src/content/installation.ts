/** 安装事实核实日期 2026-11-18；来源随平台记录，视觉来源为 v2/simple-install。 */
export interface InstallLink {
  label: string;
  url: string;
}
export interface InstallStep {
  illustrationHtml?: string;
  title: string;
  text: string;
  kind: string;
  links: InstallLink[];
}
export interface InstallBranch {
  id: string;
  label: string;
  note: string;
}
export interface InstallPlatform {
  id: string;
  name: string;
  label: string;
  url: string;
  group: string;
  steps: InstallStep[];
  note: string;
  verifiedAt: string;
  sources: string[];
  branches: InstallBranch[];
}
export const platforms: InstallPlatform[] = [
  {
    id: 'easepi',
    name: 'EasePi',
    label: 'EasePi',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/easepi.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '安装软件',
        text: '固件已预装 DDNSTO；在「服务 → DDNSTO」中打开。',
        kind: 'store',
        links: [],
      },
      {
        title: '填写令牌',
        text: '从 DDNSTO 控制台获取账号令牌，填入设备上的 DDNSTO 配置。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
      {
        title: '启用服务',
        text: '启用 DDNSTO 并保存配置，然后进入控制台添加域名映射。',
        kind: 'ready',
        links: [],
      },
      {
        title: '查看设备',
        text: '登录 DDNSTO 控制台，在设备工作台确认设备已添加、状态在线。',
        kind: 'console',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/easepi.html',
    ],
    branches: [],
  },
  {
    id: 'istoreos',
    name: 'iStoreOS',
    label: 'iStoreOS',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/istoreos.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '安装软件',
        text: '在软件中心搜索并安装 DDNSTO；已安装可直接打开。',
        kind: 'store',
        links: [],
      },
      {
        title: '填写令牌',
        text: '从 DDNSTO 控制台获取账号令牌，填入设备上的 DDNSTO 配置。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
      {
        title: '启用服务',
        text: '启用 DDNSTO 并保存配置，然后进入控制台添加域名映射。',
        kind: 'ready',
        links: [],
      },
      {
        title: '查看设备',
        text: '登录 DDNSTO 控制台，在设备工作台确认设备已添加、状态在线。',
        kind: 'console',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/istoreos.html',
    ],
    branches: [],
  },
  {
    id: 'asusgo',
    name: 'ASUSGO 固件 ≥386',
    label: '华硕 / ASUSGO',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/koolcenter_merlin.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '安装软件',
        text: '在软件中心搜索并安装 DDNSTO；已安装可直接打开。',
        kind: 'store',
        links: [],
      },
      {
        title: '填写令牌',
        text: '从 DDNSTO 控制台获取账号令牌，填入设备上的 DDNSTO 配置。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
      {
        title: '启用服务',
        text: '启用 DDNSTO 并保存配置，然后进入控制台添加域名映射。',
        kind: 'ready',
        links: [],
      },
      {
        title: '查看设备',
        text: '登录 DDNSTO 控制台，在设备工作台确认设备已添加、状态在线。',
        kind: 'console',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/koolcenter_merlin.html',
      'https://doc.linkease.com/zh/guide/ddnsto/support.html',
    ],
    branches: [
      {
        id: 'modern',
        label: '固件 ≥386',
        note: '官方支持列表：支持文件管理、WebDAV 服务及远程开机。',
      },
      {
        id: 'legacy',
        label: '固件 <386',
        note: '官方支持列表：扩展功能仅支持文件管理。',
      },
    ],
  },
  {
    id: 'lede',
    name: 'Koolcenter Lede',
    label: 'Koolcenter Lede',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/koolcenter_lede.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '按固件版本安装',
        text: 'KS LEDE ≤2.3.7 从酷软中心安装；≥3.2 按教程卸载内置版、更新 iStore 后安装。',
        kind: 'open',
        links: [],
      },
      {
        title: '打开 DDNSTO',
        text: '进入已安装的 DDNSTO 插件。',
        kind: 'open',
        links: [],
      },
      {
        title: '关联账号令牌',
        text: '扫码登录控制台获取令牌，填入设备上的 DDNSTO；启用服务后保存并应用。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/koolcenter_lede.html',
    ],
    branches: [
      {
        id: 'legacy',
        label: 'KS LEDE ≤2.3.7',
        note: '从酷软中心安装 DDNSTO，然后填写令牌并启用。',
      },
      {
        id: 'modern',
        label: 'KS LEDE ≥3.2',
        note: '先卸载固件自带的 DDNSTO，更新 iStore 商店后重新安装。',
      },
      {
        id: 'other',
        label: '其他版本 / 不确定',
        note: '官方教程未明确这些版本的安装方法，请先核对固件版本和官方说明。',
      },
    ],
  },
  {
    id: 'openwrt',
    name: 'OpenWrt',
    label: 'OpenWrt',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/openwrt.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '打开终端',
        text: '使用设备上的 TTYD 或 SSH 终端。',
        kind: 'terminal',
        links: [],
      },
      {
        title: '按教程安装',
        text: '按所选插件的官方教程，在设备终端安装对应程序。',
        kind: 'terminal',
        links: [],
      },
      {
        title: '关联账号令牌',
        text: 'DDNSTO 填写令牌后启用；DDNSTOX 还需设置设备名称。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/openwrt.html',
    ],
    branches: [
      {
        id: 'ddnsto',
        label: 'DDNSTO',
        note: '低内存硬路由或需要扩展功能时，按官方教程选择 DDNSTO 插件。',
      },
      {
        id: 'ddnstox',
        label: 'DDNSTOX',
        note: '内存要求较高，目前不提供扩展功能；需填写令牌和唯一设备名称。',
      },
    ],
  },
  {
    id: 'synology',
    name: 'Synology',
    label: '群晖',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/synology.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '下载安装包',
        text: '按 CPU 架构和 DSM 版本选择安装包；DSM 7.x 升级前先卸载旧版。',
        kind: 'download',
        links: [
          {
            label: '下载群晖安装包',
            url: 'https://www.linkease.com/rd/ddnsto-syonlogy/',
          },
        ],
      },
      {
        title: '手动安装',
        text: '在套件中心上传并安装下载的套件。',
        kind: 'upload',
        links: [],
      },
      {
        title: '填入令牌',
        text: '在安装配置中填写账号令牌，按提示完成安装。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/synology.html',
    ],
    branches: [
      {
        id: 'dsm7',
        label: 'DSM 7.x',
        note: '选择匹配 CPU 架构和 DSM 版本的套件；安装前卸载旧版 DDNSTO。',
      },
      {
        id: 'dsm6',
        label: 'DSM 6.x',
        note: '选择匹配 CPU 架构和 DSM 版本的套件，避免误用 DSM 7.x 安装包。',
      },
    ],
  },
  {
    id: 'qnap',
    name: 'QNAP',
    label: '威联通',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/qnap.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '下载安装包',
        text: '选择对应架构的 QPKG；按教程先检查 WEB 服务设置。',
        kind: 'download',
        links: [
          {
            label: '下载威联通安装包',
            url: 'https://www.linkease.com/rd/ddnsto-qnap/',
          },
        ],
      },
      {
        title: '手动安装',
        text: '在 App Center 上传安装包，完成安装。',
        kind: 'upload',
        links: [],
      },
      {
        title: '填写令牌',
        text: '打开 DDNSTO，填入账号令牌并提交。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/qnap.html',
    ],
    branches: [],
  },
  {
    id: 'docker',
    name: 'Docker',
    label: 'Docker',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
    group: '电脑与通用环境',
    steps: [
      {
        title: '准备 Docker',
        text: '在设备上安装并启用 Docker。',
        kind: 'open',
        links: [],
      },
      {
        title: '创建 DDNSTO 容器',
        text: '按教程创建容器，填写 TOKEN 和唯一的英文或数字设备名称。',
        kind: 'docker',
        links: [
          {
            label: '镜像安装说明',
            url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
          },
        ],
      },
      {
        title: '启动容器',
        text: '保存配置并启动，确认容器正常运行。',
        kind: 'ready',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
    ],
    branches: [],
  },
  {
    id: 'fnos',
    name: '飞牛',
    label: '飞牛',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/fn.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '准备 Docker',
        text: '在设备上安装并启用 Docker。',
        kind: 'open',
        links: [],
      },
      {
        title: '创建容器',
        text: '打开 SSH 终端，按飞牛教程执行命令，替换 TOKEN 和英文或数字设备名称。',
        kind: 'docker',
        links: [],
      },
      {
        title: '启动容器',
        text: '保存配置并启动，确认容器正常运行。',
        kind: 'ready',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/fn.html',
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
    ],
    branches: [],
  },
  {
    id: 'padavan',
    name: 'Padavan',
    label: 'Padavan',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/padavan.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '确认固件支持',
        text: '使用已集成 DDNSTO 的 Padavan 固件。',
        kind: 'open',
        links: [],
      },
      {
        title: '打开配置',
        text: '进入「扩展功能 → 花生壳内网」，选择 ddnsto。',
        kind: 'token',
        links: [],
      },
      {
        title: '关联账号令牌',
        text: '扫码登录控制台获取令牌，填入设备上的 DDNSTO；启用服务后保存并应用。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/padavan.html',
    ],
    branches: [],
  },
  {
    id: 'readynas',
    name: 'ReadyNAS',
    label: 'ReadyNAS',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/ready_nas.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '确认型号并下载',
        text: '先核对教程中的支持型号，再下载 DEB 安装包。',
        kind: 'download',
        links: [
          {
            label: '查看支持型号',
            url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/ready_nas.html',
          },
          {
            label: '下载安装包',
            url: 'https://fw.koolcenter.com/binary/ddnsto/readynas/ddnsto_all.deb',
          },
        ],
      },
      {
        title: '打开应用管理',
        text: '进入管理后台的「应用程序」。',
        kind: 'open',
        links: [],
      },
      {
        title: '上传安装',
        text: '选择「上传并安装应用程序」，上传 DEB 文件并完成安装。',
        kind: 'upload',
        links: [],
      },
    ],
    note: '先在官方教程核对 ARM 或 x86 型号支持表，再选择安装包；未列出的型号不作支持承诺。',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/ready_nas.html',
    ],
    branches: [],
  },
  {
    id: 'ikuai',
    name: '爱快',
    label: '爱快',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/ikuai.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '准备 Docker',
        text: '先按官方教程完成 Docker 设置。',
        kind: 'open',
        links: [],
      },
      {
        title: '下载镜像',
        text: '在「高级应用 → 插件管理 → Docker」的镜像管理中搜索 linkease/ddnsto。',
        kind: 'docker',
        links: [],
      },
      {
        title: '创建并启用容器',
        text: '按教程设置网络等参数，在环境变量中填写 TOKEN，保存并启用。',
        kind: 'docker',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/ikuai.html',
    ],
    branches: [],
  },
  {
    id: 'unraid',
    name: 'Unraid',
    label: 'Unraid',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/unraid.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '准备 Docker',
        text: '在设备上安装并启用 Docker。',
        kind: 'open',
        links: [],
      },
      {
        title: '创建容器',
        text: '进入 Docker 页面并打开终端，按教程填写令牌与设备名称、创建容器。',
        kind: 'docker',
        links: [],
      },
      {
        title: '启动容器',
        text: '保存配置并启动，确认容器正常运行。',
        kind: 'ready',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/unraid.html',
    ],
    branches: [],
  },
  {
    id: 'terramaster',
    name: '铁威马',
    label: '铁威马',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/terra_master.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '准备 Docker 与终端',
        text: 'TOS 4.0+ 从应用中心安装 Docker，并在「终端与 SNMP」中启用 SSH。',
        kind: 'open',
        links: [],
      },
      {
        title: '创建 DDNSTO 容器',
        text: '按教程创建容器，填写 TOKEN 和唯一的英文或数字设备名称。',
        kind: 'docker',
        links: [
          {
            label: '镜像安装说明',
            url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
          },
        ],
      },
      {
        title: '启动容器',
        text: '保存配置并启动，确认容器正常运行。',
        kind: 'ready',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/terra_master.html',
    ],
    branches: [],
  },
  {
    id: 'windows',
    name: 'Windows',
    label: 'Windows',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/windows.html',
    group: '电脑与通用环境',
    steps: [
      {
        title: '下载并运行',
        text: '下载 Windows 客户端，解压后运行 ddnsto.exe。',
        kind: 'download',
        links: [
          {
            label: '下载 Windows 客户端',
            url: 'https://fw.koolcenter.com/binary/ddnsto/pc/',
          },
        ],
      },
      {
        title: '打开应用并配置',
        text: '填入账号令牌，按需设置设备名称等选项。',
        kind: 'token',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
      {
        title: '按需开启 WebDAV 并保存',
        text: '需要文件访问时开启 WebDAV、配置目录与访问账号，完成后保存。',
        kind: 'ready',
        links: [],
      },
    ],
    note: '官方文档标注客户端仍处于公测。后台运行请最小化窗口，点击关闭会退出应用。',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/windows.html',
    ],
    branches: [],
  },
  {
    id: 'linux',
    name: 'Linux',
    label: 'Linux',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/linux.html',
    group: '电脑与通用环境',
    steps: [
      {
        title: '下载程序包',
        text: '下载与 CPU 架构匹配的 Linux 程序包，解压到目标设备。',
        kind: 'download',
        links: [
          {
            label: '下载 Linux 程序包',
            url: 'https://fw.koolcenter.com/binary/ddnsto/linux/',
          },
        ],
      },
      {
        title: '填写令牌并启动',
        text: '按教程将账号令牌传入启动命令，并设置后台运行。',
        kind: 'terminal',
        links: [
          {
            label: '获取账号令牌',
            url: 'https://web.ddnsto.com/app/?utm_source=website&utm_medium=website#/devices',
          },
        ],
      },
      {
        title: '确认运行状态',
        text: '日志出现 client init ok 后，可到控制台查看设备。',
        kind: 'ready',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/linux.html',
    ],
    branches: [
      {
        id: 'amd64',
        label: 'x86 / AMD64',
        note: '按官方教程选择 ddnsto.amd64。',
      },
      {
        id: 'arm64',
        label: 'ARM64',
        note: '按官方教程选择 ddnsto.arm64；其他架构先核对下载目录。',
      },
    ],
  },
  {
    id: 'zspace',
    name: '极空间',
    label: '极空间',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/zspace.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '准备 Docker',
        text: '在设备上安装并启用 Docker。',
        kind: 'open',
        links: [],
      },
      {
        title: '创建 DDNSTO 容器',
        text: '创建容器，按极空间教程映射 /ddnsto-config 目录，并填写 TOKEN。',
        kind: 'docker',
        links: [
          {
            label: '镜像安装说明',
            url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
          },
        ],
      },
      {
        title: '启动容器',
        text: '保存配置并启动，确认容器正常运行。',
        kind: 'ready',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/docker.html',
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/zspace.html',
    ],
    branches: [],
  },
  {
    id: 'ugreen',
    name: '绿联NAS',
    label: '绿联NAS',
    url: 'https://doc.linkease.com/zh/guide/ddnsto/install/device/ugreen.html',
    group: '路由器与 NAS',
    steps: [
      {
        title: '准备 Docker',
        text: '在设备上安装并启用 Docker。',
        kind: 'open',
        links: [],
      },
      {
        title: '创建容器',
        text: '官方教程采用飞牛的 Docker 安装方法，填写令牌与设备名称。',
        kind: 'docker',
        links: [],
      },
      {
        title: '启动容器',
        text: '保存配置并启动，确认容器正常运行。',
        kind: 'ready',
        links: [],
      },
    ],
    note: '',
    verifiedAt: '2026-11-18',
    sources: [
      'https://doc.linkease.com/zh/guide/ddnsto/install/device/ugreen.html',
    ],
    branches: [],
  },
];
export const installCommand = `(s=$(curl -qfsS --max-time 60 https://run.ddnsto.com/install.sh) && test -n "$s" && sh -c "$s" -- --token '用户令牌')`;
export const commandSource =
  'https://doc.linkease.com/zh/guide/ddnsto/install/device/linux.html';
export const supportSource =
  'https://doc.linkease.com/zh/guide/ddnsto/support.html';
