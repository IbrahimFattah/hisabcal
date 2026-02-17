'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { StatPill } from '@/components/shared/StatPill';
import { formatNumber, todayString } from '@/lib/utils';
import {
  Flame,
  Trophy,
  Zap,
  Landmark,
  Star,
  Swords,
  ShieldCheck,
  CircleDashed,
  CircleCheckBig,
  Sparkles,
} from 'lucide-react';
import {
  xpForNextLevel,
  xpForLevel,
  pointsToCalories,
} from '@calories-tracker/shared';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [mealsRes, bankRes, xpRes, achievementsRes] = await Promise.all([
          api.get<{ meals: any[] }>(`/api/meals?date=${todayString()}`),
          api.get<{ account: any }>('/api/bank'),
          api.get<{ xp: any }>('/api/xp'),
          api.get<{ achievements: any[] }>('/api/achievements'),
        ]);

        const consumed = mealsRes.meals.reduce(
          (total: number, meal: any) =>
            total + meal.items.reduce((sum: number, item: any) => sum + item.computedCalories, 0),
          0
        );

        setStats({
          consumed,
          target: user?.profile?.dailyTargetCalories || 2000,
          bank: bankRes.account,
          xp: xpRes.xp,
          achievements: achievementsRes.achievements,
          mealCount: mealsRes.meals.length,
          mealTypeCount: new Set(mealsRes.meals.map((meal) => meal.mealType)).size,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!stats) return null;

  const remaining = Math.max(0, stats.target - stats.consumed);
  const percentage = Math.min((stats.consumed / stats.target) * 100, 100);
  const isOver = stats.consumed > stats.target;

  const level = stats.xp?.level || 1;
  const totalXp = stats.xp?.totalXp || 0;
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const levelProgress = nextLevelXp > currentLevelXp
    ? ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    : 0;

  const rankTitle = level < 3 ? 'Rookie Saver' : level < 7 ? 'Momentum Builder' : level < 12 ? 'Elite Planner' : 'Calorie Commander';

  const earnedAchievements = stats.achievements?.filter((a: any) => a.earned) || [];
  const pointsBalance = stats.bank?.pointsBalance || 0;
  const pointsPerCalorie = user?.settings?.pointsPerCalorie || 0.1;
  const bankCalories = pointsToCalories(pointsBalance, pointsPerCalorie);

  const quests = [
    {
      id: 'target',
      title: 'Stay within target',
      detail: isOver ? `${formatNumber(stats.consumed - stats.target)} cal over` : 'On track',
      completed: !isOver,
    },
    {
      id: 'meal-count',
      title: 'Log 3 meals',
      detail: `${Math.min(stats.mealCount || 0, 3)}/3`,
      completed: (stats.mealCount || 0) >= 3,
    },
    {
      id: 'meal-variety',
      title: 'Hit 3 meal types',
      detail: `${Math.min(stats.mealTypeCount || 0, 3)}/3`,
      completed: (stats.mealTypeCount || 0) >= 3,
    },
  ];

  const completedQuests = quests.filter((quest) => quest.completed).length;
  const questProgress = (completedQuests / quests.length) * 100;
  const streak = stats.xp?.currentStreak || 0;
  const streakGoal = streak < 7 ? 7 : streak < 14 ? 14 : 30;
  const streakProgress = Math.min((streak / streakGoal) * 100, 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900 dark:text-gray-100">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Here&apos;s your daily summary</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-warning-400/30 bg-warning-400/10 px-3 py-2 text-xs font-semibold text-warning-700 dark:bg-warning-500/15 dark:text-warning-300">
          <Swords className="h-4 w-4" />
          Quest score: {completedQuests}/{quests.length}
        </div>
      </div>

      <Card interactive className="border-0 bg-gradient-to-br from-primary-600 to-primary-700 text-white dark:border-0 dark:from-primary-700 dark:to-primary-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary-200">Calories Today</p>
            <p className="mt-1 text-3xl sm:text-4xl font-black">{formatNumber(stats.consumed)}</p>
            <p className="mt-1 text-sm text-primary-200">
              of {formatNumber(stats.target)} target
            </p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-primary-100">
              <Sparkles className="h-3.5 w-3.5" />
              {rankTitle}
            </div>
          </div>
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0">
            <svg className="-rotate-90 h-24 w-24 sm:h-28 sm:w-28" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.2)" strokeWidth="10" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={isOver ? '#EF4444' : '#10B981'}
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${Math.PI * 100}`}
                strokeDashoffset={`${Math.PI * 100 * (1 - percentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black">{Math.round(percentage)}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl bg-white/10 p-2.5 sm:p-3 text-center">
            <p className="text-[10px] sm:text-xs text-primary-200">Remaining</p>
            <p className="text-base sm:text-lg font-bold">{formatNumber(remaining)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 sm:p-3 text-center">
            <p className="text-[10px] sm:text-xs text-primary-200">Goal</p>
            <p className="text-base sm:text-lg font-bold">{user?.profile?.goalWeightKg || '--'} kg</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 sm:p-3 text-center">
            <p className="text-[10px] sm:text-xs text-primary-200">Current</p>
            <p className="text-base sm:text-lg font-bold">{user?.profile?.currentWeightKg || '--'} kg</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card interactive className="text-center">
          <Flame className="mx-auto mb-1 h-6 w-6 text-warning-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.xp?.currentStreak || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Day Streak</p>
        </Card>
        <Card interactive className="text-center">
          <Landmark className="mx-auto mb-1 h-6 w-6 text-accent-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(pointsBalance)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Bank Points</p>
        </Card>
        <Card interactive className="text-center">
          <Star className="mx-auto mb-1 h-6 w-6 text-primary-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lvl {level}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(totalXp)} XP</p>
        </Card>
        <Card interactive className="text-center">
          <Trophy className="mx-auto mb-1 h-6 w-6 text-warning-500" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{earnedAchievements.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Achievements</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card interactive>
          <div className="mb-3 flex items-center justify-between">
            <CardTitle className="text-base">Daily Quests</CardTitle>
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
              {completedQuests}/{quests.length} Complete
            </span>
          </div>
          <ProgressBar value={questProgress} color="accent" size="md" />
          <div className="mt-3 space-y-2">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="quest-chip flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-surface-700 dark:bg-surface-800"
              >
                <div className="flex items-center gap-2">
                  {quest.completed ? (
                    <CircleCheckBig className="h-4 w-4 text-accent-500" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{quest.title}</p>
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{quest.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card interactive className="bg-gradient-to-br from-accent-500 to-accent-600 text-white dark:from-accent-600 dark:to-accent-700">
          <div className="mb-3 flex items-center justify-between">
            <CardTitle className="text-base text-white">Streak Momentum</CardTitle>
            <ShieldCheck className="h-5 w-5 text-accent-100" />
          </div>
          <p className="text-sm text-accent-100">
            {streak === 0 ? 'Log one meal today to start your streak.' : `${formatNumber(streak)} day streak active.`}
          </p>
          <ProgressBar value={streakProgress} color="warning" size="md" className="mt-4" />
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-accent-100">Next milestone</p>
              <p className="mt-0.5 text-base font-bold text-white">{streakGoal} days</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-accent-100">Bank calories</p>
              <p className="mt-0.5 text-base font-bold text-white">{formatNumber(bankCalories)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card interactive>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle>Level Progress</CardTitle>
          <StatPill label={`Level ${level}`} value={`${formatNumber(totalXp)} XP`} icon={<Zap className="w-4 h-4" />} />
        </div>
        <ProgressBar value={levelProgress} color="primary" size="md" showLabel />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {formatNumber(nextLevelXp - totalXp)} XP until Level {level + 1}
        </p>
      </Card>

      {stats.achievements && stats.achievements.length > 0 && (
        <Card>
          <CardTitle>Achievements</CardTitle>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {stats.achievements.map((a: any) => (
              <div
                key={a.id}
                className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                  a.earned
                    ? 'bg-primary-50 dark:bg-primary-500/15'
                    : 'bg-gray-50 opacity-40 dark:bg-surface-800'
                }`}
              >
                <span className="mb-1 text-2xl">{a.icon}</span>
                <p className="text-xs font-semibold leading-tight text-gray-800 dark:text-gray-200">{a.title}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
