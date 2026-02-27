"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  ChevronsUpDown,
  Loader2,
  Search,
  Settings,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AttendanceTable, ColumnDef } from "./AttendanceTable";
import { AttendanceTableRow } from "./AttendanceTableRow";
import { ATTENDANCE_DESCRIPTION, MONTH_NAMES } from "@/constants/attendance";
import { useAccessToken } from "@/hooks/useAccessToken";
import { useUserInfo } from "@/hooks/useUserInfo";
import { AttendanceService, UserService } from "@/api";
import { AttendanceByAuthorityDto } from "@/api/models/AttendanceByAuthorityDto";
import type {
  ApiAttendanceRecord,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  TodayAttendance,
} from "@/types/attendance";

/* ── Privileged roles that can view other users ──────────── */
const PRIVILEGED_ROLES = ["TEAM LEADER", "PROJECT MANAGER", "HR"];

/* ── inType options for authority attendance ──────────────── */
const IN_TYPE_OPTIONS: { value: AttendanceByAuthorityDto.inType; label: string }[] = [
  { value: AttendanceByAuthorityDto.inType.PRESENT, label: "Present" },
  { value: AttendanceByAuthorityDto.inType.LATE, label: "Late" },
  { value: AttendanceByAuthorityDto.inType.ABSENT, label: "Absent" },
  { value: AttendanceByAuthorityDto.inType.ON_LEAVE, label: "On Leave" },
  { value: AttendanceByAuthorityDto.inType.WEEKEND, label: "Weekend" },
  { value: AttendanceByAuthorityDto.inType.WORK_FROM_HOME, label: "Work From Home" },
];

/** Build a UTC ISO string from a YYYY-MM-DD date + optional time parts.
 *  Subtracts 6 hours (UTC+6 → UTC) so the backend stores the correct UTC value
 *  and the frontend's toLocaleTimeString (UTC+6) displays the original time. */
function buildUTCIso(
  dateStr: string,
  hour?: number,
  minute?: number,
  ampm?: string,
): string {
  // dateStr comes from <input type="date"> → "YYYY-MM-DD"
  if (hour == null || minute == null || !ampm) {
    return `${dateStr}T00:00:00.000Z`;
  }
  let h = hour;
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  // Subtract 6 hours for UTC+6 → UTC conversion
  h -= 6;

  // Handle day rollback when hours go negative
  const [yyyy, mm, dd] = dateStr.split("-").map(Number);
  let day = dd;
  let month = mm;
  let year = yyyy;
  if (h < 0) {
    h += 24;
    // Go to previous day
    const prev = new Date(Date.UTC(year, month - 1, day - 1));
    year = prev.getUTCFullYear();
    month = prev.getUTCMonth() + 1;
    day = prev.getUTCDate();
  }

  const hhStr = String(h).padStart(2, "0");
  const mmStr = String(minute).padStart(2, "0");
  const dateOut = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return `${dateOut}T${hhStr}:${mmStr}:00.000Z`;
}

/** Small helper — wait one frame so the dialog fully unmounts before showing SweetAlert */
const nextTick = () => new Promise<void>((r) => setTimeout(r, 150));

/* ── User list item type ─────────────────────────────────── */
interface UserOption {
  _id: string;
  name: string;
  employeeId: string;
}

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

