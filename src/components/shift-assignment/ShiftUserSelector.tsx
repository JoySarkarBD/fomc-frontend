"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { UserManagementService } from "@/api";

export interface ShiftUserOption {
  _id: string;
  name: string;
  employeeId: string;
}

interface ShiftUserSelectorProps {
  authorization: string | null;
  myUserId: string | null;
  selectedUser: ShiftUserOption | null;
  onSelectUser: (user: ShiftUserOption | null) => void;
  /** Label shown when no user is selected (defaults to "My Shifts") */
  selfLabel?: string;
}

export function ShiftUserSelector({
  authorization,
  myUserId,
  selectedUser,
  onSelectUser,
  selfLabel = "My Shifts",
}: ShiftUserSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [userList, setUserList] = useState<ShiftUserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch users list ──────────────────────────────────── */
  const fetchUsers = useCallback(
    async (search: string) => {
      if (!authorization) return;
      setLoading(true);
      try {
        const res = await UserManagementService.userControllerGetUsers({
          pageNo: 1,
          pageSize: 50,
          authorization,
          searchKey: search || undefined,
        });
        const payload = (res as any)?.data ?? {};
        const usersArr = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.users)
            ? payload.users
            : [];
        const users: ShiftUserOption[] = usersArr.map((u: any) => ({
          _id: u._id,
          name: u.name,
          employeeId: u.employeeId,
        }));
        setUserList(users);
      } catch {
        setUserList([]);
      } finally {
        setLoading(false);
      }
    },
    [authorization],
  );

  // Load initial user list when popover opens
  useEffect(() => {
    if (popoverOpen && userList.length === 0) {
      fetchUsers("");
    }
  }, [popoverOpen, fetchUsers, userList.length]);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearchKey(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(value);
    }, 400);
  };

  return (
    <>
      <label className="text-sm font-medium text-foreground/70">User:</label>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={popoverOpen}
            className="w-64 justify-between font-normal"
          >
            {selectedUser
              ? `${selectedUser.employeeId} — ${selectedUser.name}`
              : selfLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search by name or ID..."
              value={searchKey}
              onValueChange={handleSearch}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading…
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {/* "My Shifts" option */}
                    <CommandItem
                      value="__my_shifts__"
                      onSelect={() => {
                        onSelectUser(null);
                        setPopoverOpen(false);
                        setSearchKey("");
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selectedUser === null ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {selfLabel}
                    </CommandItem>
                    {/* User list */}
                    {userList
                      .filter((u) => u._id !== myUserId)
                      .map((user) => (
                        <CommandItem
                          key={user._id}
                          value={user._id}
                          onSelect={() => {
                            onSelectUser(user);
                            setPopoverOpen(false);
                            setSearchKey("");
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedUser?._id === user._id
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          <span className="truncate">
                            {user.employeeId} — {user.name}
                          </span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Clear selection button */}
      {selectedUser && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onSelectUser(null)}
          title="Back to my data"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
