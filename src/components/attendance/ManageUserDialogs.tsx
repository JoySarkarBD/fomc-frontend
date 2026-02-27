"use client";

import { useState } from "react";
import { CalendarDays, Check, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceService } from "@/api";
import { AttendanceByAuthorityDto } from "@/api/models/AttendanceByAuthorityDto";
import type { UpdateByAuthorityWeekendSetDto } from "@/api/models/UpdateByAuthorityWeekendSetDto";
import {
  buildUTCIso,
  IN_TYPE_OPTIONS,
  mapInTypeToStatus,
  nextTick,
  type UserOption,
} from "./attendance-helpers";

/* ── Weekend day options ─────────────────────────────────── */
type WeekendDay = UpdateByAuthorityWeekendSetDto["weekEndOff"][number];
const WEEKEND_DAY_OPTIONS: { value: WeekendDay; label: string }[] = [
  { value: "SUNDAY", label: "Sunday" },
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
];

interface ManageUserDialogsProps {
  authorization: string | null;
  selectedUser: UserOption | null;
  onAttendanceMarked: () => Promise<void>;
}

export function ManageUserDialogs({
  authorization,
  selectedUser,
  onAttendanceMarked,
}: ManageUserDialogsProps) {
  // Menu dialog
  const [menuOpen, setMenuOpen] = useState(false);

  // Manage Attendance dialog
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Update Weekend dialog
  const [weekendOpen, setWeekendOpen] = useState(false);
  const [weekendSubmitting, setWeekendSubmitting] = useState(false);
  const [weekendDay, setWeekendDay] = useState<WeekendDay | "">("")

  // Exchange Weekend dialog
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [exchangeSubmitting, setExchangeSubmitting] = useState(false);
  const [exchangeOriginalDate, setExchangeOriginalDate] = useState("");
  const [exchangeNewDate, setExchangeNewDate] = useState("");

  // Form state
  const [maDate, setMaDate] = useState("");
  const [maInType, setMaInType] = useState<
    AttendanceByAuthorityDto.inType | ""
  >("");
  const [maHour, setMaHour] = useState(9);
  const [maMinute, setMaMinute] = useState(0);
  const [maAmpm, setMaAmpm] = useState<"AM" | "PM">("AM");

  const maShowTime =
    maInType === AttendanceByAuthorityDto.inType.PRESENT ||
    maInType === AttendanceByAuthorityDto.inType.LATE ||
    maInType === AttendanceByAuthorityDto.inType.WORK_FROM_HOME;

  const resetForm = () => {
    setMaDate("");
    setMaInType("");
    setMaHour(9);
    setMaMinute(0);
    setMaAmpm("AM");
  };

  const resetWeekendForm = () => {
    setWeekendDay("");
  };

  const resetExchangeForm = () => {
    setExchangeOriginalDate("");
    setExchangeNewDate("");
  };

  /* ── Open manage menu ──────────────────────────────────── */
  const openMenu = () => setMenuOpen(true);

  /* ── Submit update weekend ─────────────────────────────── */
  const handleWeekendSubmit = async () => {
    if (!authorization || !selectedUser || !weekendDay) return;
    setWeekendSubmitting(true);
    try {
      const res = await AttendanceService.attendanceControllerUpdateWeekendOff({
        userId: selectedUser._id,
        authorization,
        requestBody: { weekEndOff: [weekendDay] },
      });
      const msg = (res as any)?.message ?? "Weekend updated successfully.";
      setWeekendOpen(false);
      resetWeekendForm();
      await nextTick();
      Swal.fire({
        icon: "success",
        title: "Weekend Updated!",
        text: msg,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setWeekendOpen(false);
      resetWeekendForm();
      await nextTick();

      const status = err?.status ?? err?.response?.status;
      let title = "Failed";
      let msg = err?.body?.message ?? "Something went wrong.";
      if (status === 400) {
        title = "Validation Error";
        const errors = err?.body?.errors;
        if (Array.isArray(errors)) {
          msg = errors.map((e: any) => e.message).join(", ");
        }
      } else if (status === 401) {
        title = "Unauthorized";
        msg = "Session expired. Please log in again.";
      } else if (status === 403) {
        title = "Forbidden";
        msg =
          err?.body?.message ?? "You don't have permission for this action.";
      } else if (status === 404) {
        title = "Not Found";
        msg = err?.body?.message ?? "User not found.";
      }
      Swal.fire({
        icon: "error",
        title,
        text: msg,
        confirmButtonColor: "#DC3545",
      });
    } finally {
      setWeekendSubmitting(false);
    }
  };

  /* ── Submit exchange weekend ───────────────────────────── */
  const handleExchangeSubmit = async () => {
    if (!authorization || !selectedUser || !exchangeOriginalDate || !exchangeNewDate) return;
    setExchangeSubmitting(true);
    try {
      const res = await AttendanceService.attendanceControllerWeekendExchangeByAuthority({
        userId: selectedUser._id,
        authorization,
        requestBody: {
          originalWeekendDate: `${exchangeOriginalDate}T00:00:00.000Z`,
          newOffDate: `${exchangeNewDate}T00:00:00.000Z`,
        },
      });
      const msg = (res as any)?.message ?? "Weekend exchanged successfully.";
      setExchangeOpen(false);
      resetExchangeForm();
      await onAttendanceMarked();
      await nextTick();
      Swal.fire({
        icon: "success",
        title: "Weekend Exchanged!",
        text: msg,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setExchangeOpen(false);
      resetExchangeForm();
      await nextTick();

      const status = err?.status ?? err?.response?.status;
      let title = "Failed";
      let msg = err?.body?.message ?? "Something went wrong.";
      if (status === 400) {
        title = "Validation Error";
        const errors = err?.body?.errors;
        if (Array.isArray(errors)) {
          msg = errors.map((e: any) => e.message).join(", ");
        }
      } else if (status === 401) {
        title = "Unauthorized";
        msg = "Session expired. Please log in again.";
      } else if (status === 403) {
        title = "Forbidden";
        msg =
          err?.body?.message ?? "You don't have permission for this action.";
      } else if (status === 404) {
        title = "Not Found";
        msg = err?.body?.message ?? "User not found.";
      }
      Swal.fire({
        icon: "error",
        title,
        text: msg,
        confirmButtonColor: "#DC3545",
      });
    } finally {
      setExchangeSubmitting(false);
    }
  };

  /* ── Submit manage attendance ──────────────────────────── */
  const handleSubmit = async () => {
    if (!authorization || !selectedUser || !maDate || !maInType) return;
    setSubmitting(true);
    try {
      const body: AttendanceByAuthorityDto = {
        inType: maInType,
        date: buildUTCIso(maDate),
        ...(maShowTime
          ? {
              checkInTime: buildUTCIso(maDate, maHour, maMinute, maAmpm),
              isLate: maInType === AttendanceByAuthorityDto.inType.LATE,
            }
          : {}),
      };
      await AttendanceService.attendanceControllerMarkAttendanceByAuthority({
        userId: selectedUser._id,
        authorization,
        requestBody: body,
      });
      setAttendanceOpen(false);
      resetForm();
      await onAttendanceMarked();
      await nextTick();
      Swal.fire({
        icon: "success",
        title: "Attendance Marked!",
        text: `Attendance for ${selectedUser.name} has been marked successfully.`,
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setAttendanceOpen(false);
      resetForm();
      await nextTick();

      const status = err?.status ?? err?.response?.status;
      let title = "Failed";
      let msg = err?.body?.message ?? "Something went wrong.";
      if (status === 400) {
        title = "Validation Error";
        const errors = err?.body?.errors;
        if (Array.isArray(errors)) {
          msg = errors.map((e: any) => e.message).join(", ");
        }
      } else if (status === 401) {
        title = "Unauthorized";
        msg = "Session expired. Please log in again.";
      } else if (status === 403) {
        title = "Forbidden";
        msg =
          err?.body?.message ?? "You don't have permission for this action.";
      } else if (status === 404) {
        title = "Not Found";
        msg = err?.body?.message ?? "User not found.";
      }
      Swal.fire({
        icon: "error",
        title,
        text: msg,
        confirmButtonColor: "#DC3545",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger — exposed via openMenu ref-like pattern; parent uses the button below */}
      <Button
        variant="outline"
        className="ml-2 gap-2"
        onClick={openMenu}
      >
        <CalendarDays className="h-4 w-4" />
        Manage User
      </Button>

      {/* ── Manage User Actions Dialog ───────────────────── */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              {selectedUser?.employeeId} — {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setMenuOpen(false);
                resetWeekendForm();
                setWeekendOpen(true);
              }}
            >
              <CalendarDays className="h-4 w-4" />
              Update Weekend
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setMenuOpen(false);
                resetForm();
                setAttendanceOpen(true);
              }}
            >
              <Check className="h-4 w-4" />
              Manage Attendance
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setMenuOpen(false);
                resetExchangeForm();
                setExchangeOpen(true);
              }}
            >
              <CalendarDays className="h-4 w-4" />
              Exchange Weekend
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Update Weekend Dialog ────────────────────────── */}
      <Dialog
        open={weekendOpen}
        onOpenChange={(open) => {
          setWeekendOpen(open);
          if (!open) resetWeekendForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Weekend</DialogTitle>
            <DialogDescription>
              Set weekend day for {selectedUser?.employeeId} —{" "}
              {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Weekend Day</Label>
              <Select
                value={weekendDay}
                onValueChange={(val) => setWeekendDay(val as WeekendDay)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKEND_DAY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setWeekendOpen(false);
                resetWeekendForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWeekendSubmit}
              disabled={!weekendDay || weekendSubmitting}
              className="gap-2"
            >
              {weekendSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Manage Attendance Dialog ─────────────────────── */}
      <Dialog
        open={attendanceOpen}
        onOpenChange={(open) => {
          setAttendanceOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Manage Attendance</DialogTitle>
            <DialogDescription>
              Mark attendance for {selectedUser?.employeeId} —{" "}
              {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ma-date">Date</Label>
              <Input
                id="ma-date"
                type="date"
                value={maDate}
                onChange={(e) => setMaDate(e.target.value)}
              />
            </div>

            {/* Attendance Type */}
            <div className="flex flex-col gap-1.5">
              <Label>Attendance Type</Label>
              <Select
                value={maInType}
                onValueChange={(val) =>
                  setMaInType(val as AttendanceByAuthorityDto.inType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {IN_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in Time — only for PRESENT / LATE */}
            {maShowTime && (
              <div className="flex flex-col gap-1.5">
                <Label>Check-in Time</Label>
                <div className="flex items-center gap-2">
                  {/* Hour */}
                  <Select
                    value={String(maHour)}
                    onValueChange={(val) => setMaHour(Number(val))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (h) => (
                          <SelectItem key={h} value={String(h)}>
                            {h}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <span className="text-lg font-semibold">:</span>
                  {/* Minute */}
                  <Select
                    value={String(maMinute)}
                    onValueChange={(val) => setMaMinute(Number(val))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {String(m).padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* AM/PM */}
                  <Select
                    value={maAmpm}
                    onValueChange={(val) => setMaAmpm(val as "AM" | "PM")}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAttendanceOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!maDate || !maInType || submitting}
              className="gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Exchange Weekend Dialog ──────────────────────── */}
      <Dialog
        open={exchangeOpen}
        onOpenChange={(open) => {
          setExchangeOpen(open);
          if (!open) resetExchangeForm();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Exchange Weekend</DialogTitle>
            <DialogDescription>
              Swap a weekend day for {selectedUser?.employeeId} —{" "}
              {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Original Weekend Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-original-date">Original Weekend Date</Label>
              <Input
                id="ex-original-date"
                type="date"
                value={exchangeOriginalDate}
                onChange={(e) => setExchangeOriginalDate(e.target.value)}
              />
            </div>

            {/* New Off Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ex-new-date">New Off Date</Label>
              <Input
                id="ex-new-date"
                type="date"
                value={exchangeNewDate}
                onChange={(e) => setExchangeNewDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExchangeOpen(false);
                resetExchangeForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExchangeSubmit}
              disabled={!exchangeOriginalDate || !exchangeNewDate || exchangeSubmitting}
              className="gap-2"
            >
              {exchangeSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
