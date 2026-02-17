import { describe, it, expect } from 'vitest';
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyTarget,
  calculateTargetFromProfile,
  calculateAge,
  caloriesToPoints,
  pointsToCalories,
  calculateEarnedPoints,
  validateWithdrawal,
  calculatePotProgress,
  calculateDailySavingRate,
  calculateLevel,
  xpForLevel,
  xpForNextLevel,
} from '@calories-tracker/shared';

describe('BMR Calculation (Mifflin-St Jeor)', () => {
  it('should calculate BMR for a male', () => {
    // 80kg, 175cm, 30 years, male
    // 10*80 + 6.25*175 - 5*30 + 5 = 800 + 1093.75 - 150 + 5 = 1748.75
    const bmr = calculateBMR(80, 175, 30, 'MALE');
    expect(bmr).toBeCloseTo(1748.75, 1);
  });

  it('should calculate BMR for a female', () => {
    // 65kg, 165cm, 28 years, female
    // 10*65 + 6.25*165 - 5*28 - 161 = 650 + 1031.25 - 140 - 161 = 1380.25
    const bmr = calculateBMR(65, 165, 28, 'FEMALE');
    expect(bmr).toBeCloseTo(1380.25, 1);
  });
});

describe('TDEE Calculation', () => {
  it('should apply sedentary multiplier', () => {
    const tdee = calculateTDEE(1750, 'SEDENTARY');
    expect(tdee).toBe(Math.round(1750 * 1.2));
  });

  it('should apply active multiplier', () => {
    const tdee = calculateTDEE(1750, 'ACTIVE');
    expect(tdee).toBe(Math.round(1750 * 1.725));
  });

  it('should apply moderate multiplier', () => {
    const tdee = calculateTDEE(1500, 'MODERATE');
    expect(tdee).toBe(Math.round(1500 * 1.55));
  });
});

describe('Daily Target Calculation', () => {
  it('should subtract deficit for SLOW pace', () => {
    const target = calculateDailyTarget(2500, 'SLOW');
    expect(target).toBe(2250); // 2500 - 250
  });

  it('should subtract deficit for NORMAL pace', () => {
    const target = calculateDailyTarget(2500, 'NORMAL');
    expect(target).toBe(2000); // 2500 - 500
  });

  it('should subtract deficit for FAST pace', () => {
    const target = calculateDailyTarget(2500, 'FAST');
    expect(target).toBe(1750); // 2500 - 750
  });

  it('should enforce minimum of 1200 calories', () => {
    const target = calculateDailyTarget(1400, 'FAST');
    expect(target).toBe(1200); // 1400 - 750 = 650, clamped to 1200
  });
});

describe('Full Target Pipeline', () => {
  it('should calculate full pipeline for a male user', () => {
    const result = calculateTargetFromProfile({
      weightKg: 80,
      heightCm: 175,
      ageYears: 30,
      gender: 'MALE',
      activityLevel: 'MODERATE',
      goalPace: 'NORMAL',
    });

    expect(result.bmr).toBeCloseTo(1748.75, 1);
    expect(result.tdee).toBe(Math.round(1748.75 * 1.55));
    expect(result.dailyTarget).toBe(result.tdee - 500);
    expect(result.deficit).toBe(500);
  });
});

describe('Age Calculation', () => {
  it('should calculate age correctly', () => {
    const dob = new Date('1995-06-15');
    const age = calculateAge(dob);
    // As of 2026-02-14, age should be 30
    expect(age).toBe(30);
  });
});

describe('Points Conversion', () => {
  it('should convert calories to points (default rate)', () => {
    expect(caloriesToPoints(100)).toBe(10); // 100 * 0.1 = 10
    expect(caloriesToPoints(250)).toBe(25);
  });

  it('should convert points to calories (default rate)', () => {
    expect(pointsToCalories(10)).toBe(100); // 10 / 0.1 = 100
    expect(pointsToCalories(50)).toBe(500);
  });

  it('should handle custom rates', () => {
    expect(caloriesToPoints(100, 0.05)).toBe(5); // 1 point = 20 cal
    expect(pointsToCalories(5, 0.05)).toBe(100);
  });
});

describe('Earn Points Logic', () => {
  it('should earn points from leftover calories', () => {
    const result = calculateEarnedPoints(1500, 2000); // 500 leftover
    expect(result.leftoverCalories).toBe(500);
    expect(result.earnedPoints).toBe(50); // 500 * 0.1
  });

  it('should cap earned points at max daily limit', () => {
    const result = calculateEarnedPoints(0, 5000); // 5000 leftover
    expect(result.leftoverCalories).toBe(5000);
    expect(result.earnedPoints).toBe(300); // capped at 300
  });

  it('should earn 0 if over target', () => {
    const result = calculateEarnedPoints(2500, 2000); // over target
    expect(result.leftoverCalories).toBe(0);
    expect(result.earnedPoints).toBe(0);
  });

  it('should respect custom settings', () => {
    const result = calculateEarnedPoints(1500, 2000, 0.2, 200);
    expect(result.leftoverCalories).toBe(500);
    expect(result.earnedPoints).toBe(100); // 500 * 0.2 = 100, under 200 cap
  });
});

describe('Withdrawal Validation', () => {
  it('should validate a valid withdrawal', () => {
    const result = validateWithdrawal(50, 100);
    expect(result.valid).toBe(true);
    expect(result.caloriesEquivalent).toBe(500);
  });

  it('should reject withdrawal exceeding balance', () => {
    const result = validateWithdrawal(150, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Insufficient');
  });

  it('should reject zero or negative withdrawal', () => {
    const result = validateWithdrawal(0, 100);
    expect(result.valid).toBe(false);
  });
});

describe('Pot Progress', () => {
  it('should calculate pot progress correctly', () => {
    // 50 points saved, target 1000 calories, 0.1 points/cal
    // Target in points = 1000 * 0.1 = 100
    // Percentage = 50/100 * 100 = 50%
    const result = calculatePotProgress(50, 1000);
    expect(result.percentage).toBe(50);
    expect(result.savedCalories).toBe(500);
    expect(result.remaining).toBe(500);
  });

  it('should cap at 100%', () => {
    const result = calculatePotProgress(150, 1000);
    expect(result.percentage).toBe(100);
    expect(result.remaining).toBe(0);
  });
});

describe('Daily Saving Rate', () => {
  it('should calculate daily rate until due date', () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 10); // 10 days from now
    const result = calculateDailySavingRate(500, dueDate);
    expect(result.daysRemaining).toBe(10);
    expect(result.dailyCalories).toBe(50); // 500 / 10
    expect(result.dailyPoints).toBe(5); // 50 * 0.1
  });
});

describe('Leveling', () => {
  it('should start at level 1 with 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('should be level 2 at 100 XP', () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it('should be level 3 at 400 XP', () => {
    expect(calculateLevel(400)).toBe(3);
  });

  it('should calculate XP needed for levels', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(400);
  });

  it('should calculate XP for next level', () => {
    expect(xpForNextLevel(1)).toBe(100);
    expect(xpForNextLevel(2)).toBe(400);
  });
});
