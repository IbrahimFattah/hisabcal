'use client';

import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-surface-800 px-4 py-3 sm:py-2.5 text-base sm:text-sm transition-colors dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            error ? 'border-danger-500 focus:ring-danger-500' : 'border-gray-200 dark:border-surface-600',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
