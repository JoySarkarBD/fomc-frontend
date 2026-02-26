"use client";

import { useAuth } from "./useAuth";

/**
 * Returns the current user's role, department, and designation.
 * All values are null when not authenticated.
 */
export function useUserInfo() {
  const { user } = useAuth();

  return {
    userId: user?._id ?? null,
    name: user?.name ?? null,
    email: user?.email ?? null,
    employeeId: user?.employeeId ?? null,
    role: user?.role ?? null,
    department: user?.department ?? null,
    designation: user?.designation ?? null,
  };
}
