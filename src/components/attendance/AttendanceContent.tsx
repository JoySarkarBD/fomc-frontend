"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceTable, ColumnDef } from "./AttendanceTable";
import { AttendanceTableRow } from "./AttendanceTableRow";
import { ATTENDANCE_DESCRIPTION, MONTH_NAMES } from "@/constants/attendance";
import { useAccessToken } from "@/hooks/useAccessToken";
import { AttendanceService } from "@/api";
import type {
  ApiAttendanceRecord,
  AttendanceRecord,
  AttendanceSummary,
  TodayAttendance,
} from "@/types/attendance";

/* ── Column definitions ─────────────────────────────────── */
const COLUMNS: ColumnDef[] = [
  { key: "#", label: "#" },
  { key: "date", label: "DATE" },
  { key: "day", label: "DAY" },
  { key: "checkIn", label: "CHECK-IN" },
  { key: "checkOut", label: "CHECK-OUT" },
  { key: "shiftType", label: "SHIFT TYPE" },
  { key: "status", label: "STATUS" },
];

/* ── Helpers ─────────────────────────────────────────────── */
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** Get number of days in a given month (1-12) */
function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/** Normalize an ISO date string to YYYY-MM-DD based on local date */
function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Build a full month of AttendanceRecord rows.
 * Days with API data show real values; days without show "-" placeholders.
 */
function buildFullMonthRecords(
  month: number,
  year: number,
  apiRecords: ApiAttendanceRecord[],
): AttendanceRecord[] {
  const totalDays = getDaysInMonth(month, year);

  // Build a lookup: localDateKey → apiRecord
  const recordMap = new Map<string, ApiAttendanceRecord>();
  for (const r of apiRecords) {
    recordMap.set(toLocalDateKey(r.date), r);
  }

  const records: AttendanceRecord[] = [];

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const apiRecord = recordMap.get(dateKey);

    if (apiRecord) {
      records.push({
        id: apiRecord._id,
        rowNumber: day,
        date: formatDateDisplay(date),
        day: DAY_NAMES[date.getDay()],
        checkIn: formatTime(apiRecord.checkInTime),
        checkOut: formatTime(apiRecord.checkOutTime),
        shiftType: apiRecord.shiftType ?? "-",
        status: apiRecord.inType === "LATE" ? "late" : "present",
      });
    } else {
      records.push({
        id: `empty-${day}`,
        rowNumber: day,
        date: formatDateDisplay(date),
        day: DAY_NAMES[date.getDay()],
        checkIn: "-",
        checkOut: "-",
        shiftType: "-",
        status: "-",
      });
    }
  }

  return records;
}

/** Build today info from today's API record (if exists) */
function buildTodayAttendance(
  records: ApiAttendanceRecord[],
): TodayAttendance {
  const now = new Date();
  const todayKey = toLocalDateKey(now.toISOString());

  const todayRecord = records.find((r) => toLocalDateKey(r.date) === todayKey);

  return {
    date: formatDateDisplay(now),
    dayOfWeek: DAY_NAMES[now.getDay()],
    checkedInAt: todayRecord?.checkInTime ? formatTime(todayRecord.checkInTime) : null,
    checkedOutAt: todayRecord?.checkOutTime ? formatTime(todayRecord.checkOutTime) : null,
  };
}

/** Compute summary stats from full month records */
function computeSummary(records: AttendanceRecord[]): AttendanceSummary {
  let present = 0;
  let late = 0;
  let absent = 0;
  let leave = 0;
  let exchange = 0;

  for (const r of records) {
    switch (r.status) {
      case "present":
        present++;
        break;
      case "late":
        late++;
        break;
      case "absent":
        absent++;
        break;
      case "leave":
        leave++;
        break;
      case "exchange":
        exchange++;
        break;
    }
  }

  return {
    present,
    late,
    absent,
    leave,
    exchange,
    workDays: present + late,
  };
}

