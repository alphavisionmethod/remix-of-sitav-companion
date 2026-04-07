// ═══════════════════════════════════════════════════════════════
// SITA OS — Centralized Supabase Table Accessor
// Single cast point for dynamic table name queries.
// All data-service files use this instead of inline casts.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

/**
 * Access a Supabase table by literal name with full type safety.
 */
export function fromTable<T extends TableName>(table: T) {
  return supabase.from(table);
}

/**
 * Access a Supabase table by dynamic (runtime) name.
 * Bypasses RejectExcessProperties — caller is responsible for types.
 * Returns a loosely-typed query builder for maximum flexibility.
 */
export function fromDynamicTable(table: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as Record<string, (...args: unknown[]) => unknown>).from(table) as ReturnType<typeof supabase.from<'action_escalations'>>;
}
