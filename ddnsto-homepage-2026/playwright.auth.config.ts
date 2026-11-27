import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/auth',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:16217',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  webServer: {
    command:
      'INSTALL_AUTH_CHECK=1 astro dev --host 127.0.0.1 --port 16217 --ignore-lock',
    url: 'http://127.0.0.1:16217/__install-auth/',
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'], channel: 'chromium' },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
