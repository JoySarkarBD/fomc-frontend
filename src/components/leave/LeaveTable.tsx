"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveTableRow } from "./LeaveTableRow";
import { LeavePagination } from "./LeavePagination";
import {
  LEAVE_ROWS_PER_PAGE_OPTIONS,
  LEAVE_TABLE_COLUMNS,
} from "@/constants/leave";
import { useAccessToken } from "@/hooks/useAccessToken";
import { LeaveManagementService } from "@/api";
import type { ILeaveRecord } from "@/types/ILeave";
import {
  ShiftUserSelector,
  type ShiftUserOption,
} from "@/components/shift-assignment/ShiftUserSelector";

const YEARS = Array.from({ length: 16 }, (_, i) => new Date().getFullYear() - 1 + i);

interface LeaveTableProps {
  refreshKey?: number;
  isPrivileged?: boolean;
  authorization?: string | null;
  myUserId?: string | null;
  selectedUser?: ShiftUserOption | null;
  onSelectUser?: (user: ShiftUserOption | null) => void;
}

export function LeaveTable({
  refreshKey,
  isPrivileged,
  authorization,
  myUserId,
  selectedUser,
  onSelectUser,
}: LeaveTableProps) {
  const token = useAccessToken();
  const [records, setRecords] = useState<ILeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [year, setYear] = useState(new Date().getFullYear());

  const isViewingOtherUser = isPrivileged && selectedUser !== null;

  const fetchLeaves = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let res: any;
      if (isViewingOtherUser && selectedUser) {
        res = await LeaveManagementService.leaveControllerGetUserSpecificLeaves({
          year,
          userId: selectedUser._id,
          authorization: token,
        });
      } else {
        res = await LeaveManagementService.leaveControllerGetMyLeaves({
          year,
          authorization: token,
        });
      }
      const data = (res as any)?.data;
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [token, year, refreshKey, isViewingOtherUser, selectedUser]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const totalRecords = records.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return records.slice(start, start + rowsPerPage);
  }, [records, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  return (
    <div className="overflow-hidden rounded-sm">
      {/* User Selector + Year Selector */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPrivileged && onSelectUser ? (
            <ShiftUserSelector
              authorization={authorization ?? null}
              myUserId={myUserId ?? null}
              selectedUser={selectedUser ?? null}
              onSelectUser={onSelectUser}
              selfLabel="My Leaves"
            />
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground/70">Year:</label>
          <Select
            value={year.toString()}
            onValueChange={(v) => {
              setYear(Number(v));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-24 rounded-sm border-border/60 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-t-sm border">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 bg-[#E7EFFF]">
              {LEAVE_TABLE_COLUMNS.map((col) => (
                <TableHead
                  key={col}
                  className="whitespace-nowrap py-3 text-xs font-bold uppercase tracking-wider text-gray-400 first:pl-5"
                >
                  <span className="flex items-center gap-1.5">
                    {col}
                    {col === "#" && (
                      <ArrowUpDown className="h-3 w-3 text-brand-navy/40" />
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <td
                  colSpan={LEAVE_TABLE_COLUMNS.length}
                  className="py-12 text-center"
                >
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#044192]" />
                </td>
              </TableRow>
            ) : paginatedRecords.length === 0 ? (
              <TableRow>
                <td
                  colSpan={LEAVE_TABLE_COLUMNS.length}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No leave records found.
                </td>
              </TableRow>
            ) : (
              paginatedRecords.map((record, idx) => (
                <LeaveTableRow
                  key={record._id}
                  record={record}
                  rowNumber={(currentPage - 1) * rowsPerPage + idx + 1}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
