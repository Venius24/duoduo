process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db'
process.env.JWT_SECRET = 'test-secret-for-vitest-only'
