import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'success' | 'danger' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-[#1a1f3a] text-gray-300 border border-[#374151]',
    secondary: 'bg-blue-900/30 text-blue-300 border border-blue-800/50',
    success: 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50',
    danger: 'bg-red-900/30 text-red-300 border border-red-800/50',
    warning: 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
