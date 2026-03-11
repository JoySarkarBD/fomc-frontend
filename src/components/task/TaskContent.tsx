"use client";

import { useState } from "react";
import { TaskPageHeader } from "./TaskPageHeader";
import { TaskPipeline } from "./TaskPipeline";
import { TaskList } from "./TaskList";
import { DCRPanel } from "./DCRPanel";
import { AddTaskModal } from "./AddTaskModal";

export function TaskContent() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header: description + Add Task button */}
      <TaskPageHeader onAddTask={() => setIsAddTaskOpen(true)} />

      {/* Add Task Modal */}
      <AddTaskModal
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onTaskCreated={() => setRefreshKey((k) => k + 1)}
      />

      {/* Pipeline flow: All Tasks → To Do → Submit DCR */}
      {/* <div className="py-1 sm:py-2">
        <TaskPipeline />
      </div> */}

      {/* Task table — full width */}
      <TaskList refreshKey={refreshKey} />

      {/* DCR panel — full width below */}
      <DCRPanel />
    </div>
  );
}
