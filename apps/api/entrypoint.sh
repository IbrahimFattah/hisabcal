#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Running database seed..."
npx tsx prisma/seed.ts || echo "⚠️  Seed may have already run (continuing)"

echo "🚀 Starting API server..."
exec "$@"
