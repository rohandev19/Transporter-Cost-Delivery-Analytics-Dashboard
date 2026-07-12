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
import { aggregateVehicleData, getTopVehiclesByCost } from '../../utils/aggregateVehicleData';
import { formatCompactCurrency } from '../../lib/formatCurrency';

interface VehicleCostChartProps {
  records: TransporterRecord[];
  limit?: number;
}

export default function VehicleCostChart({ records, limit = 8 }: VehicleCostChartProps) {
  const data = useMemo(() => {
    const summaries = aggregateVehicleData(records);
    return getTopVehiclesByCost(summaries, limit).map((vehicle) => ({
      plate: vehicle.plateNumber,
      totalCost: vehicle.totalCost,
      costPerKm: vehicle.costPerKm,
    }));
  }, [records, limit]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No vehicle data available
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
            tickFormatter={(value: number) => formatCompactCurrency(value)}
          />
          <YAxis
            type="category"
            dataKey="plate"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={90}
          />
          <Tooltip
            formatter={(value: any) => [formatCompactCurrency(value), 'Total Cost']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '13px',
            }}
          />
          <Bar
            dataKey="totalCost"
            fill="#38bdf8"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
