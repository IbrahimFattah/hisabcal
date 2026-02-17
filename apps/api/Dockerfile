FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json ./apps/api/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Copy root package.json for workspaces
COPY package.json ./package.json

# Need full monorepo context for workspaces
COPY . .
RUN npm install

# Generate prisma
RUN cd apps/api && npx prisma generate

# Build
FROM base AS runner
COPY --from=deps /app .

WORKDIR /app/apps/api

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 4000

# Entrypoint script for migrations and seeding
COPY apps/api/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["npx", "tsx", "src/index.ts"]
