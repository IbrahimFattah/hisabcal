import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { foodRoutes } from './routes/food.routes.js';
import { mealRoutes } from './routes/meal.routes.js';
import { bankRoutes } from './routes/bank.routes.js';
import { potRoutes } from './routes/pot.routes.js';
import { achievementRoutes } from './routes/achievement.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildApp() {
  const app = Fastify({
    logger: false, // We use our own pino instance
  });

  // Plugins
  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(cookie, {
    secret: config.JWT_SECRET,
  });

  await app.register(multipart, {
    limits: {
      fileSize: config.MAX_FILE_SIZE,
    },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: [],
  });

  // Serve uploaded files
  const uploadsDir = path.resolve(config.UPLOAD_DIR);
  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Rate limit auth routes more aggressively
  await app.register(async function authRateLimited(instance) {
    await instance.register(rateLimit, {
      max: 10,
      timeWindow: '1 minute',
      keyGenerator: (request) => request.ip,
    });
    await instance.register(authRoutes);
  });

  // Register routes
  await app.register(profileRoutes);
  await app.register(foodRoutes);
  await app.register(mealRoutes);
  await app.register(bankRoutes);
  await app.register(potRoutes);
  await app.register(achievementRoutes);
  await app.register(settingsRoutes);

  // Health check
  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: config.API_PORT, host: config.API_HOST });
    logger.info(`🚀 API server running on http://${config.API_HOST}:${config.API_PORT}`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

start();
