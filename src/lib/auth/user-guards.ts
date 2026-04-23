/**
 * Type guards and helpers for safe user.id access.
 * Prevents undefined user IDs from leaking into query keys and payloads.
 */

import type { User } from "@supabase/supabase-js";

/** Narrows a User | null | undefined to a User with a guaranteed `id`. */
export function isAuthenticatedUser(user: User | null | undefined): user is User {
  return user != null && typeof user.id === "string" && user.id.length > 0;
}

/**
 * Returns `user.id` if the user is authenticated, otherwise `undefined`.
 * Use in query keys: `queryKey: ["things", safeUserId(user)]`
 */
export function safeUserId(user: User | null | undefined): string | undefined {
  return isAuthenticatedUser(user) ? user.id : undefined;
}

/**
 * Returns `user.id` or throws. Use only inside enabled queries / mutations
 * where you've already gated on `enabled: !!user?.id`.
 */
export function requireUserId(user: User | null | undefined): string {
  if (!isAuthenticatedUser(user)) {
    throw new Error("requireUserId: No authenticated user — this should never be called without an auth gate.");
  }
  return user.id;
}

/**
 * React Query `enabled` helper — returns false when user is missing.
 * Usage: `enabled: queryEnabled(user) && otherCondition`
 */
export function queryEnabled(user: User | null | undefined): boolean {
  return isAuthenticatedUser(user);
}

/**
 * Builds a user-scoped query key with a guaranteed user ID segment.
 * Returns `undefined` if user is not authenticated (use with `enabled`).
 *
 * Usage:
 * ```ts
 * const key = userQueryKey("dashboard-stats", user);
 * const q = useQuery({ queryKey: key ?? ["noop"], enabled: !!key, ... });
 * ```
 */
export function userQueryKey(
  prefix: string,
  user: User | null | undefined,
  ...extra: unknown[]
): [string, string, ...unknown[]] | undefined {
  if (!isAuthenticatedUser(user)) return undefined;
  return [prefix, user.id, ...extra];
}