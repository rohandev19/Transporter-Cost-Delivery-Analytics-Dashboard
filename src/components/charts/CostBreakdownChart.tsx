import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { TransporterRecord } from '../../types/transporter';
import { formatCurrency } from '../../lib/formatCurrency';

interface CostBreakdownChartProps {
  records: TransporterRecord[];
}

const COLORS = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

const COST_LABELS: Record<string, string> = {
  gasoline: 'Gasoline',
  toll: 'Toll',
  parking: 'Parking',
  overtime: 'Overtime',
  incentive: 'Incentive',
};

export default function CostBreakdownChart({ records }: CostBreakdownChartProps) {
  const data = useMemo(() => {
    const totals = records.reduce(
      (acc, r) => ({
        gasoline: acc.gasoline + r.gasolineCost,
        toll: acc.toll + r.tollCost,
        parking: acc.parking + r.parkingCost,
        overtime: acc.overtime + r.overtimeCost,
        incentive: acc.incentive + r.incentiveCost,
      }),
      { gasoline: 0, toll: 0, parking: 0, overtime: 0, incentive: 0 }
    );

    return Object.entries(totals)
      .map(([key, value]) => ({
        name: COST_LABELS[key],
        value,
      }))
      .filter((item) => item.value > 0);
  }, [records]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No cost data available
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => formatCurrency(value)}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '13px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={10}
            formatter={(value: string) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
