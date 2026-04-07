// ═══════════════════════════════════════════════════════════════
// SITA OS — EventBus Durable Persistence Adapter
// Persists events to os_event_log, supports replay, dead-letter,
// correlation/causation lineage, idempotency, and retention
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";
import type { BusEvent, DeadLetterEntry } from "@/lib/core-services/event-bus";

// ── Types ───────────────────────────────────────────────────────

export type EventStatus = "pending" | "processed" | "failed" | "dead_letter" | "replayed";

export interface PersistedEvent {
  id: string;
  user_id: string;
  topic: string;
  payload: Record<string, unknown>;
  source: string;
  correlation_id: string | null;
  causation_id: string | null;
  tenant_id: string | null;
  actor_id: string | null;
  domain: string | null;
  metadata: Record<string, unknown> | null;
  status: EventStatus;
  retry_count: number;
  idempotency_key: string | null;
  consumers_processed: string[];
  replay_eligible: boolean;
  retention_class: string;
  created_at: string;
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

// ── Persist a single event ──────────────────────────────────────

export async function persistEvent(
  event: BusEvent,
  opts?: {
    causationId?: string;
    status?: EventStatus;
    domain?: string;
    idempotencyKey?: string;
    retentionClass?: string;
  }
): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;

  const { error } = await fromTable("os_event_log").insert({
    id: event.id,
    user_id: userId,
    topic: event.topic,
    payload: event.payload,
    source: event.source,
    correlation_id: event.correlationId ?? null,
    causation_id: opts?.causationId ?? null,
    tenant_id: event.tenantId ?? null,
    actor_id: (event.metadata?.actorId as string) ?? null,
    domain: opts?.domain ?? (event.metadata?.domain as string) ?? null,
    metadata: event.metadata ?? null,
    status: opts?.status ?? "processed",
    idempotency_key: opts?.idempotencyKey ?? null,
    retention_class: opts?.retentionClass ?? "operational",
  });

  if (error) {
    // Idempotency conflict is expected, not an error
    if (error.code === "23505") return true;
    console.error("[event-persistence] insert failed:", error);
    return false;
  }
  return true;
}

// ── Persist dead-letter entry ───────────────────────────────────

export async function persistDeadLetter(entry: DeadLetterEntry): Promise<boolean> {
  return persistEvent(entry.event, {
    status: "dead_letter",
    retentionClass: "append-only-reference",
  });
}

// ── Batch persist ───────────────────────────────────────────────

export async function persistEventBatch(events: BusEvent[]): Promise<number> {
  const userId = await uid();
  if (!userId || events.length === 0) return 0;

  const rows = events.map(e => ({
    id: e.id,
    user_id: userId,
    topic: e.topic,
    payload: e.payload,
    source: e.source,
    correlation_id: e.correlationId ?? null,
    tenant_id: e.tenantId ?? null,
    domain: (e.metadata?.domain as string) ?? null,
    metadata: e.metadata ?? null,
    status: "processed" as EventStatus,
  }));

  const { error, count } = await fromTable("os_event_log").insert(rows);
  if (error) {
    console.error("[event-persistence] batch insert failed:", error);
    return 0;
  }
  return count ?? rows.length;
}

// ── Fetch events (for replay/inspection) ────────────────────────

export async function fetchPersistedEvents(filters?: {
  topic?: string;
  domain?: string;
  correlationId?: string;
  status?: EventStatus;
  since?: string;
  until?: string;
  limit?: number;
}): Promise<PersistedEvent[]> {
  const userId = await uid();
  if (!userId) return [];

  let query = fromTable("os_event_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters?.topic) query = query.eq("topic", filters.topic);
  if (filters?.domain) query = query.eq("domain", filters.domain);
  if (filters?.correlationId) query = query.eq("correlation_id", filters.correlationId);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.since) query = query.gte("created_at", filters.since);
  if (filters?.until) query = query.lte("created_at", filters.until);
  query = query.limit(filters?.limit ?? 200);

  const { data, error } = await query;
  if (error) { console.error("[event-persistence] fetch failed:", error); return []; }
  return data ?? [];
}

// ── Fetch dead letters ──────────────────────────────────────────

export async function fetchDeadLetters(limit = 50): Promise<PersistedEvent[]> {
  return fetchPersistedEvents({ status: "dead_letter", limit });
}

// ── Mark event replayed ─────────────────────────────────────────

export async function markEventReplayed(eventId: string): Promise<boolean> {
  const { error } = await fromTable("os_event_log")
    .update({ status: "replayed" })
    .eq("id", eventId);

  if (error) { console.error("[event-persistence] replay mark failed:", error); return false; }
  return true;
}

// ── Get topic counts ────────────────────────────────────────────

export async function getPersistedTopicCounts(): Promise<Record<string, number>> {
  const events = await fetchPersistedEvents({ limit: 1000 });
  const counts: Record<string, number> = {};
  for (const e of events) { counts[e.topic] = (counts[e.topic] ?? 0) + 1; }
  return counts;
}

// ── Get event lineage (correlation chain) ───────────────────────

export async function getEventLineage(correlationId: string): Promise<PersistedEvent[]> {
  const userId = await uid();
  if (!userId) return [];

  const { data, error } = await fromTable("os_event_log")
    .select("*")
    .eq("user_id", userId)
    .eq("correlation_id", correlationId)
    .order("created_at", { ascending: true });

  if (error) { console.error("[event-persistence] lineage fetch failed:", error); return []; }
  return data ?? [];
}
