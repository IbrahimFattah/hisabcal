import { prisma } from '../lib/prisma.js';
import { XP_REWARDS, calculateLevel } from '@calories-tracker/shared';

export class GamificationService {
  async addXP(userId: string, amount: number, reason?: string) {
    const xp = await prisma.userXP.upsert({
      where: { userId },
      create: { userId, totalXp: amount, level: calculateLevel(amount) },
      update: {
        totalXp: { increment: amount },
      },
    });

    // Recalculate level
    const newLevel = calculateLevel(xp.totalXp);
    if (newLevel !== xp.level) {
      await prisma.userXP.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    // Check level achievements
    await this.checkLevelAchievements(userId, newLevel);

    return { totalXp: xp.totalXp, level: newLevel };
  }

  async updateStreak(userId: string, date: string) {
    const xp = await prisma.userXP.findUnique({ where: { userId } });
    if (!xp) return;

    const today = new Date(date);
    const lastLog = xp.lastLogDate ? new Date(xp.lastLogDate) : null;

    let newStreak = 1;
    if (lastLog) {
      const diffDays = Math.floor((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = xp.currentStreak + 1;
      } else if (diffDays === 0) {
        newStreak = xp.currentStreak; // same day, keep streak
      }
    }

    const longestStreak = Math.max(xp.longestStreak, newStreak);

    await prisma.userXP.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastLogDate: today,
      },
    });

    // Streak bonus XP
    if (newStreak > 1) {
      await this.addXP(userId, XP_REWARDS.STREAK_BONUS_PER_DAY * newStreak);
    }

    // Check streak achievements
    if (newStreak >= 7) await this.grantAchievement(userId, 'WEEK_WARRIOR');
    if (newStreak >= 30) await this.grantAchievement(userId, 'MONTH_MASTER');

    return { currentStreak: newStreak, longestStreak };
  }

  async grantAchievement(userId: string, achievementKey: string) {
    const achievement = await prisma.achievement.findUnique({ where: { key: achievementKey } });
    if (!achievement) return null;

    // Check if already earned
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    if (existing) return null;

    const ua = await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });

    // Award XP for achievement
    await this.addXP(userId, achievement.xpReward);

    return ua;
  }

  async checkLevelAchievements(userId: string, level: number) {
    if (level >= 5) await this.grantAchievement(userId, 'LEVEL_5');
    if (level >= 10) await this.grantAchievement(userId, 'LEVEL_10');
  }

  async getXP(userId: string) {
    return prisma.userXP.findUnique({ where: { userId } });
  }

  async getAchievements(userId: string) {
    const all = await prisma.achievement.findMany();
    const earned = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    });
    const earnedKeys = new Set(earned.map((e) => e.achievement.key));

    return all.map((a) => ({
      ...a,
      earned: earnedKeys.has(a.key),
      earnedAt: earned.find((e) => e.achievementId === a.id)?.earnedAt || null,
    }));
  }
}

export const gamificationService = new GamificationService();
