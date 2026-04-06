// ═══════════════════════════════════════════════════════════════
// SITA OS — Business/Revenue React Query Hooks
// Extends use-domain-data.ts with additional hooks for revenue pages
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useRealityProvider, resolveByMode } from "@/lib/hooks/useRealityProvider";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_LEAKAGE_INPUT, MOCK_RECOVERED_VALUES, MOCK_RAW_OPPORTUNITIES } from "@/lib/mock-data/revenue-autopilot";
import { MOCK_CONTACTS } from "@/lib/mock-data/revenue-calling";
import type { LeakageItem, RecoveredValueEntry, RankedOpportunity } from "@/lib/domain-engines/revenue-autopilot";

const unwrap = async (fn: () => Promise<{ data: any }>): Promise<any> => {
  const result = await fn();
  return result.data;
};

async function fetchRevenueLeaks(mode: string) {
  if (mode !== "real") return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_LEAKAGE_INPUT, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_LEAKAGE_INPUT, emptyDefault: [] });
  const { data, error } = await supabase.from("revenue_leak_items").select("*").eq("user_id", user.id).eq("resolved", false).order("created_at", { ascending: false });
  const mapped = (!error && data?.length) ? data.map((l: any) => ({
    category: l.category, label: l.item_name, amountCents: l.revenue_at_risk_cents,
    daysSinceLastAction: l.days_stale ?? 0, severity: l.severity, actionNeeded: l.action_needed,
  })) : null;
  return resolveByMode({ mode: mode as any, realData: mapped, demoData: MOCK_LEAKAGE_INPUT, emptyDefault: [] });
}

async function fetchRecoveredValues(mode: string) {
  if (mode !== "real") return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RECOVERED_VALUES, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RECOVERED_VALUES, emptyDefault: [] });
  const { data, error } = await supabase.from("revenue_leak_items").select("*").eq("user_id", user.id).eq("resolved", true).order("updated_at", { ascending: false }).limit(20);
  const mapped = (!error && data?.length) ? data.map((r: any) => ({
    source: r.category, label: r.item_name, recoveredCents: r.revenue_at_risk_cents,
    method: r.action_needed || "manual", recoveredAt: r.updated_at,
  })) : null;
  return resolveByMode({ mode: mode as any, realData: mapped, demoData: MOCK_RECOVERED_VALUES, emptyDefault: [] });
}

async function fetchRawOpportunities(mode: string) {
  if (mode !== "real") return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RAW_OPPORTUNITIES, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RAW_OPPORTUNITIES, emptyDefault: [] });
  const { data, error } = await supabase.from("deals").select("*, customers(name)").eq("user_id", user.id).order("value", { ascending: false }).limit(20);
  const mapped = (!error && data?.length) ? data.map((d: any) => ({
    label: d.name, estimatedRevenueCents: Math.round((d.value ?? 0) * 100),
    probability: d.probability ?? 0.5, effort: "medium" as const, timeHorizonDays: 30, tags: [],
  })) : null;
  return resolveByMode({ mode: mode as any, realData: mapped, demoData: MOCK_RAW_OPPORTUNITIES, emptyDefault: [] });
}

async function fetchCallingContacts(mode: string) {
  if (mode !== "real") return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_CONTACTS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_CONTACTS, emptyDefault: [] });
  const { data, error } = await supabase.from("customers").select("*").eq("user_id", user.id).not("phone", "is", null).order("last_contact_at", { ascending: true }).limit(30);
  const mapped = (!error && data?.length) ? data.map((c: any) => ({
    id: c.id, name: c.name, company: c.company ?? "", phone: c.phone, email: c.email ?? "",
    status: "not_called" as const, lastCallDate: c.last_contact_at, notes: c.notes ?? "",
    dealValue: c.lifetime_revenue ?? 0, priority: c.health_score && c.health_score < 50 ? "high" as const : "medium" as const,
  })) : null;
  return resolveByMode({ mode: mode as any, realData: mapped, demoData: MOCK_CONTACTS, emptyDefault: [] });
}

export function useRevenueLeaksData() {
  const { mode } = useRealityProvider();
  return useQuery({ queryKey: ["revenue-leaks-full", mode], queryFn: () => unwrap(() => fetchRevenueLeaks(mode)) });
}

export function useRecoveredValuesData() {
  const { mode } = useRealityProvider();
  return useQuery({ queryKey: ["recovered-values", mode], queryFn: () => unwrap(() => fetchRecoveredValues(mode)) });
}

export function useRawOpportunities() {
  const { mode } = useRealityProvider();
  return useQuery({ queryKey: ["raw-opportunities", mode], queryFn: () => unwrap(() => fetchRawOpportunities(mode)) });
}

export function useCallingContactsData() {
  const { mode } = useRealityProvider();
  return useQuery({ queryKey: ["calling-contacts", mode], queryFn: () => unwrap(() => fetchCallingContacts(mode)) });
}
