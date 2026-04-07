// ═══════════════════════════════════════════════════════════════
// SITA OS — Consent Ledger Service
// Immutable record of every consent grant, revocation, upgrade
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type {
  ConsentLedgerEntry,
  ConsentLedgerInsert,
  ConsentHistoryView,
} from "./types";

// ── Consent entries ────────────────────────────────────────────
export async function getConsentHistory(limit = 100): Promise<ConsentLedgerEntry[]> {
  const { data, error } = await supabase
    .from("consent_ledger")
    .select("*, provider_families(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getActiveConsents(): Promise<ConsentLedgerEntry[]> {
  const { data, error } = await supabase
    .from("consent_ledger")
    .select("*, provider_families(name)")
    .or("revoked_at.is.null")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function recordConsent(entry: ConsentLedgerInsert): Promise<ConsentLedgerEntry> {
  const { data, error } = await supabase
    .from("consent_ledger")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Consent history view ───────────────────────────────────────
export async function getConsentHistoryView(): Promise<ConsentHistoryView[]> {
  const { data, error } = await supabase
    .from("v_consent_history")
    .select("*");
  if (error) throw error;
  return (data ?? []) as never as ConsentHistoryView[];
}

