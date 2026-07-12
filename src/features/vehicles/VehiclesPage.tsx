import { useState, useMemo } from 'react';
import { useTransporterStore } from '../../stores/transporterStore';
import {
  aggregateVehicleData,
  getMostEfficientVehicles,
  getLeastEfficientVehicles,
} from '../../utils/aggregateVehicleData';
import type { VehicleSummary } from '../../types/transporter';
import { formatCurrency, formatNumber, formatCompactCurrency } from '../../lib/formatCurrency';
import EmptyState from '../../components/common/EmptyState';
import VehicleCostChart from '../../components/charts/VehicleCostChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Search,
  Truck,
  Fuel,
  DollarSign,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

type SortKey = 'totalUsageDays' | 'totalKilometer' | 'totalCost' | 'costPerKm' | 'anomalyCount';

export default function VehiclesPage() {
  const { records } = useTransporterStore();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalCost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSummary | null>(null);

  const allVehicles = useMemo(() => aggregateVehicleData(records), [records]);

  const filteredVehicles = useMemo(() => {
    let result = allVehicles;
    if (search) {
      result = result.filter((v) =>
        v.plateNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDir === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
  }, [allVehicles, search, sortKey, sortDir]);

  const mostEfficient = useMemo(() => getMostEfficientVehicles(allVehicles, 3), [allVehicles]);
  const leastEfficient = useMemo(() => getLeastEfficientVehicles(allVehicles, 3), [allVehicles]);

  // Efficiency chart data
  const efficiencyChartData = useMemo(
    () =>
      allVehicles
        .filter((v) => v.totalKilometer > 0)
        .sort((a, b) => a.costPerKm - b.costPerKm)
        .slice(0, 10)
        .map((v) => ({
          plate: v.plateNumber,
          costPerKm: Math.round(v.costPerKm),
        })),
    [allVehicles]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortDir === 'desc' ? (
      <ArrowDown className="w-3.5 h-3.5 text-primary-600" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-primary-600" />
    );
  };

  if (records.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Analytics</h1>
        <EmptyState
          title="No Data Available"
          description="Upload transporter data to see vehicle analytics."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Analytics</h1>
        <p className="text-gray-600 mt-1">
          Performance analysis for {allVehicles.length} registered vehicles
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-primary-600" />
            <p className="text-sm text-gray-600">Total Vehicles</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{allVehicles.length}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Fuel className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600">Total Gasoline</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCompactCurrency(allVehicles.reduce((s, v) => s + v.totalGasolineCost, 0))}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-600">Total Cost</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCompactCurrency(allVehicles.reduce((s, v) => s + v.totalCost, 0))}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-gray-600">Vehicles with Issues</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {allVehicles.filter((v) => v.anomalyCount > 0).length}
          </p>
        </div>
      </div>

      {/* Efficiency Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5 border border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Most Efficient Vehicles</h3>
          </div>
          <div className="space-y-2">
            {mostEfficient.map((v, i) => (
              <div key={v.plateNumber} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-600">#{i + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{v.plateNumber}</span>
                </div>
                <span className="text-sm text-green-700 font-medium">
                  {formatCurrency(Math.round(v.costPerKm))}/km
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5 border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Least Efficient Vehicles</h3>
          </div>
          <div className="space-y-2">
            {leastEfficient.map((v, i) => (
              <div key={v.plateNumber} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-600">#{i + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{v.plateNumber}</span>
                </div>
                <span className="text-sm text-red-700 font-medium">
                  {formatCurrency(Math.round(v.costPerKm))}/km
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Cost Ranking</h3>
          <VehicleCostChart records={records} limit={8} />
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost per KM (Most Efficient First)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v: number) => formatCompactCurrency(v)} />
                <YAxis type="category" dataKey="plate" tick={{ fontSize: 11, fill: '#6b7280' }} width={90} />
                <Tooltip
                  formatter={(v: any) => [formatCurrency(Number(v)), 'Cost/KM']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Bar dataKey="costPerKm" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search plate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Vehicle Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Plate Number</th>
                <th
                  className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('totalUsageDays')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Usage Days <SortIcon field="totalUsageDays" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('totalKilometer')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Total KM <SortIcon field="totalKilometer" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Gasoline</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Toll</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Parking</th>
                <th
                  className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('totalCost')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Total Cost <SortIcon field="totalCost" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('costPerKm')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Cost/KM <SortIcon field="costPerKm" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('anomalyCount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Anomalies <SortIcon field="anomalyCount" />
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.plateNumber}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{vehicle.plateNumber}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{vehicle.totalUsageDays}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatNumber(vehicle.totalKilometer)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(vehicle.totalGasolineCost)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(vehicle.totalTollCost)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(vehicle.totalParkingCost)}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(vehicle.totalCost)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(Math.round(vehicle.costPerKm))}</td>
                  <td className="py-3 px-4 text-right">
                    {vehicle.anomalyCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        {vehicle.anomalyCount}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedVehicle(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Vehicle Detail</h2>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-3">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{selectedVehicle.plateNumber}</h3>
              {selectedVehicle.anomalyCount > 0 && (
                <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {selectedVehicle.anomalyCount} anomalies
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MetricBox label="Usage Days" value={formatNumber(selectedVehicle.totalUsageDays)} />
              <MetricBox label="Total KM" value={`${formatNumber(selectedVehicle.totalKilometer)} km`} />
              <MetricBox label="Gasoline Cost" value={formatCurrency(selectedVehicle.totalGasolineCost)} />
              <MetricBox label="Toll Cost" value={formatCurrency(selectedVehicle.totalTollCost)} />
              <MetricBox label="Parking Cost" value={formatCurrency(selectedVehicle.totalParkingCost)} />
              <MetricBox label="Total Cost" value={formatCurrency(selectedVehicle.totalCost)} highlight />
              <MetricBox label="Cost per KM" value={formatCurrency(Math.round(selectedVehicle.costPerKm))} />
              <MetricBox label="Anomaly Count" value={String(selectedVehicle.anomalyCount)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-semibold ${highlight ? 'text-primary-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
