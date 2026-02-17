import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { CreateMealInput } from '@calories-tracker/shared';

export class MealService {
  async getMeals(userId: string, date: string) {
    const meals = await prisma.mealEntry.findMany({
      where: {
        userId,
        date: new Date(date),
      },
      include: {
        items: {
          include: {
            foodItem: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return meals;
  }

  async createMeal(userId: string, input: CreateMealInput) {
    // Fetch food items to compute calories
    const foodIds = input.items.map((i) => i.foodItemId);
    const foods = await prisma.foodItem.findMany({ where: { id: { in: foodIds } } });
    const foodMap = new Map(foods.map((f) => [f.id, f]));

    const items = input.items.map((item) => {
      const food = foodMap.get(item.foodItemId);
      if (!food) throw new AppError(400, `Food item ${item.foodItemId} not found`);
      return {
        foodItemId: item.foodItemId,
        servings: item.servings,
        computedCalories: Math.round(food.caloriesPerServing * item.servings),
      };
    });

    const meal = await prisma.mealEntry.create({
      data: {
        userId,
        date: new Date(input.date),
        mealType: input.mealType,
        items: {
          create: items,
        },
      },
      include: {
        items: {
          include: { foodItem: true },
        },
      },
    });

    return meal;
  }

  async deleteMeal(userId: string, mealId: string) {
    const meal = await prisma.mealEntry.findUnique({ where: { id: mealId } });
    if (!meal) throw new AppError(404, 'Meal not found');
    if (meal.userId !== userId) throw new AppError(403, 'Not authorized');

    await prisma.mealEntry.delete({ where: { id: mealId } });
    return { deleted: true };
  }

  async getDailyCalories(userId: string, date: string): Promise<number> {
    const meals = await prisma.mealEntry.findMany({
      where: { userId, date: new Date(date) },
      include: { items: true },
    });

    return meals.reduce((total, meal) => {
      return total + meal.items.reduce((sum, item) => sum + item.computedCalories, 0);
    }, 0);
  }
}

export const mealService = new MealService();
