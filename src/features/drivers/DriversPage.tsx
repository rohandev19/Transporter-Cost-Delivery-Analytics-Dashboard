import { useState, useMemo } from 'react';
import { useTransporterStore } from '../../stores/transporterStore';
import {
  aggregateDriverData,
  getTopDriversByCost,
} from '../../utils/aggregateDriverData';
import type { DriverSummary } from '../../types/transporter';
import { formatCurrency, formatNumber } from '../../lib/formatCurrency';
import EmptyState from '../../components/common/EmptyState';
import DriverRankingChart from '../../components/charts/DriverRankingChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactCurrency } from '../../lib/formatCurrency';
import {
  Search,
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';

type SortKey = 'totalDeliveries' | 'totalPoints' | 'totalCost' | 'anomalyCount' | 'averageCostPerPoint';

export default function DriversPage() {
  const { records } = useTransporterStore();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalCost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedDriver, setSelectedDriver] = useState<DriverSummary | null>(null);

  const allDrivers = useMemo(() => aggregateDriverData(records), [records]);

  const filteredDrivers = useMemo(() => {
    let result = allDrivers;
    if (search) {
      result = result.filter((d) =>
        d.driverName.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDir === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
  }, [allDrivers, search, sortKey, sortDir]);

  const topByCost = useMemo(() => getTopDriversByCost(allDrivers, 8), [allDrivers]);

  const topByCostChartData = useMemo(
    () =>
      topByCost.map((d) => ({
        name: d.driverName.split(' ')[0],
        fullName: d.driverName,
        totalCost: d.totalCost,
      })),
    [topByCost]
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Driver Analytics</h1>
        <EmptyState
          title="No Data Available"
          description="Upload transporter data to see driver analytics."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Driver Analytics</h1>
        <p className="text-gray-600 mt-1">
          Performance analysis for {allDrivers.length} active drivers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary-600" />
            <p className="text-sm text-gray-600">Total Drivers</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{allDrivers.length}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600">Total Deliveries</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(allDrivers.reduce((s, d) => s + d.totalDeliveries, 0))}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-600">Total Cost</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCompactCurrency(allDrivers.reduce((s, d) => s + d.totalCost, 0))}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-gray-600">Drivers with Anomalies</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {allDrivers.filter((d) => d.anomalyCount > 0).length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Drivers by Points</h3>
          <DriverRankingChart records={records} limit={8} />
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Drivers by Cost</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByCostChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v: number) => formatCompactCurrency(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} width={80} />
                <Tooltip
                  formatter={(v: any) => [formatCompactCurrency(Number(v)), 'Total Cost']}
                  labelFormatter={(_l: any, p: any) => p?.[0]?.payload?.fullName || _l}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Bar dataKey="totalCost" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
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
            placeholder="Search driver name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Driver Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Driver Name</th>
                <th
                  className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('totalDeliveries')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Deliveries <SortIcon field="totalDeliveries" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('totalPoints')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Points <SortIcon field="totalPoints" />
                  </div>
                </th>
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
                  onClick={() => toggleSort('averageCostPerPoint')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Avg Cost/Pt <SortIcon field="averageCostPerPoint" />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">KM</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Overtime</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Incentive</th>
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
              {filteredDrivers.map((driver) => (
                <tr
                  key={driver.driverName}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{driver.driverName}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{driver.totalDeliveries}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatNumber(driver.totalPoints)}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(driver.totalCost)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(Math.round(driver.averageCostPerPoint))}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatNumber(driver.totalKilometer)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(driver.totalOvertime)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(driver.totalIncentive)}</td>
                  <td className="py-3 px-4 text-right">
                    {driver.anomalyCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        {driver.anomalyCount}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedDriver(driver)}
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

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedDriver(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Driver Detail</h2>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-3">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{selectedDriver.driverName}</h3>
              {selectedDriver.anomalyCount > 0 && (
                <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {selectedDriver.anomalyCount} anomalies
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MetricBox label="Total Deliveries" value={formatNumber(selectedDriver.totalDeliveries)} />
              <MetricBox label="Total Points" value={formatNumber(selectedDriver.totalPoints)} />
              <MetricBox label="Total Kilometer" value={`${formatNumber(selectedDriver.totalKilometer)} km`} />
              <MetricBox label="Total Cost" value={formatCurrency(selectedDriver.totalCost)} highlight />
              <MetricBox label="Avg Cost/Point" value={formatCurrency(Math.round(selectedDriver.averageCostPerPoint))} />
              <MetricBox label="Total Overtime" value={formatCurrency(selectedDriver.totalOvertime)} />
              <MetricBox label="Total Incentive" value={formatCurrency(selectedDriver.totalIncentive)} />
              <MetricBox label="Anomaly Count" value={String(selectedDriver.anomalyCount)} />
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
