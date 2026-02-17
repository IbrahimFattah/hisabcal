import { z } from 'zod';

export const createPotSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  targetCalories: z.number().min(100, 'Minimum 100 calories').max(100000),
  dueDate: z.string(),
});

export const allocateToPotSchema = z.object({
  points: z.number().min(1, 'Must allocate at least 1 point'),
});

export const redeemPotSchema = z.object({
  date: z.string().optional(), // defaults to today
});

export type CreatePotInput = z.infer<typeof createPotSchema>;
export type AllocateToPotInput = z.infer<typeof allocateToPotSchema>;
export type RedeemPotInput = z.infer<typeof redeemPotSchema>;
