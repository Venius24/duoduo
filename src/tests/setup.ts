// Всегда та же БД, которую пересоздаёт global-setup.ts: DATABASE_URL из
// окружения (например, в CI) иначе уводит тесты в пустую базу без таблиц.
process.env.DATABASE_URL = 'file:./test.db'
process.env.JWT_SECRET = 'test-secret-for-vitest-only'
