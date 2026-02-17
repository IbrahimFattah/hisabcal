import { z } from 'zod';

export const createFoodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  caloriesPerServing: z.number().min(0).max(10000),
  servingLabel: z.string().max(100).optional(),
});

export const updateFoodSchema = createFoodSchema.partial();

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;
