'use client';

import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'group/button relative inline-flex select-none items-center justify-center overflow-hidden font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] dark:focus:ring-offset-surface-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
          {
            'bg-gradient-to-b from-primary-500 to-primary-700 text-white hover:from-primary-500 hover:to-primary-800 focus:ring-primary-500 shadow-md hover:shadow-lg dark:from-primary-500 dark:to-primary-700 dark:hover:to-primary-600': variant === 'primary',
            'bg-gradient-to-b from-accent-500 to-accent-600 text-white hover:from-accent-500 hover:to-accent-700 focus:ring-accent-400 shadow-md dark:from-accent-500 dark:to-accent-700': variant === 'secondary',
            'border-2 border-primary-300 text-primary-700 hover:bg-primary-50 focus:ring-primary-500 dark:border-primary-500 dark:text-primary-300 dark:hover:bg-primary-500/10': variant === 'outline',
            'text-gray-600 hover:bg-gray-100 focus:ring-gray-400 dark:text-gray-300 dark:hover:bg-surface-800': variant === 'ghost',
            'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 dark:bg-danger-600 dark:hover:bg-danger-500': variant === 'danger',
          },
          {
            'text-xs px-3 py-2 sm:py-1.5 rounded-lg min-h-[36px]': size === 'sm',
            'text-sm px-4 py-3 sm:py-2.5 rounded-xl min-h-[44px]': size === 'md',
            'text-base px-6 py-3.5 sm:py-3 rounded-xl min-h-[48px]': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {variant === 'primary' && (
          <span className="xp-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/button:opacity-100" />
        )}
        <span className="relative z-10 inline-flex items-center">
          {loading && (
            <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
