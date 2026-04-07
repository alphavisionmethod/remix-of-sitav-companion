// ═══════════════════════════════════════════════════════════════
// SITA OS — Centralized Supabase Table Accessor
// Single cast point for dynamic table name queries.
// All data-service files use this instead of inline casts.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];

/**
 * Access a Supabase table by dynamic name with full type safety.
 * This is the ONLY accessor for `.from()` calls in the codebase.
 */
export function fromTable<T extends TableName>(table: T) {
  return supabase.from(table);
}
