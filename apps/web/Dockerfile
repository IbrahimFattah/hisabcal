FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY . .
RUN npm install

# Build
FROM base AS builder
COPY --from=deps /app .

# Accept build-time env vars needed by Next.js
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Ensure public dir exists (Next.js doesn't require it, so it may be absent)
RUN mkdir -p /app/apps/web/public

WORKDIR /app/apps/web
RUN npm run build

# Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output (includes server.js at apps/web/server.js)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Copy static assets — must live next to server.js in standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy public assets — must live next to server.js in standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
