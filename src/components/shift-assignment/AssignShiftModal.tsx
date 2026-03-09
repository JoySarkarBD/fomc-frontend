"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Check, ChevronsUpDown, Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UserManagementService,
  DepartmentManagementService,
  SellsShiftManagementService,
} from "@/api";
import { CreateSellsShiftDto } from "@/api/models/CreateSellsShiftDto";
import { useAccessToken } from "@/hooks/useAccessToken";
import {
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  addDays,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

/* ── Types ───────────────────────────────────────────────── */
interface DeptOption {
  _id: string;
  name: string;
}

interface DeptUser {
  _id: string;
  name: string;
  employeeId: string;
  designation: string;
}

interface AssignShiftModalProps {
  open: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

const SHIFT_OPTIONS: {
  value: CreateSellsShiftDto.shiftType;
  label: string;
}[] = [
  { value: CreateSellsShiftDto.shiftType.MORNING, label: "Morning Shift" },
  { value: CreateSellsShiftDto.shiftType.EVENING, label: "Evening Shift" },
  { value: CreateSellsShiftDto.shiftType.NIGHT, label: "Night Shift" },
];

/* ── Helpers ─────────────────────────────────────────────── */
/** Given any date, return the Sunday–Saturday week range */
function getWeekRange(date: Date): DateRange {
  const sun = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  const sat = endOfWeek(date, { weekStartsOn: 0 }); // Saturday
  return { from: sun, to: sat };
}

/** Format YYYY-MM-DD for API */
function toIsoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/* ── Component ───────────────────────────────────────────── */
export function AssignShiftModal({
  open,
  onClose,
  onAssigned,
}: AssignShiftModalProps) {
  const authorization = useAccessToken();

  /* ── Department state ───────────────────────────────── */
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState("");

  /* ── User search state ──────────────────────────────── */
  const [userList, setUserList] = useState<DeptUser[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Form state ─────────────────────────────────────── */
  const [selectedUser, setSelectedUser] = useState<DeptUser | null>(null);
  const [weekRange, setWeekRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [shiftType, setShiftType] = useState<
    CreateSellsShiftDto.shiftType | ""
  >("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── Fetch departments once on open ─────────────────── */
  useEffect(() => {
    if (!open || departments.length > 0) return;
    setDeptsLoading(true);
    DepartmentManagementService.departmentControllerFindAll({
      pageNo: 1,
      pageSize: 100,
    })
      .then((res: any) => {
        const raw = res?.data?.departments ?? res?.data ?? [];
        const list: DeptOption[] = Array.isArray(raw)
          ? raw.map((d: any) => ({ _id: d._id, name: d.name }))
          : [];
        setDepartments(list);
      })
      .catch(() => setDepartments([]))
      .finally(() => setDeptsLoading(false));
  }, [open, departments.length]);

  /* ── Fetch users for selected department ────────────── */
  const fetchUsers = useCallback(
    async (search: string) => {
      if (!authorization || !selectedDeptId) return;
      setUserLoading(true);
      try {
        const res = await UserManagementService.userControllerGetUsers({
          pageNo: 1,
          pageSize: 50,
          authorization,
          searchKey: search || undefined,
          department: selectedDeptId as any,
        });
        const payload = (res as any)?.data ?? {};
        const usersArr = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.users)
            ? payload.users
            : [];
        setUserList(
          usersArr.map((u: any) => ({
            _id: u._id,
            name: u.name ?? "",
            employeeId: u.employeeId ?? "-",
            designation:
              typeof u.designation === "object"
                ? u.designation?.name ?? "-"
                : u.designation ?? "-",
          })),
        );
      } catch {
        setUserList([]);
      } finally {
        setUserLoading(false);
      }
    },
    [authorization, selectedDeptId],
  );

  /* Clear user when department changes */
  useEffect(() => {
    setSelectedUser(null);
    setUserList([]);
    setSearchKey("");
  }, [selectedDeptId]);

  /* Load users when user-popover opens */
  useEffect(() => {
    if (userPopoverOpen && selectedDeptId) fetchUsers("");
  }, [userPopoverOpen, selectedDeptId, fetchUsers]);

  /* Debounced search */
  const handleSearch = (value: string) => {
    setSearchKey(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchUsers(value), 400);
  };

  /* ── Week picker handler ────────────────────────────── */
  const handleDayClick = (day: Date) => {
    setWeekRange(getWeekRange(day));
  };

  /* Custom modifier: highlight entire week on hover is handled via CSS;
     the range selection itself already highlights Sunday–Saturday */

  /* ── Reset form ─────────────────────────────────────── */
  const resetForm = () => {
    setSelectedDeptId("");
    setSelectedUser(null);
    setWeekRange(undefined);
    setShiftType("");
    setNote("");
    setSearchKey("");
    setUserList([]);
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  /* ── Submit ─────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (
      !authorization ||
      !selectedUser ||
      !weekRange?.from ||
      !weekRange?.to ||
      !shiftType
    ) {
      toast.warning("Please fill in all required fields.", {
        description: "Missing Fields",
      });
      return;
    }

    setSubmitting(true);
    try {
      await SellsShiftManagementService.sellsShiftManagementControllerCreate({
        userId: selectedUser._id,
        authorization,
        requestBody: {
          weekStartDate: `${toIsoDate(weekRange.from)}T00:00:00.000Z`,
          weekEndDate: `${toIsoDate(weekRange.to)}T00:00:00.000Z`,
          shiftType,
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      });

      handleClose();
      toast.success("Sells shift created successfully.", {
        description: "Shift Assigned",
      });
      onAssigned?.();
    } catch (err: any) {
      const msg =
        err?.body?.message ?? err?.message ?? "Failed to assign shift.";
      setSubmitting(false);
      handleClose();
      toast.error(msg, {
        description: "Error",
      });
    }
  };

  const canSubmit =
    !!selectedUser &&
    !!weekRange?.from &&
    !!weekRange?.to &&
    !!shiftType &&
    !submitting;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Assign Shift</DialogTitle>
        <DialogDescription className="sr-only">
          Assign a shift to a team member
        </DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/30 px-5 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Assign Shift
          </h2>
        </div>

        {/* Form */}
        <div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-6">
          {/* ── 1. Department Selector ── */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Department <span className="text-red-500">*</span>
            </label>
            <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    deptsLoading ? "Loading departments..." : "Select department"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── 2. User Selector (appears after dept is chosen) ── */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Member <span className="text-red-500">*</span>
            </label>
            <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={userPopoverOpen}
                  disabled={!selectedDeptId}
                  className="w-full justify-between font-normal"
                >
                  {selectedUser ? (
                    <span className="truncate">
                      {selectedUser.name}{" "}
                      <span className="text-muted-foreground">
                        ({selectedUser.employeeId})
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {selectedDeptId
                        ? "Search member..."
                        : "Select a department first"}
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
                align="start"
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search by name or ID..."
                    value={searchKey}
                    onValueChange={handleSearch}
                  />
                  <CommandList>
                    {userLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading...
                        </span>
                      </div>
                    ) : userList.length === 0 ? (
                      <CommandEmpty>No members found.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {userList.map((user) => (
                          <CommandItem
                            key={user._id}
                            value={user._id}
                            onSelect={() => {
                              setSelectedUser(user);
                              setUserPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUser?._id === user._id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {user.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.employeeId} &middot; {user.designation}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* ── 3. Shift Type ── */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Shift Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={shiftType}
              onValueChange={(v) =>
                setShiftType(v as CreateSellsShiftDto.shiftType)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select shift type" />
              </SelectTrigger>
              <SelectContent>
                {SHIFT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── 4. Week Picker (Sun–Sat) ── */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Week (Sun – Sat) <span className="text-red-500">*</span>
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start px-3 font-normal",
                    !weekRange && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {weekRange?.from && weekRange?.to ? (
                    <>
                      {format(weekRange.from, "LLL dd, yyyy")} –{" "}
                      {format(weekRange.to, "LLL dd, yyyy")}
                    </>
                  ) : (
                    "Pick a week"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  defaultMonth={weekRange?.from ?? new Date()}
                  selected={weekRange?.from}
                  onSelect={(day) => {
                    if (day) handleDayClick(day);
                  }}
                  modifiers={{
                    weekStart: (day: Date) =>
                      !!weekRange?.from && isSameDay(day, weekRange.from),
                    weekEnd: (day: Date) =>
                      !!weekRange?.to && isSameDay(day, weekRange.to),
                    weekMid: (day: Date) => {
                      if (!weekRange?.from || !weekRange?.to) return false;
                      for (let i = 1; i < 6; i++) {
                        if (isSameDay(day, addDays(weekRange.from, i)))
                          return true;
                      }
                      return false;
                    },
                  }}
                  modifiersClassNames={{
                    weekStart:
                      "!bg-primary !text-primary-foreground !rounded-l-md !rounded-r-none",
                    weekEnd:
                      "!bg-primary !text-primary-foreground !rounded-r-md !rounded-l-none",
                    weekMid:
                      "!bg-accent !text-accent-foreground !rounded-none",
                  }}
                  weekStartsOn={0}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* ── 5. Note (optional) ── */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Note{" "}
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-sm border-gray-300 text-sm"
            />
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-sm bg-[#044192] px-8 py-2 text-sm font-medium text-white hover:bg-[#044192]/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Shift"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}