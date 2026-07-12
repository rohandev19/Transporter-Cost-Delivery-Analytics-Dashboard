import { describe, it, expect } from 'vitest';
import { calculateTotalCost, calculateCostPerPoint, calculateCostPerKm } from './calculateMetrics';

describe('calculateMetrics', () => {
  describe('calculateTotalCost', () => {
    it('should sum all costs correctly', () => {
      expect(calculateTotalCost(100, 50, 20, 10, 30)).toBe(210);
    });

    it('should handle zero costs', () => {
      expect(calculateTotalCost(0, 0, 0, 0, 0)).toBe(0);
    });

    it('should handle some zero costs', () => {
      expect(calculateTotalCost(100, 0, 20, 0, 30)).toBe(150);
    });
  });

  describe('calculateCostPerPoint', () => {
    it('should calculate cost per point correctly', () => {
      expect(calculateCostPerPoint(1000, 5)).toBe(200);
    });

    it('should return 0 when points are 0 to avoid Infinity', () => {
      expect(calculateCostPerPoint(1000, 0)).toBe(0);
    });
  });

  describe('calculateCostPerKm', () => {
    it('should calculate cost per km correctly', () => {
      expect(calculateCostPerKm(1000, 50)).toBe(20);
    });

    it('should return 0 when km is 0 to avoid Infinity', () => {
      expect(calculateCostPerKm(1000, 0)).toBe(0);
    });
  });
});
