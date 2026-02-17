import { FastifyInstance } from 'fastify';
import { createFoodSchema } from '@calories-tracker/shared';
import { foodService } from '../services/food.service.js';
import { authenticate } from '../middleware/authenticate.js';
import { config } from '../config.js';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

export async function foodRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  app.get('/api/foods', async (request) => {
    const { search } = request.query as { search?: string };
    const foods = await foodService.listFoods(request.user!.userId, search);
    return { foods };
  });

  app.post('/api/foods', async (request, reply) => {
    let imageUrl: string | undefined;
    let parsedBody: any = {};

    const contentType = request.headers['content-type'] || '';
    if (contentType.includes('multipart')) {
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'image') {
          if (!ALLOWED_MIMES.includes(part.mimetype)) {
            return reply.status(400).send({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP' });
          }
          const ext = part.mimetype.split('/')[1] === 'jpeg' ? 'jpg' : part.mimetype.split('/')[1];
          const filename = `${randomUUID()}.${ext}`;
          const filepath = path.join(config.UPLOAD_DIR, filename);
          await fs.mkdir(config.UPLOAD_DIR, { recursive: true });
          const buffer = await part.toBuffer();
          if (buffer.length > config.MAX_FILE_SIZE) {
            return reply.status(400).send({ error: 'File too large. Max 5MB.' });
          }
          await fs.writeFile(filepath, buffer);
          imageUrl = `/uploads/${filename}`;
        } else if (part.type === 'field') {
          parsedBody[part.fieldname] = part.value;
        }
      }
      // Convert numeric fields
      if (parsedBody.caloriesPerServing) {
        parsedBody.caloriesPerServing = Number(parsedBody.caloriesPerServing);
      }
    } else {
      parsedBody = request.body;
    }

    const validated = createFoodSchema.parse(parsedBody);
    const food = await foodService.createFood(request.user!.userId, validated, imageUrl);
    return reply.status(201).send({ food });
  });

  app.put('/api/foods/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const food = await foodService.updateFood(request.user!.userId, id, request.body as any);
    return { food };
  });

  app.delete('/api/foods/:id', async (request) => {
    const { id } = request.params as { id: string };
    return foodService.deleteFood(request.user!.userId, id);
  });
}
