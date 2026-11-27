import { test, expect, type Page } from '@playwright/test';

import { mockInstallScan as mock } from '../e2e/install-helpers';
const proof = 'proof-fixture';
const deviceToken = 'device-token-fixture';
async function start(page: Page) {
  await page.goto('/__install-auth/');
  await page.getByRole('button', { name: '开始扫码 / 刷新二维码' }).click();
}

test('QR proof establishes login; account token comes from profile and stays out of UI/storage', async ({
  page,
}) => {
  const calls = await mock(page);
  await start(page);
  await expect(page.locator('#status')).toHaveAttribute(
    'data-phase',
    'authenticated',
  );
  expect(calls.indexOf('profile')).toBeGreaterThan(calls.indexOf('confirm'));
  const exposed = await page.evaluate(() =>
    JSON.stringify({
      html: document.documentElement.outerHTML,
      url: location.href,
      local: { ...localStorage },
      session: { ...sessionStorage },
    }),
  );
  expect(exposed).not.toContain(deviceToken);
  expect(exposed).not.toContain(proof);
  await expect(page.locator('script[data-install-auth]')).toHaveCount(0);
  await page.getByRole('button', { name: '取消并清除本页令牌' }).click();
  await expect(page.locator('#status')).toHaveAttribute(
    'data-phase',
    'cancelled',
  );
});

test('missing profile token cannot become ready', async ({ page }) => {
  const calls = await mock(page, { missingToken: true });
  await start(page);
  await expect(page.locator('#status')).toHaveAttribute('data-phase', 'error', {
    timeout: 10000,
  });
  await expect(page.locator('#status')).toContainText('未取得设备令牌');
  expect(calls).toContain('qr');
});

test('signal failure may recover only after authoritative login status and profile succeed', async ({
  page,
}) => {
  await mock(page, { failConfirm: true });
  await start(page);
  await expect(page.locator('#status')).toHaveAttribute(
    'data-phase',
    'authenticated',
  );
});

test('empty polls expire; polling failure stays an error', async ({ page }) => {
  await mock(page, { emptyPoll: true });
  await start(page);
  await expect(page.locator('#status')).toHaveAttribute(
    'data-phase',
    'expired',
    { timeout: 10000 },
  );
  await page.unrouteAll();
  await mock(page, { failPoll: true });
  await page.getByRole('button', { name: '开始扫码 / 刷新二维码' }).click();
  await expect(page.locator('#status')).toHaveAttribute('data-phase', 'error');
});

test('failed QR closes the isolated session', async ({ page }) => {
  const calls = await mock(page, { failQr: true });
  await start(page);
  await expect(page.locator('#status')).toHaveAttribute('data-phase', 'error');
  await expect.poll(() => calls.includes('close')).toBe(true);
  expect(
    await page.evaluate(() =>
      Object.keys(window).filter((k) => k.startsWith('__ddnsto_install_')),
    ),
  ).toEqual([]);
});

test('cancel and refresh invalidate old poll results', async ({ page }) => {
  let polls = 0;
  await mock(page);
  await page.route('**/__install-auth-api/poll', async (route) => {
    polls++;
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route
      .fulfill({ json: { events: [{ data: { token: proof } }] } })
      .catch(() => {});
  });
  await start(page);
  await expect(page.locator('#qr')).toBeVisible();
  await expect.poll(() => polls).toBe(1);
  await page.getByRole('button', { name: '取消并清除本页令牌' }).click();
  await page.waitForTimeout(1000);
  await expect(page.locator('#status')).toHaveAttribute(
    'data-phase',
    'cancelled',
  );
  await expect(page.locator('#qr')).toBeHidden();
  await page.getByRole('button', { name: '开始扫码 / 刷新二维码' }).click();
  await expect(page.locator('#status')).toHaveAttribute(
    'data-phase',
    'authenticated',
  );
});

test('development handler rejects unrelated and cross-origin operations', async ({
  request,
}) => {
  expect((await request.get('/api/devices/')).status()).toBe(404);
  expect(
    (
      await request.post('/__install-auth-api/create', {
        headers: {
          Origin: 'https://untrusted.invalid',
          'X-Install-Request': '1',
        },
      })
    ).status(),
  ).toBe(403);
  expect((await request.post('/api/profile/')).status()).toBe(404);
});

test('unexpected preauthenticated session is rejected instead of reusing login', async ({
  page,
}) => {
  const calls = await mock(page, { reusedLogin: true });
  await start(page);
  await expect(page.locator('#status')).toHaveAttribute('data-phase', 'error');
  expect(calls).not.toContain('profile');
  await expect.poll(() => calls.includes('close')).toBe(true);
});
