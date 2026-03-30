import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx ng serve',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
