import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/system',
  snapshotDir: './tests/system/__screenshots__',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:6173',
    acceptDownloads: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 6173 --strictPort',
    url: 'http://127.0.0.1:6173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
