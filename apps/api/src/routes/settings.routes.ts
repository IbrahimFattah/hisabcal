import { FastifyInstance } from 'fastify';
import { updateSettingsSchema } from '@calories-tracker/shared';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../lib/prisma.js';

export async function settingsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/api/settings', async (request) => {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: request.user!.userId },
    });
    return { settings };
  });

  app.put('/api/settings', {
    preHandler: [validate(updateSettingsSchema)],
    handler: async (request) => {
      const settings = await prisma.userSettings.upsert({
        where: { userId: request.user!.userId },
        create: { userId: request.user!.userId, ...(request.body as any) },
        update: request.body as any,
      });
      return { settings };
    },
  });
}
