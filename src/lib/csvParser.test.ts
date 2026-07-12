import { describe, it, expect } from 'vitest';
import { parseCSV } from './csvParser';

const validCSV = `Date,DriverName,PlateNumber,CustomerName,DeliveryPoints,Kilometer,GasolineCost,TollCost,ParkingCost,OvertimeCost,IncentiveCost
2023-10-01,John Doe,B 1234 CD,Customer A,5,100,50000,10000,5000,0,10000
2023-10-02,Jane Smith,B 5678 EF,Customer B,10,200,100000,20000,10000,50000,20000`;

const missingColumnsCSV = `Date,DriverName,PlateNumber
2023-10-01,John Doe,B 1234 CD`;

const invalidDataCSV = `Date,DriverName,PlateNumber,CustomerName,DeliveryPoints,Kilometer,GasolineCost,TollCost,ParkingCost,OvertimeCost,IncentiveCost
invalid-date,John Doe,B 1234 CD,Customer A,abc,xyz,invalid,10000,5000,0,10000`;

describe('csvParser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV data correctly', async () => {
      const result = await parseCSV(validCSV);
      
      expect(result.success).toBe(true);
      expect(result.totalRows).toBe(2);
      expect(result.validRows).toBe(2);
      expect(result.records).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      
      const firstRecord = result.records[0];
      expect(firstRecord.driverName).toBe('John Doe');
      expect(firstRecord.deliveryPoints).toBe(5);
      expect(firstRecord.kilometer).toBe(100);
      expect(firstRecord.totalCost).toBe(75000); // 50000 + 10000 + 5000 + 0 + 10000
    });

    it('should fail if required columns are missing', async () => {
      const result = await parseCSV(missingColumnsCSV);
      
      expect(result.success).toBe(false);
      expect(result.totalRows).toBe(1);
      expect(result.validRows).toBe(0);
      expect(result.records).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Missing required columns');
    });

    it('should handle and report row validation errors', async () => {
      const result = await parseCSV(invalidDataCSV);
      
      expect(result.success).toBe(false);
      expect(result.totalRows).toBe(1);
      expect(result.validRows).toBe(0);
      expect(result.records).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Row 1:');
    });

    it('should return error for empty CSV', async () => {
      const result = await parseCSV('Date,DriverName\n'); // only header
      expect(result.success).toBe(false);
    });
  });
});
