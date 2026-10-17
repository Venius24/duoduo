import { defineConfig, devices } from '@playwright/test'

const PORT = 3419

export default defineConfig({
  testDir: './e2e',
  // Один воркер: все тесты делят одну файловую SQLite-базу.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  // Dev-сервер компилирует маршруты при первом обращении, поэтому ожидания щедрые.
  expect: { timeout: 20_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node e2e/prepare-db.mjs && npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: 'file:./e2e.db',
      JWT_SECRET: 'e2e-only-secret-9d41c7a2b6f0e83d5a17',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  }
})
