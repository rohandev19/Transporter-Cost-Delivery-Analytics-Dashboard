import { LucideIcon } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../lib/formatCurrency';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  format?: 'currency' | 'number';
  decimals?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  format = 'number',
  decimals = 0,
  trend,
  subtitle,
}: MetricCardProps) {
  const formattedValue =
    format === 'currency'
      ? formatCurrency(value)
      : formatNumber(value, decimals);

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {formattedValue}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <span
            className={
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
