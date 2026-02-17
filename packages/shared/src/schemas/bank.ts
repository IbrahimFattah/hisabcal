import { z } from 'zod';

export const earnPointsSchema = z.object({
  date: z.string(), // The date to earn points for (YYYY-MM-DD)
});

export const withdrawPointsSchema = z.object({
  points: z.number().min(1, 'Must withdraw at least 1 point'),
  note: z.string().max(200).optional(),
});

export type EarnPointsInput = z.infer<typeof earnPointsSchema>;
export type WithdrawPointsInput = z.infer<typeof withdrawPointsSchema>;
