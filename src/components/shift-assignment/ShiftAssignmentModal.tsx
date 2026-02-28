"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShiftAssignmentContent } from "./ShiftAssignmentContent";
import { X } from "lucide-react";

interface ShiftAssignmentModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShiftAssignmentModal({
  open,
  onClose,
}: ShiftAssignmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto p-0 sm:max-w-6xl">
        <DialogTitle className="sr-only">Shift Assignment</DialogTitle>
        <DialogDescription className="sr-only">
          View and manage your shift assignments
        </DialogDescription>

        {/* Header with title and close */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Shift Assignment
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 hover:bg-muted transition-colors"
          >
            {/* <X className="h-5 w-5" /> */}
          </button>
        </div>

        {/* Reuse the same content from shift assignment page */}
        <div className="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
          <ShiftAssignmentContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}