/** Map backend inType to frontend AttendanceStatus */
function mapInTypeToStatus(inType: string): AttendanceStatus {
  switch (inType) {
    case "PRESENT":
    case "WORK_FROM_HOME":
      return "present";
    case "LATE":
      return "late";
    case "ABSENT":
    case "WEEKEND":
      return "absent";
    case "ON_LEAVE":
      return "leave";
    default:
      return "-";
  }
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
        status: mapInTypeToStatus(apiRecord.inType),
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
  const { role, userId: myUserId } = useUserInfo();

  // Whether current user can view other users' attendance
  const isPrivileged = !!role && PRIVILEGED_ROLES.includes(role);

  // Month / year selection (default = current)
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());

  // Selected user for privileged users (null = "My Attendance")
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  // User combobox state
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [userSearchKey, setUserSearchKey] = useState("");
  const [userList, setUserList] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Are we viewing someone else's attendance?
  const isViewingOtherUser = isPrivileged && selectedUser !== null;

  // Data state
  const [rawRecords, setRawRecords] = useState<ApiAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action state (check-in / check-out)
  const [actionLoading, setActionLoading] = useState<
    "checkin" | "checkout" | null
  >(null);

  // Manage User modals
  const [manageMenuOpen, setManageMenuOpen] = useState(false);
  const [manageAttendanceOpen, setManageAttendanceOpen] = useState(false);
  const [maSubmitting, setMaSubmitting] = useState(false);

  // Manage Attendance form state
  const [maDate, setMaDate] = useState(""); // YYYY-MM-DD
  const [maInType, setMaInType] = useState<AttendanceByAuthorityDto.inType | "">("" );
  const [maHour, setMaHour] = useState(9);
  const [maMinute, setMaMinute] = useState(0);
  const [maAmpm, setMaAmpm] = useState<"AM" | "PM">("AM");

  // Whether the selected inType requires a checkInTime
  const maShowTime =
    maInType === AttendanceByAuthorityDto.inType.PRESENT ||
    maInType === AttendanceByAuthorityDto.inType.LATE;

  const resetManageAttendanceForm = () => {
    setMaDate("");
    setMaInType("");
    setMaHour(9);
    setMaMinute(0);
    setMaAmpm("AM");
  };

  /* ── Fetch users list (for privileged roles) ───────────── */
  const fetchUsers = useCallback(
    async (search: string) => {
      if (!authorization) return;
      setUsersLoading(true);
      try {
        const res = await UserService.userControllerGetUsers({
          pageNo: 1,
          pageSize: 50,
          authorization,
          searchKey: search || undefined,
        });
        const payload = (res as any)?.data ?? {};
        const usersArr = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.users)
            ? payload.users
            : [];
        const users: UserOption[] = usersArr.map((u: any) => ({
          _id: u._id,
          name: u.name,
          employeeId: u.employeeId,
        }));
        setUserList(users);
      } catch {
        setUserList([]);
      } finally {
        setUsersLoading(false);
      }
    },
    [authorization],
  );

  // Load initial user list when popover opens
  useEffect(() => {
    if (userPopoverOpen && isPrivileged && userList.length === 0) {
      fetchUsers("");
    }
  }, [userPopoverOpen, isPrivileged, fetchUsers, userList.length]);

  // Debounced search
  const handleUserSearch = (value: string) => {
    setUserSearchKey(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(value);
    }, 400);
  };

  /* ── Fetch attendance for selected month/year ──────────── */
  const fetchAttendance = useCallback(async () => {
    if (!authorization) return;
    setLoading(true);
    setError(null);
    try {
      let res: any;
      if (isViewingOtherUser && selectedUser) {
        // Fetch specific user's attendance
        res =
          await AttendanceService.attendanceControllerGetSpecificUserAttendance({
            month,
            year,
            userId: selectedUser._id,
            authorization,
          });
      } else {
        // Fetch own attendance
        res = await AttendanceService.attendanceControllerGetMyAttendance({
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
      else if (status === 404)
        setError("User not found.");
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

  /* ── Mark Attendance by Authority ────────────────────────── */
  const handleManageAttendanceSubmit = async () => {
    if (!authorization || !selectedUser || !maDate || !maInType) return;
    setMaSubmitting(true);
    try {
      const body: AttendanceByAuthorityDto = {
        inType: maInType,
        date: buildUTCIso(maDate),
        ...(maShowTime
          ? {
              checkInTime: buildUTCIso(maDate, maHour, maMinute, maAmpm),
              isLate: maInType === AttendanceByAuthorityDto.inType.LATE,
            }
          : {}),
      };
      await AttendanceService.attendanceControllerMarkAttendanceByAuthority({
        userId: selectedUser._id,
        authorization,
        requestBody: body,
      });
      // Close dialog first, wait for unmount, then show success alert
      setManageAttendanceOpen(false);
      resetManageAttendanceForm();
      await fetchAttendance();
      await nextTick();
      Swal.fire({
        icon: "success",
        title: "Attendance Marked!",
        text: `Attendance for ${selectedUser.name} has been marked successfully.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      // Close dialog before showing error alert to avoid aria-hidden focus conflict
      setManageAttendanceOpen(false);
      resetManageAttendanceForm();
      await nextTick();

      const status = err?.status ?? err?.response?.status;
      let title = "Failed";
      let msg = err?.body?.message ?? "Something went wrong.";
      if (status === 400) {
        title = "Validation Error";
        const errors = err?.body?.errors;
        if (Array.isArray(errors)) {
          msg = errors.map((e: any) => e.message).join(", ");
        }
      } else if (status === 401) {
        title = "Unauthorized";
        msg = "Session expired. Please log in again.";
      } else if (status === 403) {
        title = "Forbidden";
        msg = err?.body?.message ?? "You don't have permission for this action.";
      } else if (status === 404) {
        title = "Not Found";
        msg = err?.body?.message ?? "User not found.";
      }
      Swal.fire({
        icon: "error",
        title,
        text: msg,
        confirmButtonColor: "#DC3545",
      });
    } finally {
      setMaSubmitting(false);
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

      {/* Today's Attendance Info Section — only for own attendance */}
      {!isViewingOtherUser && (
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
          <>
            <label className="text-sm font-medium text-foreground/70">
              User:
            </label>
            <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={userPopoverOpen}
                  className="w-64 justify-between font-normal"
                >
                  {selectedUser
                    ? `${selectedUser.employeeId} — ${selectedUser.name}`
                    : "My Attendance"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search by name or ID..."
                    value={userSearchKey}
                    onValueChange={handleUserSearch}
                  />
                  <CommandList>
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading…
                        </span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {/* "My Attendance" option */}
                          <CommandItem
                            value="__my_attendance__"
                            onSelect={() => {
                              setSelectedUser(null);
                              setUserPopoverOpen(false);
                              setUserSearchKey("");
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedUser === null
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            My Attendance
                          </CommandItem>
                          {/* User list */}
                          {userList
                            .filter((u) => u._id !== myUserId)
                            .map((user) => (
                              <CommandItem
                                key={user._id}
                                value={user._id}
                                onSelect={() => {
                                  setSelectedUser(user);
                                  setUserPopoverOpen(false);
                                  setUserSearchKey("");
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedUser?._id === user._id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                <span className="truncate">
                                  {user.employeeId} — {user.name}
                                </span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Clear selection button */}
            {selectedUser && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedUser(null)}
                title="Back to my attendance"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
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

        {/* Manage User button — visible when viewing another user */}
        {isViewingOtherUser && selectedUser && (
          <Button
            variant="outline"
            className="ml-2 gap-2"
            onClick={() => setManageMenuOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Manage User
          </Button>
        )}
      </div>

      {/* ── Manage User Actions Dialog ───────────────────── */}
      <Dialog open={manageMenuOpen} onOpenChange={setManageMenuOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              {selectedUser?.employeeId} — {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              disabled
            >
              <CalendarDays className="h-4 w-4" />
              Update Weekend
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setManageMenuOpen(false);
                resetManageAttendanceForm();
                setManageAttendanceOpen(true);
              }}
            >
              <Check className="h-4 w-4" />
              Manage Attendance
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              disabled
            >
              <CalendarDays className="h-4 w-4" />
              Exchange Weekend
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Manage Attendance Dialog ─────────────────────── */}
      <Dialog open={manageAttendanceOpen} onOpenChange={(open) => {
        setManageAttendanceOpen(open);
        if (!open) resetManageAttendanceForm();
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage Attendance</DialogTitle>
            <DialogDescription>
              Mark attendance for {selectedUser?.employeeId} — {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ma-date">Date</Label>
              <Input
                id="ma-date"
                type="date"
                value={maDate}
                onChange={(e) => setMaDate(e.target.value)}
              />
            </div>

            {/* Attendance Type */}
            <div className="flex flex-col gap-1.5">
              <Label>Attendance Type</Label>
              <Select
                value={maInType}
                onValueChange={(val) =>
                  setMaInType(val as AttendanceByAuthorityDto.inType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {IN_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in Time — only for PRESENT / LATE */}
            {maShowTime && (
              <div className="flex flex-col gap-1.5">
                <Label>Check-in Time</Label>
                <div className="flex items-center gap-2">
                  {/* Hour */}
                  <Select
                    value={String(maHour)}
                    onValueChange={(val) => setMaHour(Number(val))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-lg font-semibold">:</span>
                  {/* Minute */}
                  <Select
                    value={String(maMinute)}
                    onValueChange={(val) => setMaMinute(Number(val))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {String(m).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* AM/PM */}
                  <Select
                    value={maAmpm}
                    onValueChange={(val) => setMaAmpm(val as "AM" | "PM")}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setManageAttendanceOpen(false);
                resetManageAttendanceForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleManageAttendanceSubmit}
              disabled={!maDate || !maInType || maSubmitting}
              className="gap-2"
            >
              {maSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
