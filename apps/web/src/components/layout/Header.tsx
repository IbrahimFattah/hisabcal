'use client';

import { useAuth } from '@/lib/auth';
import { useTheme } from '@/providers/ThemeProvider';
import { LogOut, User, Moon, Sun, Sparkles } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100/80 bg-white/80 backdrop-blur-md dark:border-surface-700 dark:bg-surface-900/80 safe-area-pt">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        {/* Mobile: app logo */}
        <div className="md:hidden">
          <h1 className="font-display text-xl font-black text-primary-600 dark:text-primary-400">HisabCal</h1>
        </div>

        {/* Desktop: welcome */}
        <div className="hidden md:flex md:items-center md:gap-3">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</h2>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.name || 'User'}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-400/15 px-2.5 py-1 text-[11px] font-semibold text-warning-600 dark:bg-warning-500/15 dark:text-warning-400">
            <Sparkles className="h-3.5 w-3.5" />
            Mission Mode
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Theme Toggle -- 44px min touch target */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:-translate-y-0.5 hover:bg-gray-100 dark:hover:bg-surface-800 active:scale-95"
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            <Sun className="w-[18px] h-[18px] text-warning-500 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-[18px] h-[18px] text-primary-300 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </button>

          {/* User pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-50 dark:bg-primary-500/15 rounded-full">
            <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 hidden sm:inline max-w-[100px] truncate">
              {user?.name}
            </span>
          </div>

          {/* Logout -- 44px min touch target */}
          <button
            onClick={logout}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:-translate-y-0.5 hover:bg-gray-100 dark:hover:bg-surface-800 active:scale-95"
            title="Log out"
          >
            <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
