import { FastifyInstance } from 'fastify';
import { gamificationService } from '../services/gamification.service.js';
import { authenticate } from '../middleware/authenticate.js';

export async function achievementRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/api/achievements', async (request) => {
    const achievements = await gamificationService.getAchievements(request.user!.userId);
    return { achievements };
  });

  app.get('/api/xp', async (request) => {
    const xp = await gamificationService.getXP(request.user!.userId);
    return { xp };
  });
}
