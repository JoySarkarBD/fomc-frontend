import type { ILeaveRecord, ILeaveStatus } from "@/types/ILeave";
import { TableCell, TableRow } from "@/components/ui/table";
import { LEAVE_TYPE_LABELS } from "@/constants/leave";

interface LeaveTableRowProps {
  record: ILeaveRecord;
  rowNumber: number;
}

const STATUS_STYLES: Record<
  ILeaveStatus,
  { bg: string; text: string; label: string }
> = {
  Approved: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Approved",
  },
  Rejected: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Rejected",
  },
  Pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    label: "Pending",
  },
};

function getStatus(record: ILeaveRecord): ILeaveStatus {
  if (record.isApproved) return "Approved";
  if (record.isRejected) return "Rejected";
  return "Pending";
}

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
  const diff = Math.round(
    (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24),
  ) + 1;
  return diff <= 1 ? "1 day" : `${diff} days`;
}

export function LeaveTableRow({ record, rowNumber }: LeaveTableRowProps) {
  const status = getStatus(record);
  const statusStyle = STATUS_STYLES[status];

  return (
    <TableRow className="border-b border-border/40 hover:bg-muted/30">
      <TableCell className="whitespace-nowrap py-3.5 pl-5 text-sm font-medium text-foreground/70">
        {rowNumber}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm font-semibold">
        {LEAVE_TYPE_LABELS[record.type] ?? record.type}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {formatDate(record.startDate)}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {formatDate(record.endDate)}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm">
        {calcDuration(record.startDate, record.endDate)}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5">
        <span
          className={`inline-block w-20 rounded-sm px-2.5 py-1 text-center text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </TableCell>
    </TableRow>
  );
}
