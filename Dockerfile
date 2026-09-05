FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p /app/data && npx prisma db push --skip-generate && npm run db:seed && npm run start"]
