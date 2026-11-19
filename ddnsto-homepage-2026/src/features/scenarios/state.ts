export const scenes = [
  {
    key: 'apps',
    label: '一键添加域名',
    title: '家里的应用，随时用',
    description: '扫描局域网里的服务，一键生成远程访问链接。',
    panelTitle: '添加外网域名 · 发现应用',
  },
  {
    key: 'tcp',
    label: 'TCP 远程桌面 · 新功能',
    title: '远处的电脑，接着用',
    description: '用本地 RDP / VNC 客户端，继续操作远处电脑。',
    panelTitle: 'TCP 远程桌面',
  },
  {
    key: 'files',
    label: '远程文件管理',
    title: '文件忘了带，远程也能取用',
    description: '随时查看、下载和管理远处设备上的文件。',
    panelTitle: '远程文件管理',
  },
  {
    key: 'device',
    label: '远程设备管理',
    title: '设备不在身边，也能及时处理',
    description: '出门也能打开路由器、NAS 的管理页面。',
    panelTitle: '远程设备管理',
  },
] as const;
export type SceneKey = (typeof scenes)[number]['key'];
export const services = [
  { name: '下载工具', slug: 'download', ip: '192.168.1.20:8080' },
  { name: '文件服务', slug: 'files', ip: '192.168.1.30:5000' },
  { name: '智能家居', slug: 'home', ip: '192.168.1.40:8123' },
];
export interface DemoState {
  apps: {
    step: number;
    progress: number;
    selected: number[];
    prefix: string;
    opened: number | null;
    bookmarks: number[];
    protocol: 'https' | 'http';
  };
  tcp: {
    step: number;
    protocol: 'RDP' | 'VNC';
    folder: string | null;
    file: string | null;
    tcp: boolean;
    connection: string;
  };
  files: {
    step: number;
    folder: boolean;
    file: string | null;
    window: boolean;
    bookmarked: boolean;
    remember: boolean;
  };
  device: { step: number; generating: boolean };
}
export function freshState(): DemoState {
  return {
    apps: {
      step: 0,
      progress: 0,
      selected: [],
      prefix: 'myhome',
      opened: null,
      bookmarks: [],
      protocol: 'https',
    },
    tcp: {
      step: 0,
      protocol: 'RDP',
      folder: null,
      file: null,
      tcp: false,
      connection: '网页访问',
    },
    files: {
      step: 0,
      folder: false,
      file: null,
      window: false,
      bookmarked: false,
      remember: false,
    },
    device: { step: 0, generating: false },
  };
}
export function isScene(value: string): value is SceneKey {
  return scenes.some((scene) => scene.key === value);
}
export function validPrefix(value: string) {
  return /^[a-z0-9](?:[a-z0-9-]{0,18}[a-z0-9])?$/.test(value);
}
