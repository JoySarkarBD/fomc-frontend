import { TableCell, TableRow } from "@/components/ui/table";
import type { Task, TaskStatus } from "@/types/task";

interface TaskTableRowProps {
  task: Task;
  rowNumber: number;
}

/* ── Status badge config ────────────────────────────────────── */
const STATUS_CONFIG: Record<
  TaskStatus,
  { bg: string; text: string; label: string }
> = {
  PENDING: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "Pending",
  },
  WORK_IN_PROGRESS: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "In Progress",
  },
  COMPLETED: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Completed",
  },
  BLOCKED: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "Blocked",
  },
  DELIVERED: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "Delivered",
  },
};

/* ── Priority badge config ──────────────────────────────────── */
const PRIORITY_CONFIG: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  LOW: { bg: "bg-gray-100", text: "text-gray-600", label: "Low" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
  CRITICAL: { bg: "bg-red-100", text: "text-red-700", label: "Critical" },
};

/* ── Helpers ────────────────────────────────────────────────── */
function resolveProjectName(
  field: string | { _id: string; name: string } | null | undefined,
): string {
  if (!field) return "—";
  if (typeof field === "string") return field;
  return field.name || "—";
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TaskTableRow({ task, rowNumber }: TaskTableRowProps) {
  const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.PENDING;
  const priorityCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.LOW;

  return (
    <TableRow className="border-b border-border/40 hover:bg-muted/30">
      {/* Checkbox */}
      <TableCell className="py-3.5 pl-5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          aria-label={`Select task ${rowNumber}`}
        />
      </TableCell>

      {/* # */}
      <TableCell className="whitespace-nowrap py-3.5 text-sm font-medium text-foreground/70">
        {rowNumber}
      </TableCell>

      {/* Task Name */}
      <TableCell className="py-3.5 text-sm text-foreground">
        <div className="max-w-[280px] truncate">{task.name}</div>
      </TableCell>

      {/* Project */}
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {resolveProjectName(task.project)}
      </TableCell>

      {/* Due Date */}
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {formatDate(task.dueDate)}
      </TableCell>

      {/* Priority */}
      <TableCell className="whitespace-nowrap py-3.5">
        <span
          className={`inline-block w-20 rounded-sm px-2.5 py-1 text-center text-xs font-semibold ${priorityCfg.bg} ${priorityCfg.text}`}
        >
          {priorityCfg.label}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className="whitespace-nowrap py-3.5">
        <span
          className={`inline-block w-24 rounded-sm px-2.5 py-1 text-center text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}
        >
          {statusCfg.label}
        </span>
      </TableCell>
    </TableRow>
  );
}
