"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface RequestShiftChangeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function RequestShiftChangeModal({
  open,
  onClose,
  onSubmit,
}: RequestShiftChangeModalProps) {
  const [originalShift, setOriginalShift] = useState("");
  const [requestedShift, setRequestedShift] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    // TODO: Implement submit request
    console.log("Submit shift change request:", {
      originalShift,
      requestedShift,
      reason,
    });
    onSubmit();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Request Shift Change</DialogTitle>
        <DialogDescription className="sr-only">
          Submit a request to change your shift assignment
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Request Shift Change
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 hover:bg-muted transition-colors"
          >
            {/* <X className="h-5 w-5" /> */}
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 px-4 pb-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#044192] text-xs font-semibold text-white sm:h-12 sm:w-12 sm:text-sm">
            RD
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground sm:text-base">
              Robbi Darwis
            </h3>
            <p className="text-xs text-muted-foreground">
              Employee ID: Dp 1033
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6">
          {/* Original Shift */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Original Shift <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={originalShift}
              onChange={(e) => setOriginalShift(e.target.value)}
              placeholder="Enter your date"
              className="rounded-sm"
            />
          </div>

          {/* Requested Shift */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Requested Shift <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={requestedShift}
              onChange={(e) => setRequestedShift(e.target.value)}
              placeholder="Enter your date"
              className="rounded-sm"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter your reason for requested"
              rows={4}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="w-50 rounded-sm bg-[#044192] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#033174] sm:w-auto"
            >
              Submit Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}