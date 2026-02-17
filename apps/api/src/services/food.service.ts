import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateFoodInput, UpdateFoodInput } from '@calories-tracker/shared';

export class FoodService {
  async listFoods(userId: string, search?: string) {
    const where: any = {
      OR: [
        { isCustom: false },
        { userId },
      ],
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    return prisma.foodItem.findMany({
      where,
      orderBy: [{ isCustom: 'asc' }, { name: 'asc' }],
    });
  }

  async createFood(userId: string, input: CreateFoodInput, imageUrl?: string) {
    return prisma.foodItem.create({
      data: {
        userId,
        name: input.name,
        caloriesPerServing: input.caloriesPerServing,
        servingLabel: input.servingLabel || 'serving',
        imageUrl,
        isCustom: true,
      },
    });
  }

  async updateFood(userId: string, foodId: string, input: UpdateFoodInput, imageUrl?: string) {
    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) throw new AppError(404, 'Food item not found');
    if (food.userId !== userId) throw new AppError(403, 'Not authorized to edit this food');

    const data: any = { ...input };
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    return prisma.foodItem.update({ where: { id: foodId }, data });
  }

  async deleteFood(userId: string, foodId: string) {
    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) throw new AppError(404, 'Food item not found');
    if (food.userId !== userId) throw new AppError(403, 'Not authorized to delete this food');

    await prisma.foodItem.delete({ where: { id: foodId } });
    return { deleted: true };
  }
}

export const foodService = new FoodService();
