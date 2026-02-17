'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Landmark,
  Target,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/log', label: 'Log', icon: UtensilsCrossed },
  { href: '/bank', label: 'Bank', icon: Landmark },
  { href: '/pots', label: 'Pots', icon: Target },
  { href: '/settings', label: 'More', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100/80 bg-white/95 backdrop-blur-lg dark:border-surface-700 dark:bg-surface-900/95 md:hidden safe-area-pb">
      <div className="flex items-stretch justify-around">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-[11px] font-medium transition-colors active:scale-95',
                active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 transition-transform',
                active && 'text-primary-600 dark:text-primary-400 scale-110'
              )} />
              <span>{item.label}</span>
              {active && (
                <div className="absolute top-0 h-0.5 w-8 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
