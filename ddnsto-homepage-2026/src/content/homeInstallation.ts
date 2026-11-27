import design from './installationDesign.json' with { type: 'json' };
import { platforms as documentedPlatforms } from './installation';
import type { InstallPlatform } from './installation';

/** Homepage presentation captured from the approved v2 design (2026-11-19).
 * Independent guide pages retain their documented platform/version details.
 * These are local, trusted static illustrations; never remote HTML or runtime imports.
 */
export const platforms: InstallPlatform[] = documentedPlatforms.map(
  (platform) => {
    const entry = design.find((item) => item.label === platform.label);
    if (!entry)
      throw new Error(`Missing approved installation design: ${platform.id}`);
    return { ...platform, ...entry, branches: [] };
  },
);

// New reference's macOS entry makes the M2 hero link usable before M4 restyles this section.
// Presentation source: original-preview Installation.jsx, user approved 2026-11-26.
platforms.push({
  id: 'macos',
  name: 'macOS',
  label: 'macOS',
  group: '电脑与通用环境',
  url: '', // No dedicated macOS tutorial is published.
  note: '',
  verifiedAt: '',
  sources: ['https://doc.istoreos.com/zh/guide/ddnsto/quickstart/'],
  branches: [],
  steps: [
    {
      title: '下载程序',
      text: '下载 macOS 命令行程序包并解压。',
      kind: 'terminal',
      links: [
        {
          label: '下载 macOS 程序包',
          url: 'https://fw.koolcenter.com/binary/ddnsto/macOS/',
        },
      ],
    },
    {
      title: '配置并启动',
      text: '按对应文档，在终端中使用账号令牌启动 DDNSTO。',
      kind: 'terminal',
      links: [],
    },
    {
      title: '查看设备',
      text: '登录控制台，确认设备在线并管理访问链接。',
      kind: 'ready',
      links: [],
    },
  ],
});
