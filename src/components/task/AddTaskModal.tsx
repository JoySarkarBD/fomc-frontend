"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddTaskForm } from "./AddTaskForm";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export function AddTaskModal({ open, onOpenChange, onTaskCreated }: AddTaskModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-sm border-0 p-6 shadow-xl sm:max-w-180">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-foreground">
            Add Task
          </DialogTitle>
        </DialogHeader>

        <AddTaskForm
          onSubmit={() => {
            onOpenChange(false);
            onTaskCreated?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
