import { DriverSummary, VehicleSummary, AnomalyItem } from './transporter';

// Report types
export interface ReportSummary {
  periodFrom: string;
  periodTo: string;
  totalDrivers: number;
  totalVehicles: number;
  totalCustomers: number;
  totalDeliveryPoints: number;
  totalKilometer: number;
  totalCost: number;
  topDrivers: DriverSummary[];
  topVehiclesByCost: VehicleSummary[];
  anomalies: AnomalyItem[];
  generatedAt: string;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeAnomalies: boolean;
  includeSummary: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}
