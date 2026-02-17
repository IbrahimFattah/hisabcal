import { z } from 'zod';

export const updateSettingsSchema = z.object({
  pointsPerCalorie: z.number().min(0.01).max(10).optional(),
  maxDailyEarnPoints: z.number().min(10).max(10000).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
