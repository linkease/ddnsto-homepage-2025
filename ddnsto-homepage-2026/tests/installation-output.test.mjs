import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';

test('all installation content is static HTML and has no production reference dependency', async () => {
  const html = await readFile(
    new URL('../dist/index.html', import.meta.url),
    'utf8',
  );
  for (const platform of [
    'easepi',
    'istoreos',
    'asusgo',
    'lede',
    'openwrt',
    'synology',
    'qnap',
    'docker',
    'fnos',
    'padavan',
    'readynas',
    'ikuai',
    'unraid',
    'terramaster',
    'windows',
    'linux',
    'zspace',
    'ugreen',
  ])
    assert.ok(html.includes(`data-guide="${platform}"`), platform);
  for (const text of [
    '扫码配置',
    '生成域名',
    '自动扫码配置',
    '自动下载并校验安装器',
    '启动成功不代表设备在线',
    '更多教程',
    '复制安装命令',
    '扫码确认账号',
    'AI 帮我装',
  ])
    assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /192\.168\.9\.3:6002|src="[^\"]*reference\//);
  assert.doesNotMatch(html, /DEMO_TOKEN_NOT_VALID|模拟扫码成功/);
  assert.match(html, /<code><\/code>/);
  assert.ok(!html.includes('https://web.toany.net/i'));
  if (process.env.SITE_ENV !== 'test')
    assert.doesNotMatch(html, /entry-r6|--env test/);
  if (process.env.SITE_ENV !== 'production') assert.match(html, /noindex/);
});
