import { FastifyInstance } from 'fastify';
import { profileSchema, weightLogSchema } from '@calories-tracker/shared';
import { profileService } from '../services/profile.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

export async function profileRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/api/profile', async (request) => {
    const profile = await profileService.getProfile(request.user!.userId);
    return { profile };
  });

  app.put('/api/profile', {
    preHandler: [validate(profileSchema)],
    handler: async (request) => {
      const profile = await profileService.upsertProfile(request.user!.userId, request.body as any);
      return { profile };
    },
  });

  app.post('/api/profile/weight', {
    preHandler: [validate(weightLogSchema)],
    handler: async (request) => {
      const profile = await profileService.logWeight(request.user!.userId, request.body as any);
      return { profile };
    },
  });
}
