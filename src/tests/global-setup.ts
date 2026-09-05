import { execSync } from 'child_process'
import { rmSync } from 'fs'
import { fileURLToPath } from 'node:url'

const prismaDir = fileURLToPath(new URL('../../prisma', import.meta.url))

/**
 * Пересоздаёт изолированную тестовую БД перед прогоном.
 * Файл удаляется вручную, а не через `prisma db push --force-reset`,
 * чтобы не упираться в интерактивный confirm деструктивных команд Prisma.
 */
export default function globalSetup() {
  for (const f of ['test.db', 'test.db-journal']) {
    rmSync(`${prismaDir}/${f}`, { force: true })
  }
  execSync('npx prisma db push --skip-generate', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'inherit'
  })
}
