import { defineConfig, devices } from '@playwright/test';

const PORTA = 4173;
const BASE = `http://127.0.0.1:${PORTA}`;

// Permite apontar para um Chromium ja instalado (CI ou container sem download).
const executavel = process.env.PW_CHROMIUM;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // o teste de ordenacao de eventos observa uma janela real de rede
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...(executavel ? { launchOptions: { executablePath: executavel } } : {}),
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --host 127.0.0.1',
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
