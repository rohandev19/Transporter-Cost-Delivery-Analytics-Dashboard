import { TransporterRecord, VehicleSummary } from '../types/transporter';

/**
 * Aggregate transporter data by vehicle
 */
export function aggregateVehicleData(records: TransporterRecord[]): VehicleSummary[] {
  const vehicleMap = new Map<string, VehicleSummary>();

  records.forEach(record => {
    const existing = vehicleMap.get(record.plateNumber);

    if (existing) {
      existing.totalUsageDays++;
      existing.totalKilometer += record.kilometer;
      existing.totalGasolineCost += record.gasolineCost;
      existing.totalTollCost += record.tollCost;
      existing.totalParkingCost += record.parkingCost;
      existing.totalCost += record.totalCost;
      if (record.status === 'anomaly' || record.status === 'warning') {
        existing.anomalyCount++;
      }
    } else {
      vehicleMap.set(record.plateNumber, {
        plateNumber: record.plateNumber,
        totalUsageDays: 1,
        totalKilometer: record.kilometer,
        totalGasolineCost: record.gasolineCost,
        totalTollCost: record.tollCost,
        totalParkingCost: record.parkingCost,
        totalCost: record.totalCost,
        costPerKm: 0,
        anomalyCount: (record.status === 'anomaly' || record.status === 'warning') ? 1 : 0,
      });
    }
  });

  // Calculate cost per km for each vehicle
  const summaries = Array.from(vehicleMap.values());
  summaries.forEach(summary => {
    summary.costPerKm = summary.totalKilometer > 0 
      ? summary.totalCost / summary.totalKilometer 
      : 0;
  });

  // Sort by total cost descending
  return summaries.sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Get top N vehicles by total cost
 */
export function getTopVehiclesByCost(
  summaries: VehicleSummary[],
  limit: number = 10
): VehicleSummary[] {
  return [...summaries]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, limit);
}

/**
 * Get most efficient vehicles by cost per km
 */
export function getMostEfficientVehicles(
  summaries: VehicleSummary[],
  limit: number = 10
): VehicleSummary[] {
  return [...summaries]
    .filter(s => s.totalKilometer > 0)
    .sort((a, b) => a.costPerKm - b.costPerKm)
    .slice(0, limit);
}

/**
 * Get least efficient vehicles by cost per km
 */
export function getLeastEfficientVehicles(
  summaries: VehicleSummary[],
  limit: number = 10
): VehicleSummary[] {
  return [...summaries]
    .filter(s => s.totalKilometer > 0)
    .sort((a, b) => b.costPerKm - a.costPerKm)
    .slice(0, limit);
}

/**
 * Get vehicles with anomalies
 */
export function getVehiclesWithAnomalies(
  summaries: VehicleSummary[]
): VehicleSummary[] {
  return summaries
    .filter(s => s.anomalyCount > 0)
    .sort((a, b) => b.anomalyCount - a.anomalyCount);
}
