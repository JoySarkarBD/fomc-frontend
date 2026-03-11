import { TableCell, TableRow } from "@/components/ui/table";
import type { Task, TaskStatus } from "@/types/task";

interface TasksModalRowProps {
  task: Task;
  rowNumber: number;
}

const STATUS_STYLES: Record<
  TaskStatus,
  { bg: string; text: string; label: string }
> = {
  PENDING: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending" },
  WORK_IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  BLOCKED: { bg: "bg-red-100", text: "text-red-700", label: "Blocked" },
  DELIVERED: { bg: "bg-purple-100", text: "text-purple-700", label: "Delivered" },
};

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

export function TasksModalRow({ task, rowNumber }: TasksModalRowProps) {
  const statusStyle = STATUS_STYLES[task.status] ?? STATUS_STYLES.PENDING;

  return (
    <TableRow className="border-b border-border/40 hover:bg-muted/30">
      <TableCell className="py-3.5 pl-5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          aria-label={`Select task ${rowNumber}`}
        />
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm font-medium text-foreground/70">
        {rowNumber}
      </TableCell>
      <TableCell className="py-3.5 text-sm text-foreground">
        <div className="max-w-[280px] truncate">{task.name}</div>
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {resolveProjectName(task.project)}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {formatDate(task.dueDate)}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5 text-sm text-foreground/70">
        {task.priority}
      </TableCell>
      <TableCell className="whitespace-nowrap py-3.5">
        <span
          className={`inline-block rounded-sm px-2.5 py-1 text-xs font-semibold w-30 text-center ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </TableCell>
    </TableRow>
  );
}
