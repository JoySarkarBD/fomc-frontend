"use client";

import { useState } from "react";
import { ShiftLegend } from "./ShiftLegend";
import { ShiftChangeRequestedBanner } from "./ShiftChangeRequestedBanner";
import { ShiftUserInfo } from "./ShiftUserInfo";
import { ShiftCalendar } from "./ShiftCalendar";
import { ShiftCalendarLegend } from "./ShiftCalendarLegend";

export function ShiftAssignmentContent() {
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = January
  const [showBanner, setShowBanner] = useState(false);
  const currentYear = 2026;

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Shift Legend and Request Button */}
      <ShiftLegend onShiftChangeSubmit={() => setShowBanner(true)} />

      {/* Shift Change Requested Banner */}
      <ShiftChangeRequestedBanner
        isVisible={showBanner}
        onCancel={() => setShowBanner(false)}
      />

      {/* User Info and Month Navigation */}
      <ShiftUserInfo
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Calendar Grid */}
      <ShiftCalendar month={currentMonth} year={currentYear} />

      {/* Calendar Legend */}
      <ShiftCalendarLegend />
    </>
  );
}