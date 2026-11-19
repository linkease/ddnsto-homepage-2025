import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  workers: 4,
  use: { baseURL: 'http://127.0.0.1:16208' },
  webServer: {
    command: 'astro dev --host 127.0.0.1 --port 16208 --ignore-lock',
    url: 'http://127.0.0.1:16208',
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 7'], channel: 'chromium' },
    },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: { executablePath: process.env.M7_WEBKIT_EXECUTABLE },
      },
    },
    {
      name: 'webkit-mobile',
      use: {
        ...devices['iPhone 13'],
        launchOptions: { executablePath: process.env.M7_WEBKIT_EXECUTABLE },
      },
    },
  ],
});
