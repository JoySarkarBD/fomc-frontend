/** Possible statuses for attendance */
export type AttendanceStatus = "present" | "late" | "absent" | "leave" | "exchange" | "-";

/** A single attendance record (for table display) */
export interface AttendanceRecord {
  id: string;
  rowNumber: number;
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  shiftType: string;
  status: AttendanceStatus;
}

/** Today's attendance info */
export interface TodayAttendance {
  date: string;
  dayOfWeek: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
}

/** Raw attendance record from the API */
export interface ApiAttendanceRecord {
  _id: string;
  user: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
  inType: "PRESENT" | "LATE";
  shiftType: "DAY";
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Summary stats derived from monthly records */
export interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  leave: number;
  exchange: number;
  workDays: number;
}