/* ── Component ───────────────────────────────────────────── */
export function AttendanceContent() {
  const authorization = useAccessToken();

  // Month / year selection (default = current)
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());

  // Data state
  const [rawRecords, setRawRecords] = useState<ApiAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action state (check-in / check-out)
  const [actionLoading, setActionLoading] = useState<
    "checkin" | "checkout" | null
  >(null);

  /* ── Fetch attendance for selected month/year ──────────── */
  const fetchAttendance = useCallback(async () => {
    if (!authorization) return;
    setLoading(true);
    setError(null);
    try {
      const res = await AttendanceService.attendanceControllerGetMyAttendance({
        month,
        year,
        authorization,
      });
      const data = (res as any)?.data ?? [];
      setRawRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 401) setError("Session expired. Please log in again.");
      else if (status === 403)
        setError("You don't have permission to view attendance.");
      else
        setError(err?.body?.message ?? "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, [authorization, month, year]);

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
      await AttendanceService.attendanceControllerPresentAttendance({
        authorization,
      });
      await fetchAttendance();
      Swal.fire({
        icon: "success",
        title: "Checked In!",
        text: "Your attendance has been marked successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to check in. Please try again.";
      Swal.fire({
        icon: "warning",
        title: "Check In Failed",
        text: msg,
        confirmButtonColor: "#14804A",
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
      await AttendanceService.attendanceControllerOutAttendance({
        authorization,
      });
      await fetchAttendance();
      Swal.fire({
        icon: "success",
        title: "Checked Out!",
        text: "You have been checked out successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to check out. Please try again.";
      Swal.fire({
        icon: "warning",
        title: "Check Out Failed",
        text: msg,
        confirmButtonColor: "#DC3545",
      });
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Year options for selector ─────────────────────────── */
  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 26 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-base pr-0 leading-relaxed text-muted-foreground/80 sm:text-xl sm:pr-8 md:text-2xl">
        {ATTENDANCE_DESCRIPTION}
      </p>

      {/* Today's Attendance Info Section */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Date and Check-in Info */}
          <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-6 sm:text-base">
            <div>
              <h3 className="font-semibold text-foreground flex items-center">
                <Image
                  src="/icons/schedule.png"
                  alt="Check In"
                  width={28}
                  height={24}
                  className="mr-2"
                />
                Today: {todayAttendance.date} ({todayAttendance.dayOfWeek})
              </h3>
            </div>
            {todayAttendance.checkedInAt && (
              <div className="flex items-center gap-2">
                <span className="text-foreground/70">Checked in at:</span>
                <span className="font-semibold text-foreground">
                  {todayAttendance.checkedInAt}
                </span>
              </div>
            )}
            {todayAttendance.checkedOutAt && (
              <div className="flex items-center gap-2">
                <span className="text-foreground/70">Checked out at:</span>
                <span className="font-semibold text-foreground">
                  {todayAttendance.checkedOutAt}
                </span>
              </div>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={
                !!todayAttendance.checkedInAt || actionLoading !== null
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#14804A] px-4 py-2 text-xs font-medium text-white hover:bg-[#14804A]/90 disabled:opacity-50 sm:flex-none sm:px-6 sm:text-sm"
            >
              {actionLoading === "checkin" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Image
                  src="/icons/tick-icons.png"
                  alt="Check In"
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              )}
              Check In
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={
                !todayAttendance.checkedInAt ||
                !!todayAttendance.checkedOutAt ||
                actionLoading !== null
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#DC3545] px-4 py-2 text-xs font-medium text-white hover:bg-[#DC3545]/90 disabled:opacity-50 sm:flex-none sm:px-6 sm:text-sm"
            >
              {actionLoading === "checkout" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Image
                  src="/icons/checkout-icons.png"
                  alt="Check Out"
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              )}
              Check Out
            </Button>
          </div>
        </div>
      </div>

      {/* Month / Year Selector */}
      <div className="flex flex-wrap items-center gap-3 px-3 sm:px-6">
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
      {!loading && !error && (
        <div className="flex flex-wrap gap-y-1 items-center text-xs text-gray-600 sm:text-sm">
          <div className="flex flex-wrap gap-x-1 gap-y-1">
            Total:
            <span className="text-green-600 font-medium ml-1">
              {summary.present} Present
            </span>
            ,
            <span className="text-red-600 font-medium ml-1">
              {summary.late} Late
            </span>
            ,
            <span className="text-orange-600 font-medium ml-1">
              {summary.absent} Absent
            </span>
            ,
            <span className="text-blue-600 font-medium ml-1">
              {summary.leave} Leave
            </span>
            ,
            <span className="text-purple-600 font-medium ml-1">
              {summary.exchange} Exchange
            </span>
            <span className="ml-2 text-blue-600 font-medium sm:ml-4">
              Work Days: {summary.workDays}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
