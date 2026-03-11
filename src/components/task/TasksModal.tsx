"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TasksModalTable } from "./TasksModalTable";

interface TasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TasksModal({ open, onOpenChange }: TasksModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto gap-0 p-0 sm:max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <DialogTitle className="text-lg font-semibold text-foreground sm:text-xl">
            Tasks
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            {/* <X className="h-5 w-5" /> */}
          </button>
        </div>
        <DialogDescription className="sr-only">
          View and manage all tasks
        </DialogDescription>

        {/* Content */}
        <div className="overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <TasksModalTable tasks={[]} totalRecords={0} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
