// Constants & Types
export {
  ACTIVITY_MULTIPLIERS,
  DEFICIT_MAP,
  DEFAULTS,
  XP_REWARDS,
  ACHIEVEMENT_DEFINITIONS,
  calculateLevel,
  xpForLevel,
  xpForNextLevel,
  type ActivityLevel,
  type GoalPace,
  type Gender,
  type MealType,
  type TransactionType,
} from './constants';

// Calculations
export {
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
} from './calculations';

// Schemas
export {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from './schemas/auth';

export {
  profileSchema,
  activityLevelEnum,
  goalPaceEnum,
  genderEnum,
  weightLogSchema,
  type ProfileInput,
  type WeightLogInput,
} from './schemas/profile';

export {
  createFoodSchema,
  updateFoodSchema,
  type CreateFoodInput,
  type UpdateFoodInput,
} from './schemas/food';

export {
  mealTypeEnum,
  mealEntryItemSchema,
  createMealSchema,
  type MealEntryItemInput,
  type CreateMealInput,
} from './schemas/meal';

export {
  earnPointsSchema,
  withdrawPointsSchema,
  type EarnPointsInput,
  type WithdrawPointsInput,
} from './schemas/bank';

export {
  createPotSchema,
  allocateToPotSchema,
  redeemPotSchema,
  type CreatePotInput,
  type AllocateToPotInput,
  type RedeemPotInput,
} from './schemas/pot';

export {
  updateSettingsSchema,
  type UpdateSettingsInput,
} from './schemas/settings';
