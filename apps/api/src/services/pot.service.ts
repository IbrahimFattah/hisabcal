import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreatePotInput, pointsToCalories, calculatePotProgress, calculateDailySavingRate } from '@calories-tracker/shared';

export class PotService {
  async listPots(userId: string) {
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const pointsPerCalorie = settings?.pointsPerCalorie || 0.1;

    const pots = await prisma.pot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return pots.map((pot) => {
      const progress = calculatePotProgress(pot.savedPoints, pot.targetCalories, pointsPerCalorie);
      const savingRate = calculateDailySavingRate(progress.remaining, pot.dueDate, pointsPerCalorie);
      return { ...pot, ...progress, ...savingRate };
    });
  }

  async createPot(userId: string, input: CreatePotInput) {
    return prisma.pot.create({
      data: {
        userId,
        title: input.title,
        targetCalories: input.targetCalories,
        dueDate: new Date(input.dueDate),
      },
    });
  }

  async allocateToPot(userId: string, potId: string, points: number) {
    const pot = await prisma.pot.findUnique({ where: { id: potId } });
    if (!pot) throw new AppError(404, 'Pot not found');
    if (pot.userId !== userId) throw new AppError(403, 'Not authorized');
    if (pot.isRedeemed) throw new AppError(400, 'Pot already redeemed');

    const account = await prisma.bankAccount.findUnique({ where: { userId } });
    if (!account) throw new AppError(400, 'Bank account not found');
    if (points > account.pointsBalance) {
      throw new AppError(400, 'Insufficient bank balance');
    }

    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const pointsPerCalorie = settings?.pointsPerCalorie || 0.1;
    const caloriesEquivalent = pointsToCalories(points, pointsPerCalorie);

    const [transaction] = await prisma.$transaction([
      prisma.bankTransaction.create({
        data: {
          bankAccountId: account.id,
          type: 'ALLOCATE',
          points,
          caloriesEquivalent,
          potId,
          note: `Allocated to pot: ${pot.title}`,
        },
      }),
      prisma.bankAccount.update({
        where: { id: account.id },
        data: { pointsBalance: { decrement: points } },
      }),
      prisma.pot.update({
        where: { id: potId },
        data: { savedPoints: { increment: points } },
      }),
    ]);

    return { transaction, newBankBalance: account.pointsBalance - points };
  }

  async redeemPot(userId: string, potId: string) {
    const pot = await prisma.pot.findUnique({ where: { id: potId } });
    if (!pot) throw new AppError(404, 'Pot not found');
    if (pot.userId !== userId) throw new AppError(403, 'Not authorized');
    if (pot.isRedeemed) throw new AppError(400, 'Pot already redeemed');

    const account = await prisma.bankAccount.findUnique({ where: { userId } });
    if (!account) throw new AppError(400, 'Bank account not found');

    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    const pointsPerCalorie = settings?.pointsPerCalorie || 0.1;
    const caloriesEquivalent = pointsToCalories(pot.savedPoints, pointsPerCalorie);

    const [transaction] = await prisma.$transaction([
      prisma.bankTransaction.create({
        data: {
          bankAccountId: account.id,
          type: 'REDEEM',
          points: pot.savedPoints,
          caloriesEquivalent,
          potId,
          note: `Redeemed pot: ${pot.title}`,
        },
      }),
      prisma.pot.update({
        where: { id: potId },
        data: { isRedeemed: true },
      }),
    ]);

    return { transaction, caloriesEquivalent, pot };
  }

  async deletePot(userId: string, potId: string) {
    const pot = await prisma.pot.findUnique({ where: { id: potId } });
    if (!pot) throw new AppError(404, 'Pot not found');
    if (pot.userId !== userId) throw new AppError(403, 'Not authorized');

    // Return saved points to bank
    if (pot.savedPoints > 0 && !pot.isRedeemed) {
      const account = await prisma.bankAccount.findUnique({ where: { userId } });
      if (account) {
        await prisma.bankAccount.update({
          where: { id: account.id },
          data: { pointsBalance: { increment: pot.savedPoints } },
        });
      }
    }

    await prisma.pot.delete({ where: { id: potId } });
    return { deleted: true };
  }
}

export const potService = new PotService();
