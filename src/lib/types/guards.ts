/**
 * Shared type-guard utilities for narrowing `unknown` values safely.
 * Use these at data boundaries (query results, JSON metadata, API responses)
 * instead of inline `typeof` checks scattered across components.
 */

/** Narrow `unknown` to a plain object (not null, not array). */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Narrow `unknown` to `string`. */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/** Narrow `unknown` to `number` (excluding NaN). */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

/** Narrow `unknown` to `boolean`. */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/** Narrow `unknown` to a non-empty array. */
export function isNonEmptyArray<T = unknown>(value: unknown): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

/** Narrow `unknown` to any array. */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/** Safely extract a string from an unknown record field. */
export function getString(obj: unknown, key: string, fallback = ""): string {
  if (isRecord(obj) && isString(obj[key])) return obj[key];
  return fallback;
}

/** Safely extract a number from an unknown record field. */
export function getNumber(obj: unknown, key: string, fallback = 0): number {
  if (isRecord(obj) && isNumber(obj[key])) return obj[key];
  return fallback;
}

/** Safely extract a boolean from an unknown record field. */
export function getBoolean(obj: unknown, key: string, fallback = false): boolean {
  if (isRecord(obj) && isBoolean(obj[key])) return obj[key];
  return fallback;
}

/** Safely extract an array from an unknown record field. */
export function getArray(obj: unknown, key: string): unknown[] {
  if (isRecord(obj) && Array.isArray(obj[key])) return obj[key] as unknown[];
  return [];
}

/** Safely extract a string array from an unknown record field. */
export function getStringArray(obj: unknown, key: string): string[] {
  return getArray(obj, key).filter(isString);
}
