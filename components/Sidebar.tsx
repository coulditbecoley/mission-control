'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckSquare,
  FolderOpen,
  Zap,
  BookOpen,
  Activity,
  Calendar,
  FileText,
  Building2,
  TrendingUp,
  Bitcoin,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Overview' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/agents', icon: Zap, label: 'Agents' },
  { href: '/office', icon: Building2, label: 'Office' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/docs', icon: FileText, label: 'Docs' },
  { href: '/activity', icon: Activity, label: 'Activity' },
];

const tradingItems = [
  { href: '/trading/portfolio', icon: TrendingUp, label: 'Portfolio' },
  { href: '/trading/bitcoin', icon: Bitcoin, label: 'Bitcoin' },
  { href: '/trading/trades', icon: TrendingUp, label: 'Trades' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#141829] border-r border-[#374151] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[#374151]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          <h1 className="text-lg font-bold text-white">Asgard Dashboard</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-[#1a1f3a] hover:text-gray-200 active:bg-[#1f2438]',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        {/* Trading Category */}
        <div className="mt-6 pt-4 border-t border-[#374151]">
          <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Trading</div>
          <div className="space-y-1">
            {tradingItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:bg-[#1a1f3a] hover:text-gray-200 active:bg-[#1f2438]',
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#374151] space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#1a1f3a] hover:text-gray-200 transition-colors"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
