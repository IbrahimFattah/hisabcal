'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Landmark } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-500/20 rounded-2xl mb-4">
            <Landmark className="w-8 h-8 text-accent-600 dark:text-accent-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Start your calorie banking journey</p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl dark:shadow-none px-5 py-6 sm:p-8 border border-gray-100 dark:border-surface-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-danger-500/10 text-danger-600 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <Input
              id="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <Button type="submit" loading={loading} className="w-full" size="lg" variant="secondary">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
