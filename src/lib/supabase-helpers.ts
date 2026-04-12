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
  return supabase.from(table as any);
}

/**
 * Untyped Supabase query builder for dynamic table access.
 * Bypasses RejectExcessProperties entirely.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDynamicTable(table: string): any {
  return supabase.from(table as any);
}
