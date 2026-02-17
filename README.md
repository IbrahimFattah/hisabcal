# HisabCal - Calorie Banking System

A production-grade calorie tracker web app with gamified "calorie banking" that lets you save calories as points and spend them on special occasions.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: Fastify + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT in httpOnly cookies
- **File Storage**: Local uploads with validation
- **Deployment**: Docker Compose

## Quick Start (Docker)

The fastest way to run the app:

```bash
# 1. Clone and enter the project
cd calories-tracker-app-2

# 2. Start everything with Docker
docker compose up --build
```

This starts:
- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **PostgreSQL**: localhost:5432

The API container automatically runs Prisma migrations and seeds the database on startup.

## Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (running locally or via Docker)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example apps/api/.env
# Edit apps/api/.env with your database URL

# 3. Start PostgreSQL (if using Docker for DB only)
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=calories_tracker \
  postgres:15-alpine

# 4. Run database migrations
cd apps/api
npx prisma migrate dev --name init
npx prisma generate

# 5. Seed the database
npx tsx prisma/seed.ts

# 6. Start both servers (from root)
cd ../..
npm run dev
```

The app will be available at:
- **Web**: http://localhost:3000
- **API**: http://localhost:4000

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/calories_tracker` |
| `JWT_SECRET` | Secret for JWT token signing (min 16 chars) | - |
| `API_PORT` | API server port | `4000` |
| `API_HOST` | API server host | `0.0.0.0` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `UPLOAD_DIR` | Directory for uploaded images | `./uploads` |
| `MAX_FILE_SIZE` | Max upload file size in bytes | `5242880` (5MB) |
| `NODE_ENV` | Environment | `development` |
| `NEXT_PUBLIC_API_URL` | API URL for Next.js | `http://localhost:4000` |

## Project Structure

```
calories-tracker-app-2/
├── docker-compose.yml          # Full deployment
├── packages/
│   └── shared/                 # Shared schemas, types, calculations
│       └── src/
│           ├── schemas/        # Zod validation schemas
│           ├── constants.ts    # Enums, XP rewards, achievements
│           └── calculations.ts # BMR, TDEE, points conversion
├── apps/
│   ├── api/                    # Fastify backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database models
│   │   │   └── seed.ts         # 45 predefined foods + achievements
│   │   └── src/
│   │       ├── routes/         # API route handlers
│   │       ├── services/       # Business logic
│   │       ├── middleware/     # Auth, validation, error handling
│   │       └── lib/           # Prisma client, logger
│   └── web/                    # Next.js frontend
│       └── src/
│           ├── app/           # App Router pages
│           ├── components/    # UI components
│           ├── lib/           # API client, utilities
│           └── providers/     # Auth, Toast providers
```

## Features

### Calorie Tracking
- 45+ predefined food items
- Custom food creation with photo upload
- Daily meal logging (breakfast, lunch, dinner, snacks)
- Real-time calorie tracking vs. target

### Calorie Banking
- Earn points when eating under daily target
- Configurable conversion rate (default: 1 point = 10 calories)
- Withdraw points on free days for extra allowance
- Daily earn cap (default: 300 points/day)
- Full transaction history

### Special Occasion Pots
- Create savings pots with target calories and due dates
- Allocate bank points to specific pots
- Track progress with suggested daily saving rates
- Redeem pots for extra calories on occasion day

### Gamification
- XP system with leveling
- Logging streaks
- 10 achievements to unlock
- Dashboard with progress visualization

### Smart Calculations
- BMR via Mifflin-St Jeor equation
- TDEE with activity multipliers
- Configurable deficit based on goal pace
- Automatic recalculation on weight updates

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/weight` | Log weight |
| GET | `/api/foods` | List foods |
| POST | `/api/foods` | Create food (multipart) |
| GET | `/api/meals?date=` | Get meals by date |
| POST | `/api/meals` | Create meal |
| DELETE | `/api/meals/:id` | Delete meal |
| GET | `/api/bank` | Get bank account |
| GET | `/api/bank/transactions` | List transactions |
| POST | `/api/bank/earn` | Earn points |
| POST | `/api/bank/withdraw` | Withdraw points |
| GET | `/api/pots` | List pots |
| POST | `/api/pots` | Create pot |
| POST | `/api/pots/:id/allocate` | Allocate to pot |
| POST | `/api/pots/:id/redeem` | Redeem pot |
| DELETE | `/api/pots/:id` | Delete pot |
| GET | `/api/achievements` | List achievements |
| GET | `/api/xp` | Get XP/level |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |

## Running Tests

```bash
cd apps/api
npm test
```

Tests cover:
- BMR/TDEE calculations
- Daily target with deficit
- Points/calories conversion
- Earn/withdraw logic with caps
- Pot progress and saving rates
- Leveling system

## NEXT STEPS

Future enhancements planned:

1. **AI Calorie Estimation from Photos** - Use vision AI to estimate calories from food photos
2. **Macronutrient Tracking** - Track protein, carbs, and fat alongside calories
3. **Barcode Scanning** - Scan food barcodes to auto-fill nutrition data
4. **Cloud Storage + CDN** - Move image uploads to S3/R2 with CloudFront/CDN
5. **Mobile App** - React Native or Flutter app using the same API
6. **Social Features** - Friends, challenges, and leaderboards
7. **Advanced Analytics** - Weekly/monthly trends, weight projection charts
8. **Meal Planning** - Plan meals in advance, auto-calculate daily targets
9. **Push Notifications** - Meal reminders, streak warnings
10. **Export Data** - CSV/PDF export of logs and progress
