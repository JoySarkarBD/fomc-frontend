"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceTable } from "./AttendanceTable";
import { AttendanceTableRow } from "./AttendanceTableRow";
import { TodayAttendanceCard } from "./TodayAttendanceCard";
import { UserSelector } from "./UserSelector";
import { ManageUserDialogs } from "./ManageUserDialogs";
import { AttendanceSummaryBar } from "./AttendanceSummaryBar";
import {
  buildFullMonthRecords,
  buildTodayAttendance,
  COLUMNS,
  computeSummary,
  PRIVILEGED_ROLES,
  type UserOption,
} from "./attendance-helpers";
import { ATTENDANCE_DESCRIPTION, MONTH_NAMES } from "@/constants/attendance";
import { useAccessToken } from "@/hooks/useAccessToken";
import { useUserInfo } from "@/hooks/useUserInfo";
import { AttendanceManagementService } from "@/api";
import type {
  ApiAttendanceRecord,
  AttendanceRecord,
} from "@/types/attendance";

/* ── Component ───────────────────────────────────────────── */
export function AttendanceContent() {
  const authorization = useAccessToken();
  const { role, userId: myUserId } = useUserInfo();

  const isPrivileged = !!role && PRIVILEGED_ROLES.includes(role);

  // Month / year selection
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Selected user for privileged users
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const isViewingOtherUser = isPrivileged && selectedUser !== null;

  // Data state
  const [rawRecords, setRawRecords] = useState<ApiAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check-in / check-out loading
  const [actionLoading, setActionLoading] = useState<
    "checkin" | "checkout" | null
  >(null);

  /* ── Fetch attendance ──────────────────────────────────── */
  const fetchAttendance = useCallback(async () => {
    if (!authorization) return;
    setLoading(true);
    setError(null);
    try {
      let res: any;
      if (isViewingOtherUser && selectedUser) {
        res =
          await AttendanceManagementService.attendanceControllerGetSpecificUserAttendance({
            month,
            year,
            userId: selectedUser._id,
            authorization,
          });
      } else {
        res = await AttendanceManagementService.attendanceControllerGetMyAttendance({
          month,
          year,
          authorization,
        });
      }
      const data = (res as any)?.data ?? [];
      setRawRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 401) setError("Session expired. Please log in again.");
      else if (status === 403)
        setError("You don't have permission to view this user's attendance.");
      else if (status === 404) setError("User not found.");
      else
        setError(err?.body?.message ?? "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, [authorization, month, year, isViewingOtherUser, selectedUser]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  /* ── Derived data ──────────────────────────────────────── */
  const tableRecords: AttendanceRecord[] = useMemo(
    () => buildFullMonthRecords(month, year, rawRecords),
    [month, year, rawRecords],
  );

  const todayAttendance = useMemo(
    () => buildTodayAttendance(rawRecords),
    [rawRecords],
  );

  const summary = useMemo(() => computeSummary(tableRecords), [tableRecords]);

  /* ── Check In ──────────────────────────────────────────── */
  const handleCheckIn = async () => {
    if (!authorization || actionLoading) return;
    setActionLoading("checkin");
    try {
      await AttendanceManagementService.attendanceControllerPresentAttendance({
        authorization,
      });
      await fetchAttendance();
      toast.success("Your attendance has been marked successfully.", {
        description: "Checked In!",
      });
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to check in. Please try again.";
      toast.warning(msg, {
        description: "Check In Failed",
      });
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Check Out ─────────────────────────────────────────── */
  const handleCheckOut = async () => {
    if (!authorization || actionLoading) return;
    setActionLoading("checkout");
    try {
      await AttendanceManagementService.attendanceControllerOutAttendance({
        authorization,
      });
      await fetchAttendance();
      toast.success("You have been checked out successfully.", {
        description: "Checked Out!",
      });
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to check out. Please try again.";
      toast.warning(msg, {
        description: "Check Out Failed",
      });
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Year options ──────────────────────────────────────── */
  const currentYear = now.getFullYear();
  const yearOptions = Array.from(
    { length: 26 },
    (_, i) => currentYear - 1 + i,
  );

  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-base pr-0 leading-relaxed text-muted-foreground/80 sm:text-xl sm:pr-8 md:text-2xl">
        {ATTENDANCE_DESCRIPTION}
      </p>

      {/* Today's Attendance — only for own attendance */}
      {!isViewingOtherUser && (
        <TodayAttendanceCard
          todayAttendance={todayAttendance}
          actionLoading={actionLoading}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      )}

      {/* Viewing other user banner */}
      {isViewingOtherUser && selectedUser && (
        <div className="flex items-center gap-2 rounded-sm border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <Search className="h-4 w-4" />
          <span>
            Viewing attendance for:{" "}
            <strong>
              {selectedUser.employeeId} — {selectedUser.name}
            </strong>
          </span>
        </div>
      )}

      {/* User Selector + Month / Year Selector */}
      <div className="flex flex-wrap items-center gap-3 px-3 sm:px-6">
        {/* User selector — only for privileged roles */}
        {isPrivileged && (
          <UserSelector
            authorization={authorization}
            myUserId={myUserId}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
          />
        )}

        <label className="text-sm font-medium text-foreground/70">
          Month:
        </label>
        <Select
          value={String(month)}
          onValueChange={(val) => setMonth(Number(val))}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, idx) => (
              <SelectItem key={name} value={String(idx + 1)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="text-sm font-medium text-foreground/70 ml-2">
          Year:
        </label>
        <Select
          value={String(year)}
          onValueChange={(val) => setYear(Number(val))}
        >
          <SelectTrigger className="w-25">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Manage User button + dialogs */}
        {isViewingOtherUser && selectedUser && (
          <ManageUserDialogs
            authorization={authorization}
            selectedUser={selectedUser}
            onAttendanceMarked={fetchAttendance}
          />
        )}
      </div>

      {/* Loading / Error / Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">
            Loading attendance…
          </span>
        </div>
      ) : error ? (
        <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-6 text-center text-red-600">
          {error}
        </div>
      ) : (
        <AttendanceTable
          data={tableRecords}
          columns={COLUMNS}
          totalRecords={tableRecords.length}
          enableSearch={false}
          enableCheckboxes={false}
          renderRow={(record: AttendanceRecord) => (
            <AttendanceTableRow key={record.id} record={record} />
          )}
        />
      )}

      {/* Summary */}
      {!loading && !error && <AttendanceSummaryBar summary={summary} />}
    </div>
  );
}
