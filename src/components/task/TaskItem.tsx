import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/task";

interface TaskItemProps {
  task: Task;
}

const STATUS_CONFIG: Record<TaskStatus, {
  badgeClass: string;
  badgeLabel: string;
  checkboxClass: string;
  checked: boolean;
}> = {
  COMPLETED: {
    badgeClass: "bg-[#DCFCE7] text-[#166534]",
    badgeLabel: "Completed",
    checkboxClass: "bg-[#16A34A] border-[#16A34A]",
    checked: true,
  },
  PENDING: {
    badgeClass: "bg-[#FEF3C7] text-[#92400E]",
    badgeLabel: "Pending",
    checkboxClass: "border-gray-300 bg-white group-hover:border-[#16A34A]",
    checked: false,
  },
  WORK_IN_PROGRESS: {
    badgeClass: "bg-[#DBEAFE] text-[#1E40AF]",
    badgeLabel: "In Progress",
    checkboxClass: "border-blue-400 bg-blue-50",
    checked: false,
  },
  BLOCKED: {
    badgeClass: "bg-[#FEE2E2] text-[#991B1B]",
    badgeLabel: "Blocked",
    checkboxClass: "border-red-400 bg-red-50",
    checked: false,
  },
  DELIVERED: {
    badgeClass: "bg-[#F3E8FF] text-[#6B21A8]",
    badgeLabel: "Delivered",
    checkboxClass: "border-purple-400 bg-purple-50",
    checked: true,
  },
};

export function TaskItem({ task }: TaskItemProps) {
  const config = STATUS_CONFIG[task.status];

  return (
    <div className="group mb-3 rounded-sm bg-white p-3 shadow-sm ring-1 ring-border/60 transition-all hover:shadow-md hover:ring-border sm:p-4">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Checkbox */}
        <div
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
            config.checkboxClass,
          )}
        >
          {config.checked && (
            <svg
              className="h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug text-foreground/90 sm:text-base">
            {task.name}
          </p>

          {/* Badge + Date row - stack on mobile */}
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:px-2.5 sm:text-[11px]",
                config.badgeClass,
              )}
            >
              {config.badgeLabel}
            </span>

            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          className="shrink-0 rounded p-1 text-muted-foreground/60 hover:bg-muted hover:text-foreground"
          aria-label="Task actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
