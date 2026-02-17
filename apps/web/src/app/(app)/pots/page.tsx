'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';
import { useConfetti } from '@/components/shared/ConfettiEffect';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  Target,
  Plus,
  ArrowRight,
  Gift,
  Calendar,
  Trash2,
  Coins,
} from 'lucide-react';

export default function PotsPage() {
  const { addToast } = useToast();
  const { fire: fireConfetti } = useConfetti();
  const [pots, setPots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAllocate, setShowAllocate] = useState<string | null>(null);
  const [allocateAmount, setAllocateAmount] = useState('');

  // Create form
  const [title, setTitle] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ pots: any[] }>('/api/pots');
      setPots(res.pots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPots(); }, [fetchPots]);

  const handleCreate = async () => {
    if (!title || !targetCalories || !dueDate) return;
    setSaving(true);
    try {
      await api.post('/api/pots', { title, targetCalories: Number(targetCalories), dueDate });
      addToast('Pot created! Start saving towards your goal.', 'success');
      setShowCreate(false);
      setTitle('');
      setTargetCalories('');
      setDueDate('');
      fetchPots();
    } catch (err: any) {
      addToast(err.message || 'Failed to create pot', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAllocate = async (potId: string) => {
    if (!allocateAmount) return;
    setSaving(true);
    try {
      await api.post(`/api/pots/${potId}/allocate`, { points: Number(allocateAmount) });
      addToast(`Allocated ${allocateAmount} points to pot!`, 'success');
      setShowAllocate(null);
      setAllocateAmount('');
      fetchPots();
    } catch (err: any) {
      addToast(err.message || 'Allocation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRedeem = async (potId: string) => {
    setSaving(true);
    try {
      const result = await api.post<any>(`/api/pots/${potId}/redeem`);
      fireConfetti();
      addToast(`Pot redeemed! +${formatNumber(result.caloriesEquivalent)} cal extra allowance`, 'success');
      fetchPots();
    } catch (err: any) {
      addToast(err.message || 'Redeem failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (potId: string) => {
    try {
      await api.delete(`/api/pots/${potId}`);
      addToast('Pot deleted (saved points returned to bank)', 'info');
      fetchPots();
    } catch (err: any) {
      addToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Calorie Pots</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Save for special occasions</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Pot
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : pots.length === 0 ? (
        <EmptyState
          icon={<Target className="w-12 h-12" />}
          title="No pots yet"
          description="Create a pot to start saving calories for a special occasion"
          action={<Button onClick={() => setShowCreate(true)} size="sm"><Plus className="w-4 h-4 mr-1" /> Create Pot</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pots.map((pot) => (
            <Card key={pot.id} className={pot.isRedeemed ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${pot.isRedeemed ? 'bg-gray-100 dark:bg-surface-800' : 'bg-primary-100 dark:bg-primary-500/15'}`}>
                    {pot.isRedeemed ? <Gift className="w-5 h-5 text-gray-400" /> : <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                  </div>
                  <div>
                    <CardTitle>{pot.title}</CardTitle>
                    {pot.isRedeemed && <span className="text-xs text-accent-600 font-semibold">Redeemed</span>}
                  </div>
                </div>
                {!pot.isRedeemed && (
                  <button onClick={() => handleDelete(pot.id)} className="p-2 -mr-1 -mt-1 hover:bg-gray-100 dark:hover:bg-surface-800 rounded-lg active:scale-95">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              <ProgressBar value={pot.percentage} color={pot.percentage >= 100 ? 'accent' : 'primary'} size="md" showLabel />

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3">
                <div className="text-center bg-gray-50 dark:bg-surface-800 rounded-xl py-2 px-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Saved</p>
                  <p className="text-xs sm:text-sm font-bold dark:text-gray-100">{formatNumber(pot.savedCalories)}</p>
                </div>
                <div className="text-center bg-gray-50 dark:bg-surface-800 rounded-xl py-2 px-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Target</p>
                  <p className="text-xs sm:text-sm font-bold dark:text-gray-100">{formatNumber(pot.targetCalories)}</p>
                </div>
                <div className="text-center bg-gray-50 dark:bg-surface-800 rounded-xl py-2 px-1">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Due</p>
                  <p className="text-xs sm:text-sm font-bold dark:text-gray-100">{formatDate(pot.dueDate)}</p>
                </div>
              </div>

              {!pot.isRedeemed && pot.remaining > 0 && (
                <div className="bg-primary-50 dark:bg-primary-500/10 rounded-xl p-2 mt-3 text-xs text-primary-700 dark:text-primary-300 text-center">
                  Save ~{formatNumber(pot.dailyCalories)} cal/day ({pot.daysRemaining} days left)
                </div>
              )}

              {!pot.isRedeemed && (
                <div className="flex gap-2 mt-3">
                  <Button onClick={() => { setShowAllocate(pot.id); setAllocateAmount(''); }} variant="outline" size="sm" className="flex-1">
                    <Coins className="w-3 h-3 mr-1" /> Allocate
                  </Button>
                  {pot.percentage >= 100 && (
                    <Button onClick={() => handleRedeem(pot.id)} variant="secondary" size="sm" className="flex-1">
                      <Gift className="w-3 h-3 mr-1" /> Redeem
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Pot Dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="Create Calorie Pot">
        <div className="space-y-4">
          <Input
            id="potTitle"
            label="Occasion Name"
            placeholder="e.g. Birthday Dinner, Holiday Feast"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            id="targetCal"
            type="number"
            label="Target Calories"
            placeholder="2000"
            value={targetCalories}
            onChange={(e) => setTargetCalories(e.target.value)}
          />
          <Input
            id="dueDate"
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Button onClick={handleCreate} loading={saving} disabled={!title || !targetCalories || !dueDate} className="w-full">
            Create Pot
          </Button>
        </div>
      </Dialog>

      {/* Allocate Dialog */}
      <Dialog open={!!showAllocate} onClose={() => setShowAllocate(null)} title="Allocate Points to Pot">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Transfer points from your bank to this pot.
          </p>
          <Input
            id="allocateAmount"
            type="number"
            label="Points to Allocate"
            placeholder="50"
            value={allocateAmount}
            onChange={(e) => setAllocateAmount(e.target.value)}
          />
          <Button onClick={() => showAllocate && handleAllocate(showAllocate)} loading={saving} disabled={!allocateAmount} className="w-full">
            Allocate Points
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
