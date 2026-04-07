// ═══════════════════════════════════════════════════════════════
// SITA OS — Supabase Persistence Adapters
// Typed clients for sita_receipts, sita_proof_records,
// sita_memory_entries, and sita_memory_forget_log
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

// ── Types ───────────────────────────────────────────────────────

export interface PersistedReceipt {
  id: string;
  user_id: string;
  correlation_id: string;
  receipt_type: string;
  capability_id?: string;
  domain?: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PersistedProof {
  id: string;
  user_id: string;
  correlation_id: string;
  proof_type: string;
  receipt_id?: string;
  capability_id?: string;
  evidence: Record<string, unknown>;
  verification_status: string;
  verified_at?: string;
  created_at: string;
}

export interface PersistedMemoryEntry {
  id: string;
  user_id: string;
  key: string;
  value: Record<string, unknown>;
  privacy_tier: string;
  confidence: number;
  source: string;
  entity_id?: string;
  entity_type?: string;
  tags: string[];
  superseded_by?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// ── Receipt Persistence ─────────────────────────────────────────

export async function persistReceipt(receipt: {
  correlation_id: string;
  receipt_type: string;
  capability_id?: string;
  domain?: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<PersistedReceipt | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await fromTable("sita_receipts")
    .insert({ ...receipt, user_id: user.id })
    .select()
    .single();

  if (error) { console.error("[persistence] receipt insert failed:", error); return null; }
  return data;
}

export async function fetchReceipts(filters?: {
  correlation_id?: string;
  receipt_type?: string;
  limit?: number;
}): Promise<PersistedReceipt[]> {
  let query = fromTable("sita_receipts").select("*").order("created_at", { ascending: false });
  if (filters?.correlation_id) query = query.eq("correlation_id", filters.correlation_id);
  if (filters?.receipt_type) query = query.eq("receipt_type", filters.receipt_type);
  if (filters?.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  if (error) { console.error("[persistence] receipt fetch failed:", error); return []; }
  return data ?? [];
}

// ── Proof Persistence ───────────────────────────────────────────

export async function persistProof(proof: {
  correlation_id: string;
  proof_type: string;
  receipt_id?: string;
  capability_id?: string;
  evidence: Record<string, unknown>;
}): Promise<PersistedProof | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await fromTable("sita_proof_records")
    .insert({ ...proof, user_id: user.id })
    .select()
    .single();

  if (error) { console.error("[persistence] proof insert failed:", error); return null; }
  return data;
}

export async function fetchProofs(filters?: {
  correlation_id?: string;
  receipt_id?: string;
  limit?: number;
}): Promise<PersistedProof[]> {
  let query = fromTable("sita_proof_records").select("*").order("created_at", { ascending: false });
  if (filters?.correlation_id) query = query.eq("correlation_id", filters.correlation_id);
  if (filters?.receipt_id) query = query.eq("receipt_id", filters.receipt_id);
  if (filters?.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  if (error) { console.error("[persistence] proof fetch failed:", error); return []; }
  return data ?? [];
}

// ── Memory Persistence ──────────────────────────────────────────

export async function persistMemory(entry: {
  key: string;
  value: Record<string, unknown>;
  privacy_tier?: string;
  confidence?: number;
  source?: string;
  entity_id?: string;
  entity_type?: string;
  tags?: string[];
  expires_at?: string;
}): Promise<PersistedMemoryEntry | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await fromTable("sita_memory_entries")
    .insert({ ...entry, user_id: user.id })
    .select()
    .single();

  if (error) { console.error("[persistence] memory insert failed:", error); return null; }
  return data;
}

export async function fetchMemory(filters?: {
  key?: string;
  entity_id?: string;
  privacy_tier?: string;
  limit?: number;
}): Promise<PersistedMemoryEntry[]> {
  let query = fromTable("sita_memory_entries")
    .select("*")
    .is("superseded_by", null)
    .order("updated_at", { ascending: false });
  if (filters?.key) query = query.eq("key", filters.key);
  if (filters?.entity_id) query = query.eq("entity_id", filters.entity_id);
  if (filters?.privacy_tier) query = query.eq("privacy_tier", filters.privacy_tier);
  if (filters?.limit) query = query.limit(filters.limit);
  const { data, error } = await query;
  if (error) { console.error("[persistence] memory fetch failed:", error); return []; }
  return data ?? [];
}

export async function forgetMemory(entryId: string, reason: string, requestedBy: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get the entry first for audit
  const { data: entry } = await fromTable("sita_memory_entries")
    .select("key, privacy_tier")
    .eq("id", entryId)
    .maybeSingle();

  if (!entry) return false;

  // Log the forget action
  await fromTable("sita_memory_forget_log").insert({
    user_id: user.id,
    entry_id: entryId,
    key: entry.key,
    reason,
    requested_by: requestedBy,
    previous_tier: entry.privacy_tier,
  });

  // Delete the entry
  const { error } = await fromTable("sita_memory_entries").delete().eq("id", entryId);
  if (error) { console.error("[persistence] memory delete failed:", error); return false; }
  return true;
}
