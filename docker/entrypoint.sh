#!/bin/sh
# Старт контейнера: проверить конфигурацию, привести схему БД, при первом
# запуске засеять демо-данные, затем отдать управление серверу Next.
#
# Prisma и tsx вызываются по прямым путям, а не через npx: в standalone-образе
# нет node_modules/.bin, а npx полез бы в сеть за пакетом.
set -e

PRISMA="node ./node_modules/prisma/build/index.js"
TSX="node ./node_modules/tsx/dist/cli.mjs"

if [ -z "$JWT_SECRET" ]; then
  echo "ОШИБКА: переменная JWT_SECRET не задана — приложение не стартует."
  echo "Сгенерируй значение и передай его контейнеру:"
  echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  exit 1
fi

echo "→ Провайдер БД"
node scripts/set-db-provider.mjs

echo "→ Применяю схему БД"
$PRISMA db push --skip-generate

# Сид идемпотентен (upsert по email), но гонять его на каждом рестарте
# незачем — метка на томе включает его только для пустой базы.
if [ -f /app/data/.seeded ]; then
  echo "→ База уже засеяна, пропускаю сид"
else
  echo "→ Первый запуск: заполняю демо-данными"
  $TSX prisma/seed.ts
  touch /app/data/.seeded
fi

echo "→ Дуодуо слушает порт ${PORT:-3000}"
exec node server.js
