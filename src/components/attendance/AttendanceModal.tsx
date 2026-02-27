"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttendanceContent } from "./AttendanceContent";

interface AttendanceModalProps {
  open: boolean;
  onClose: () => void;
}

export function AttendanceModal({ open, onClose }: AttendanceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogTitle className="sr-only">My Attendance</DialogTitle>
        <DialogDescription className="sr-only">
          View and manage your attendance records
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            My Attendance
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 hover:bg-muted transition-colors"
          >
            {/* close handled by Dialog overlay click / Esc */}
          </button>
        </div>

        {/* Attendance Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
          <AttendanceContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
