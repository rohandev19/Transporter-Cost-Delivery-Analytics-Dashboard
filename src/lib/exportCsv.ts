import { TransporterRecord } from '../types/transporter';
import { DriverSummary, VehicleSummary } from '../types/transporter';

/**
 * Convert transporter records to CSV string
 */
export function recordsToCsv(records: TransporterRecord[]): string {
  const headers = [
    'Date',
    'Driver',
    'Plate Number',
    'Customer',
    'Points',
    'KM',
    'Gasoline',
    'Toll',
    'Parking',
    'Overtime',
    'Incentive',
    'Total Cost',
    'Cost/Point',
    'Cost/KM',
    'Status',
    'Anomaly Reasons',
  ];

  const rows = records.map((r) => [
    r.date,
    `"${r.driverName}"`,
    `"${r.plateNumber}"`,
    `"${r.customerName}"`,
    r.deliveryPoints,
    r.kilometer,
    r.gasolineCost,
    r.tollCost,
    r.parkingCost,
    r.overtimeCost,
    r.incentiveCost,
    r.totalCost,
    Math.round(r.costPerPoint),
    Math.round(r.costPerKm),
    r.status,
    `"${r.anomalyReasons.join('; ')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Convert driver summaries to CSV string
 */
export function driverSummariesToCsv(summaries: DriverSummary[]): string {
  const headers = [
    'Driver Name',
    'Total Deliveries',
    'Total Points',
    'Total KM',
    'Total Cost',
    'Avg Cost/Point',
    'Total Overtime',
    'Total Incentive',
    'Anomaly Count',
  ];

  const rows = summaries.map((s) => [
    `"${s.driverName}"`,
    s.totalDeliveries,
    s.totalPoints,
    s.totalKilometer,
    s.totalCost,
    Math.round(s.averageCostPerPoint),
    s.totalOvertime,
    s.totalIncentive,
    s.anomalyCount,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Convert vehicle summaries to CSV string
 */
export function vehicleSummariesToCsv(summaries: VehicleSummary[]): string {
  const headers = [
    'Plate Number',
    'Usage Days',
    'Total KM',
    'Gasoline Cost',
    'Toll Cost',
    'Parking Cost',
    'Total Cost',
    'Cost/KM',
    'Anomaly Count',
  ];

  const rows = summaries.map((s) => [
    `"${s.plateNumber}"`,
    s.totalUsageDays,
    s.totalKilometer,
    s.totalGasolineCost,
    s.totalTollCost,
    s.totalParkingCost,
    s.totalCost,
    Math.round(s.costPerKm),
    s.anomalyCount,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Trigger CSV file download in browser
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger JSON file download in browser
 */
export function downloadJson(data: unknown, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
