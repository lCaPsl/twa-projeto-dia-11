#!/usr/bin/env node
/**
 * Ensure client node_modules (esp. vite) exist before npm run scripts.
 * Safe to run repeatedly; exits 0 when ready.
 */
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const clientRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const vitePkg = join(clientRoot, 'node_modules', 'vite', 'package.json')
const vuePkg = join(clientRoot, 'node_modules', 'vue', 'package.json')
const pluginPkg = join(clientRoot, 'node_modules', '@vitejs', 'plugin-vue', 'package.json')
const viteBinWin = join(clientRoot, 'node_modules', '.bin', 'vite.cmd')
const viteBinUnix = join(clientRoot, 'node_modules', '.bin', 'vite')

function ready() {
  const hasVite =
    existsSync(vitePkg) && (existsSync(viteBinWin) || existsSync(viteBinUnix))
  return hasVite && existsSync(vuePkg) && existsSync(pluginPkg)
}

if (ready()) {
  process.exit(0)
}

console.log('Missing client dependencies — running npm install…')
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(npmCmd, ['install'], {
  cwd: clientRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
})

if (result.status !== 0) {
  console.error('npm install failed; cannot start without vite/vue.')
  process.exit(result.status ?? 1)
}

if (!ready()) {
  console.error('Dependencies still incomplete after npm install (vite/vue/@vitejs/plugin-vue).')
  process.exit(1)
}

process.exit(0)
