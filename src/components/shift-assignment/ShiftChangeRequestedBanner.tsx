"use client";

import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

interface ShiftChangeRequestedBannerProps {
  isVisible: boolean;
  onCancel: () => void;
}

export function ShiftChangeRequestedBanner({
  isVisible,
  onCancel,
}: ShiftChangeRequestedBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-sm border border-[#F0C36D] bg-[#FFF8E1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
      {/* Left: Icon + Text */}
      <div className="flex items-start gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex gap-2 items-center py-1 sm:py-2">
            <TriangleAlert className="h-5 w-5 shrink-0 text-[#E8A317]" /> Shift
            Change Requested
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-foreground/70 sm:text-sm">
            You have requested to exchange your{" "}
            <span className="font-semibold text-foreground">Morning Shift</span>{" "}
            on{" "}
            <span className="font-semibold text-foreground">
              February 16, 2026
            </span>{" "}
            for an{" "}
            <span className="font-semibold text-foreground">Evening Shift</span>
            . Awaiting manager approval.
          </p>
        </div>
      </div>

      {/* Right: Cancel Request Button */}
      <Button
        onClick={onCancel}
        variant="outline"
        className="w-50 shrink-0 rounded-sm bg-[#044192] px-5 py-2 text-sm font-semibold text-white hover:bg-[#044192]/80 hover:text-white sm:w-auto"
      >
        Cancel Request
      </Button>
    </div>
  );
}