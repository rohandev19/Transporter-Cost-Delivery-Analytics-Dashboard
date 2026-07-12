import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TransporterRecord } from '../../types/transporter';
import { aggregateDriverData, getTopDriversByPoints } from '../../utils/aggregateDriverData';

interface DriverRankingChartProps {
  records: TransporterRecord[];
  limit?: number;
}

export default function DriverRankingChart({ records, limit = 8 }: DriverRankingChartProps) {
  const data = useMemo(() => {
    const summaries = aggregateDriverData(records);
    return getTopDriversByPoints(summaries, limit).map((driver) => ({
      name: driver.driverName.split(' ')[0],
      fullName: driver.driverName,
      points: driver.totalPoints,
      deliveries: driver.totalDeliveries,
    }));
  }, [records, limit]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No driver data available
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={80}
          />
          <Tooltip
            formatter={(value: any, _name: any) => [value, 'Delivery Points']}
            labelFormatter={(_label: any, payload: any) =>
              payload?.[0]?.payload?.fullName || _label
            }
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '13px',
            }}
          />
          <Bar
            dataKey="points"
            fill="#0ea5e9"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
