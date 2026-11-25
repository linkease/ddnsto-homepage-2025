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
    'https://run.ddnsto.com/install.sh',
    ' | sh -s -- --token ',
    '自动下载并校验安装器',
    '启动成功不代表设备在线',
    '更多教程',
    '复制命令',
  ])
    assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /192\.168\.9\.3:6002|src="[^\"]*reference\//);
  assert.ok(!html.includes('https://web.toany.net/i'));
  assert.match(html, /noindex/);
});
