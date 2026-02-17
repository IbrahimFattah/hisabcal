'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/providers/ToastProvider';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatNumber, todayString } from '@/lib/utils';
import {
  Plus,
  Search,
  UtensilsCrossed,
  Trash2,
  Camera,
  Coffee,
  Sun,
  Moon,
  Cookie,
  X,
  Sparkles,
  Swords,
  CircleCheckBig,
  CircleDashed,
} from 'lucide-react';

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: Coffee },
  { value: 'LUNCH', label: 'Lunch', icon: Sun },
  { value: 'DINNER', label: 'Dinner', icon: Moon },
  { value: 'SNACK', label: 'Snack', icon: Cookie },
];

interface FoodItem {
  id: string;
  name: string;
  caloriesPerServing: number;
  servingLabel: string;
  imageUrl?: string;
  isCustom: boolean;
}

export default function LogPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [date, setDate] = useState(todayString());
  const [meals, setMeals] = useState<any[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);

  // Add meal form state
  const [mealType, setMealType] = useState('BREAKFAST');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ foodItemId: string; servings: number; food: FoodItem }[]>([]);

  // Add food form state
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState('');
  const [newFoodServing, setNewFoodServing] = useState('');
  const [newFoodImage, setNewFoodImage] = useState<File | null>(null);
  const [savingFood, setSavingFood] = useState(false);
  const [savingMeal, setSavingMeal] = useState(false);

  const dailyTarget = user?.profile?.dailyTargetCalories || 2000;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mealsRes, foodsRes] = await Promise.all([
        api.get<{ meals: any[] }>(`/api/meals?date=${date}`),
        api.get<{ foods: FoodItem[] }>('/api/foods'),
      ]);
      setMeals(mealsRes.meals);
      setFoods(foodsRes.foods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalConsumed = meals.reduce(
    (total, meal) => total + meal.items.reduce((sum: number, item: any) => sum + item.computedCalories, 0),
    0
  );
  const mealTypeCount = new Set(meals.map((meal) => meal.mealType)).size;
  const remainingCalories = Math.max(0, dailyTarget - totalConsumed);
  const comboMultiplier =
    1 +
    Number(totalConsumed <= dailyTarget) +
    Number(meals.length >= 3) +
    Number(mealTypeCount >= 3);

  const missions = [
    {
      id: 'target',
      title: 'Stay under target',
      detail: totalConsumed <= dailyTarget ? 'On track' : `${formatNumber(totalConsumed - dailyTarget)} over`,
      completed: totalConsumed <= dailyTarget,
    },
    {
      id: 'meal-volume',
      title: 'Log 3 meals',
      detail: `${Math.min(meals.length, 3)}/3`,
      completed: meals.length >= 3,
    },
    {
      id: 'meal-variety',
      title: '3 meal types',
      detail: `${Math.min(mealTypeCount, 3)}/3`,
      completed: mealTypeCount >= 3,
    },
    {
      id: 'calorie-buffer',
      title: 'Keep 200 cal buffer',
      detail: `${formatNumber(remainingCalories)} left`,
      completed: remainingCalories >= 200,
    },
  ];
  const completedMissions = missions.filter((mission) => mission.completed).length;
  const missionProgress = (completedMissions / missions.length) * 100;

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItemToMeal = (food: FoodItem) => {
    const existing = selectedItems.find((i) => i.foodItemId === food.id);
    if (existing) {
      setSelectedItems(selectedItems.map((i) =>
        i.foodItemId === food.id ? { ...i, servings: i.servings + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { foodItemId: food.id, servings: 1, food }]);
    }
  };

  const removeItemFromMeal = (foodId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.foodItemId !== foodId));
  };

  const handleSaveMeal = async () => {
    if (selectedItems.length === 0) return;
    setSavingMeal(true);
    try {
      await api.post('/api/meals', {
        date,
        mealType,
        items: selectedItems.map((i) => ({ foodItemId: i.foodItemId, servings: i.servings })),
      });
      addToast('Meal logged! +10 XP', 'success');
      setShowAddMeal(false);
      setSelectedItems([]);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to save meal', 'error');
    } finally {
      setSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await api.delete(`/api/meals/${mealId}`);
      addToast('Meal deleted', 'info');
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleCreateFood = async () => {
    if (!newFoodName || !newFoodCalories) return;
    setSavingFood(true);
    try {
      const formData = new FormData();
      formData.append('name', newFoodName);
      formData.append('caloriesPerServing', newFoodCalories);
      if (newFoodServing) formData.append('servingLabel', newFoodServing);
      if (newFoodImage) formData.append('image', newFoodImage);

      await api.upload('/api/foods', formData);
      addToast('Custom food created!', 'success');
      setShowAddFood(false);
      setNewFoodName('');
      setNewFoodCalories('');
      setNewFoodServing('');
      setNewFoodImage(null);
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Failed to create food', 'error');
    } finally {
      setSavingFood(false);
    }
  };

  const mealEstCalories = selectedItems.reduce(
    (sum, i) => sum + i.food.caloriesPerServing * i.servings, 0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900 dark:text-gray-100">Meal Log</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track your daily intake</p>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full sm:w-auto"
        />
      </div>

      {/* Daily Summary */}
      <Card interactive className="bg-gradient-to-r from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700 text-white border-0 dark:border-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <div>
            <p className="text-accent-100 text-sm">Today&apos;s Progress</p>
            <p className="text-2xl sm:text-3xl font-black">{formatNumber(totalConsumed)} <span className="text-base sm:text-lg font-medium text-accent-200">/ {formatNumber(dailyTarget)} cal</span></p>
          </div>
          <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
            <p className="text-xl sm:text-2xl font-bold">{formatNumber(remainingCalories)} left</p>
            <p className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[11px] font-semibold text-accent-100">
              <Sparkles className="h-3.5 w-3.5" />
              Combo x{comboMultiplier}
            </p>
          </div>
        </div>
        <ProgressBar
          value={totalConsumed}
          max={dailyTarget}
          color={totalConsumed > dailyTarget ? 'danger' : 'primary'}
          size="md"
        />
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setShowAddMeal(true)} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Log Meal
        </Button>
        <Button onClick={() => setShowAddFood(true)} variant="outline" className="w-full">
          <Camera className="w-4 h-4 mr-1" /> Add Food
        </Button>
      </div>

      <Card interactive>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-primary-500" />
            <CardTitle className="text-base">Daily Missions</CardTitle>
          </div>
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
            {completedMissions}/{missions.length} Complete
          </span>
        </div>
        <ProgressBar value={missionProgress} color="primary" size="md" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className="quest-chip flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-surface-700 dark:bg-surface-800"
            >
              <div className="flex items-center gap-2">
                {mission.completed ? (
                  <CircleCheckBig className="h-4 w-4 text-accent-500" />
                ) : (
                  <CircleDashed className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                )}
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{mission.title}</span>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{mission.detail}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Meals List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : meals.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="w-12 h-12" />}
          title="No meals logged yet"
          description="Start logging your meals to track your calorie intake"
          action={<Button onClick={() => setShowAddMeal(true)} size="sm">Log Your First Meal</Button>}
        />
      ) : (
        <div className="space-y-4">
          {MEAL_TYPES.map(({ value, label, icon: Icon }) => {
            const typeMeals = meals.filter((m) => m.mealType === value);
            if (typeMeals.length === 0) return null;
            const typeCalories = typeMeals.reduce(
              (total: number, meal: any) => total + meal.items.reduce((sum: number, item: any) => sum + item.computedCalories, 0), 0
            );

            return (
              <Card key={value} interactive>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-50 dark:bg-primary-500/15 rounded-xl">
                      <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <CardTitle>{label}</CardTitle>
                  </div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{formatNumber(typeCalories)} cal</span>
                </div>
                <div className="space-y-2">
                  {typeMeals.map((meal: any) =>
                    meal.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:bg-surface-800 dark:hover:bg-surface-700"
                      >
                        <div className="flex items-center gap-3">
                          {item.foodItem.imageUrl ? (
                            <img src={item.foodItem.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/15 rounded-lg flex items-center justify-center">
                              <UtensilsCrossed className="w-5 h-5 text-primary-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.foodItem.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{item.servings} x {item.foodItem.servingLabel}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{formatNumber(item.computedCalories)} cal</span>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="p-2 -mr-1 hover:bg-danger-500/10 rounded-lg transition-colors active:scale-95"
                            aria-label="Delete meal entry"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-danger-500" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Meal Dialog */}
      <Dialog open={showAddMeal} onClose={() => { setShowAddMeal(false); setSelectedItems([]); }} title="Log Meal">
        <div className="space-y-4">
          <Select
            id="mealType"
            label="Meal Type"
            options={MEAL_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-surface-600 dark:bg-surface-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="bg-primary-50 dark:bg-primary-500/15 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">Selected ({selectedItems.length})</p>
                <p className="text-xs font-bold text-primary-700 dark:text-primary-300">{formatNumber(mealEstCalories)} cal</p>
              </div>
              {selectedItems.map((item) => (
                <div key={item.foodItemId} className="flex items-center justify-between bg-white dark:bg-surface-800 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800 dark:text-gray-200">{item.food.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={item.servings}
                      onChange={(e) =>
                        setSelectedItems(selectedItems.map((i) =>
                          i.foodItemId === item.foodItemId
                            ? { ...i, servings: Math.max(0.1, Number(e.target.value)) }
                            : i
                        ))
                      }
                      className="w-16 text-center rounded-lg border border-gray-200 dark:border-surface-600 dark:bg-surface-800 dark:text-gray-100 py-1 text-sm"
                    />
                    <button onClick={() => removeItemFromMeal(item.foodItemId)}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Food List */}
          <div className="max-h-56 sm:max-h-48 overflow-y-auto overscroll-contain -mx-1 px-1 space-y-1">
            {filteredFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => addItemToMeal(food)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-surface-800 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {food.imageUrl ? (
                    <img src={food.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                      <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{food.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{food.servingLabel}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{food.caloriesPerServing} cal</span>
              </button>
            ))}
          </div>

          <Button onClick={handleSaveMeal} loading={savingMeal} disabled={selectedItems.length === 0} className="w-full">
            Log Meal ({formatNumber(mealEstCalories)} cal)
          </Button>
        </div>
      </Dialog>

      {/* Add Custom Food Dialog */}
      <Dialog open={showAddFood} onClose={() => setShowAddFood(false)} title="Create Custom Food">
        <div className="space-y-4">
          <Input
            id="foodName"
            label="Food Name"
            placeholder="e.g. Mom's Pasta"
            value={newFoodName}
            onChange={(e) => setNewFoodName(e.target.value)}
          />
          <Input
            id="foodCalories"
            type="number"
            label="Calories per Serving"
            placeholder="350"
            value={newFoodCalories}
            onChange={(e) => setNewFoodCalories(e.target.value)}
          />
          <Input
            id="foodServing"
            label="Serving Label (optional)"
            placeholder="e.g. plate, cup, piece"
            value={newFoodServing}
            onChange={(e) => setNewFoodServing(e.target.value)}
          />

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Food Photo (optional)</label>
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-surface-600 rounded-xl cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-500/10 transition-all">
              {newFoodImage ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-primary-600">{newFoodImage.name}</p>
                  <p className="text-xs text-gray-400">{(newFoodImage.size / 1024).toFixed(0)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Click to upload photo</p>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setNewFoodImage(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <Button onClick={handleCreateFood} loading={savingFood} disabled={!newFoodName || !newFoodCalories} className="w-full">
            Create Food Item
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
