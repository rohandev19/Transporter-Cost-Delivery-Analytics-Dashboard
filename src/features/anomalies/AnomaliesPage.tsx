import { useState, useMemo } from 'react';
import { useTransporterStore } from '../../stores/transporterStore';
import type { AnomalySeverity, AnomalyCategory } from '../../types/transporter';

import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../lib/formatCurrency';
import { formatDate } from '../../lib/formatDate';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  Filter,
  X,
} from 'lucide-react';

const SEVERITY_CONFIG: Record<AnomalySeverity, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  high: { label: 'High', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: ShieldAlert },
  medium: { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle },
  low: { label: 'Low', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Info },
};

const CATEGORY_LABELS: Record<AnomalyCategory, string> = {
  cost: 'Cost Issue',
  data_quality: 'Data Quality',
  duplicate: 'Duplicate',
  operational: 'Operational',
};

const CATEGORY_COLORS: Record<AnomalyCategory, string> = {
  cost: '#ef4444',
  data_quality: '#f59e0b',
  duplicate: '#8b5cf6',
  operational: '#3b82f6',
};

export default function AnomaliesPage() {
  const { records, anomalies } = useTransporterStore();
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AnomalyCategory | 'all'>('all');

  // Anomaly stats
  const stats = useMemo(() => {
    const bySeverity = { high: 0, medium: 0, low: 0 };
    const byCategory = { cost: 0, data_quality: 0, duplicate: 0, operational: 0 };

    anomalies.forEach((a) => {
      bySeverity[a.severity]++;
      byCategory[a.category]++;
    });

    return { bySeverity, byCategory };
  }, [anomalies]);

  // Chart data
  const categoryChartData = useMemo(() => {
    return Object.entries(stats.byCategory)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        name: CATEGORY_LABELS[key as AnomalyCategory],
        value: count,
        color: CATEGORY_COLORS[key as AnomalyCategory],
      }));
  }, [stats.byCategory]);

  // Filtered anomalies with record data
  const filteredAnomalies = useMemo(() => {
    let result = anomalies;
    if (severityFilter !== 'all') {
      result = result.filter((a) => a.severity === severityFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter);
    }
    return result.map((anomaly) => ({
      ...anomaly,
      record: records.find((r) => r.id === anomaly.recordId),
    }));
  }, [anomalies, records, severityFilter, categoryFilter]);

  const clearFilters = () => {
    setSeverityFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = severityFilter !== 'all' || categoryFilter !== 'all';

  if (anomalies.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Anomaly Center</h1>
        <EmptyState
          title="No Anomalies Detected"
          description="All transporter records are valid. No data quality issues or cost anomalies found."
          icon={AlertTriangle}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Anomaly Center</h1>
        <p className="text-gray-600 mt-1">
          Monitor and investigate data quality issues and cost anomalies
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <p className="text-sm text-gray-600 mb-1">Total Anomalies</p>
          <p className="text-3xl font-bold text-gray-900">{anomalies.length}</p>
        </div>
        {(['high', 'medium', 'low'] as AnomalySeverity[]).map((severity) => {
          const config = SEVERITY_CONFIG[severity];
          const Icon = config.icon;
          return (
            <div
              key={severity}
              className={`card p-5 border ${config.border} ${config.bg} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => setSeverityFilter(severity)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <p className={`text-sm font-medium ${config.color}`}>{config.label} Severity</p>
              </div>
              <p className={`text-3xl font-bold ${config.color}`}>
                {stats.bySeverity[severity]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart + Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Category Distribution Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="card p-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as AnomalySeverity | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Severity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as AnomalyCategory | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                <option value="cost">Cost Issue</option>
                <option value="data_quality">Data Quality</option>
                <option value="duplicate">Duplicate</option>
                <option value="operational">Operational</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}

              <span className="text-sm text-gray-500 ml-auto">
                {filteredAnomalies.length} anomalies
              </span>
            </div>
          </div>

          {/* Anomaly Items */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredAnomalies.length === 0 ? (
              <div className="card p-8 text-center text-gray-500">
                No anomalies match the selected filters
              </div>
            ) : (
              filteredAnomalies.map((anomaly) => {
                const sevConfig = SEVERITY_CONFIG[anomaly.severity];
                const SevIcon = sevConfig.icon;

                return (
                  <div
                    key={anomaly.id}
                    className={`card p-4 border ${sevConfig.border} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${sevConfig.bg}`}>
                        <SevIcon className={`w-4 h-4 ${sevConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {anomaly.code}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sevConfig.bg} ${sevConfig.color}`}>
                            {sevConfig.label}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                            {CATEGORY_LABELS[anomaly.category]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {anomaly.message}
                        </p>
                        {anomaly.record && (
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                            <span>{formatDate(anomaly.record.date)}</span>
                            <span>•</span>
                            <span>{anomaly.record.driverName}</span>
                            <span>•</span>
                            <span>{anomaly.record.plateNumber}</span>
                            <span>•</span>
                            <span>{formatCurrency(anomaly.record.totalCost)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
