'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/providers/ToastProvider';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatNumber, formatDate } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeProvider';
import {
  User,
  Scale,
  Settings2,
  TrendingDown,
  Save,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

const ACTIVITY_OPTIONS = [
  { value: 'SEDENTARY', label: 'Sedentary' },
  { value: 'LIGHT', label: 'Light' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'VERY_ACTIVE', label: 'Very Active' },
];

const PACE_OPTIONS = [
  { value: 'SLOW', label: 'Slow (~0.25 kg/week)' },
  { value: 'NORMAL', label: 'Normal (~0.5 kg/week)' },
  { value: 'FAST', label: 'Fast (~0.75 kg/week)' },
];

export default function SettingsPage() {
  const { user, refresh, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [weightLoading, setWeightLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [profile, setProfile] = useState({
    heightCm: '',
    currentWeightKg: '',
    goalWeightKg: '',
    activityLevel: '',
    goalPace: '',
    gender: '',
    dateOfBirth: '',
  });

  const [newWeight, setNewWeight] = useState('');

  const [settings, setSettings] = useState({
    pointsPerCalorie: '',
    maxDailyEarnPoints: '',
  });

  useEffect(() => {
    if (user?.profile) {
      setProfile({
        heightCm: String(user.profile.heightCm),
        currentWeightKg: String(user.profile.currentWeightKg),
        goalWeightKg: String(user.profile.goalWeightKg),
        activityLevel: user.profile.activityLevel,
        goalPace: user.profile.goalPace,
        gender: user.profile.gender,
        dateOfBirth: user.profile.dateOfBirth
          ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0]
          : '',
      });
    }
    if (user?.settings) {
      setSettings({
        pointsPerCalorie: String(user.settings.pointsPerCalorie),
        maxDailyEarnPoints: String(user.settings.maxDailyEarnPoints),
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.put('/api/profile', {
        heightCm: Number(profile.heightCm),
        currentWeightKg: Number(profile.currentWeightKg),
        goalWeightKg: Number(profile.goalWeightKg),
        activityLevel: profile.activityLevel,
        goalPace: profile.goalPace,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
      });
      await refresh();
      addToast('Profile updated! Calorie target recalculated.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeight = async () => {
    if (!newWeight) return;
    setWeightLoading(true);
    try {
      await api.post('/api/profile/weight', { weightKg: Number(newWeight) });
      await refresh();
      setNewWeight('');
      addToast('Weight logged! Target recalculated.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to log weight', 'error');
    } finally {
      setWeightLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await api.put('/api/settings', {
        pointsPerCalorie: Number(settings.pointsPerCalorie),
        maxDailyEarnPoints: Number(settings.maxDailyEarnPoints),
      });
      await refresh();
      addToast('Settings saved!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const weightHistory = (user?.profile?.weightHistory as Array<{ date: string; weightKg: number }>) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your profile and preferences</p>
      </div>

      {/* Profile Info */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-500/15 rounded-xl">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Daily Target: <strong>{formatNumber(user?.profile?.dailyTargetCalories || 0)} cal</strong>
            </CardDescription>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            id="gender"
            label="Gender"
            options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }]}
            value={profile.gender}
            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
          />
          <Input
            id="dob"
            type="date"
            label="Date of Birth"
            value={profile.dateOfBirth}
            onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
          />
          <Input
            id="height"
            type="number"
            label="Height (cm)"
            value={profile.heightCm}
            onChange={(e) => setProfile({ ...profile, heightCm: e.target.value })}
          />
          <Input
            id="goalWeight"
            type="number"
            label="Goal Weight (kg)"
            value={profile.goalWeightKg}
            onChange={(e) => setProfile({ ...profile, goalWeightKg: e.target.value })}
          />
          <Select
            id="activity"
            label="Activity Level"
            options={ACTIVITY_OPTIONS}
            value={profile.activityLevel}
            onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value })}
          />
          <Select
            id="pace"
            label="Goal Pace"
            options={PACE_OPTIONS}
            value={profile.goalPace}
            onChange={(e) => setProfile({ ...profile, goalPace: e.target.value })}
          />
        </div>

        <Button onClick={handleSaveProfile} loading={loading} className="mt-4 w-full">
          <Save className="w-4 h-4 mr-1" /> Update Profile
        </Button>
      </Card>

      {/* Log Weight */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent-100 dark:bg-accent-500/15 rounded-xl">
            <Scale className="w-5 h-5 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <CardTitle>Weight Tracking</CardTitle>
            <CardDescription>Current: {user?.profile?.currentWeightKg || '--'} kg</CardDescription>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id="newWeight"
            type="number"
            placeholder="Enter weight (kg)"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleLogWeight} loading={weightLoading} disabled={!newWeight} className="w-full sm:w-auto">
            Log Weight
          </Button>
        </div>

        {weightHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Weight History</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {[...weightHistory].reverse().map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-gray-50 dark:bg-surface-800 rounded-lg">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{entry.weightKg} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Banking Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-warning-400/20 dark:bg-warning-500/15 rounded-xl">
            <Settings2 className="w-5 h-5 text-warning-600 dark:text-warning-400" />
          </div>
          <CardTitle>Banking Settings</CardTitle>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="pointsPerCal"
            type="number"
            label="Points per Calorie"
            value={settings.pointsPerCalorie}
            onChange={(e) => setSettings({ ...settings, pointsPerCalorie: e.target.value })}
          />
          <Input
            id="maxEarn"
            type="number"
            label="Max Daily Earn (pts)"
            value={settings.maxDailyEarnPoints}
            onChange={(e) => setSettings({ ...settings, maxDailyEarnPoints: e.target.value })}
          />
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          1 point = {settings.pointsPerCalorie ? formatNumber(1 / Number(settings.pointsPerCalorie)) : '--'} calories
        </p>

        <Button onClick={handleSaveSettings} loading={settingsLoading} variant="outline" className="mt-4 w-full">
          Save Banking Settings
        </Button>
      </Card>

      {/* Theme */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-500/15 rounded-xl">
            <Moon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <CardTitle>Appearance</CardTitle>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'light' as const, label: 'Light', icon: Sun },
            { value: 'dark' as const, label: 'Dark', icon: Moon },
            { value: 'system' as const, label: 'System', icon: Monitor },
          ]).map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                theme === option.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-surface-700 hover:border-gray-300 dark:hover:border-surface-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              <option.icon className="w-5 h-5" />
              <span className="text-xs font-semibold">{option.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Member since {user?.createdAt ? formatDate(user.createdAt) : '--'}</p>
          </div>
          <Button onClick={logout} variant="danger" size="sm">
            Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
