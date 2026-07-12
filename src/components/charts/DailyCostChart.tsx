import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TransporterRecord } from '../../types/transporter';
import { formatCompactCurrency } from '../../lib/formatCurrency';

interface DailyCostChartProps {
  records: TransporterRecord[];
}

export default function DailyCostChart({ records }: DailyCostChartProps) {
  const data = useMemo(() => {
    const dailyMap = new Map<string, number>();

    records.forEach((record) => {
      const existing = dailyMap.get(record.date) || 0;
      dailyMap.set(record.date, existing + record.totalCost);
    });

    return Array.from(dailyMap.entries())
      .map(([date, totalCost]) => ({
        date,
        totalCost,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No daily cost data available
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value: string) => {
              const d = new Date(value);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
            width={70}
          />
          <Tooltip
            formatter={(value: any) => [formatCompactCurrency(value), 'Total Cost']}
            labelFormatter={(label: any) => {
              const d = new Date(label);
              return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
            }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '13px',
            }}
          />
          <Area
            type="monotone"
            dataKey="totalCost"
            stroke="#0284c7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCost)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
