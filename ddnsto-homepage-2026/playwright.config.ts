import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { channel: 'chromium', baseURL: 'http://127.0.0.1:16208' },
  webServer: {
    command: 'astro dev --host 127.0.0.1 --port 16208 --ignore-lock',
    url: 'http://127.0.0.1:16208',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
