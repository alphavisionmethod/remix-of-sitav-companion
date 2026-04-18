/**
 * Utilities for safely rendering `unknown` values in JSX.
 * Prevents "Objects are not valid as a React child" errors
 * and provides consistent fallback formatting.
 */
import type { ReactNode } from "react";

/** Convert an unknown value to something React can render. */
export function toReactNode(value: unknown, fallback: ReactNode = "—"): ReactNode {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.map(String).join(", ") || fallback;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
}

/** Render an unknown value as a display string (not ReactNode). */
export function toDisplayString(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.map(String).join(", ") || fallback;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
}

/** Format a number for display with optional decimal places. */
export function toFormattedNumber(
  value: unknown,
  fallback = "0",
  options?: { decimals?: number; prefix?: string; suffix?: string }
): string {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  const { decimals = 0, prefix = "", suffix = "" } = options ?? {};
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}
