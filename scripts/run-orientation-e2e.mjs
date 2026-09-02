import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const authState = path.join(root, 'playwright', '.auth', 'user.json')
const playwrightCli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js')
const missingSession = 'Sesión E2E caducada. Ejecuta npm run e2e:auth'

try {
  const state = JSON.parse(fs.readFileSync(authState, 'utf8'))
  if (!Array.isArray(state.origins) || state.origins.length === 0) throw new Error('empty state')
} catch {
  console.error(missingSession)
  process.exit(1)
}

const result = spawnSync(process.execPath, [playwrightCli, 'test', '--project=orientation'], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
