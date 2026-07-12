import { AnomalyCategory, AnomalySeverity } from '../types/transporter';

export interface AnomalyRule {
  code: string;
  name: string;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  description: string;
  check: (record: any) => boolean;
  message: (record: any) => string;
}

export const ANOMALY_RULES: AnomalyRule[] = [
  {
    code: 'A-001',
    name: 'Excessive Gasoline Cost',
    category: 'cost',
    severity: 'high',
    description: 'Gasoline cost exceeds Rp500,000 per day',
    check: (record) => record.gasolineCost > 500000,
    message: (record) => `Gasoline cost (Rp${record.gasolineCost.toLocaleString('id-ID')}) exceeds daily limit`
  },
  {
    code: 'A-002',
    name: 'Zero Delivery Points',
    category: 'data_quality',
    severity: 'high',
    description: 'Delivery points equal to zero',
    check: (record) => record.deliveryPoints === 0,
    message: () => 'No delivery points recorded'
  },
  {
    code: 'A-003',
    name: 'Zero Kilometer with Cost',
    category: 'data_quality',
    severity: 'medium',
    description: 'Kilometer is zero but gasoline cost exists',
    check: (record) => record.kilometer === 0 && record.gasolineCost > 0,
    message: () => 'Gasoline cost recorded without kilometer traveled'
  },
  {
    code: 'A-004',
    name: 'High Cost Per Point',
    category: 'cost',
    severity: 'high',
    description: 'Cost per delivery point exceeds Rp150,000',
    check: (record) => record.costPerPoint > 150000,
    message: (record) => `Cost per point (Rp${record.costPerPoint.toLocaleString('id-ID')}) is unusually high`
  },
  {
    code: 'A-005',
    name: 'Missing Plate Number',
    category: 'data_quality',
    severity: 'high',
    description: 'Vehicle plate number is empty',
    check: (record) => !record.plateNumber || record.plateNumber.trim() === '',
    message: () => 'Vehicle plate number is missing'
  },
  {
    code: 'A-006',
    name: 'Missing Driver Name',
    category: 'data_quality',
    severity: 'high',
    description: 'Driver name is empty',
    check: (record) => !record.driverName || record.driverName.trim() === '',
    message: () => 'Driver name is missing'
  },
  {
    code: 'A-007',
    name: 'Duplicate Entry',
    category: 'duplicate',
    severity: 'medium',
    description: 'Duplicate record based on date, driver, plate, and customer',
    check: () => false, // Handled separately in validation
    message: () => 'Duplicate entry detected'
  },
  {
    code: 'A-008',
    name: 'Excessive Toll Cost',
    category: 'cost',
    severity: 'medium',
    description: 'Toll cost is too high compared to kilometer',
    check: (record) => record.kilometer > 0 && (record.tollCost / record.kilometer) > 5000,
    message: (record) => `Toll cost per km (Rp${Math.round(record.tollCost / record.kilometer).toLocaleString('id-ID')}) is unusually high`
  },
  {
    code: 'A-009',
    name: 'Overtime with Low Points',
    category: 'operational',
    severity: 'low',
    description: 'Overtime cost exists but delivery points are low',
    check: (record) => record.overtimeCost > 0 && record.deliveryPoints < 3,
    message: () => 'Overtime recorded with minimal delivery points'
  },
  {
    code: 'A-010',
    name: 'Excessive Daily Kilometer',
    category: 'operational',
    severity: 'medium',
    description: 'Kilometer traveled exceeds reasonable daily limit',
    check: (record) => record.kilometer > 500,
    message: (record) => `Daily kilometer (${record.kilometer} km) exceeds typical range`
  }
];

// Thresholds
export const COST_THRESHOLDS = {
  MAX_GASOLINE_DAILY: 500000,
  MAX_COST_PER_POINT: 150000,
  MAX_TOLL_PER_KM: 5000,
  MAX_DAILY_KM: 500,
  MIN_POINTS_FOR_OVERTIME: 3
};
