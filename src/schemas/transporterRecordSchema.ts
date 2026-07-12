import { z } from 'zod';

// Schema untuk validasi CSV/Excel upload
export const transporterRecordSchema = z.object({
  date: z.string()
    .min(1, 'Date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  
  driverName: z.string()
    .min(2, 'Driver name must be at least 2 characters')
    .max(100, 'Driver name is too long'),
  
  plateNumber: z.string()
    .min(3, 'Plate number must be at least 3 characters')
    .max(20, 'Plate number is too long'),
  
  customerName: z.string()
    .min(1, 'Customer name is required')
    .max(200, 'Customer name is too long'),
  
  deliveryPoints: z.number()
    .int('Delivery points must be an integer')
    .min(0, 'Delivery points cannot be negative'),
  
  kilometer: z.number()
    .min(0, 'Kilometer cannot be negative')
    .max(10000, 'Kilometer value is unrealistic'),
  
  gasolineCost: z.number()
    .min(0, 'Gasoline cost cannot be negative')
    .max(10000000, 'Gasoline cost is unrealistic'),
  
  tollCost: z.number()
    .min(0, 'Toll cost cannot be negative')
    .max(5000000, 'Toll cost is unrealistic')
    .optional()
    .default(0),
  
  parkingCost: z.number()
    .min(0, 'Parking cost cannot be negative')
    .max(500000, 'Parking cost is unrealistic')
    .optional()
    .default(0),
  
  overtimeCost: z.number()
    .min(0, 'Overtime cost cannot be negative')
    .max(5000000, 'Overtime cost is unrealistic')
    .optional()
    .default(0),
  
  incentiveCost: z.number()
    .min(0, 'Incentive cost cannot be negative')
    .max(5000000, 'Incentive cost is unrealistic')
    .optional()
    .default(0),
});

export type TransporterRecordInput = z.infer<typeof transporterRecordSchema>;

// Schema untuk validasi form filter
export const filterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  driverName: z.string().optional(),
  plateNumber: z.string().optional(),
  customerName: z.string().optional(),
  status: z.enum(['all', 'valid', 'warning', 'anomaly']).optional(),
  searchKeyword: z.string().optional(),
});

export type FilterInput = z.infer<typeof filterSchema>;
