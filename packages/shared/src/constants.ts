// Activity level multipliers for TDEE calculation
export const ACTIVITY_MULTIPLIERS = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
} as const;

// Deficit per day in calories based on goal pace
export const DEFICIT_MAP = {
  SLOW: 250,    // ~0.25 kg/week
  NORMAL: 500,  // ~0.5 kg/week
  FAST: 750,    // ~0.75 kg/week
} as const;

// Default settings
export const DEFAULTS = {
  POINTS_PER_CALORIE: 0.1, // 1 point = 10 calories
  MAX_DAILY_EARN_POINTS: 300,
  MIN_DAILY_TARGET: 1200, // Minimum safe calorie target
} as const;

// XP rewards
export const XP_REWARDS = {
  LOG_MEAL: 10,
  UNDER_TARGET: 25,
  ALLOCATE_TO_POT: 15,
  STREAK_BONUS_PER_DAY: 5,
  REDEEM_POT: 20,
  CREATE_POT: 10,
} as const;

// Level calculation: Level = floor(sqrt(totalXP / 100)) + 1
export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

// XP needed for next level
export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = [
  {
    key: 'FIRST_BITE',
    title: 'First Bite',
    description: 'Log your first meal',
    icon: '🍽️',
    xpReward: 50,
  },
  {
    key: 'WEEK_WARRIOR',
    title: 'Week Warrior',
    description: '7-day logging streak',
    icon: '🔥',
    xpReward: 100,
  },
  {
    key: 'MONTH_MASTER',
    title: 'Month Master',
    description: '30-day logging streak',
    icon: '👑',
    xpReward: 500,
  },
  {
    key: 'SAVER',
    title: 'Saver',
    description: 'Save 1,000 calories in the bank',
    icon: '💰',
    xpReward: 100,
  },
  {
    key: 'SUPER_SAVER',
    title: 'Super Saver',
    description: 'Save 5,000 calories in the bank',
    icon: '🏦',
    xpReward: 250,
  },
  {
    key: 'POT_CREATOR',
    title: 'Pot Creator',
    description: 'Create your first pot',
    icon: '🎯',
    xpReward: 50,
  },
  {
    key: 'POT_MASTER',
    title: 'Pot Master',
    description: 'Redeem a pot',
    icon: '🎉',
    xpReward: 200,
  },
  {
    key: 'UNDER_CONTROL',
    title: 'Under Control',
    description: '7 consecutive days under target',
    icon: '✅',
    xpReward: 150,
  },
  {
    key: 'LEVEL_5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    xpReward: 100,
  },
  {
    key: 'LEVEL_10',
    title: 'Fitness Legend',
    description: 'Reach level 10',
    icon: '🌟',
    xpReward: 300,
  },
] as const;

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS;
export type GoalPace = keyof typeof DEFICIT_MAP;
export type Gender = 'MALE' | 'FEMALE';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type TransactionType = 'EARN' | 'WITHDRAW' | 'ALLOCATE' | 'REDEEM';
