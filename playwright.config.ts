import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL?.trim() || 'https://staging.resolvajato.com.br';

const cfAccessHeaders: Record<string, string> = {};
const cfClientId = process.env.E2E_CF_ACCESS_CLIENT_ID?.trim();
const cfClientSecret = process.env.E2E_CF_ACCESS_CLIENT_SECRET?.trim();
const browserExecutable = process.env.E2E_BROWSER_EXECUTABLE?.trim();
if (cfClientId && cfClientSecret) {
  cfAccessHeaders['CF-Access-Client-Id'] = cfClientId;
  cfAccessHeaders['CF-Access-Client-Secret'] = cfClientSecret;
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['github']]
    : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.E2E_NO_VIDEO === '1' ? 'off' : 'retain-on-failure',
    extraHTTPHeaders: cfAccessHeaders,
    ...(browserExecutable ? { launchOptions: { executablePath: browserExecutable } } : {}),
    ...devices['Desktop Chrome']
  },
  outputDir: 'test-results'
});
