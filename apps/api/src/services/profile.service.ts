import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { ProfileInput, WeightLogInput, calculateTargetFromProfile, calculateAge } from '@calories-tracker/shared';

export class ProfileService {
  async getProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    return profile;
  }

  async upsertProfile(userId: string, input: ProfileInput) {
    const dob = new Date(input.dateOfBirth as string);
    const age = calculateAge(dob);

    const { dailyTarget } = calculateTargetFromProfile({
      weightKg: input.currentWeightKg,
      heightCm: input.heightCm,
      ageYears: age,
      gender: input.gender,
      activityLevel: input.activityLevel,
      goalPace: input.goalPace,
    });

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        heightCm: input.heightCm,
        currentWeightKg: input.currentWeightKg,
        goalWeightKg: input.goalWeightKg,
        activityLevel: input.activityLevel,
        goalPace: input.goalPace,
        gender: input.gender,
        dateOfBirth: dob,
        dailyTargetCalories: dailyTarget,
        weightHistory: [{ date: new Date().toISOString().split('T')[0], weightKg: input.currentWeightKg }],
      },
      update: {
        heightCm: input.heightCm,
        currentWeightKg: input.currentWeightKg,
        goalWeightKg: input.goalWeightKg,
        activityLevel: input.activityLevel,
        goalPace: input.goalPace,
        gender: input.gender,
        dateOfBirth: dob,
        dailyTargetCalories: dailyTarget,
      },
    });

    return profile;
  }

  async logWeight(userId: string, input: WeightLogInput) {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError(404, 'Profile not found. Complete onboarding first.', 'PROFILE_NOT_FOUND');
    }

    const date = input.date || new Date().toISOString().split('T')[0];
    const history = (profile.weightHistory as Array<{ date: string; weightKg: number }>) || [];
    history.push({ date, weightKg: input.weightKg });

    // Recalculate target with new weight
    const age = calculateAge(profile.dateOfBirth);
    const { dailyTarget } = calculateTargetFromProfile({
      weightKg: input.weightKg,
      heightCm: profile.heightCm,
      ageYears: age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      goalPace: profile.goalPace,
    });

    const updated = await prisma.userProfile.update({
      where: { userId },
      data: {
        currentWeightKg: input.weightKg,
        dailyTargetCalories: dailyTarget,
        weightHistory: history,
      },
    });

    return updated;
  }
}

export const profileService = new ProfileService();
