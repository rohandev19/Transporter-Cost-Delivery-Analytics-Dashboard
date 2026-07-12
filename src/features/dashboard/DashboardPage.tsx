import { useEffect } from 'react';
import { useTransporterStore } from '../../stores/transporterStore';
import { MOCK_TRANSPORTER_RECORDS } from '../../data/mockTransporterRecords';
import { calculateDashboardMetrics } from '../../utils/calculateMetrics';
import MetricCard from '../../components/common/MetricCard';
import EmptyState from '../../components/common/EmptyState';
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
  const { records, setRecords } = useTransporterStore();

  useEffect(() => {
    // Load mock data if no records exist
    if (records.length === 0) {
      setRecords(MOCK_TRANSPORTER_RECORDS);
    }
  }, [records.length, setRecords]);

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

  const metrics = calculateDashboardMetrics(records);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Monitor your transporter operations and costs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart component coming soon
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daily Cost Trend
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart component coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
