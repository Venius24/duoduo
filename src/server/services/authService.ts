import bcrypt from 'bcryptjs'
import { db } from '../db'

export class AuthError extends Error {
  constructor(public code: string) {
    super(code)
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email: string) {
  if (!EMAIL_RE.test(email)) throw new AuthError('BAD_EMAIL')
}

function validatePassword(password: string) {
  if (password.length < 6 || password.length > 72) throw new AuthError('BAD_PASSWORD')
}

export async function registerUser(email: string, name: string, password: string, color: string) {
  validateEmail(email)
  if (name.trim().length < 2) throw new AuthError('BAD_NAME')
  validatePassword(password)
  const exists = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  if (exists) throw new AuthError('EMAIL_TAKEN')
  const passwordHash = await bcrypt.hash(password, 10)
  return db.user.create({
    data: { email: email.toLowerCase(), name: name.trim().slice(0, 24), passwordHash, color }
  })
}

export async function loginUser(email: string, password: string) {
  validateEmail(email)
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) throw new AuthError('BAD_CREDENTIALS')
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw new AuthError('BAD_CREDENTIALS')
  return user
}
