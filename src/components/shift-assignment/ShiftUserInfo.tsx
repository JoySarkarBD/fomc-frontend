"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface ShiftUserInfoProps {
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function ShiftUserInfo({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}: ShiftUserInfoProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 rounded-sm p-3 sm:p-4">
      {/* User Info */}
      <div className="flex items-center gap-3">
        {/* User Avatar with Initials */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#044192] text-xs font-semibold text-white sm:h-12 sm:w-12 sm:text-sm">
          RD
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground sm:text-base">
            Robbi Darwis
          </h3>
          <p className="text-xs text-muted-foreground">Employee-ID: Dp-1033</p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center self-start border rounded-sm py-1 sm:self-auto">
        <button
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-muted transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-20 text-center text-xs font-medium text-foreground sm:min-w-24 sm:text-sm">
          {MONTHS[currentMonth]}
        </span>
        <button
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-muted transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}