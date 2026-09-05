#!/usr/bin/env node
/** Печатает готовую строку JWT_SECRET (32 случайных байта в hex). */
import { randomBytes } from 'node:crypto'

const secret = randomBytes(32).toString('hex')
console.log(`JWT_SECRET="${secret}"`)
