import { describe, it, expect } from 'vitest';
import { processRecordsWithAnomalies } from './detectAnomalies';
import { TransporterRecord } from '../types/transporter';

describe('detectAnomalies', () => {
  const baseRecord: TransporterRecord = {
    id: '1',
    date: '2023-10-01',
    driverName: 'John Doe',
    plateNumber: 'B 1234 CD',
    customerName: 'Customer A',
    deliveryPoints: 5,
    kilometer: 100,
    gasolineCost: 50000,
    tollCost: 10000,
    parkingCost: 5000,
    overtimeCost: 0,
    incentiveCost: 10000,
    totalCost: 75000,
    costPerPoint: 15000,
    costPerKm: 750,
    status: 'valid',
    anomalyReasons: [],
    createdAt: '2023-10-01T00:00:00Z',
  };

  it('should not flag valid records', () => {
    const { records } = processRecordsWithAnomalies([baseRecord]);
    expect(records[0].status).toBe('valid');
    expect(records[0].anomalyReasons).toHaveLength(0);
  });

  it('should flag excessive cost per point', () => {
    const record = { ...baseRecord, costPerPoint: 200000 }; // threshold is 150000
    const { records, anomalies } = processRecordsWithAnomalies([record]);
    expect(records[0].status).toBe('anomaly');
    expect(anomalies).toContainEqual(
      expect.objectContaining({ category: 'cost', severity: 'high' })
    );
  });

  it('should flag gasoline without kilometer', () => {
    const record = { ...baseRecord, gasolineCost: 50000, kilometer: 0 };
    const { records, anomalies } = processRecordsWithAnomalies([record]);
    // Medium severity results in warning
    expect(records[0].status).toBe('warning');
    expect(anomalies).toContainEqual(
      expect.objectContaining({ category: 'data_quality', severity: 'medium' })
    );
  });

  it('should flag overtime without sufficient points', () => {
    const record = { ...baseRecord, overtimeCost: 50000, deliveryPoints: 1 };
    const { records, anomalies } = processRecordsWithAnomalies([record]);
    // Low severity results in warning
    expect(records[0].status).toBe('warning');
    expect(anomalies).toContainEqual(
      expect.objectContaining({ category: 'operational', severity: 'low' })
    );
  });

  it('should flag duplicate entries (same driver, plate, date, customer)', () => {
    const record2 = { ...baseRecord, id: '2' };
    const { records, anomalies } = processRecordsWithAnomalies([baseRecord, record2]);
    
    // Process anomalies will flag duplicates (medium severity -> warning)
    expect(records[0].status).toBe('warning');
    expect(records[1].status).toBe('warning');
    
    expect(anomalies).toContainEqual(
      expect.objectContaining({ category: 'duplicate', severity: 'medium' })
    );
  });
});
