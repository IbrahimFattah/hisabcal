'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/providers/ToastProvider';
import { useConfetti } from '@/components/shared/ConfettiEffect';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatNumber, formatDate, todayString } from '@/lib/utils';
import { pointsToCalories } from '@calories-tracker/shared';
import {
  Landmark,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Info,
  Zap,
} from 'lucide-react';

export default function BankPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { fire: fireConfetti } = useConfetti();
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [earning, setEarning] = useState(false);

  const pointsPerCalorie = user?.settings?.pointsPerCalorie || 0.1;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bankRes, txRes] = await Promise.all([
        api.get<{ account: any }>('/api/bank'),
        api.get<{ transactions: any[] }>('/api/bank/transactions'),
      ]);
      setAccount(bankRes.account);
      setTransactions(txRes.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEarn = async () => {
    setEarning(true);
    try {
      const result = await api.post<any>('/api/bank/earn', { date: todayString() });
      fireConfetti();
      addToast(`Earned ${formatNumber(result.earnedPoints)} points! (${formatNumber(result.leftoverCalories)} cal saved)`, 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Cannot earn points', 'error');
    } finally {
      setEarning(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    setSaving(true);
    try {
      const result = await api.post<any>('/api/bank/withdraw', {
        points: Number(withdrawAmount),
        note: withdrawNote || undefined,
      });
      addToast(`Withdrew ${withdrawAmount} points (+${formatNumber(result.caloriesEquivalent)} cal today)`, 'info');
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawNote('');
      fetchData();
    } catch (err: any) {
      addToast(err.message || 'Withdrawal failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const balance = account?.pointsBalance || 0;
  const calEquiv = pointsToCalories(balance, pointsPerCalorie);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Calorie Bank</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Save calories as points for special occasions</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700 text-white border-0 dark:border-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <p className="text-accent-100 text-sm">Current Balance</p>
            <p className="text-3xl sm:text-4xl font-black">{formatNumber(balance)} <span className="text-base sm:text-lg">pts</span></p>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-200" />
          <span className="text-sm text-accent-100">Equivalent to <strong className="text-white">{formatNumber(calEquiv)} calories</strong> of extra allowance</span>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={handleEarn} loading={earning} variant="secondary" size="lg" className="w-full">
          <ArrowUpCircle className="w-5 h-5 mr-2" /> Earn Points
        </Button>
        <Button onClick={() => setShowWithdraw(true)} variant="outline" size="lg" className="w-full" disabled={balance <= 0}>
          <ArrowDownCircle className="w-5 h-5 mr-2" /> Withdraw
        </Button>
      </div>

      {/* How It Works */}
      <Card className="bg-primary-50 dark:bg-primary-500/10 border-primary-100 dark:border-primary-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-500 dark:text-primary-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-primary-800 dark:text-primary-200">
            <p className="font-semibold mb-1">How Calorie Banking Works</p>
            <ul className="space-y-1.5 text-primary-700 dark:text-primary-300 text-xs sm:text-sm">
              <li>Eat under target &rarr; leftover calories become points</li>
              <li>1 point = {formatNumber(1 / pointsPerCalorie)} cal (configurable in Settings)</li>
              <li>Max earn: {user?.settings?.maxDailyEarnPoints || 300} pts/day</li>
              <li>Withdraw points to boost your daily allowance</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Recent banking activity</CardDescription>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="w-10 h-10" />}
            title="No transactions yet"
            description="Eat under your target and earn your first points!"
          />
        ) : (
          <div className="mt-4 space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 dark:hover:bg-surface-800 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    tx.type === 'EARN' ? 'bg-accent-100 dark:bg-accent-500/15' :
                    tx.type === 'WITHDRAW' ? 'bg-warning-400/20 dark:bg-warning-500/15' :
                    tx.type === 'ALLOCATE' ? 'bg-primary-100 dark:bg-primary-500/15' :
                    'bg-purple-100 dark:bg-purple-500/15'
                  }`}>
                    {tx.type === 'EARN' ? <ArrowUpCircle className="w-4 h-4 text-accent-600" /> :
                     tx.type === 'WITHDRAW' ? <ArrowDownCircle className="w-4 h-4 text-warning-600" /> :
                     <TrendingUp className="w-4 h-4 text-primary-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{tx.note || formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    tx.type === 'EARN' ? 'text-accent-600' : 'text-warning-600'
                  }`}>
                    {tx.type === 'EARN' ? '+' : '-'}{formatNumber(tx.points)} pts
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatNumber(tx.caloriesEquivalent)} cal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Points">
        <div className="space-y-4">
          <div className="bg-accent-50 dark:bg-accent-500/15 rounded-xl p-3 text-center">
            <p className="text-xs text-accent-600 dark:text-accent-400">Available Balance</p>
            <p className="text-2xl font-black text-accent-700 dark:text-accent-300">{formatNumber(balance)} pts</p>
          </div>
          <Input
            id="withdrawAmount"
            type="number"
            label="Points to Withdraw"
            placeholder="50"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          {withdrawAmount && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              = <strong>{formatNumber(pointsToCalories(Number(withdrawAmount), pointsPerCalorie))}</strong> extra calories today
            </p>
          )}
          <Input
            id="withdrawNote"
            label="Note (optional)"
            placeholder="e.g. Birthday dinner"
            value={withdrawNote}
            onChange={(e) => setWithdrawNote(e.target.value)}
          />
          <Button onClick={handleWithdraw} loading={saving} disabled={!withdrawAmount || Number(withdrawAmount) <= 0} className="w-full">
            Withdraw Points
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
