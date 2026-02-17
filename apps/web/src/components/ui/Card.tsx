import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  interactive?: boolean;
}

export function Card({ children, className, padding = true, interactive = false }: CardProps) {
  return (
    <div
      data-interactive={interactive ? 'true' : 'false'}
      className={cn(
        'game-card rounded-2xl border border-gray-100/90 bg-white/95 shadow-sm dark:border-surface-700 dark:bg-surface-900/95 dark:shadow-none',
        interactive && 'cursor-default',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('font-display text-lg font-bold text-gray-900 dark:text-gray-100', className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}>{children}</p>;
}
