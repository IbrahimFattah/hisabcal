import { cn } from '@/lib/utils';

interface StatPillProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'accent' | 'warning';
  className?: string;
}

export function StatPill({ label, value, icon, color = 'primary', className }: StatPillProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium',
      {
        'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300': color === 'primary',
        'bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300': color === 'accent',
        'bg-warning-400/10 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400': color === 'warning',
      },
      className
    )}>
      {icon}
      <span className="font-bold">{value}</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  );
}
