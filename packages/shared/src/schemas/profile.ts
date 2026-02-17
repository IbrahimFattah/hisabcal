import { z } from 'zod';

export const activityLevelEnum = z.enum([
  'SEDENTARY',
  'LIGHT',
  'MODERATE',
  'ACTIVE',
  'VERY_ACTIVE',
]);

export const goalPaceEnum = z.enum(['SLOW', 'NORMAL', 'FAST']);
export const genderEnum = z.enum(['MALE', 'FEMALE']);

export const profileSchema = z.object({
  heightCm: z.number().min(50).max(300),
  currentWeightKg: z.number().min(20).max(500),
  goalWeightKg: z.number().min(20).max(500),
  activityLevel: activityLevelEnum,
  goalPace: goalPaceEnum,
  gender: genderEnum,
  dateOfBirth: z.string().or(z.date()),
});

export const weightLogSchema = z.object({
  weightKg: z.number().min(20).max(500),
  date: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type WeightLogInput = z.infer<typeof weightLogSchema>;
