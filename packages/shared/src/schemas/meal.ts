import { z } from 'zod';

export const mealTypeEnum = z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']);

export const mealEntryItemSchema = z.object({
  foodItemId: z.string(),
  servings: z.number().min(0.1).max(100),
});

export const createMealSchema = z.object({
  date: z.string(),
  mealType: mealTypeEnum,
  items: z.array(mealEntryItemSchema).min(1, 'At least one food item is required'),
});

export type MealEntryItemInput = z.infer<typeof mealEntryItemSchema>;
export type CreateMealInput = z.infer<typeof createMealSchema>;
