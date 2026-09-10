import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3100'
const localServer = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(baseURL)
const localPort = localServer ? new URL(baseURL).port || '3000' : ''
const authState = path.join(process.cwd(), 'playwright', '.auth', 'user.json')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 12_000 },
  outputDir: 'test-results',
  reporter: [['line']],
  use: {
    baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: localServer ? {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${localPort}`,
    url: baseURL,
    // Never attach audit runs to an unrelated/stale process that happens to own
    // the configured port. A clean server is part of the test boundary.
    reuseExistingServer: false,
    timeout: 120_000,
  } : undefined,
  projects: [
    {
      name: 'auth',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', headless: false },
    },
    {
      name: 'auth-public-audit',
      testMatch: /(^|[\\/])auth-public\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'auth-onboarding-audit',
      testMatch: /(^|[\\/])auth-(onboarding|logout)\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: authState },
    },
    {
      name: 'orientation',
      testMatch: /(^|[\\/])orientation\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: authState },
    },
    {
      name: 'camino-orientation',
      testMatch: /(^|[\\/])camino-orientation\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: authState },
    },
    {
      name: 'calendar-editor',
      testMatch: /(^|[\\/])calendar-editor\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: authState },
    },
    {
      name: 'camino-chat',
      testMatch: /(^|[\\/])camino-chat\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: authState },
    },
    {
      name: 'pricing-public',
      testMatch: /(^|[\\/])pricing\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'examenes',
      testMatch: /(^|[\\/])examenes\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: authState },
    },
    {
      name: 'simulacros',
      testMatch: /(^|[\\/])simulacros\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', storageState: authState },
    },
  ],
})
