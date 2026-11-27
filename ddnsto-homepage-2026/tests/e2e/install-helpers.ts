import { expect, type Page } from '@playwright/test';
export const TEST_DEVICE_TOKEN = 'device-token-fixture';
export const authenticatedCommand = (template: string) =>
  template.replaceAll("'token'", "'" + TEST_DEVICE_TOKEN + "'");
export async function mockInstallScan(
  page: Page,
  options: {
    missingToken?: boolean;
    emptyPoll?: boolean;
    failPoll?: boolean;
    failConfirm?: boolean;
    failQr?: boolean;
    reusedLogin?: boolean;
  } = {},
) {
  const calls: string[] = [];
  const logged = new Set<string>();
  let sequence = 0;
  await page.route('**/__install-auth-api/**', async (route) => {
    const action = new URL(route.request().url()).pathname.split('/').pop()!;
    calls.push(action);
    expect(route.request().headers()['cookie']).toBeUndefined();
    const id = route.request().headers()['x-install-session'];
    let result: unknown = {};
    let status = 200;
    if (action === 'create') result = { id: 'fixture-' + ++sequence };
    else if (action === 'status')
      result = {
        status:
          logged.has(id) || options.reusedLogin ? 'logined' : 'not_logined',
        state: 'state-fixture',
      };
    else if (action === 'qr') {
      status = options.failQr ? 502 : 200;
      result = {
        status: 'not_logined',
        image: 'https://example.invalid/scan-fixture',
        event_id: 'fixture',
      };
    } else if (action === 'poll') {
      status = options.failPoll ? 502 : 200;
      result = {
        events: options.emptyPoll ? [] : [{ data: { token: 'proof-fixture' } }],
      };
    } else if (action === 'confirm') {
      expect(route.request().postDataJSON()).toEqual({
        proof: 'proof-fixture',
      });
      logged.add(id);
      status = options.failConfirm ? 502 : 200;
    } else if (action === 'profile')
      result = [
        { id: 1, token: options.missingToken ? '' : TEST_DEVICE_TOKEN },
      ];
    else if (action !== 'close') throw new Error('Unexpected endpoint');
    await route.fulfill({ status, json: result });
  });
  return calls;
}
export async function prepareAuthenticatedCommand(page: Page) {
  await mockInstallScan(page);
  await page.getByRole('tab', { name: /一键脚本/ }).click();
  await page
    .getByRole('button', { name: '扫码获取安装命令', exact: true })
    .click();
  await expect(page.locator('[data-scan-state=ready]')).toBeVisible();
}
