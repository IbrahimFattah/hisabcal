'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Landmark,
  Target,
  Settings,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/log', label: 'Log Meals', icon: UtensilsCrossed },
  { href: '/bank', label: 'Bank', icon: Landmark },
  { href: '/pots', label: 'Pots', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen sticky top-0 border-r border-gray-100 bg-white/95 dark:border-surface-700 dark:bg-surface-900/95 md:flex md:w-64 md:flex-col">
      <div className="px-6 py-5">
        <Image src="/logo.png" alt="HisabCal" width={150} height={42} className="h-10 w-auto dark:brightness-110" priority />
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">Calorie Banking System</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 shadow-sm dark:from-primary-500/20 dark:to-primary-500/10 dark:text-primary-300 dark:shadow-none'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-surface-800 dark:hover:text-gray-200'
              )}
            >
              <item.icon className={cn('h-5 w-5', active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mx-3 mb-3 rounded-2xl border border-primary-200/70 bg-gradient-to-br from-primary-50 to-accent-50 p-4 dark:border-primary-500/30 dark:from-primary-500/15 dark:to-accent-500/10">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary-700 dark:text-primary-300">
          <Sparkles className="h-3.5 w-3.5" />
          Daily Mission
        </div>
        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          Stay under your target to bank more points and keep your streak alive.
        </p>
      </div>
    </aside>
  );
}
