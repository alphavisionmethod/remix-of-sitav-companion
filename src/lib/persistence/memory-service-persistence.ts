// ═══════════════════════════════════════════════════════════════
// SITA OS — MemoryService Durable Persistence Adapter
// Persists scoped memory to os_memory_scoped with privacy tiers,
// confidence decay, supersession, forget audit, and retention
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { MemoryEntry, MemoryForgetRecord, MemoryQuery } from "@/lib/core-services/memory-service";

// ── Types ───────────────────────────────────────────────────────

export type MemoryScope =
  | "private" | "workspace" | "household" | "domain"
  | "operator" | "agent" | "system" | "session" | "decision";

export interface PersistedScopedMemory {
  id: string;
  user_id: string;
  key: string;
  value: Record<string, unknown>;
  memory_scope: MemoryScope;
  privacy_tier: string;
  confidence: number;
  source: string;
  entity_id: string | null;
  entity_type: string | null;
  tags: string[];
  domain: string | null;
  retention_class: string;
  provenance: Record<string, unknown> | null;
  superseded_by: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Helpers ─────────────────────────────────────────────────────

let _userId: string | null = null;
async function uid(): Promise<string | null> {
  if (_userId) return _userId;
  const { data: { user } } = await supabase.auth.getUser();
  _userId = user?.id ?? null;
  return _userId;
}
supabase.auth.onAuthStateChange(() => { _userId = null; });

// ── Store memory entry ──────────────────────────────────────────

export async function persistMemoryEntry(
  entry: MemoryEntry,
  opts?: {
    scope?: MemoryScope;
    domain?: string;
    retentionClass?: string;
    provenance?: Record<string, unknown>;
  }
): Promise<string | null> {
  const userId = await uid();
  if (!userId) return null;

  const { data, error } = await (supabase as any).from("os_memory_scoped")
    .insert({
      id: entry.id,
      user_id: userId,
      key: entry.key,
      value: typeof entry.value === "object" ? entry.value : { _raw: entry.value },
      memory_scope: opts?.scope ?? "private",
      privacy_tier: entry.privacyTier,
      confidence: entry.confidence,
      source: entry.source,
      entity_id: entry.entityId ?? null,
      entity_type: entry.entityType ?? null,
      tags: entry.tags,
      domain: opts?.domain ?? null,
      retention_class: opts?.retentionClass ?? "operational",
      provenance: opts?.provenance ?? null,
      expires_at: entry.expiresAt ? new Date(entry.expiresAt).toISOString() : null,
    })
    .select("id")
    .single();

  if (error) { console.error("[memory-persistence] insert failed:", error); return null; }
  return data?.id ?? null;
}

// ── Supersede memory entry ──────────────────────────────────────

export async function supersedeMemoryEntry(
  oldEntryId: string,
  newEntry: MemoryEntry,
  opts?: { scope?: MemoryScope; domain?: string }
): Promise<string | null> {
  const newId = await persistMemoryEntry(newEntry, opts);
  if (!newId) return null;

  await (supabase as any).from("os_memory_scoped")
    .update({ superseded_by: newId })
    .eq("id", oldEntryId);

  return newId;
}

// ── Fetch memory entries ────────────────────────────────────────

export async function fetchScopedMemory(filters?: {
  key?: string;
  scope?: MemoryScope;
  domain?: string;
  entityId?: string;
  privacyTier?: string;
  minConfidence?: number;
  includeSuperseded?: boolean;
  tags?: string[];
  limit?: number;
}): Promise<PersistedScopedMemory[]> {
  const userId = await uid();
  if (!userId) return [];

  let query = (supabase as any).from("os_memory_scoped")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (!filters?.includeSuperseded) query = query.is("superseded_by", null);
  if (filters?.key) query = query.eq("key", filters.key);
  if (filters?.scope) query = query.eq("memory_scope", filters.scope);
  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.entityId) query = query.eq("entity_id", filters.entityId);
  if (filters?.privacyTier) query = query.eq("privacy_tier", filters.privacyTier);
  if (filters?.minConfidence) query = query.gte("confidence", filters.minConfidence);
  if (filters?.tags && filters.tags.length > 0) query = query.overlaps("tags", filters.tags);
  query = query.limit(filters?.limit ?? 200);

  const { data, error } = await query;
  if (error) { console.error("[memory-persistence] fetch failed:", error); return []; }
  return data ?? [];
}

// ── Forget memory (with audit) ──────────────────────────────────

export async function forgetScopedMemory(
  entryId: string,
  reason: string,
  requestedBy: string
): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;

  // Fetch entry for audit
  const { data: entry } = await (supabase as any).from("os_memory_scoped")
    .select("key, privacy_tier")
    .eq("id", entryId)
    .maybeSingle();

  if (!entry) return false;

  // Log to the existing forget log
  await (supabase as any).from("sita_memory_forget_log").insert({
    user_id: userId,
    entry_id: entryId,
    key: entry.key,
    reason,
    requested_by: requestedBy,
    previous_tier: entry.privacy_tier,
  });

  // Delete entry
  const { error } = await (supabase as any).from("os_memory_scoped")
    .delete().eq("id", entryId);

  if (error) { console.error("[memory-persistence] delete failed:", error); return false; }
  return true;
}

// ── Update confidence ───────────────────────────────────────────

export async function updateMemoryConfidence(
  entryId: string,
  newConfidence: number
): Promise<boolean> {
  const { error } = await (supabase as any).from("os_memory_scoped")
    .update({ confidence: Math.max(0.1, Math.min(1, newConfidence)) })
    .eq("id", entryId);

  if (error) { console.error("[memory-persistence] confidence update failed:", error); return false; }
  return true;
}

// ── Memory statistics ───────────────────────────────────────────

export async function getMemoryStats(): Promise<{
  total: number;
  byScope: Record<string, number>;
  byPrivacy: Record<string, number>;
  superseded: number;
}> {
  const all = await fetchScopedMemory({ includeSuperseded: true, limit: 1000 });
  const active = all.filter(e => !e.superseded_by);
  const byScope: Record<string, number> = {};
  const byPrivacy: Record<string, number> = {};

  for (const e of active) {
    byScope[e.memory_scope] = (byScope[e.memory_scope] ?? 0) + 1;
    byPrivacy[e.privacy_tier] = (byPrivacy[e.privacy_tier] ?? 0) + 1;
  }

  return {
    total: active.length,
    byScope,
    byPrivacy,
    superseded: all.length - active.length,
  };
}

// ── Hydrate memory for AI context packet ────────────────────────

export async function hydrateMemoryForAI(opts: {
  domain?: string;
  entityId?: string;
  maxItems?: number;
}): Promise<Array<{ key: string; value: unknown; confidence: number; source: string }>> {
  const entries = await fetchScopedMemory({
    domain: opts.domain,
    entityId: opts.entityId,
    minConfidence: 0.3,
    limit: opts.maxItems ?? 50,
  });

  return entries.map(e => ({
    key: e.key,
    value: e.value,
    confidence: Number(e.confidence),
    source: e.source,
  }));
}
