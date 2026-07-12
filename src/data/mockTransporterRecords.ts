import { TransporterRecord } from '../types/transporter';
import { nanoid } from 'nanoid';
import { calculateTotalCost, calculateCostPerPoint, calculateCostPerKm } from '../utils/calculateMetrics';

// Mock data generators
const DRIVERS = [
  'Dika Pratama',
  'Irwan Saputra',
  'Yadi Firmansyah',
  'Sahid Ramadhan',
  'Rizky Maulana',
  'Fajar Nugroho',
  'Agus Setiawan',
  'Bayu Prakoso',
  'Andi Wijaya',
  'Budi Santoso',
  'Cahyo Utomo',
  'Dwi Handoko',
  'Eko Prasetyo',
  'Faisal Rahman',
];

const PLATES = [
  'B 1234 HMD',
  'B 1820 TRK',
  'B 4421 LOG',
  'B 7730 OPS',
  'B 9821 DLV',
  'B 5566 TRS',
  'B 3344 VAN',
  'B 8899 FRT',
  'B 2211 CRG',
  'B 6677 DST',
  'B 9900 SHP',
  'B 4455 MOV',
];

const CUSTOMERS = [
  'PT Sinar Logistik Nusantara',
  'PT Global Retail Indonesia',
  'PT Karya Distribusi Mandiri',
  'PT Prima Warehouse',
  'PT Metro Supply Chain',
  'PT Sejahtera Express',
  'CV Maju Bersama',
  'PT Indah Cargo',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function generateRecord(daysAgo: number, intentionalAnomaly: boolean = false): TransporterRecord {
  const deliveryPoints = intentionalAnomaly && Math.random() < 0.3 
    ? 0 
    : randomInt(1, 12);
  
  const kilometer = intentionalAnomaly && Math.random() < 0.2 
    ? 0 
    : randomInt(15, 350);
  
  const gasolineCost = intentionalAnomaly && Math.random() < 0.3 
    ? randomInt(550000, 800000) 
    : randomInt(80000, 450000);
  
  const tollCost = kilometer > 100 ? randomInt(20000, 150000) : randomInt(0, 50000);
  const parkingCost = deliveryPoints > 0 ? randomInt(5000, 40000) : 0;
  const overtimeCost = deliveryPoints > 8 ? randomInt(50000, 200000) : 0;
  const incentiveCost = deliveryPoints > 6 ? randomInt(30000, 150000) : 0;

  const totalCost = calculateTotalCost(
    gasolineCost,
    tollCost,
    parkingCost,
    overtimeCost,
    incentiveCost
  );

  const costPerPoint = calculateCostPerPoint(totalCost, deliveryPoints);
  const costPerKm = calculateCostPerKm(totalCost, kilometer);

  return {
    id: nanoid(),
    date: generateDate(daysAgo),
    driverName: randomChoice(DRIVERS),
    plateNumber: randomChoice(PLATES),
    customerName: randomChoice(CUSTOMERS),
    deliveryPoints,
    kilometer,
    gasolineCost,
    tollCost,
    parkingCost,
    overtimeCost,
    incentiveCost,
    totalCost,
    costPerPoint,
    costPerKm,
    status: 'valid', // Will be determined by anomaly detection
    anomalyReasons: [],
    createdAt: new Date().toISOString(),
  };
}

export function generateMockData(count: number = 400): TransporterRecord[] {
  const records: TransporterRecord[] = [];
  
  // Generate mostly valid records
  for (let i = 0; i < Math.floor(count * 0.7); i++) {
    records.push(generateRecord(randomInt(0, 30), false));
  }
  
  // Generate some records with intentional anomalies
  for (let i = 0; i < Math.floor(count * 0.25); i++) {
    records.push(generateRecord(randomInt(0, 30), true));
  }
  
  // Generate some more normal records
  for (let i = 0; i < count - records.length; i++) {
    records.push(generateRecord(randomInt(0, 30), false));
  }

  // Add some duplicate records (same date, driver, plate, customer)
  if (records.length > 10) {
    const duplicateSource = records[randomInt(0, records.length - 1)];
    const duplicate = {
      ...duplicateSource,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    records.push(duplicate);
  }

  return records;
}

// Pre-generated mock data for immediate use
export const MOCK_TRANSPORTER_RECORDS = generateMockData(400);
