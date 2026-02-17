'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: 'primary' | 'accent' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'w-full rounded-full bg-gray-100 dark:bg-surface-700 overflow-hidden',
        { 'h-1.5': size === 'sm', 'h-3': size === 'md', 'h-5': size === 'lg' }
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            {
              'bg-primary-500': color === 'primary',
              'bg-accent-500': color === 'accent',
              'bg-warning-500': color === 'warning',
              'bg-danger-500': color === 'danger',
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}
