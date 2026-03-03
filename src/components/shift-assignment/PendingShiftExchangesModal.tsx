"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import Image from "next/image";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  X,
} from "lucide-react";
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
import { SellsShiftManagementService } from "@/api";

/* ─── types ─── */
interface PendingExchange {
  _id: string;
  exchangeDate: string;
  originalShift: string;
  newShift: string;
  reason?: string;
  status: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name: string;
    employeeId?: string;
  };
}

interface PendingShiftExchangesModalProps {
  open: boolean;
  onClose: () => void;
}

/* helpers */
const SHIFT_LABELS: Record<string, string> = {
  MORNING: "Morning Shift",
  EVENING: "Evening Shift",
  NIGHT: "Night Shift",
};

const TABLE_COLUMNS = [
  "#",
  "EMPLOYEE",
  "DATE",
  "ORIGINAL SHIFT",
  "NEW SHIFT",
  "REASON",
  "ACTION",
];

/* ─── component ─── */
export function PendingShiftExchangesModal({
  open,
  onClose,
}: PendingShiftExchangesModalProps) {
  const token = useAccessToken();

  const [exchanges, setExchanges] = useState<PendingExchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState<{ id: string; action: "approve" | "reject" } | null>(null);

  /* ── fetch pending exchanges ── */
  const fetchPending = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res =
        await SellsShiftManagementService.sellsShiftManagementControllerGetPendingShiftExchanges(
          { authorization: token }
        );
      const data = (res as any)?.data;
      setExchanges(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load pending shift exchange requests.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (open) {
      fetchPending();
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [open, fetchPending]);

  /* ── helpers for user info ── */
  const getName = (ex: PendingExchange) => ex.user?.name ?? "—";
  const getEmployeeId = (ex: PendingExchange) => ex.user?.employeeId ?? "";
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  /* ── search filter ── */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return exchanges;
    return exchanges.filter((ex) => {
      return (
        getName(ex).toLowerCase().includes(q) ||
        getEmployeeId(ex).toLowerCase().includes(q) ||
        (SHIFT_LABELS[ex.originalShift] ?? ex.originalShift)
          .toLowerCase()
          .includes(q) ||
        (SHIFT_LABELS[ex.newShift] ?? ex.newShift)
          .toLowerCase()
          .includes(q) ||
        ex.exchangeDate.toLowerCase().includes(q) ||
        (ex.reason ?? "").toLowerCase().includes(q)
      );
    });
  }, [exchanges, searchQuery]);

  /* ── pagination ── */
  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);
  const paginated = filtered.slice(startIndex, endIndex);

  /* ── approve / reject ── */
  const handleApprove = async (exchangeId: string) => {
    if (!token || actionLoading) return;
    setActionLoading({ id: exchangeId, action: "approve" });
    try {
      await SellsShiftManagementService.sellsShiftManagementControllerApproveShiftExchange(
        { exchangeId, authorization: token }
      );
      toast.success("Shift exchange request approved.");
      setExchanges((prev) => prev.filter((ex) => ex._id !== exchangeId));
    } catch (err: any) {
      const msg =
        err?.body?.message ?? err?.message ?? "Failed to approve request.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (exchangeId: string) => {
    if (!token || actionLoading) return;
    setActionLoading({ id: exchangeId, action: "reject" });
    try {
      await SellsShiftManagementService.sellsShiftManagementControllerRejectShiftExchange(
        { exchangeId, authorization: token }
      );
      toast.success("Shift exchange request rejected.");
      setExchanges((prev) => prev.filter((ex) => ex._id !== exchangeId));
    } catch (err: any) {
      const msg =
        err?.body?.message ?? err?.message ?? "Failed to reject request.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setActionLoading(null);
    }
  };

  /* ── date formatter ── */
  const fmtDate = (d: string) => {
    try {
      return format(new Date(d), "MMM d, yyyy");
    } catch {
      return d;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-h-[90vh] p-0 sm:max-w-5xl flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">Pending Shift Exchange Requests</DialogTitle>
        <DialogDescription className="sr-only">
          Review and approve or reject pending shift exchange requests
        </DialogDescription>

        {/* Header — fixed */}
        <div className="shrink-0 px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Pending Shift Exchange Requests
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review shift exchange requests from team members
          </p>
        </div>

        {/* Filter Bar — fixed */}
        <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 sm:gap-4 sm:px-6">
          {/* Left: Filter Icon + Search */}
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

          {/* Right: Total count badge */}
          <div className="rounded-sm bg-[#044192] px-3 py-1.5 text-xs font-medium text-white sm:text-sm">
            {totalRecords} Pending
          </div>
        </div>

        {/* Table — scrollable both axes */}
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
                      {TABLE_COLUMNS.map((col) => (
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
                          colSpan={TABLE_COLUMNS.length}
                          className="py-12 text-center text-sm text-muted-foreground"
                        >
                          {searchQuery
                            ? "No matching pending requests found."
                            : "No pending shift exchange requests."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((ex, idx) => {
                        const name = getName(ex);
                        const empId = getEmployeeId(ex);
                        const isApprovingThis =
                          actionLoading?.id === ex._id &&
                          actionLoading?.action === "approve";
                        const isRejectingThis =
                          actionLoading?.id === ex._id &&
                          actionLoading?.action === "reject";
                        const isAnyAction = actionLoading !== null;

                        return (
                          <TableRow
                            key={ex._id}
                            className="border-b border-border/40 hover:bg-muted/30"
                          >
                            {/* # */}
                            <TableCell className="whitespace-nowrap py-3 pl-3 text-sm font-medium text-foreground/70 sm:py-3.5 sm:pl-5">
                              {startIndex + idx + 1}
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

                            {/* Date */}
                            <TableCell className="whitespace-nowrap py-3 text-sm text-foreground sm:py-3.5">
                              {fmtDate(ex.exchangeDate)}
                            </TableCell>

                            {/* Original Shift */}
                            <TableCell className="whitespace-nowrap py-3 text-sm text-foreground sm:py-3.5">
                              {SHIFT_LABELS[ex.originalShift] ??
                                ex.originalShift}
                            </TableCell>

                            {/* New Shift */}
                            <TableCell className="whitespace-nowrap py-3 text-sm text-foreground sm:py-3.5">
                              {SHIFT_LABELS[ex.newShift] ?? ex.newShift}
                            </TableCell>

                            {/* Reason */}
                            <TableCell className="max-w-40 truncate py-3 text-sm text-foreground/70 sm:py-3.5">
                              {ex.reason || "—"}
                            </TableCell>

                            {/* Action */}
                            <TableCell className="whitespace-nowrap py-3 pr-3 text-center sm:py-3.5 sm:pr-5">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  disabled={isAnyAction}
                                  onClick={() => handleApprove(ex._id)}
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
                                  onClick={() => handleReject(ex._id)}
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

          {/* Pagination — fixed at bottom */}
          <div className="shrink-0 flex items-center justify-between rounded-b-sm bg-[#E8EAEE] px-3 py-3 sm:px-5">
            {/* Left: Rows count display */}
            <div className="text-xs text-foreground/70 sm:text-sm">
              {totalRecords === 0 ? 0 : startIndex + 1}-{endIndex} of{" "}
              {totalRecords}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Rows per page selector */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="hidden text-sm text-foreground/70 sm:inline">
                  Rows per page:
                </span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-14 rounded-sm border-border/60 bg-white text-xs sm:w-17.5 sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((v) => (
                      <SelectItem key={v} value={v.toString()}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
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
