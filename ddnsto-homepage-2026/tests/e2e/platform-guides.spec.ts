import { test, expect } from '@playwright/test';

test('container methods, keyboard switching and exact template copies', async ({
  page,
}) => {
  await page.goto('/?platform=fnos#devices');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).copiedTemplate = text;
        },
      },
    }),
  );
  await expect(page.locator('[data-method]:visible')).toHaveCount(2);
  await expect(page.locator('[data-method-panel=compose]')).toBeVisible();
  const compose = page.locator(
    '[data-method-panel=compose] [data-container-platform=fnos]',
  );
  await compose.getByRole('button', { name: '复制 Compose 配置' }).click();
  expect(await page.evaluate(() => (window as any).copiedTemplate)).toBe(
    await compose.locator('code').textContent(),
  );
  await page.locator('[data-method=compose]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-method=docker]')).toBeFocused();
  await expect(page.locator('[data-method-panel=docker]')).toBeVisible();
  await page
    .getByRole('button', { name: '复制 Docker 命令', exact: true })
    .click();
  expect(await page.evaluate(() => (window as any).copiedTemplate)).toMatch(
    /^sudo docker run/,
  );
  await page.locator('[data-platform=docker]').click();
  await expect(page.locator('[data-method]:visible')).toHaveCount(3);
  await expect(page.locator('[data-method=script]')).toBeHidden();
  await page.locator('[data-method=compose]').click();
  await page.getByRole('button', { name: '复制启动命令', exact: true }).click();
  expect(await page.evaluate(() => (window as any).copiedTemplate)).toBe(
    'docker-compose up -d\n',
  );
  await page.locator('[data-platform=fnos]').click();
  await expect(compose).toBeVisible();
});

test('NAS updated steps, signature help and copy failure are usable', async ({
  page,
}) => {
  await page.goto('/?platform=qnap#devices');
  const qnap = page.locator('[data-guide=qnap]');
  await expect(qnap).toContainText('下载 QNAP 插件');
  await qnap.locator('[data-install-step="1"]').click();
  await qnap.getByText('因签名问题安装失败？', { exact: true }).click();
  await expect(qnap.locator('details[open]')).toContainText(
    '允许在没有有效数字签名',
  );
  await qnap.locator('[data-install-step="2"]').click();
  await expect(qnap.locator('[data-step-panel="2"]')).toContainText('设备编号');
  await page.locator('[data-platform=synology]').click();
  const synology = page.locator('[data-guide=synology]');
  await synology.locator('[data-install-step="1"]').click();
  await expect(synology.locator('[data-step-panel="1"]')).toContainText(
    '上传套件',
  );
  await page.locator('[data-platform=fnos]').click();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    });
    document.execCommand = () => false;
  });
  await page.getByRole('button', { name: '复制 Compose 配置' }).click();
  await expect(
    page.locator(
      '[data-method-panel=compose] [data-container-platform=fnos] [data-template-fallback]',
    ),
  ).toBeVisible();
  expect(
    await page
      .locator(
        '[data-method-panel=compose] [data-container-platform=fnos] [data-template-fallback]',
      )
      .inputValue(),
  ).toContain('TOKEN=用户令牌');
});

