// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Receipts & Inference Trace Service
// Supabase-backed: every AI invocation traced
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { AIInferenceReceipt, AITaskRequest } from "./types";

// ── Inference Receipts ─────────────────────────────────────────
export async function getInferenceReceipts(limit = 100): Promise<AIInferenceReceipt[]> {
  const { data, error } = await supabase
    .from("ai_inference_receipts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getReceiptsByProvider(provider: string, limit = 50): Promise<AIInferenceReceipt[]> {
  const { data, error } = await supabase
    .from("ai_inference_receipts")
    .select("*")
    .eq("provider", provider)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Task Requests ──────────────────────────────────────────────
export async function getTaskRequests(limit = 100): Promise<AITaskRequest[]> {
  const { data, error } = await supabase
    .from("ai_task_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getTaskRequestsByStatus(status: string, limit = 50): Promise<AITaskRequest[]> {
  const { data, error } = await supabase
    .from("ai_task_requests")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Receipt statistics ─────────────────────────────────────────
export async function getReceiptStats(): Promise<{
  totalReceipts: number;
  totalCostCents: number;
  avgLatencyMs: number;
  cacheHitRate: number;
  byProvider: Record<string, number>;
}> {
  const { data, error } = await supabase
    .from("ai_inference_receipts")
    .select("provider, cost_actual_cents, latency_ms, cache_hits");
  if (error) throw error;

  const receipts = data ?? [];
  const byProvider: Record<string, number> = {};
  let totalCost = 0;
  let totalLatency = 0;
  let totalCacheHits = 0;

  receipts.forEach(r => {
    byProvider[r.provider] = (byProvider[r.provider] ?? 0) + 1;
    totalCost += r.cost_actual_cents ?? 0;
    totalLatency += r.latency_ms ?? 0;
    totalCacheHits += r.cache_hits ?? 0;
  });

  return {
    totalReceipts: receipts.length,
    totalCostCents: totalCost,
    avgLatencyMs: receipts.length > 0 ? Math.round(totalLatency / receipts.length) : 0,
    cacheHitRate: receipts.length > 0 ? totalCacheHits / receipts.length : 0,
    byProvider,
  };
}
