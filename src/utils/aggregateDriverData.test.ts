import { describe, it, expect } from 'vitest';
import { aggregateDriverData, getTopDriversByCost, getTopDriversByPoints } from './aggregateDriverData';
import { TransporterRecord } from '../types/transporter';

const mockRecords: TransporterRecord[] = [
  {
    id: '1', date: '2023-10-01', driverName: 'Alice', plateNumber: 'A1', customerName: 'C1',
    deliveryPoints: 10, kilometer: 100, gasolineCost: 100, tollCost: 0, parkingCost: 0, overtimeCost: 0, incentiveCost: 0,
    totalCost: 100, costPerPoint: 10, costPerKm: 1, status: 'valid', anomalyReasons: [], createdAt: ''
  },
  {
    id: '2', date: '2023-10-02', driverName: 'Alice', plateNumber: 'A1', customerName: 'C1',
    deliveryPoints: 5, kilometer: 50, gasolineCost: 50, tollCost: 0, parkingCost: 0, overtimeCost: 0, incentiveCost: 0,
    totalCost: 50, costPerPoint: 10, costPerKm: 1, status: 'anomaly', anomalyReasons: [], createdAt: ''
  },
  {
    id: '3', date: '2023-10-01', driverName: 'Bob', plateNumber: 'B1', customerName: 'C2',
    deliveryPoints: 20, kilometer: 200, gasolineCost: 300, tollCost: 0, parkingCost: 0, overtimeCost: 0, incentiveCost: 0,
    totalCost: 300, costPerPoint: 15, costPerKm: 1.5, status: 'valid', anomalyReasons: [], createdAt: ''
  },
];

describe('aggregateDriverData', () => {
  describe('aggregateDriverData', () => {
    it('should correctly aggregate records by driver', () => {
      const summaries = aggregateDriverData(mockRecords);
      expect(summaries).toHaveLength(2);
      
      const alice = summaries.find(s => s.driverName === 'Alice');
      expect(alice).toBeDefined();
      expect(alice?.totalDeliveries).toBe(2);
      expect(alice?.totalCost).toBe(150);
      expect(alice?.totalPoints).toBe(15);
      expect(alice?.anomalyCount).toBe(1);

      const bob = summaries.find(s => s.driverName === 'Bob');
      expect(bob).toBeDefined();
      expect(bob?.totalDeliveries).toBe(1);
      expect(bob?.totalCost).toBe(300);
      expect(bob?.totalPoints).toBe(20);
      expect(bob?.anomalyCount).toBe(0);
    });
  });

  describe('getTopDriversByCost', () => {
    it('should sort drivers by total cost descending', () => {
      const summaries = aggregateDriverData(mockRecords);
      const top = getTopDriversByCost(summaries, 2);
      expect(top[0].driverName).toBe('Bob'); // 300
      expect(top[1].driverName).toBe('Alice'); // 150
    });
  });

  describe('getTopDriversByPoints', () => {
    it('should sort drivers by delivery points descending', () => {
      const summaries = aggregateDriverData(mockRecords);
      const top = getTopDriversByPoints(summaries, 2);
      expect(top[0].driverName).toBe('Bob'); // 20
      expect(top[1].driverName).toBe('Alice'); // 15
    });
  });
});
