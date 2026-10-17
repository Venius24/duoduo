// Свежая изолированная БД на каждый прогон; dev-база не затрагивается.
// Запускается перед сервером (webServer.command), а не в globalSetup:
// Playwright поднимает сервер раньше globalSetup, и на Windows открытый
// сервером файл БД уже нельзя удалить.
import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const prismaDir = fileURLToPath(new URL('../prisma', import.meta.url))
for (const f of ['e2e.db', 'e2e.db-journal']) rmSync(`${prismaDir}/${f}`, { force: true })
execSync('npx prisma db push --skip-generate', {
  env: { ...process.env, DATABASE_URL: 'file:./e2e.db' },
  stdio: 'inherit'
})
