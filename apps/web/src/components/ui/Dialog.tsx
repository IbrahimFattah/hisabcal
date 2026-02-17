'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative w-full sm:max-w-lg bg-white dark:bg-surface-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overscroll-contain',
        'animate-in slide-in-from-bottom duration-300',
        className
      )}>
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-surface-900 z-10">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-surface-600" />
        </div>

        <div className="px-5 pb-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 sticky top-0 sm:static bg-white dark:bg-surface-900 pt-2 sm:pt-0 -mx-5 px-5 sm:mx-0 sm:px-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-2.5 -mr-2 hover:bg-gray-100 dark:hover:bg-surface-800 rounded-xl transition-colors active:scale-95"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Safe area bottom padding for iPhone */}
          <div className="safe-area-pb">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
