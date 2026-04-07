// ═══════════════════════════════════════════════════════════════
// SITA OS — Centralized Supabase Table Accessor
// Single cast point for dynamic table name queries.
// All data-service files use this instead of inline `as any`.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

/**
 * Access a Supabase table by dynamic name.
 * This is the ONLY place in the codebase where `as any` is used
 * for `.from()` calls — all other files use typed literals or this helper.
 */
export function fromTable(table: string) {
  return fromTable(table);
}
