import {
  ACTIVITY_MULTIPLIERS,
  DEFICIT_MAP,
  DEFAULTS,
  type ActivityLevel,
  type GoalPace,
  type Gender,
} from './constants';

/**
 * Calculate BMR using Mifflin-St Jeor equation
 * Male:   10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return gender === 'MALE' ? base + 5 : base - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR * activity multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate daily calorie target based on TDEE and goal pace
 * Ensures minimum safe intake of 1200 calories
 */
export function calculateDailyTarget(
  tdee: number,
  goalPace: GoalPace
): number {
  const deficit = DEFICIT_MAP[goalPace];
  return Math.max(Math.round(tdee - deficit), DEFAULTS.MIN_DAILY_TARGET);
}

/**
 * Full calculation pipeline: profile data -> daily target
 */
export function calculateTargetFromProfile(params: {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goalPace: GoalPace;
}): { bmr: number; tdee: number; dailyTarget: number; deficit: number } {
  const bmr = calculateBMR(params.weightKg, params.heightCm, params.ageYears, params.gender);
  const tdee = calculateTDEE(bmr, params.activityLevel);
  const dailyTarget = calculateDailyTarget(tdee, params.goalPace);
  const deficit = DEFICIT_MAP[params.goalPace];
  return { bmr, tdee, dailyTarget, deficit };
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

// ============ Points / Calorie Banking ============

/**
 * Convert calories to points
 */
export function caloriesToPoints(
  calories: number,
  pointsPerCalorie: number = DEFAULTS.POINTS_PER_CALORIE
): number {
  return Math.floor(calories * pointsPerCalorie);
}

/**
 * Convert points to calories
 */
export function pointsToCalories(
  points: number,
  pointsPerCalorie: number = DEFAULTS.POINTS_PER_CALORIE
): number {
  return Math.round(points / pointsPerCalorie);
}

/**
 * Calculate earned points from leftover calories
 * Caps at maxDailyEarnPoints
 */
export function calculateEarnedPoints(
  consumedCalories: number,
  dailyTarget: number,
  pointsPerCalorie: number = DEFAULTS.POINTS_PER_CALORIE,
  maxDailyEarnPoints: number = DEFAULTS.MAX_DAILY_EARN_POINTS
): { leftoverCalories: number; earnedPoints: number } {
  const leftoverCalories = Math.max(0, dailyTarget - consumedCalories);
  const rawPoints = caloriesToPoints(leftoverCalories, pointsPerCalorie);
  const earnedPoints = Math.min(rawPoints, maxDailyEarnPoints);
  return { leftoverCalories, earnedPoints };
}

/**
 * Validate withdrawal: ensure requested points <= balance
 * Returns the calorie equivalent of withdrawal
 */
export function validateWithdrawal(
  requestedPoints: number,
  currentBalance: number,
  pointsPerCalorie: number = DEFAULTS.POINTS_PER_CALORIE
): { valid: boolean; caloriesEquivalent: number; error?: string } {
  if (requestedPoints <= 0) {
    return { valid: false, caloriesEquivalent: 0, error: 'Points must be positive' };
  }
  if (requestedPoints > currentBalance) {
    return {
      valid: false,
      caloriesEquivalent: 0,
      error: `Insufficient balance. Available: ${currentBalance} points`,
    };
  }
  const caloriesEquivalent = pointsToCalories(requestedPoints, pointsPerCalorie);
  return { valid: true, caloriesEquivalent };
}

// ============ Pot Logic ============

/**
 * Calculate pot progress as percentage
 */
export function calculatePotProgress(
  savedPoints: number,
  targetCalories: number,
  pointsPerCalorie: number = DEFAULTS.POINTS_PER_CALORIE
): { percentage: number; savedCalories: number; remaining: number } {
  const targetPoints = caloriesToPoints(targetCalories, pointsPerCalorie);
  const percentage = targetPoints > 0 ? Math.min((savedPoints / targetPoints) * 100, 100) : 0;
  const savedCalories = pointsToCalories(savedPoints, pointsPerCalorie);
  const remaining = Math.max(0, targetCalories - savedCalories);
  return { percentage: Math.round(percentage * 10) / 10, savedCalories, remaining };
}

/**
 * Calculate suggested daily saving rate for a pot
 */
export function calculateDailySavingRate(
  remainingCalories: number,
  dueDate: Date,
  pointsPerCalorie: number = DEFAULTS.POINTS_PER_CALORIE
): { dailyCalories: number; dailyPoints: number; daysRemaining: number } {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const dailyCalories = Math.ceil(remainingCalories / daysRemaining);
  const dailyPoints = caloriesToPoints(dailyCalories, pointsPerCalorie);
  return { dailyCalories, dailyPoints, daysRemaining };
}
