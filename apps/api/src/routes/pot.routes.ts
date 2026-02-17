import { FastifyInstance } from 'fastify';
import { createPotSchema, allocateToPotSchema } from '@calories-tracker/shared';
import { potService } from '../services/pot.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

export async function potRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/api/pots', async (request) => {
    const pots = await potService.listPots(request.user!.userId);
    return { pots };
  });

  app.post('/api/pots', {
    preHandler: [validate(createPotSchema)],
    handler: async (request, reply) => {
      const pot = await potService.createPot(request.user!.userId, request.body as any);
      return reply.status(201).send({ pot });
    },
  });

  app.post('/api/pots/:id/allocate', {
    preHandler: [validate(allocateToPotSchema)],
    handler: async (request) => {
      const { id } = request.params as { id: string };
      const { points } = request.body as { points: number };
      return potService.allocateToPot(request.user!.userId, id, points);
    },
  });

  app.post('/api/pots/:id/redeem', async (request) => {
    const { id } = request.params as { id: string };
    return potService.redeemPot(request.user!.userId, id);
  });

  app.delete('/api/pots/:id', async (request) => {
    const { id } = request.params as { id: string };
    return potService.deletePot(request.user!.userId, id);
  });
}
