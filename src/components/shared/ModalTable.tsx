"use client";

import { useState, useMemo, ReactNode } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ModalTablePagination } from "./ModalTablePagination";

export interface FilterTab<T = string> {
  label: string;
  value: T;
  count: number;
}

export interface ColumnDef {
  key: string;
  label: string;
  className?: string;
}

interface ModalTableProps<TData, TFilter = string> {
  // Data
  data: TData[];
  columns: ColumnDef[];
  totalRecords: number;

  // Filtering
  filterTabs?: FilterTab<TFilter>[];
  defaultFilter?: TFilter;
  onFilterData?: (data: TData[], filter: TFilter, search: string) => TData[];

  // Search
  enableSearch?: boolean;
  searchPlaceholder?: string;

  // Row rendering
  renderRow: (item: TData, index: number) => ReactNode;

  // Checkboxes
  enableCheckboxes?: boolean;

  // Pagination
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;

  // Optional: Show DCR List Button
  showDCRButton?: boolean;

  // Optional: External control callbacks (for server-side search/pagination)
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  externalPage?: number;
  externalRowsPerPage?: number;
}

export function ModalTable<TData, TFilter = string>({
  data,
  columns,
  totalRecords,
  filterTabs,
  defaultFilter,
  onFilterData,
  enableSearch = true,
  searchPlaceholder = "Search...",
  renderRow,
  enableCheckboxes = true,
  rowsPerPageOptions = [10, 20, 50, 100],
  defaultRowsPerPage = 10,
  showDCRButton = false,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  externalPage,
  externalRowsPerPage,
}: ModalTableProps<TData, TFilter>) {
  const [activeFilter, setActiveFilter] = useState<TFilter | undefined>(
    defaultFilter,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  // Filter data
  const filteredData = useMemo(() => {
    if (!onFilterData || activeFilter === undefined) return data;
    return onFilterData(data, activeFilter, searchQuery);
  }, [data, activeFilter, searchQuery, onFilterData]);

  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      onPageChange?.(page);
    }
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
    onRowsPerPageChange?.(rows);
  };

  return (
    <div className="rounded-sm">
      {/* Filter Tabs + Search */}
      {(filterTabs || enableSearch) && (
        <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Search with Filter Icon */}
          {enableSearch && (
            <div className="flex flex-1 items-center gap-3">
              {/* Filter Icon */}
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-sm bg-white border-2 border-gray-300  transition-colors"
                aria-label="Filter"
              >
                <Image
                  src="/icons/filter-icons.png"
                  alt="Filter"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              </button>

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onSearchChange?.(e.target.value);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          {filterTabs && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={String(tab.value)}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`rounded-sm px-2 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                    activeFilter === tab.value
                      ? "bg-brand-navy text-white"
                      : "bg-gray-100 text-foreground/70 hover:bg-gray-200"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-t-sm border border-b-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 bg-[#E7EFFF]">
              {enableCheckboxes && (
                <TableHead className="w-12 py-3 pl-5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`whitespace-nowrap py-3 text-xs font-bold uppercase tracking-wider text-gray-400 ${
                    col.className || ""
                  }`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, index) => renderRow(item, index))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <ModalTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalRecords={totalRecords}
        startRecord={startRecord}
        endRecord={endRecord}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      {/* View DCR List Button (only for tasks) */}
      {showDCRButton && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="rounded-sm bg-[#044192] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#033174]"
          >
            View DCR List
          </button>
        </div>
      )}
    </div>
  );
}
