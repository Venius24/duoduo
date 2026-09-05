#!/usr/bin/env node
/**
 * Переключает провайдер БД в prisma/schema.prisma.
 *
 * Зачем: Prisma не принимает провайдер из переменной окружения, а для
 * деплоя нужны оба варианта — SQLite (файл, локально и на своём сервере)
 * и PostgreSQL (Vercel, Railway, Neon и любой другой хостинг с эфемерной
 * файловой системой, где файловая БД просто теряется между запусками).
 *
 * Провайдер берётся из DATABASE_PROVIDER, а если её нет — выводится из
 * схемы DATABASE_URL, чтобы в типовом случае ничего настраивать не пришлось.
 *
 * Использование:
 *   node scripts/set-db-provider.mjs            # автоопределение
 *   node scripts/set-db-provider.mjs postgresql # явно
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SCHEMA = fileURLToPath(new URL('../prisma/schema.prisma', import.meta.url))
const SUPPORTED = ['sqlite', 'postgresql']

function detect() {
  const explicit = (process.argv[2] || process.env.DATABASE_PROVIDER || '').trim()
  if (explicit) return explicit === 'postgres' ? 'postgresql' : explicit

  const url = (process.env.DATABASE_URL || '').trim()
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'postgresql'
  return 'sqlite'
}

const provider = detect()

if (!SUPPORTED.includes(provider)) {
  console.error(`Неизвестный провайдер «${provider}». Поддерживаются: ${SUPPORTED.join(', ')}.`)
  process.exit(1)
}

const schema = readFileSync(SCHEMA, 'utf8')
const next = schema.replace(/(datasource\s+db\s*\{[^}]*?provider\s*=\s*)"[^"]+"/s, `$1"${provider}"`)

if (next === schema) {
  console.log(`Провайдер БД уже «${provider}» — схема не изменена.`)
} else {
  writeFileSync(SCHEMA, next)
  console.log(`Провайдер БД переключён на «${provider}».`)
}
