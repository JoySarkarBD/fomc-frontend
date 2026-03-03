"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddLeaveRequestForm } from "./AddLeaveRequestForm";

interface AddLeaveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export function AddLeaveRequestModal({
  open,
  onOpenChange,
  onSubmitted,
}: AddLeaveRequestModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto rounded-sm border-0 p-4 shadow-xl sm:max-w-2xl sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-foreground">
            Add Leave Request
          </DialogTitle>
        </DialogHeader>

        <AddLeaveRequestForm onSubmit={onSubmitted ?? (() => onOpenChange(false))} />
      </DialogContent>
    </Dialog>
  );
}
