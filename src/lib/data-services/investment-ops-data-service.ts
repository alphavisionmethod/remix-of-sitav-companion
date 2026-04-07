// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Ops Data Service
// CRUD operations for 16 investment/thesis/market tables
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

type QF = { limit?: number; since?: string };

async function queryTable(table: string, filters?: QF & Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return [];
  let q = fromTable(table).select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (filters?.since) q = q.gte("created_at", filters.since);
  q = q.limit(filters?.limit ?? 100);
  const { data, error } = await q;
  if (error) { console.error(`[investment-ops] ${table} fetch:`, error); return []; }
  return data ?? [];
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const userId = await uid();
  if (!userId) return null;
  const { data, error } = await fromTable(table).insert({ ...row, user_id: userId }).select().single();
  if (error) { console.error(`[investment-ops] ${table} insert:`, error); return null; }
  return data;
}

async function updateRow(table: string, id: string, updates: Record<string, unknown>) {
  const { error } = await fromTable(table).update(updates).eq("id", id);
  if (error) { console.error(`[investment-ops] ${table} update:`, error); return false; }
  return true;
}

async function deleteRow(table: string, id: string) {
  const { error } = await fromTable(table).delete().eq("id", id);
  if (error) { console.error(`[investment-ops] ${table} delete:`, error); return false; }
  return true;
}

function crud(table: string) {
  return {
    list: (f?: QF) => queryTable(table, f),
    create: (row: Record<string, unknown>) => insertRow(table, row),
    update: (id: string, u: Record<string, unknown>) => updateRow(table, id, u),
    delete: (id: string) => deleteRow(table, id),
  };
}

export const investmentAccounts = crud("investment_accounts");
export const investmentAdvisorDebates = crud("investment_advisor_debates");
export const investmentAdvisorObservations = crud("investment_advisor_observations");
export const investmentAdvisorProfiles = crud("investment_advisor_profiles");
export const investmentBehavioralSignals = crud("investment_behavioral_signals");
export const investmentConstitutions = crud("investment_constitutions");
export const investmentDecisionRecords = crud("investment_decision_records");
export const investmentExecutionRecords = crud("investment_execution_records");
export const investmentJournalEntries = crud("investment_journal_entries");
export const investmentOfficeProfiles = crud("investment_office_profiles");
export const investmentReceipts = crud("investment_receipts");
export const investmentScenarioSets = crud("investment_scenario_sets");
export const investmentSignals = crud("investment_signals");
export const connectedInvestmentPlatforms = crud("connected_investment_platforms");
export const thesisRecords = crud("thesis_records");
export const marketMemoryEvents = crud("market_memory_events");
