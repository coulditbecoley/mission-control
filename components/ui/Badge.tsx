import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'success' | 'danger' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    secondary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
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
