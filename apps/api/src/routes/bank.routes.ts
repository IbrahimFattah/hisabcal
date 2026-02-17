import { FastifyInstance } from 'fastify';
import { earnPointsSchema, withdrawPointsSchema } from '@calories-tracker/shared';
import { bankService } from '../services/bank.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

export async function bankRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/api/bank', async (request) => {
    const account = await bankService.getAccount(request.user!.userId);
    return { account };
  });

  app.get('/api/bank/transactions', async (request) => {
    const transactions = await bankService.getTransactions(request.user!.userId);
    return { transactions };
  });

  app.post('/api/bank/earn', {
    preHandler: [validate(earnPointsSchema)],
    handler: async (request) => {
      const result = await bankService.earnPoints(request.user!.userId, (request.body as any).date);
      return result;
    },
  });

  app.post('/api/bank/withdraw', {
    preHandler: [validate(withdrawPointsSchema)],
    handler: async (request) => {
      const result = await bankService.withdrawPoints(request.user!.userId, request.body as any);
      return result;
    },
  });
}
