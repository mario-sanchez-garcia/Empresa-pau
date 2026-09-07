import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const playwrightCli = fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url))
const child = spawn(process.execPath, [playwrightCli, 'test', '--project=auth', '--headed'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    E2E_BASE_URL: process.env.E2E_AUTH_BASE_URL ?? 'https://kairo-pau.com',
    E2E_STORAGE_ORIGIN: process.env.E2E_STORAGE_ORIGIN ?? 'http://127.0.0.1:3000',
  },
  stdio: 'inherit',
})

child.on('exit', code => process.exit(code ?? 1))
child.on('error', error => {
  console.error('No se pudo abrir el navegador de autenticación:', error.message)
  process.exit(1)
})
