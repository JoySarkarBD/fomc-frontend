"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LeaveManagementService } from "@/api";
import { LeaveRequestDto } from "@/api/models/LeaveRequestDto";
import { useAccessToken } from "@/hooks/useAccessToken";

const LEAVE_TYPE_OPTIONS: { value: LeaveRequestDto.type; label: string }[] = [
  { value: LeaveRequestDto.type.SICK_LEAVE, label: "Sick Leave" },
  { value: LeaveRequestDto.type.CASUAL_LEAVE, label: "Casual Leave" },
  {
    value: LeaveRequestDto.type.GOVERNMENT_FESTIVAL_HOLIDAY,
    label: "Government Festival Holiday",
  },
];

export function AddLeaveRequestForm({ onSubmit }: { onSubmit?: () => void }) {
  const token = useAccessToken();
  const [leaveType, setLeaveType] = useState<LeaveRequestDto.type | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !leaveType || !startDate || !endDate || !reason.trim()) return;

    setSubmitting(true);
    try {
      await LeaveManagementService.leaveControllerCreateLeaveRequest({
        authorization: token,
        requestBody: {
          type: leaveType,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          reason: reason.trim(),
        },
      });
      toast.success("Leave request submitted successfully.");
      resetForm();
      onSubmit?.();
    } catch (err: any) {
      const msg =
        err?.body?.message ?? "Failed to submit leave request. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Leave Type */}
      <div className="space-y-1.5">
        <Label
          htmlFor="leaveType"
          className="text-sm font-medium text-foreground"
        >
          Leave Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={leaveType}
          onValueChange={(v) => setLeaveType(v as LeaveRequestDto.type)}
          required
        >
          <SelectTrigger
            id="leaveType"
            className="h-11 w-full border-border/60 bg-white text-muted-foreground/50"
          >
            <SelectValue placeholder="Select Leave Type" />
          </SelectTrigger>
          <SelectContent>
            {LEAVE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div className="space-y-1.5">
        <Label htmlFor="startDate" className="text-sm font-medium text-foreground">
          Start Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="h-11 w-full border-border/60 bg-white placeholder:text-muted-foreground/50 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50"
        />
      </div>

      {/* End Date */}
      <div className="space-y-1.5">
        <Label htmlFor="endDate" className="text-sm font-medium text-foreground">
          End Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate || undefined}
          required
          className="h-11 w-full border-border/60 bg-white placeholder:text-muted-foreground/50 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50"
        />
      </div>

      {/* Reason */}
      <div className="space-y-1.5">
        <Label htmlFor="reason" className="text-sm font-medium text-foreground">
          Reason <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="reason"
          placeholder="Reason for leave"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={3}
          className="w-full border-border/60 bg-white placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 rounded-sm bg-brand-navy px-8 text-sm font-semibold transition-all hover:bg-brand-navy-dark hover:shadow-md active:scale-[0.98]"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </form>
  );
}
