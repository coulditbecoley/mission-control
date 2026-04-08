interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
}

export function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-[#141829] rounded-lg border border-[#374151] p-6 hover:border-[#4b5563] transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-3xl font-bold mt-2 text-white">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-2 ${
                trend.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% vs last week
            </p>
          )}
        </div>
        <div className="text-4xl opacity-30 text-blue-500">{icon}</div>
      </div>
    </div>
  );
}
