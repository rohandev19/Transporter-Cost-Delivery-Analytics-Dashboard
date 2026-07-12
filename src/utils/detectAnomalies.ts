import { TransporterRecord, AnomalyItem, TransporterRecordStatus } from '../types/transporter';
import { ANOMALY_RULES } from '../constants/anomalyRules';
import { nanoid } from 'nanoid';

/**
 * Detect anomalies in a single record based on predefined rules
 */
export function detectAnomalies(record: TransporterRecord): AnomalyItem[] {
  const anomalies: AnomalyItem[] = [];

  for (const rule of ANOMALY_RULES) {
    if (rule.check(record)) {
      anomalies.push({
        id: nanoid(),
        recordId: record.id,
        code: rule.code,
        category: rule.category,
        severity: rule.severity,
        message: rule.message(record),
        createdAt: new Date().toISOString(),
      });
    }
  }

  return anomalies;
}

/**
 * Determine record status based on detected anomalies
 */
export function determineRecordStatus(anomalies: AnomalyItem[]): TransporterRecordStatus {
  if (anomalies.length === 0) return 'valid';
  
  const hasHighSeverity = anomalies.some(a => a.severity === 'high');
  if (hasHighSeverity) return 'anomaly';
  
  return 'warning';
}

/**
 * Detect duplicate records
 */
export function detectDuplicates(records: TransporterRecord[]): Map<string, TransporterRecord[]> {
  const duplicateMap = new Map<string, TransporterRecord[]>();
  const seen = new Map<string, TransporterRecord>();

  for (const record of records) {
    const key = `${record.date}-${record.driverName}-${record.plateNumber}-${record.customerName}`;
    
    if (seen.has(key)) {
      if (!duplicateMap.has(key)) {
        duplicateMap.set(key, [seen.get(key)!]);
      }
      duplicateMap.get(key)!.push(record);
    } else {
      seen.set(key, record);
    }
  }

  return duplicateMap;
}

/**
 * Process records with anomaly detection
 */
export function processRecordsWithAnomalies(
  records: TransporterRecord[]
): { records: TransporterRecord[]; anomalies: AnomalyItem[] } {
  const allAnomalies: AnomalyItem[] = [];
  const processedRecords = records.map(record => {
    const anomalies = detectAnomalies(record);
    allAnomalies.push(...anomalies);
    
    return {
      ...record,
      status: determineRecordStatus(anomalies),
      anomalyReasons: anomalies.map(a => a.message),
    };
  });

  // Check for duplicates
  const duplicates = detectDuplicates(processedRecords);
  duplicates.forEach((dupRecords) => {
    dupRecords.forEach(record => {
      const anomaly: AnomalyItem = {
        id: nanoid(),
        recordId: record.id,
        code: 'A-007',
        category: 'duplicate',
        severity: 'medium',
        message: 'Duplicate entry detected',
        createdAt: new Date().toISOString(),
      };
      allAnomalies.push(anomaly);
      
      // Update record status
      const recordIndex = processedRecords.findIndex(r => r.id === record.id);
      if (recordIndex !== -1) {
        processedRecords[recordIndex].anomalyReasons.push(anomaly.message);
        if (processedRecords[recordIndex].status === 'valid') {
          processedRecords[recordIndex].status = 'warning';
        }
      }
    });
  });

  return { records: processedRecords, anomalies: allAnomalies };
}
