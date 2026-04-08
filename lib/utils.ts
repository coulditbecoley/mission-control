export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Task statuses
    'todo': 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'done': 'bg-green-100 text-green-700',
    'blocked': 'bg-red-100 text-red-700',
    // Project statuses
    'planning': 'bg-purple-100 text-purple-700',
    'active': 'bg-blue-100 text-blue-700',
    'paused': 'bg-yellow-100 text-yellow-700',
    'completed': 'bg-green-100 text-green-700',
    // Agent statuses
    'offline': 'bg-gray-100 text-gray-700',
    'idle': 'bg-yellow-100 text-yellow-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'low': 'text-green-600',
    'medium': 'text-yellow-600',
    'high': 'text-orange-600',
    'urgent': 'text-red-600',
  };
  return colors[priority] || 'text-gray-600';
}

export function getProjectColor(color: string): string {
  const colors: Record<string, string> = {
    'red': 'bg-red-500',
    'blue': 'bg-blue-500',
    'green': 'bg-green-500',
    'purple': 'bg-purple-500',
    'yellow': 'bg-yellow-500',
    'pink': 'bg-pink-500',
    'indigo': 'bg-indigo-500',
    'cyan': 'bg-cyan-500',
  };
  return colors[color] || 'bg-blue-500';
}

export function filterAndSearch<T extends { title?: string; name?: string }>(
  items: T[],
  query: string,
): T[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item) => {
    const title = (item.title || item.name || '').toLowerCase();
    return title.includes(q);
  });
}
