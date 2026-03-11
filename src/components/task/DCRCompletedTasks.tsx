import type { Task } from "@/types/task";

interface DCRCompletedTasksProps {
  tasks: Task[];
}

export function DCRCompletedTasks({ tasks }: DCRCompletedTasksProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No completed tasks yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task._id}
          className="group flex items-start gap-3 rounded-sm bg-gray-50/80 p-3.5 ring-1 ring-border/20 transition-colors hover:bg-gray-100"
        >
          {/* Green checkbox */}
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#16A34A] shadow-sm">
            <svg
              className="h-3.5 w-3.5 text-white stroke-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <p className="text-sm font-medium leading-normal text-foreground/80">
            {task.name}
          </p>
        </div>
      ))}
    </div>
  );
}
