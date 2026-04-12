// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Account Graph Service
// Merges identity + connector domains into one navigable graph
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import type {
  UnifiedAccountNode,
  UnifiedAccountEdge,
  AccountGraphSummaryView,
} from "./types";

// ── Nodes ──────────────────────────────────────────────────────
export async function getAccountNodes(): Promise<UnifiedAccountNode[]> {
  const { data, error } = await db.from("unified_account_nodes")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

// ── Edges ──────────────────────────────────────────────────────
export async function getAccountEdges(): Promise<UnifiedAccountEdge[]> {
  const { data, error } = await db.from("unified_account_edges")
    .select("*, provider_families(name)")
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

// ── Graph summary view ─────────────────────────────────────────
export async function getAccountGraphSummary(): Promise<AccountGraphSummaryView[]> {
  const { data, error } = await db.from("v_account_graph_summary")
    .select("*");
  if (error) throw error;
  return (data ?? []) as never as AccountGraphSummaryView[];
}

// ── Separation audit ───────────────────────────────────────────
export async function getSeparationAudits() {
  const { data, error } = await db.from("auth_connector_separation_audits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

