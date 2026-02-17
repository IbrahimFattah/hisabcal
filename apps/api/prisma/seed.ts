import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PREDEFINED_FOODS = [
  // Breakfast items
  { name: 'Scrambled Eggs (2 eggs)', caloriesPerServing: 182, servingLabel: 'serving' },
  { name: 'Oatmeal', caloriesPerServing: 154, servingLabel: 'cup' },
  { name: 'Greek Yogurt', caloriesPerServing: 130, servingLabel: 'cup' },
  { name: 'Banana', caloriesPerServing: 105, servingLabel: 'medium' },
  { name: 'Whole Wheat Toast', caloriesPerServing: 69, servingLabel: 'slice' },
  { name: 'Peanut Butter', caloriesPerServing: 94, servingLabel: 'tablespoon' },
  { name: 'Orange Juice', caloriesPerServing: 112, servingLabel: 'cup' },
  { name: 'Granola', caloriesPerServing: 210, servingLabel: '1/2 cup' },
  { name: 'Blueberries', caloriesPerServing: 84, servingLabel: 'cup' },
  { name: 'Pancakes', caloriesPerServing: 227, servingLabel: '2 medium' },

  // Lunch items
  { name: 'Grilled Chicken Breast', caloriesPerServing: 165, servingLabel: '100g' },
  { name: 'Brown Rice', caloriesPerServing: 216, servingLabel: 'cup cooked' },
  { name: 'Caesar Salad', caloriesPerServing: 190, servingLabel: 'bowl' },
  { name: 'Turkey Sandwich', caloriesPerServing: 320, servingLabel: 'sandwich' },
  { name: 'Lentil Soup', caloriesPerServing: 230, servingLabel: 'bowl' },
  { name: 'Tuna Salad', caloriesPerServing: 280, servingLabel: 'serving' },
  { name: 'Vegetable Wrap', caloriesPerServing: 250, servingLabel: 'wrap' },
  { name: 'Quinoa Bowl', caloriesPerServing: 222, servingLabel: 'cup' },
  { name: 'Hummus', caloriesPerServing: 70, servingLabel: '2 tablespoons' },
  { name: 'Whole Wheat Pita', caloriesPerServing: 170, servingLabel: 'pita' },

  // Dinner items
  { name: 'Grilled Salmon', caloriesPerServing: 208, servingLabel: '100g' },
  { name: 'Pasta with Marinara', caloriesPerServing: 380, servingLabel: 'plate' },
  { name: 'Steak (Sirloin)', caloriesPerServing: 271, servingLabel: '150g' },
  { name: 'Baked Sweet Potato', caloriesPerServing: 103, servingLabel: 'medium' },
  { name: 'Steamed Broccoli', caloriesPerServing: 55, servingLabel: 'cup' },
  { name: 'Chicken Stir-Fry', caloriesPerServing: 310, servingLabel: 'plate' },
  { name: 'Grilled Vegetables', caloriesPerServing: 85, servingLabel: 'cup' },
  { name: 'Baked Chicken Thigh', caloriesPerServing: 229, servingLabel: 'thigh' },
  { name: 'Spaghetti Bolognese', caloriesPerServing: 420, servingLabel: 'plate' },
  { name: 'Vegetable Curry', caloriesPerServing: 250, servingLabel: 'serving' },

  // Snacks
  { name: 'Apple', caloriesPerServing: 95, servingLabel: 'medium' },
  { name: 'Almonds', caloriesPerServing: 164, servingLabel: '1/4 cup' },
  { name: 'Protein Bar', caloriesPerServing: 200, servingLabel: 'bar' },
  { name: 'Dark Chocolate', caloriesPerServing: 170, servingLabel: '30g' },
  { name: 'Rice Cakes', caloriesPerServing: 35, servingLabel: 'cake' },
  { name: 'Cottage Cheese', caloriesPerServing: 110, servingLabel: '1/2 cup' },
  { name: 'Trail Mix', caloriesPerServing: 175, servingLabel: '1/4 cup' },
  { name: 'Carrot Sticks', caloriesPerServing: 35, servingLabel: 'cup' },
  { name: 'String Cheese', caloriesPerServing: 80, servingLabel: 'stick' },
  { name: 'Popcorn (Air-popped)', caloriesPerServing: 93, servingLabel: '3 cups' },

  // Drinks
  { name: 'Coffee (Black)', caloriesPerServing: 2, servingLabel: 'cup' },
  { name: 'Green Tea', caloriesPerServing: 0, servingLabel: 'cup' },
  { name: 'Milk (Whole)', caloriesPerServing: 149, servingLabel: 'cup' },
  { name: 'Protein Shake', caloriesPerServing: 160, servingLabel: 'shake' },
  { name: 'Smoothie (Berry)', caloriesPerServing: 230, servingLabel: 'glass' },
];

const ACHIEVEMENTS = [
  { key: 'FIRST_BITE', title: 'First Bite', description: 'Log your first meal', icon: '🍽️', xpReward: 50 },
  { key: 'WEEK_WARRIOR', title: 'Week Warrior', description: '7-day logging streak', icon: '🔥', xpReward: 100 },
  { key: 'MONTH_MASTER', title: 'Month Master', description: '30-day logging streak', icon: '👑', xpReward: 500 },
  { key: 'SAVER', title: 'Saver', description: 'Save 1,000 calories in the bank', icon: '💰', xpReward: 100 },
  { key: 'SUPER_SAVER', title: 'Super Saver', description: 'Save 5,000 calories in the bank', icon: '🏦', xpReward: 250 },
  { key: 'POT_CREATOR', title: 'Pot Creator', description: 'Create your first pot', icon: '🎯', xpReward: 50 },
  { key: 'POT_MASTER', title: 'Pot Master', description: 'Redeem a pot', icon: '🎉', xpReward: 200 },
  { key: 'UNDER_CONTROL', title: 'Under Control', description: '7 consecutive days under target', icon: '✅', xpReward: 150 },
  { key: 'LEVEL_5', title: 'Rising Star', description: 'Reach level 5', icon: '⭐', xpReward: 100 },
  { key: 'LEVEL_10', title: 'Fitness Legend', description: 'Reach level 10', icon: '🌟', xpReward: 300 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed predefined foods
  for (const food of PREDEFINED_FOODS) {
    await prisma.foodItem.upsert({
      where: {
        id: `predefined-${food.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      },
      update: {
        caloriesPerServing: food.caloriesPerServing,
        servingLabel: food.servingLabel,
      },
      create: {
        id: `predefined-${food.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: food.name,
        caloriesPerServing: food.caloriesPerServing,
        servingLabel: food.servingLabel,
        isCustom: false,
      },
    });
  }
  console.log(`✅ Seeded ${PREDEFINED_FOODS.length} predefined food items`);

  // Seed achievements
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      },
      create: achievement,
    });
  }
  console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
