import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useTransporterStore } from '../../stores/transporterStore';
import { useAuthStore } from '../../stores/authStore';
import type { TransporterRecord } from '../../types/transporter';
import { formatCurrency } from '../../lib/formatCurrency';
import { formatDate } from '../../lib/formatDate';
import { recordsToCsv, downloadCsv } from '../../lib/exportCsv';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Columns3,
} from 'lucide-react';

const columnHelper = createColumnHelper<TransporterRecord>();

export default function OperationsPage() {
  const { records } = useTransporterStore();
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canExport = hasPermission('canExport');

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    costPerKm: false,
    createdAt: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TransporterRecord | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('');
  const [plateFilter, setPlateFilter] = useState('');

  // Derived filter options
  const drivers = useMemo(() => [...new Set(records.map((r) => r.driverName))].sort(), [records]);
  const plates = useMemo(() => [...new Set(records.map((r) => r.plateNumber))].sort(), [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    let result = records;
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (driverFilter) {
      result = result.filter((r) => r.driverName === driverFilter);
    }
    if (plateFilter) {
      result = result.filter((r) => r.plateNumber === plateFilter);
    }
    return result;
  }, [records, statusFilter, driverFilter, plateFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => formatDate(info.getValue()),
        size: 110,
      }),
      columnHelper.accessor('driverName', {
        header: 'Driver',
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
        size: 150,
      }),
      columnHelper.accessor('plateNumber', {
        header: 'Plate',
        size: 110,
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        size: 180,
      }),
      columnHelper.accessor('deliveryPoints', {
        header: 'Points',
        cell: (info) => (
          <span className="text-center block">{info.getValue()}</span>
        ),
        size: 70,
      }),
      columnHelper.accessor('kilometer', {
        header: 'KM',
        cell: (info) => info.getValue().toLocaleString('id-ID'),
        size: 70,
      }),
      columnHelper.accessor('gasolineCost', {
        header: 'Gasoline',
        cell: (info) => formatCurrency(info.getValue()),
        size: 120,
      }),
      columnHelper.accessor('tollCost', {
        header: 'Toll',
        cell: (info) => formatCurrency(info.getValue()),
        size: 100,
      }),
      columnHelper.accessor('parkingCost', {
        header: 'Parking',
        cell: (info) => formatCurrency(info.getValue()),
        size: 100,
      }),
      columnHelper.accessor('overtimeCost', {
        header: 'Overtime',
        cell: (info) => formatCurrency(info.getValue()),
        size: 110,
      }),
      columnHelper.accessor('incentiveCost', {
        header: 'Incentive',
        cell: (info) => formatCurrency(info.getValue()),
        size: 110,
      }),
      columnHelper.accessor('totalCost', {
        header: 'Total Cost',
        cell: (info) => (
          <span className="font-semibold">{formatCurrency(info.getValue())}</span>
        ),
        size: 130,
      }),
      columnHelper.accessor('costPerPoint', {
        header: 'Cost/Pt',
        cell: (info) => formatCurrency(Math.round(info.getValue())),
        size: 110,
      }),
      columnHelper.accessor('costPerKm', {
        header: 'Cost/KM',
        cell: (info) => formatCurrency(Math.round(info.getValue())),
        size: 110,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue()} size="sm" />,
        size: 110,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedRecord(row.original)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Detail
          </button>
        ),
        size: 60,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredRecords,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleExport = () => {
    const visibleRows = table.getFilteredRowModel().rows.map((r) => r.original);
    const csv = recordsToCsv(visibleRows);
    downloadCsv(csv, `transporter-operations-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDriverFilter('');
    setPlateFilter('');
    setGlobalFilter('');
  };

  const hasActiveFilters = statusFilter !== 'all' || driverFilter || plateFilter || globalFilter;

  if (records.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Operations Table</h1>
        <EmptyState
          title="No Data Available"
          description="Upload transporter data to view the operations table."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Table</h1>
          <p className="text-gray-600 mt-1">
            {table.getFilteredRowModel().rows.length} of {records.length} records
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canExport && (
            <button onClick={handleExport} className="btn-secondary inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Column Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumns(!showColumns)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Columns3 className="w-4 h-4" />
              Columns
            </button>
            {showColumns && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 w-56 max-h-80 overflow-y-auto">
                {table.getAllLeafColumns().map((column) => {
                  if (column.id === 'actions') return null;
                  return (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700">
                        {typeof column.columnDef.header === 'string'
                          ? column.columnDef.header
                          : column.id}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Row */}
        {showFilters && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="valid">Valid</option>
              <option value="warning">Warning</option>
              <option value="anomaly">Anomaly</option>
            </select>

            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Drivers</option>
              {drivers.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={plateFilter}
              onChange={(e) => setPlateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Plates</option>
              {plates.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-3 px-4 font-medium text-gray-600 select-none"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 ${
                            header.column.getCanSort() ? 'cursor-pointer hover:text-gray-900' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: <ArrowUp className="w-3.5 h-3.5 text-primary-600" />,
                                desc: <ArrowDown className="w-3.5 h-3.5 text-primary-600" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-12 text-gray-500"
                  >
                    No matching records found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4 text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <span className="text-gray-400">|</span>
            <span>{table.getFilteredRowModel().rows.length} rows</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[10, 20, 30, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Record Detail Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelectedRecord(null)}
          />
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Record Detail</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedRecord.status} size="lg" />
                <span className="text-sm text-gray-500">ID: {selectedRecord.id.slice(0, 8)}...</span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Date" value={formatDate(selectedRecord.date)} />
                <DetailItem label="Driver" value={selectedRecord.driverName} />
                <DetailItem label="Plate Number" value={selectedRecord.plateNumber} />
                <DetailItem label="Customer" value={selectedRecord.customerName} />
                <DetailItem label="Delivery Points" value={String(selectedRecord.deliveryPoints)} />
                <DetailItem label="Kilometer" value={`${selectedRecord.kilometer.toLocaleString('id-ID')} km`} />
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                  Cost Breakdown
                </h3>
                <div className="space-y-2">
                  <CostRow label="Gasoline" value={selectedRecord.gasolineCost} />
                  <CostRow label="Toll" value={selectedRecord.tollCost} />
                  <CostRow label="Parking" value={selectedRecord.parkingCost} />
                  <CostRow label="Overtime" value={selectedRecord.overtimeCost} />
                  <CostRow label="Incentive" value={selectedRecord.incentiveCost} />
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Cost</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {formatCurrency(selectedRecord.totalCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Cost per Point</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(Math.round(selectedRecord.costPerPoint))}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Cost per KM</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(Math.round(selectedRecord.costPerKm))}
                  </p>
                </div>
              </div>

              {/* Anomaly Reasons */}
              {selectedRecord.anomalyReasons.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Anomaly Reasons
                  </h3>
                  <ul className="space-y-2">
                    {selectedRecord.anomalyReasons.map((reason, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm bg-red-50 border border-red-100 rounded-lg p-3"
                      >
                        <span className="text-red-600 mt-0.5">⚠</span>
                        <span className="text-red-800">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{formatCurrency(value)}</span>
    </div>
  );
}
