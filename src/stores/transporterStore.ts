import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TransporterRecord, AnomalyItem } from '../types/transporter';
import { processRecordsWithAnomalies } from '../utils/detectAnomalies';

interface TransporterState {
  records: TransporterRecord[];
  anomalies: AnomalyItem[];
  isLoading: boolean;
  error: string | null;
  
  setRecords: (records: TransporterRecord[]) => void;
  addRecords: (records: TransporterRecord[]) => void;
  clearRecords: () => void;
  deleteRecord: (id: string) => void;
  reprocessAnomalies: () => void;
}

export const useTransporterStore = create<TransporterState>()(
  persist(
    (set, get) => ({
      records: [],
      anomalies: [],
      isLoading: false,
      error: null,

      setRecords: (records) => {
        const { records: processedRecords, anomalies } = processRecordsWithAnomalies(records);
        set({ 
          records: processedRecords, 
          anomalies,
          error: null 
        });
      },

      addRecords: (newRecords) => {
        const { records } = get();
        const combined = [...records, ...newRecords];
        const { records: processedRecords, anomalies } = processRecordsWithAnomalies(combined);
        set({ 
          records: processedRecords, 
          anomalies 
        });
      },

      clearRecords: () => {
        set({ 
          records: [], 
          anomalies: [],
          error: null 
        });
      },

      deleteRecord: (id) => {
        const { records } = get();
        const filtered = records.filter(r => r.id !== id);
        const { records: processedRecords, anomalies } = processRecordsWithAnomalies(filtered);
        set({ 
          records: processedRecords, 
          anomalies 
        });
      },

      reprocessAnomalies: () => {
        const { records } = get();
        const { records: processedRecords, anomalies } = processRecordsWithAnomalies(records);
        set({ 
          records: processedRecords, 
          anomalies 
        });
      },
    }),
    {
      name: 'transporter-storage',
    }
  )
);
