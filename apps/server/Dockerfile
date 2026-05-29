FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/knexfile.js ./
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/seeds ./seeds
RUN npm ci --only=production
EXPOSE 4000
CMD ["sh", "-c", "npx knex migrate:latest && node dist/index.js"]
