import { create } from 'zustand';
import { FilterState } from '../types/transporter';

interface FilterStoreState extends FilterState {
  setDateRange: (from: string, to: string) => void;
  setDriverName: (name: string) => void;
  setPlateNumber: (plate: string) => void;
  setCustomerName: (customer: string) => void;
  setStatus: (status: FilterState['status']) => void;
  setSearchKeyword: (keyword: string) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  dateFrom: '',
  dateTo: '',
  driverName: '',
  plateNumber: '',
  customerName: '',
  status: 'all',
  searchKeyword: '',
};

export const useFilterStore = create<FilterStoreState>((set) => ({
  ...initialState,

  setDateRange: (from, to) => set({ dateFrom: from, dateTo: to }),
  setDriverName: (name) => set({ driverName: name }),
  setPlateNumber: (plate) => set({ plateNumber: plate }),
  setCustomerName: (customer) => set({ customerName: customer }),
  setStatus: (status) => set({ status }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  resetFilters: () => set(initialState),
}));
