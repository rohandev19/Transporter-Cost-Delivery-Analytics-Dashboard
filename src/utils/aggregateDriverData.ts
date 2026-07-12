import { TransporterRecord, DriverSummary } from '../types/transporter';

/**
 * Aggregate transporter data by driver
 */
export function aggregateDriverData(records: TransporterRecord[]): DriverSummary[] {
  const driverMap = new Map<string, DriverSummary>();

  records.forEach(record => {
    const existing = driverMap.get(record.driverName);

    if (existing) {
      existing.totalDeliveries++;
      existing.totalPoints += record.deliveryPoints;
      existing.totalKilometer += record.kilometer;
      existing.totalCost += record.totalCost;
      existing.totalOvertime += record.overtimeCost;
      existing.totalIncentive += record.incentiveCost;
      if (record.status === 'anomaly' || record.status === 'warning') {
        existing.anomalyCount++;
      }
    } else {
      driverMap.set(record.driverName, {
        driverName: record.driverName,
        totalDeliveries: 1,
        totalPoints: record.deliveryPoints,
        totalKilometer: record.kilometer,
        totalCost: record.totalCost,
        averageCostPerPoint: 0,
        totalOvertime: record.overtimeCost,
        totalIncentive: record.incentiveCost,
        anomalyCount: (record.status === 'anomaly' || record.status === 'warning') ? 1 : 0,
      });
    }
  });

  // Calculate average cost per point for each driver
  const summaries = Array.from(driverMap.values());
  summaries.forEach(summary => {
    summary.averageCostPerPoint = summary.totalPoints > 0 
      ? summary.totalCost / summary.totalPoints 
      : 0;
  });

  // Sort by total cost descending
  return summaries.sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Get top N drivers by delivery points
 */
export function getTopDriversByPoints(
  summaries: DriverSummary[],
  limit: number = 10
): DriverSummary[] {
  return [...summaries]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

/**
 * Get top N drivers by total cost
 */
export function getTopDriversByCost(
  summaries: DriverSummary[],
  limit: number = 10
): DriverSummary[] {
  return [...summaries]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, limit);
}

/**
 * Get drivers with anomalies
 */
export function getDriversWithAnomalies(
  summaries: DriverSummary[]
): DriverSummary[] {
  return summaries
    .filter(s => s.anomalyCount > 0)
    .sort((a, b) => b.anomalyCount - a.anomalyCount);
}
