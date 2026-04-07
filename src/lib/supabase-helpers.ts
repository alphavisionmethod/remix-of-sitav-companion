// ═══════════════════════════════════════════════════════════════
// SITA OS — Centralized Supabase Table Accessor
// Single cast point for dynamic table name queries.
// All data-service files use this instead of inline casts.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import type { Database } from "@/integrations/supabase/types";
import type { PostgrestQueryBuilder } from "@supabase/postgrest-js";

type TableName = keyof Database["public"]["Tables"];

/**
 * Access a Supabase table by literal name with full type safety.
 */
export function fromTable<T extends TableName>(table: T) {
  return supabase.from(table);
}

/**
 * Untyped Supabase query builder for dynamic table access.
 * Bypasses RejectExcessProperties entirely.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynamicQueryBuilder = PostgrestQueryBuilder<any, any, any, any>;

/**
 * Access a Supabase table by dynamic (runtime) name.
 * Bypasses RejectExcessProperties — caller is responsible for types.
 */
export function fromDynamicTable(table: string): DynamicQueryBuilder {
  return supabase.from(table as TableName) as unknown as DynamicQueryBuilder;
}
