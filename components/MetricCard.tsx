interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
}

export function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-2 ${
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% vs last week
            </p>
          )}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}
