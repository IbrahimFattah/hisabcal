'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { useConfetti } from '@/components/shared/ConfettiEffect';
import { Heart, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const ACTIVITY_OPTIONS = [
  { value: 'SEDENTARY', label: 'Sedentary (little or no exercise)' },
  { value: 'LIGHT', label: 'Light (exercise 1-3 days/week)' },
  { value: 'MODERATE', label: 'Moderate (exercise 3-5 days/week)' },
  { value: 'ACTIVE', label: 'Active (exercise 6-7 days/week)' },
  { value: 'VERY_ACTIVE', label: 'Very Active (hard exercise daily)' },
];

const PACE_OPTIONS = [
  { value: 'SLOW', label: 'Slow (~0.25 kg/week)' },
  { value: 'NORMAL', label: 'Normal (~0.5 kg/week)' },
  { value: 'FAST', label: 'Fast (~0.75 kg/week)' },
];

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { refresh } = useAuth();
  const router = useRouter();
  const { fire: fireConfetti } = useConfetti();

  const [form, setForm] = useState({
    gender: '',
    dateOfBirth: '',
    heightCm: '',
    currentWeightKg: '',
    goalWeightKg: '',
    activityLevel: '',
    goalPace: '',
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      title: 'About You',
      subtitle: 'Let us know your basics',
      fields: (
        <div className="space-y-4">
          <Select
            id="gender"
            label="Gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
          />
          <Input
            id="dob"
            type="date"
            label="Date of Birth"
            value={form.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
          />
        </div>
      ),
      valid: form.gender && form.dateOfBirth,
    },
    {
      title: 'Your Body',
      subtitle: 'Current measurements',
      fields: (
        <div className="space-y-4">
          <Input
            id="height"
            type="number"
            label="Height (cm)"
            placeholder="175"
            value={form.heightCm}
            onChange={(e) => update('heightCm', e.target.value)}
          />
          <Input
            id="weight"
            type="number"
            label="Current Weight (kg)"
            placeholder="80"
            value={form.currentWeightKg}
            onChange={(e) => update('currentWeightKg', e.target.value)}
          />
          <Input
            id="goalWeight"
            type="number"
            label="Goal Weight (kg)"
            placeholder="70"
            value={form.goalWeightKg}
            onChange={(e) => update('goalWeightKg', e.target.value)}
          />
        </div>
      ),
      valid: form.heightCm && form.currentWeightKg && form.goalWeightKg,
    },
    {
      title: 'Your Plan',
      subtitle: 'Activity level and pace',
      fields: (
        <div className="space-y-4">
          <Select
            id="activity"
            label="Activity Level"
            options={ACTIVITY_OPTIONS}
            value={form.activityLevel}
            onChange={(e) => update('activityLevel', e.target.value)}
          />
          <Select
            id="pace"
            label="Weight Loss Pace"
            options={PACE_OPTIONS}
            value={form.goalPace}
            onChange={(e) => update('goalPace', e.target.value)}
          />
        </div>
      ),
      valid: form.activityLevel && form.goalPace,
    },
  ];

  const currentStep = steps[step];

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.put('/api/profile', {
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        heightCm: Number(form.heightCm),
        currentWeightKg: Number(form.currentWeightKg),
        goalWeightKg: Number(form.goalWeightKg),
        activityLevel: form.activityLevel,
        goalPace: form.goalPace,
      });
      fireConfetti();
      await refresh();
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-500/20 rounded-2xl mb-3">
            <Heart className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Let&apos;s set up your profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Step {step + 1} of {steps.length}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary-500 w-8' : 'bg-gray-200 dark:bg-surface-700 w-2'
              }`}
            />
          ))}
        </div>

        <Card className="shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{currentStep.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{currentStep.subtitle}</p>

          {error && (
            <div className="bg-danger-500/10 text-danger-600 text-sm p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {currentStep.fields}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            <div className="flex-1" />
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!currentStep.valid}
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!currentStep.valid}
                variant="secondary"
              >
                <Sparkles className="w-4 h-4 mr-1" /> Complete Setup
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
