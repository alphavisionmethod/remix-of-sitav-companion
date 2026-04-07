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
 * Use when the table name comes from a variable, not a string literal.
 * Returns untyped query builder — caller is responsible for types.
 */
export function fromDynamicTable(table: string) {
  return supabase.from(table as TableName);
}
