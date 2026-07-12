import { describe, it, expect } from 'vitest';
import { aggregateVehicleData, getMostEfficientVehicles, getLeastEfficientVehicles } from './aggregateVehicleData';
import { TransporterRecord } from '../types/transporter';

const mockRecords: TransporterRecord[] = [
  {
    id: '1', date: '2023-10-01', driverName: 'D1', plateNumber: 'TRK-001', customerName: 'C1',
    deliveryPoints: 10, kilometer: 100, gasolineCost: 1000, tollCost: 0, parkingCost: 0, overtimeCost: 0, incentiveCost: 0,
    totalCost: 1000, costPerPoint: 100, costPerKm: 10, status: 'valid', anomalyReasons: [], createdAt: ''
  },
  {
    id: '2', date: '2023-10-02', driverName: 'D1', plateNumber: 'TRK-001', customerName: 'C1',
    deliveryPoints: 5, kilometer: 100, gasolineCost: 2000, tollCost: 0, parkingCost: 0, overtimeCost: 0, incentiveCost: 0,
    totalCost: 2000, costPerPoint: 400, costPerKm: 20, status: 'anomaly', anomalyReasons: [], createdAt: ''
  },
  {
    id: '3', date: '2023-10-01', driverName: 'D2', plateNumber: 'TRK-002', customerName: 'C2',
    deliveryPoints: 20, kilometer: 500, gasolineCost: 2500, tollCost: 0, parkingCost: 0, overtimeCost: 0, incentiveCost: 0,
    totalCost: 2500, costPerPoint: 125, costPerKm: 5, status: 'valid', anomalyReasons: [], createdAt: ''
  },
];

describe('aggregateVehicleData', () => {
  describe('aggregateVehicleData', () => {
    it('should correctly aggregate records by vehicle plate', () => {
      const summaries = aggregateVehicleData(mockRecords);
      expect(summaries).toHaveLength(2);
      
      const trk1 = summaries.find(s => s.plateNumber === 'TRK-001');
      expect(trk1).toBeDefined();
      expect(trk1?.totalUsageDays).toBe(2);
      expect(trk1?.totalCost).toBe(3000); // 1000 + 2000
      expect(trk1?.totalKilometer).toBe(200); // 100 + 100
      expect(trk1?.costPerKm).toBe(15); // 3000 / 200
      expect(trk1?.anomalyCount).toBe(1);

      const trk2 = summaries.find(s => s.plateNumber === 'TRK-002');
      expect(trk2).toBeDefined();
      expect(trk2?.totalUsageDays).toBe(1);
      expect(trk2?.costPerKm).toBe(5); // 2500 / 500
    });
  });

  describe('getMostEfficientVehicles', () => {
    it('should sort vehicles by cost per km ascending', () => {
      const summaries = aggregateVehicleData(mockRecords);
      const mostEfficient = getMostEfficientVehicles(summaries, 2);
      expect(mostEfficient[0].plateNumber).toBe('TRK-002'); // 5 / km
      expect(mostEfficient[1].plateNumber).toBe('TRK-001'); // 15 / km
    });
  });

  describe('getLeastEfficientVehicles', () => {
    it('should sort vehicles by cost per km descending', () => {
      const summaries = aggregateVehicleData(mockRecords);
      const leastEfficient = getLeastEfficientVehicles(summaries, 2);
      expect(leastEfficient[0].plateNumber).toBe('TRK-001'); // 15 / km
      expect(leastEfficient[1].plateNumber).toBe('TRK-002'); // 5 / km
    });
  });
});
