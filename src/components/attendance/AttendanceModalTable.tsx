"use client";

import { ModalTable } from "@/components/shared/ModalTable";
import { AttendanceModalRow } from "./AttendanceModalRow";
import type { AttendanceRecord } from "@/types/attendance";
import type { ColumnDef } from "@/components/shared/ModalTable";

const COLUMNS: ColumnDef[] = [
  { key: "#", label: "#" },
  { key: "date", label: "DATE" },
  { key: "day", label: "DAY" },
  { key: "checkIn", label: "CHECK-IN" },
  { key: "checkOut", label: "CHECK-OUT" },
  { key: "status", label: "STATUS" },
];

export function AttendanceModalTable() {
  return (
    <div>hello</div>
  );
}
