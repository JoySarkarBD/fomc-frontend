"use client";

import { useAuth } from "./useAuth";

/**
 * Returns the Bearer authorization header string, or null if not logged in.
 * Usage: pass directly to service calls that require `authorization`.
 */
export function useAccessToken(): string | null {
  const { token } = useAuth();
  return token ? `Bearer ${token}` : null;
}
