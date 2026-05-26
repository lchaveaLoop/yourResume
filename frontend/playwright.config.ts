import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/system',
  snapshotDir: './tests/system/__screenshots__',
  globalSetup: './tests/system/global-setup.ts',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:6173',
    acceptDownloads: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
