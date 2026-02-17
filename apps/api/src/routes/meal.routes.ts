import { FastifyInstance } from 'fastify';
import { createMealSchema } from '@calories-tracker/shared';
import { mealService } from '../services/meal.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

export async function mealRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/api/meals', async (request) => {
    const { date } = request.query as { date: string };
    if (!date) {
      return { meals: [] };
    }
    const meals = await mealService.getMeals(request.user!.userId, date);
    return { meals };
  });

  app.post('/api/meals', {
    preHandler: [validate(createMealSchema)],
    handler: async (request, reply) => {
      const meal = await mealService.createMeal(request.user!.userId, request.body as any);
      return reply.status(201).send({ meal });
    },
  });

  app.delete('/api/meals/:id', async (request) => {
    const { id } = request.params as { id: string };
    return mealService.deleteMeal(request.user!.userId, id);
  });
}