test('latest tutorial modes retain official destinations and copy usable Compose', async ({
  page,
}) => {
  await page.goto('/#devices');
  for (const id of [
    'docker',
    'unraid',
    'terramaster',
    'zspace',
    'ugreen',
    'linux',
    'macos',
    'ikuai',
    'windows',
  ]) {
    await page.locator(`[data-platform=${id}]`).click();
    const guide = page.locator('[data-method-panel]:visible');
    await expect(guide).toBeVisible();
    if (['docker', 'unraid', 'terramaster'].includes(id)) {
      await expect(page.locator('[data-method]:visible')).toHaveCount(3);
      await page.locator('[data-method=docker]').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('[data-method=compose]')).toBeFocused();
      const code = page
        .locator(
          `[data-method-panel=compose] [data-container-platform=${id}] code`,
        )
        .first();
      expect(await code.textContent()).toMatch(/^services:\n  ddnsto:/);
    }
    if (['linux', 'macos'].includes(id)) {
      await expect(page.locator('[data-method=software]')).toBeHidden();
      await expect(page.locator('[data-method=script]')).toHaveAttribute(
        'aria-selected',
        'true',
      );
    }
    if (id === 'ikuai') {
      await expect(page.locator('.ikuai-video-card')).toHaveAttribute(
        'href',
        'https://www.bilibili.com/video/BV1tt4y157W5/?spm_id_from=333.999.0.0&vd_source=d54ec756b25150ca0b560583e5e5a6a3',
      );
      await expect(page.locator('.ikuai-doc-link')).toHaveAttribute(
        'href',
        'https://doc.istoreos.com/zh/guide/ddnsto/quickstart/install-guide/ikuai.html',
      );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test('each script platform uses the approved concise introductory copy', async ({
  page,
}) => {
  await page.goto('/#devices');
  for (const id of [
    'easepi',
    'istoreos',
    'asusgo',
    'openwrt',
    'synology',
    'linux',
    'macos',
    'terminal-unix',
  ]) {
    await page.locator(`[data-platform=${id}]`).click();
    if (id !== 'terminal-unix')
      await page.locator('[data-method=script]').click();
    const guide = page.locator('[data-script-guide]');
    await expect(guide.locator('.method-intro')).toHaveText(
      '在被访问设备上运行。脚本自动识别受支持的平台，安装或更新 DDNSTO。',
    );
    await expect(
      guide.locator('.script-howto li').nth(2).locator('p'),
    ).toHaveText(
      '粘贴到终端并按回车。安装启动完成后，进入控制台确认设备在线。',
    );
    await expect(guide.locator('[data-scan-state=idle]')).toContainText(
      '请先打开被访问设备的终端，再获取安装命令。',
    );
  }
});

test('Ikuai play card opens the designated video separately from documentation', async ({
  page,
  context,
}) => {
  const video =
    'https://www.bilibili.com/video/BV1tt4y157W5/?spm_id_from=333.999.0.0&vd_source=d54ec756b25150ca0b560583e5e5a6a3';
  await context.route('https://www.bilibili.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>Video destination</title>',
    }),
  );
  await page.goto('/?platform=ikuai#devices');
  const card = page.locator('.ikuai-video-card');
  await expect(card).toContainText('B站视频');
  await expect(card).toContainText('点击前往 B 站播放');
  const opened = context.waitForEvent('page');
  await card.locator('.ikuai-play').click();
  const popup = await opened;
  await expect(popup).toHaveURL(video);
  await expect(page.locator('.ikuai-doc-link')).toHaveAttribute(
    'href',
    'https://doc.istoreos.com/zh/guide/ddnsto/quickstart/install-guide/ikuai.html',
  );
  await popup.close();
});

test('NAS token wording and hidden Windows script match the requested UI', async ({
  page,
}) => {
  await page.goto('/?platform=terramaster#devices');
  for (const id of ['terramaster', 'unraid', 'zspace', 'ugreen']) {
    await page.locator(`[data-platform=${id}]`).click();
    await expect(
      page
        .locator(
          `[data-method-panel=docker] [data-container-platform=${id}] pre`,
        )
        .last(),
    ).toContainText('填写扫码获取的用户令牌');
  }
  await page.locator('[data-platform=docker]').click();
  await expect(
    page.locator('#devices a[href="https://www.docker.com/"]'),
  ).toHaveCount(0);
  await page.locator('[data-platform=windows]').click();
  await expect(page.locator('[data-method=script]')).toBeHidden();
  await expect(page.locator('[data-method]:visible')).toHaveCount(2);
  await page.locator('[data-method=software]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-method=ai]')).toBeFocused();
  await expect(page.locator('[data-method-panel=ai]')).toBeVisible();
  await page.locator('[data-platform=openwrt]').click();
  await expect(page.locator('[data-method=script]')).toBeVisible();
});
