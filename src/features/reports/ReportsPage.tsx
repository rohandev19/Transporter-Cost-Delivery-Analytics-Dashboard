import { useState, useMemo, useRef } from 'react';
import { useTransporterStore } from '../../stores/transporterStore';
import { useAuthStore } from '../../stores/authStore';
import { aggregateDriverData, getTopDriversByCost } from '../../utils/aggregateDriverData';
import { aggregateVehicleData, getTopVehiclesByCost } from '../../utils/aggregateVehicleData';
import { formatCurrency, formatNumber, formatCompactCurrency } from '../../lib/formatCurrency';
import { formatDate } from '../../lib/formatDate';
import { recordsToCsv, downloadCsv, downloadJson } from '../../lib/exportCsv';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import {
  FileText,
  Printer,
  Calendar,
  Users,
  Truck,
  Building2,
  MapPin,
  Route,
  DollarSign,
  AlertTriangle,
  FileDown,
  FileJson,
} from 'lucide-react';

export default function ReportsPage() {
  const { records } = useTransporterStore();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canExport = hasPermission('canExport');
  const reportRef = useRef<HTMLDivElement>(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filtered records by date range
  const filteredRecords = useMemo(() => {
    let result = records;
    if (dateFrom) {
      result = result.filter((r) => r.date >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((r) => r.date <= dateTo);
    }
    return result;
  }, [records, dateFrom, dateTo]);

  // Report data
  const reportData = useMemo(() => {
    const driverSummaries = aggregateDriverData(filteredRecords);
    const vehicleSummaries = aggregateVehicleData(filteredRecords);
    const topDrivers = getTopDriversByCost(driverSummaries, 5);
    const topVehicles = getTopVehiclesByCost(vehicleSummaries, 5);

    const totalCost = filteredRecords.reduce((s, r) => s + r.totalCost, 0);
    const totalPoints = filteredRecords.reduce((s, r) => s + r.deliveryPoints, 0);
    const totalKm = filteredRecords.reduce((s, r) => s + r.kilometer, 0);
    const uniqueDrivers = new Set(filteredRecords.map((r) => r.driverName)).size;
    const uniqueVehicles = new Set(filteredRecords.map((r) => r.plateNumber)).size;
    const uniqueCustomers = new Set(filteredRecords.map((r) => r.customerName)).size;
    const anomalyRecords = filteredRecords.filter((r) => r.status === 'anomaly' || r.status === 'warning');

    return {
      totalRecords: filteredRecords.length,
      totalCost,
      totalPoints,
      totalKm,
      uniqueDrivers,
      uniqueVehicles,
      uniqueCustomers,
      anomalyCount: anomalyRecords.length,
      topDrivers,
      topVehicles,
      driverSummaries,
      vehicleSummaries,
      anomalyRecords: anomalyRecords.slice(0, 10),
    };
  }, [filteredRecords]);

  const handleExportCsv = () => {
    const csv = recordsToCsv(filteredRecords);
    const suffix = dateFrom || dateTo ? `-${dateFrom || 'start'}-to-${dateTo || 'end'}` : '';
    downloadCsv(csv, `transporter-report${suffix}.csv`);
  };

  const handleExportJson = () => {
    const suffix = dateFrom || dateTo ? `-${dateFrom || 'start'}-to-${dateTo || 'end'}` : '';
    downloadJson({
      generatedAt: new Date().toISOString(),
      period: { from: dateFrom || 'all', to: dateTo || 'all' },
      summary: {
        totalRecords: reportData.totalRecords,
        totalCost: reportData.totalCost,
        totalPoints: reportData.totalPoints,
        totalKm: reportData.totalKm,
        uniqueDrivers: reportData.uniqueDrivers,
        uniqueVehicles: reportData.uniqueVehicles,
        uniqueCustomers: reportData.uniqueCustomers,
        anomalyCount: reportData.anomalyCount,
      },
      topDrivers: reportData.topDrivers,
      topVehicles: reportData.topVehicles,
      records: filteredRecords,
    }, `transporter-report${suffix}.json`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (records.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
        <EmptyState
          title="No Data Available"
          description="Upload transporter data to generate reports."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export operational reports</p>
        </div>
        {canExport && (
          <div className="flex items-center gap-2">
            <button onClick={handleExportCsv} className="btn-secondary inline-flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Export CSV
            </button>
            <button onClick={handleExportJson} className="btn-secondary inline-flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              Export JSON
            </button>
            <button onClick={handlePrint} className="btn-primary inline-flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        )}
      </div>

      {/* Date Filter */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          )}
          <span className="text-sm text-gray-500 ml-auto">
            {reportData.totalRecords} records in period
          </span>
        </div>
      </div>

      {/* Report Content (printable area) */}
      <div ref={reportRef} className="print:p-8">
        {/* Report Header (visible in print) */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold">Transporter Cost & Delivery Analytics Report</h1>
          <p className="text-gray-600">
            Period: {dateFrom || 'All'} — {dateTo || 'All'} | Generated: {new Date().toLocaleDateString('id-ID')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard icon={FileText} label="Total Records" value={formatNumber(reportData.totalRecords)} />
          <SummaryCard icon={Users} label="Drivers" value={String(reportData.uniqueDrivers)} />
          <SummaryCard icon={Truck} label="Vehicles" value={String(reportData.uniqueVehicles)} />
          <SummaryCard icon={Building2} label="Customers" value={String(reportData.uniqueCustomers)} />
          <SummaryCard icon={MapPin} label="Delivery Points" value={formatNumber(reportData.totalPoints)} />
          <SummaryCard icon={Route} label="Total Kilometer" value={`${formatNumber(reportData.totalKm)} km`} />
          <SummaryCard icon={DollarSign} label="Total Cost" value={formatCompactCurrency(reportData.totalCost)} highlight />
          <SummaryCard icon={AlertTriangle} label="Anomalies" value={String(reportData.anomalyCount)} warning={reportData.anomalyCount > 0} />
        </div>

        {/* Top 5 Drivers */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Drivers by Cost</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">#</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Driver Name</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Deliveries</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Points</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Total Cost</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Avg Cost/Pt</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Anomalies</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topDrivers.map((driver, index) => (
                  <tr key={driver.driverName} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-500 font-medium">{index + 1}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{driver.driverName}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{driver.totalDeliveries}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{formatNumber(driver.totalPoints)}</td>
                    <td className="py-2 px-3 text-right font-medium text-gray-900">{formatCurrency(driver.totalCost)}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{formatCurrency(Math.round(driver.averageCostPerPoint))}</td>
                    <td className="py-2 px-3 text-right">
                      {driver.anomalyCount > 0 ? (
                        <span className="text-red-600 font-medium">{driver.anomalyCount}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Vehicles */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Vehicles by Cost</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">#</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Plate Number</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Usage Days</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Total KM</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Total Cost</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Cost/KM</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Anomalies</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topVehicles.map((vehicle, index) => (
                  <tr key={vehicle.plateNumber} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-500 font-medium">{index + 1}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{vehicle.plateNumber}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{vehicle.totalUsageDays}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{formatNumber(vehicle.totalKilometer)}</td>
                    <td className="py-2 px-3 text-right font-medium text-gray-900">{formatCurrency(vehicle.totalCost)}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{formatCurrency(Math.round(vehicle.costPerKm))}</td>
                    <td className="py-2 px-3 text-right">
                      {vehicle.anomalyCount > 0 ? (
                        <span className="text-red-600 font-medium">{vehicle.anomalyCount}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Anomaly Summary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Anomaly Summary ({reportData.anomalyCount} records)
          </h3>
          {reportData.anomalyRecords.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">No anomalies in the selected period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Date</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Driver</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Plate</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">Total Cost</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Reasons</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.anomalyRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-700">{formatDate(record.date)}</td>
                      <td className="py-2 px-3 text-gray-900 font-medium">{record.driverName}</td>
                      <td className="py-2 px-3 text-gray-700">{record.plateNumber}</td>
                      <td className="py-2 px-3 text-right text-gray-900">{formatCurrency(record.totalCost)}</td>
                      <td className="py-2 px-3">
                        <StatusBadge status={record.status} size="sm" />
                      </td>
                      <td className="py-2 px-3 text-gray-600 text-xs max-w-[250px]">
                        {record.anomalyReasons.join('; ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.anomalyCount > 10 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Showing 10 of {reportData.anomalyCount} anomaly records. Export for full data.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  highlight,
  warning,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`card p-4 ${
        highlight
          ? 'border border-primary-200 bg-primary-50'
          : warning
          ? 'border border-red-200 bg-red-50'
          : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon
          className={`w-4 h-4 ${
            highlight ? 'text-primary-600' : warning ? 'text-red-600' : 'text-gray-400'
          }`}
        />
        <p className="text-xs text-gray-600">{label}</p>
      </div>
      <p
        className={`text-xl font-bold ${
          highlight ? 'text-primary-700' : warning ? 'text-red-700' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
