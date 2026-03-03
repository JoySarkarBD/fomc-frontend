"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Loader2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useAccessToken } from "@/hooks/useAccessToken";
import { LeaveManagementService, UserManagementService } from "@/api";
import { LEAVE_TYPE_LABELS } from "@/constants/leave";

/* ─── types ─── */
interface PendingLeave {
  _id: string;
  user: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  isApproved: boolean | null;
  isRejected: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  name: string;
  employeeId: string;
}

type ActionState = { id: string; action: "approve" | "reject" } | null;

/* ─── helpers ─── */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calcDuration(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const diff =
    Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff <= 1 ? "1 day" : `${diff} days`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
const COLUMNS = [
  "#",
  "EMPLOYEE",
  "LEAVE TYPE",
  "FROM",
  "TO",
  "DURATION",
  "REASON",
  "ACTION",
];

/* ─── component ─── */
interface PendingLeaveRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PendingLeaveRequestsModal({
  open,
  onOpenChange,
}: PendingLeaveRequestsModalProps) {
  const token = useAccessToken();
  const [records, setRecords] = useState<PendingLeave[]>([]);
  const [userMap, setUserMap] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<ActionState>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ── Fetch user details ── */
  const fetchUserDetails = useCallback(
    async (userIds: string[]) => {
      if (!token || userIds.length === 0) return;
      const unique = [...new Set(userIds)];
      const results: Record<string, UserInfo> = {};

      await Promise.allSettled(
        unique.map(async (uid) => {
          try {
            const res = await UserManagementService.userControllerGetUser({
              authorization: token,
              id: uid,
            });
            const data = (res as any)?.data;
            if (data) {
              results[uid] = {
                name: data.name ?? "Unknown",
                employeeId: data.employeeId ?? "",
              };
            }
          } catch {
            results[uid] = { name: "Unknown", employeeId: "" };
          }
        }),
      );

      setUserMap((prev) => ({ ...prev, ...results }));
    },
    [token],
  );

  /* ── Fetch pending records ── */
  const fetchPending = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res =
        await LeaveManagementService.leaveControllerGetAllPendingLeaveRequestsForAuthority(
          { authorization: token },
        );
      const data = (res as any)?.data;
      const raw: PendingLeave[] = Array.isArray(data) ? data : [];
      // Filter out already-rejected requests
      const list = raw.filter((r) => r.isRejected !== true);
      setRecords(list);

      // Fetch user details for all user IDs in results
      const userIds = list.map((r) => r.user).filter(Boolean);
      if (userIds.length > 0) fetchUserDetails(userIds);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [token, fetchUserDetails]);

  useEffect(() => {
    if (open) {
      fetchPending();
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [open, fetchPending]);

  /* ── User info helpers ── */
  const getName = (userId: string) => userMap[userId]?.name ?? "—";
  const getEmployeeId = (userId: string) => userMap[userId]?.employeeId ?? "";

  /* ── Search filter ── */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      return (
        getName(r.user).toLowerCase().includes(q) ||
        getEmployeeId(r.user).toLowerCase().includes(q) ||
        (LEAVE_TYPE_LABELS[r.type] ?? r.type).toLowerCase().includes(q) ||
        (r.reason ?? "").toLowerCase().includes(q)
      );
    });
  }, [records, searchQuery, userMap]);

  /* ── Approve ── */
  const handleApprove = async (id: string) => {
    if (!token || actionLoading) return;
    setActionLoading({ id, action: "approve" });
    try {
      await LeaveManagementService.leaveControllerApproveLeaveRequest({
        id,
        authorization: token,
      });
      toast.success("Leave request approved.");
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      toast.error(err?.body?.message ?? "Failed to approve leave request.");
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Reject ── */
  const handleReject = async (id: string) => {
    if (!token || actionLoading) return;
    setActionLoading({ id, action: "reject" });
    try {
      await LeaveManagementService.leaveControllerRejectLeaveRequest({
        id,
        authorization: token,
      });
      toast.success("Leave request rejected.");
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      toast.error(err?.body?.message ?? "Failed to reject leave request.");
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Pagination ── */
  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
  const paginated = filtered.slice(startIndex, endIndex);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogTitle className="sr-only">Pending Leave Requests</DialogTitle>
        <DialogDescription className="sr-only">
          Review and approve or reject pending leave requests
        </DialogDescription>

        {/* Header */}
        <div className="shrink-0 px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Pending Leave Requests
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve or reject pending leave requests
          </p>
        </div>

        {/* Filter Bar */}
        <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 sm:gap-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image
              src="/icons/filter-icons.png"
              alt="Filter"
              width={20}
              height={20}
              className="hidden sm:block"
            />
            <div className="relative w-32 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-full rounded-sm border-border/60 pl-9 pr-3 text-sm focus-visible:ring-1 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          <div className="rounded-sm bg-[#044192] px-3 py-1.5 text-xs font-medium text-white sm:text-sm">
            {totalRecords} Pending
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading pending requests…
            </span>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <Table className="min-w-200">
              <TableHeader>
                <TableRow className="border-b border-border/40 bg-[#E7EFFF] hover:bg-[#E7EFFF]">
                  {COLUMNS.map((col) => (
                    <TableHead
                      key={col}
                      className={`h-11 whitespace-nowrap font-semibold text-foreground/80 ${
                        col === "#" ? "pl-3 sm:pl-5" : ""
                      } ${col === "ACTION" ? "pr-3 text-center sm:pr-5" : ""}`}
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={COLUMNS.length}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      {searchQuery
                        ? "No matching pending requests found."
                        : "No pending leave requests."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((record, idx) => {
                    const rowNum = startIndex + idx + 1;
                    const name = getName(record.user);
                    const empId = getEmployeeId(record.user);
                    const isApprovingThis =
                      actionLoading?.id === record._id &&
                      actionLoading?.action === "approve";
                    const isRejectingThis =
                      actionLoading?.id === record._id &&
                      actionLoading?.action === "reject";
                    const isAnyAction = actionLoading !== null;

                    return (
                      <TableRow
                        key={record._id}
                        className="border-b border-border/40 hover:bg-muted/30"
                      >
                        {/* # */}
                        <TableCell className="whitespace-nowrap py-3 pl-3 text-sm font-medium text-foreground/70 sm:py-3.5 sm:pl-5">
                          {rowNum}
                        </TableCell>

                        {/* Employee */}
                        <TableCell className="py-3 pl-3 sm:py-3.5 sm:pl-5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#044192] text-xs font-medium text-white sm:h-9 sm:w-9 sm:text-sm">
                              {getInitials(name)}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-foreground">
                                {name}
                              </span>
                              {empId && (
                                <p className="text-xs text-muted-foreground">
                                  {empId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Leave Type */}
                        <TableCell className="whitespace-nowrap py-3 text-sm font-semibold sm:py-3.5">
                          {LEAVE_TYPE_LABELS[record.type] ?? record.type}
                        </TableCell>

                        {/* From */}
                        <TableCell className="whitespace-nowrap py-3 text-sm text-foreground/70 sm:py-3.5">
                          {formatDate(record.startDate)}
                        </TableCell>

                        {/* To */}
                        <TableCell className="whitespace-nowrap py-3 text-sm text-foreground/70 sm:py-3.5">
                          {formatDate(record.endDate)}
                        </TableCell>

                        {/* Duration */}
                        <TableCell className="whitespace-nowrap py-3 text-sm sm:py-3.5">
                          {calcDuration(record.startDate, record.endDate)}
                        </TableCell>

                        {/* Reason */}
                        <TableCell className="max-w-40 truncate py-3 text-sm text-foreground/70 sm:py-3.5">
                          {record.reason || "—"}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="whitespace-nowrap py-3 pr-3 text-center sm:py-3.5 sm:pr-5">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              disabled={isAnyAction}
                              onClick={() => handleApprove(record._id)}
                              className="rounded-sm bg-[#14804A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#14804A]/90 sm:px-4"
                            >
                              {isApprovingThis ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Check className="mr-1 h-3.5 w-3.5" />
                                  Accept
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              disabled={isAnyAction}
                              onClick={() => handleReject(record._id)}
                              className="rounded-sm bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600/90 sm:px-4"
                            >
                              {isRejectingThis ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <X className="mr-1 h-3.5 w-3.5" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="shrink-0 flex items-center justify-between rounded-b-sm bg-[#E8EAEE] px-3 py-3 sm:px-5">
          <div className="text-xs text-foreground/70 sm:text-sm">
            {totalRecords === 0 ? 0 : startIndex + 1}-{endIndex} of{" "}
            {totalRecords}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="hidden text-sm text-foreground/70 sm:inline">
                Rows per page:
              </span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(v) => {
                  setRowsPerPage(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-14 rounded-sm border-border/60 bg-white text-xs sm:w-17.5 sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROWS_PER_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt.toString()}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="h-8 w-8 rounded-sm hover:bg-white/50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                className="h-8 w-8 rounded-sm hover:bg-white/50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
