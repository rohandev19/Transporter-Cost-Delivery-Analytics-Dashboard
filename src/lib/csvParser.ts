import { nanoid } from 'nanoid';
import { TransporterRecord } from '../types/transporter';
import { transporterRecordSchema } from '../schemas/transporterRecordSchema';
import { calculateTotalCost, calculateCostPerPoint, calculateCostPerKm } from '../utils/calculateMetrics';

export interface ParseResult {
  success: boolean;
  records: TransporterRecord[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

/**
 * Parse CSV text content to transporter records
 */
export async function parseCSV(csvText: string): Promise<ParseResult> {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    return {
      success: false,
      records: [],
      errors: ['CSV file is empty or has no data rows'],
      totalRows: 0,
      validRows: 0,
    };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const records: TransporterRecord[] = [];
  const errors: string[] = [];

  // Validate required columns
  const requiredColumns = [
    'date',
    'drivername',
    'platenumber',
    'customername',
    'deliverypoints',
    'kilometer',
    'gasolinecost',
  ];

  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  if (missingColumns.length > 0) {
    return {
      success: false,
      records: [],
      errors: [`Missing required columns: ${missingColumns.join(', ')}`],
      totalRows: lines.length - 1,
      validRows: 0,
    };
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < headers.length) {
        errors.push(`Row ${i}: Incomplete data`);
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      // Convert to proper types
      const parsedData = {
        date: rowData.date,
        driverName: rowData.drivername,
        plateNumber: rowData.platenumber,
        customerName: rowData.customername,
        deliveryPoints: parseInt(rowData.deliverypoints) || 0,
        kilometer: parseFloat(rowData.kilometer) || 0,
        gasolineCost: parseFloat(rowData.gasolinecost) || 0,
        tollCost: parseFloat(rowData.tollcost || '0') || 0,
        parkingCost: parseFloat(rowData.parkingcost || '0') || 0,
        overtimeCost: parseFloat(rowData.overtimecost || '0') || 0,
        incentiveCost: parseFloat(rowData.incentivecost || '0') || 0,
      };

      // Validate with Zod schema
      const validation = transporterRecordSchema.safeParse(parsedData);
      
      if (!validation.success) {
        const errorMessages = validation.error.errors.map(e => e.message).join(', ');
        errors.push(`Row ${i}: ${errorMessages}`);
        continue;
      }

      // Calculate derived fields
      const totalCost = calculateTotalCost(
        parsedData.gasolineCost,
        parsedData.tollCost,
        parsedData.parkingCost,
        parsedData.overtimeCost,
        parsedData.incentiveCost
      );

      const record: TransporterRecord = {
        id: nanoid(),
        ...parsedData,
        totalCost,
        costPerPoint: calculateCostPerPoint(totalCost, parsedData.deliveryPoints),
        costPerKm: calculateCostPerKm(totalCost, parsedData.kilometer),
        status: 'valid',
        anomalyReasons: [],
        createdAt: new Date().toISOString(),
      };

      records.push(record);
    } catch (error) {
      errors.push(`Row ${i}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: records.length > 0,
    records,
    errors,
    totalRows: lines.length - 1,
    validRows: records.length,
  };
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
