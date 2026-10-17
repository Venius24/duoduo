# syntax=docker/dockerfile:1

# ─── 1. зависимости для сборки ─────────────────────────────────────────────
FROM node:25-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# ─── 2. сборка приложения ──────────────────────────────────────────────────
FROM node:25-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Сборке нужен непустой JWT_SECRET: prerender дёргает код, который в
# продакшене отказывается работать с дефолтным значением. Настоящий секрет
# приходит в рантайме из окружения и в образ не попадает.
ENV JWT_SECRET="build-time-placeholder-9c41f7ab2e5d0863"
ENV DATABASE_URL="file:/tmp/build.db"
RUN node scripts/set-db-provider.mjs \
 && npx prisma generate \
 && npx next build

# ─── 3. зависимости для стартовых задач ────────────────────────────────────
# Контейнеру при старте нужны prisma CLI (применить схему) и tsx (посев).
# Отдельная стадия вместо копирования кусков node_modules: у prisma есть
# @prisma/engines, у tsx — esbuild, и выборочное копирование ломает запуск.
FROM node:25-alpine AS bootdeps
WORKDIR /boot
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev --no-audit --no-fund --ignore-scripts \
 && npm install --no-save --no-audit --no-fund \
      "prisma@$(node -p "require('./package.json').devDependencies.prisma")" \
      "tsx@$(node -p "require('./package.json').devDependencies.tsx")" \
 && npx prisma generate \
 && npm cache clean --force

# ─── 4. рантайм ────────────────────────────────────────────────────────────
FROM node:25-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# standalone содержит сервер и только те модули, что нужны в рантайме
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Дерево для стартовых задач лежит отдельно, чтобы не перетирать
# выверенный next-ом node_modules приложения.
COPY --from=bootdeps --chown=nextjs:nodejs /boot/node_modules ./boot_modules

COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh \
 && mkdir -p /app/data \
 && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
