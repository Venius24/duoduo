#!/bin/sh
# Старт контейнера: проверить конфигурацию, привести схему БД, при первом
# запуске засеять демо-данные, затем отдать управление серверу Next.
set -e

# Стартовые инструменты лежат в boot_modules отдельным деревом: npx здесь
# использовать нельзя — он полез бы в сеть за пакетом.
PRISMA="./boot_modules/prisma/build/index.js"
TSX="./boot_modules/tsx/dist/cli.mjs"

if [ -z "$JWT_SECRET" ]; then
  echo "ОШИБКА: переменная JWT_SECRET не задана — приложение не стартует."
  echo "Сгенерируй значение и передай его контейнеру:"
  echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  exit 1
fi

for tool in "$PRISMA" "$TSX"; do
  if [ ! -f "$tool" ]; then
    echo "ОШИБКА: в образе нет $tool — стадия bootdeps собралась неверно."
    exit 1
  fi
done

echo "→ Определяю провайдер БД"
node scripts/set-db-provider.mjs

echo "→ Применяю схему БД"
node "$PRISMA" db push --skip-generate

# Сид идемпотентен (upsert по email), но гонять его на каждом рестарте
# незачем — метка на томе включает посев только для пустой базы.
if [ -f /app/data/.seeded ]; then
  echo "→ База уже засеяна, пропускаю посев"
else
  echo "→ Первый запуск: заполняю демо-данными"
  node "$TSX" prisma/seed.ts
  touch /app/data/.seeded
fi

echo "→ Дуодуо слушает порт ${PORT:-3000}"
exec node server.js
