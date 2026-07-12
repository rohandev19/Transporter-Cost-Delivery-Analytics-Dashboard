import { useEffect, useMemo } from 'react';
import { useTransporterStore } from '../../stores/transporterStore';
import { MOCK_TRANSPORTER_RECORDS } from '../../data/mockTransporterRecords';
import { calculateDashboardMetrics } from '../../utils/calculateMetrics';
import MetricCard from '../../components/common/MetricCard';
import EmptyState from '../../components/common/EmptyState';
import CostBreakdownChart from '../../components/charts/CostBreakdownChart';
import DailyCostChart from '../../components/charts/DailyCostChart';
import DriverRankingChart from '../../components/charts/DriverRankingChart';
import VehicleCostChart from '../../components/charts/VehicleCostChart';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../lib/formatCurrency';
import { formatDate } from '../../lib/formatDate';
import {
  TrendingUp,
  MapPin,
  DollarSign,
  Activity,
  Route,
  Users,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { records, anomalies, setRecords } = useTransporterStore();

  useEffect(() => {
    // Load mock data if no records exist
    if (records.length === 0) {
      setRecords(MOCK_TRANSPORTER_RECORDS);
    }
  }, [records.length, setRecords]);

  const metrics = useMemo(() => calculateDashboardMetrics(records), [records]);

  const recentAnomalies = useMemo(() => {
    return records
      .filter((r) => r.status === 'anomaly' || r.status === 'warning')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }, [records]);

  if (records.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Dashboard Overview
        </h1>
        <EmptyState
          title="No Data Available"
          description="Upload transporter data to see analytics and insights."
          action={{
            label: 'Upload Data',
            onClick: () => navigate('/upload'),
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Monitor your transporter operations and costs
        </p>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Total Deliveries"
          value={metrics.totalDeliveries}
          icon={TrendingUp}
          format="number"
        />
        <MetricCard
          title="Delivery Points"
          value={metrics.totalDeliveryPoints}
          icon={MapPin}
          format="number"
        />
        <MetricCard
          title="Total Cost"
          value={metrics.totalOperationalCost}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Avg Cost/Point"
          value={metrics.averageCostPerPoint}
          icon={Activity}
          format="currency"
        />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Kilometer"
          value={metrics.totalKilometer}
          icon={Route}
          format="number"
          subtitle={`Avg: ${Math.round(metrics.totalKilometer / metrics.totalDeliveries)} km/delivery`}
        />
        <MetricCard
          title="Active Drivers"
          value={metrics.activeDrivers}
          icon={Users}
          format="number"
        />
        <MetricCard
          title="Active Vehicles"
          value={metrics.activeVehicles}
          icon={Truck}
          format="number"
        />
        <MetricCard
          title="Anomalies Detected"
          value={metrics.totalAnomalies}
          icon={AlertTriangle}
          format="number"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Cost Trend
          </h3>
          <DailyCostChart records={records} />
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Breakdown
          </h3>
          <CostBreakdownChart records={records} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Drivers by Points
            </h3>
            <button
              onClick={() => navigate('/drivers')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </button>
          </div>
          <DriverRankingChart records={records} limit={6} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Vehicle Cost Ranking
            </h3>
            <button
              onClick={() => navigate('/vehicles')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </button>
          </div>
          <VehicleCostChart records={records} limit={6} />
        </div>
      </div>

      {/* Recent Anomalies */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Anomalies
          </h3>
          <button
            onClick={() => navigate('/anomalies')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All ({anomalies.length}) →
          </button>
        </div>

        {recentAnomalies.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">No anomalies detected</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Driver</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Plate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Total Cost</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentAnomalies.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-700">{formatDate(record.date)}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">{record.driverName}</td>
                    <td className="py-3 px-4 text-gray-700">{record.plateNumber}</td>
                    <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(record.totalCost)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={record.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs max-w-[200px] truncate" title={record.anomalyReasons.join('; ')}>
                      {record.anomalyReasons[0] || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
