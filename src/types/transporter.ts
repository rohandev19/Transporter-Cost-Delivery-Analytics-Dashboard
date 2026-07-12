// Core transporter record types
export type TransporterRecordStatus = 'valid' | 'warning' | 'anomaly';

export interface TransporterRecord {
  id: string;
  date: string;
  driverName: string;
  plateNumber: string;
  customerName: string;
  deliveryPoints: number;
  kilometer: number;
  gasolineCost: number;
  tollCost: number;
  parkingCost: number;
  overtimeCost: number;
  incentiveCost: number;
  totalCost: number;
  costPerPoint: number;
  costPerKm: number;
  status: TransporterRecordStatus;
  anomalyReasons: string[];
  createdAt: string;
}

// Driver summary type
export interface DriverSummary {
  driverName: string;
  totalDeliveries: number;
  totalPoints: number;
  totalKilometer: number;
  totalCost: number;
  averageCostPerPoint: number;
  totalOvertime: number;
  totalIncentive: number;
  anomalyCount: number;
}

// Vehicle summary type
export interface VehicleSummary {
  plateNumber: string;
  totalUsageDays: number;
  totalKilometer: number;
  totalGasolineCost: number;
  totalTollCost: number;
  totalParkingCost: number;
  totalCost: number;
  costPerKm: number;
  anomalyCount: number;
}

// Anomaly types
export type AnomalyCategory = 'cost' | 'data_quality' | 'duplicate' | 'operational';
export type AnomalySeverity = 'low' | 'medium' | 'high';

export interface AnomalyItem {
  id: string;
  recordId: string;
  code: string;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  message: string;
  field?: string;
  createdAt: string;
}

// Dashboard metrics type
export interface DashboardMetrics {
  totalDeliveries: number;
  totalDeliveryPoints: number;
  totalOperationalCost: number;
  averageCostPerPoint: number;
  totalKilometer: number;
  averageCostPerKm: number;
  activeDrivers: number;
  activeVehicles: number;
  totalAnomalies: number;
}

// Filter state type
export interface FilterState {
  dateFrom: string;
  dateTo: string;
  driverName: string;
  plateNumber: string;
  customerName: string;
  status: TransporterRecordStatus | 'all';
  searchKeyword: string;
}

// CSV upload types
export interface UploadResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  anomalyRows: number;
  errors: string[];
  data: TransporterRecord[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}
