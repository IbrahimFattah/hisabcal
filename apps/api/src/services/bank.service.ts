import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { calculateEarnedPoints, pointsToCalories, WithdrawPointsInput } from '@calories-tracker/shared';

export class BankService {
  async getAccount(userId: string) {
    let account = await prisma.bankAccount.findUnique({ where: { userId } });
    if (!account) {
      account = await prisma.bankAccount.create({ data: { userId } });
    }
    return account;
  }

  async getTransactions(userId: string, limit = 50) {
    const account = await this.getAccount(userId);
    return prisma.bankTransaction.findMany({
      where: { bankAccountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { pot: { select: { id: true, title: true } } },
    });
  }

  async earnPoints(userId: string, date: string) {
    // Get user settings
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) throw new AppError(400, 'Settings not configured');

    // Get profile for daily target
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(400, 'Profile not configured');

    // Calculate consumed calories for the date
    const meals = await prisma.mealEntry.findMany({
      where: { userId, date: new Date(date) },
      include: { items: true },
    });
    const consumed = meals.reduce((total, meal) =>
      total + meal.items.reduce((sum, item) => sum + item.computedCalories, 0), 0);

    // Check if already earned for this date
    const account = await this.getAccount(userId);
    const existingEarn = await prisma.bankTransaction.findFirst({
      where: {
        bankAccountId: account.id,
        type: 'EARN',
        note: { contains: date },
      },
    });
    if (existingEarn) {
      throw new AppError(400, 'Already earned points for this date');
    }

    const { leftoverCalories, earnedPoints } = calculateEarnedPoints(
      consumed,
      profile.dailyTargetCalories,
      settings.pointsPerCalorie,
      settings.maxDailyEarnPoints
    );

    if (earnedPoints <= 0) {
      throw new AppError(400, 'No leftover calories to earn points from');
    }

    // Create transaction and update balance
    const caloriesEquivalent = pointsToCalories(earnedPoints, settings.pointsPerCalorie);

    const [transaction] = await prisma.$transaction([
      prisma.bankTransaction.create({
        data: {
          bankAccountId: account.id,
          type: 'EARN',
          points: earnedPoints,
          caloriesEquivalent,
          note: `Earned from ${date} (${leftoverCalories} cal leftover)`,
        },
      }),
      prisma.bankAccount.update({
        where: { id: account.id },
        data: { pointsBalance: { increment: earnedPoints } },
      }),
    ]);

    return {
      transaction,
      leftoverCalories,
      earnedPoints,
      newBalance: account.pointsBalance + earnedPoints,
    };
  }

  async withdrawPoints(userId: string, input: WithdrawPointsInput) {
    const account = await this.getAccount(userId);
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) throw new AppError(400, 'Settings not configured');

    if (input.points > account.pointsBalance) {
      throw new AppError(400, `Insufficient balance. Available: ${account.pointsBalance} points`);
    }

    const caloriesEquivalent = pointsToCalories(input.points, settings.pointsPerCalorie);

    const [transaction] = await prisma.$transaction([
      prisma.bankTransaction.create({
        data: {
          bankAccountId: account.id,
          type: 'WITHDRAW',
          points: input.points,
          caloriesEquivalent,
          note: input.note || 'Withdrawal for extra allowance',
        },
      }),
      prisma.bankAccount.update({
        where: { id: account.id },
        data: { pointsBalance: { decrement: input.points } },
      }),
    ]);

    return {
      transaction,
      caloriesEquivalent,
      newBalance: account.pointsBalance - input.points,
    };
  }
}

export const bankService = new BankService();
