import { TransporterRecord, DashboardMetrics } from '../types/transporter';

/**
 * Calculate total cost from all cost components
 */
export function calculateTotalCost(
  gasolineCost: number,
  tollCost: number = 0,
  parkingCost: number = 0,
  overtimeCost: number = 0,
  incentiveCost: number = 0
): number {
  return gasolineCost + tollCost + parkingCost + overtimeCost + incentiveCost;
}

/**
 * Calculate cost per delivery point
 */
export function calculateCostPerPoint(
  totalCost: number,
  deliveryPoints: number
): number {
  if (deliveryPoints === 0) return 0;
  return totalCost / deliveryPoints;
}

/**
 * Calculate cost per kilometer
 */
export function calculateCostPerKm(
  totalCost: number,
  kilometer: number
): number {
  if (kilometer === 0) return 0;
  return totalCost / kilometer;
}

/**
 * Calculate dashboard metrics from records
 */
export function calculateDashboardMetrics(
  records: TransporterRecord[]
): DashboardMetrics {
  if (records.length === 0) {
    return {
      totalDeliveries: 0,
      totalDeliveryPoints: 0,
      totalOperationalCost: 0,
      averageCostPerPoint: 0,
      totalKilometer: 0,
      averageCostPerKm: 0,
      activeDrivers: 0,
      activeVehicles: 0,
      totalAnomalies: 0,
    };
  }

  const totalDeliveries = records.length;
  const totalDeliveryPoints = records.reduce((sum, r) => sum + r.deliveryPoints, 0);
  const totalOperationalCost = records.reduce((sum, r) => sum + r.totalCost, 0);
  const totalKilometer = records.reduce((sum, r) => sum + r.kilometer, 0);
  
  const activeDrivers = new Set(records.map(r => r.driverName)).size;
  const activeVehicles = new Set(records.map(r => r.plateNumber)).size;
  
  const totalAnomalies = records.filter(
    r => r.status === 'anomaly' || r.status === 'warning'
  ).length;

  const averageCostPerPoint = totalDeliveryPoints > 0 
    ? totalOperationalCost / totalDeliveryPoints 
    : 0;
  
  const averageCostPerKm = totalKilometer > 0 
    ? totalOperationalCost / totalKilometer 
    : 0;

  return {
    totalDeliveries,
    totalDeliveryPoints,
    totalOperationalCost,
    averageCostPerPoint,
    totalKilometer,
    averageCostPerKm,
    activeDrivers,
    activeVehicles,
    totalAnomalies,
  };
}
