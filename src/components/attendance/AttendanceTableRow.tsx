import { TableCell, TableRow } from "@/components/ui/table";
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance";

interface AttendanceTableRowProps {
  record: AttendanceRecord;
}

const STATUS_STYLES: Record<
  AttendanceStatus,
  { bg: string; text: string; label: string }
> = {
  present: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Present",
  },
  late: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Late",
  },
  absent: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "Absent",
  },
  leave: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Leave",
  },
  exchange: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "Exchange",
  },
  "-": {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "-",
  },
};

export function AttendanceTableRow({ record }: AttendanceTableRowProps) {
  const statusStyle = STATUS_STYLES[record.status];

  return (
    <TableRow className="border-b border-border/40 hover:bg-muted/30">
      <TableCell className="whitespace-nowrap py-3.5 pl-5 text-sm font-medium text-foreground/70">
        {record.rowNumber}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {record.date}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {record.day}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {record.checkIn}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {record.checkOut}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {record.shiftType}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5">
        <span
          className={`inline-block rounded-sm px-2.5 py-2 text-xs font-semibold w-30 text-center ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </TableCell>
    </TableRow>
  );
}
