// ═══════════════════════════════════════════════════════════════
// SITA OS — Centralized Supabase Table Accessor
// Single cast point for dynamic table name queries.
// All data-service files use this instead of inline casts.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

/**
 * Access a Supabase table by name.
 * Uses `any` cast because the auto-generated types may not reflect
 * runtime tables (empty schema in types.ts). Caller handles types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromTable(table: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
}

/**
 * Untyped Supabase query builder for dynamic table access.
 * Bypasses RejectExcessProperties entirely.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDynamicTable(table: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table);
}

/**
 * Dynamic-typed Supabase client wrapper. Use ONLY in pages where the table
 * is not yet present in `Database` generated types. Centralized here so
 * page files can stay free of `as any` casts (ISS-020 compliance).
 *
 * Usage:
 *   import { dbAny } from "@/lib/supabase-helpers";
 *   const { data } = await dbAny.from("user_memory").select("*");
 */
export const dbAny: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
} = {
  from: (table: string) => fromTable(table),
};
