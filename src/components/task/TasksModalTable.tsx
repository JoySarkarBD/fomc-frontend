import { ModalTable, type ColumnDef } from "@/components/shared";
import { TasksModalRow } from "./TasksModalRow";
import type { Task, TaskStatus } from "@/types/task";

const COLUMNS: ColumnDef[] = [
  { key: "number", label: "#" },
  { key: "task", label: "Task" },
  { key: "project", label: "Project" },
  { key: "dueDate", label: "Due Date" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
];

interface TasksModalTableProps {
  tasks: Task[];
  totalRecords: number;
}

export function TasksModalTable({ tasks, totalRecords }: TasksModalTableProps) {
  const handleFilterData = (
    data: Task[],
    filter: TaskStatus | "all",
    search: string,
  ): Task[] => {
    return data.filter((task) => {
      const matchesFilter = filter === "all" || task.status === filter;
      const matchesSearch = task.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  return (
    <ModalTable<Task, TaskStatus | "all">
      data={tasks}
      columns={COLUMNS}
      totalRecords={totalRecords}
      defaultFilter={"all" as TaskStatus | "all"}
      onFilterData={handleFilterData}
      enableSearch={true}
      searchPlaceholder="Search..."
      renderRow={(task, index) => (
        <TasksModalRow key={task._id} task={task} rowNumber={index + 1} />
      )}
      enableCheckboxes={true}
      rowsPerPageOptions={[10, 20, 50, 100]}
      defaultRowsPerPage={10}
      showDCRButton={true}
    />
  );
}
