// ═══════════════════════════════════════════════════════════════
// SITA OS — Business/Revenue React Query Hooks
// Mode-aware hooks for revenue autopilot, calling, collections
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useRealityProvider, resolveByMode } from "@/lib/hooks/useRealityProvider";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_LEAKAGE_INPUT, MOCK_RECOVERED_VALUES, MOCK_RAW_OPPORTUNITIES } from "@/lib/mock-data/revenue-autopilot";
import { MOCK_CONTACTS } from "@/lib/mock-data/revenue-calling";

const unwrap = async (fn: () => Promise<{ data: any }>): Promise<any> => {
  const result = await fn();
  return result.data;
};

async function fetchRevenueLeaks(mode: string) {
  if (mode !== "real") return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_LEAKAGE_INPUT, emptyDefault: MOCK_LEAKAGE_INPUT });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_LEAKAGE_INPUT, emptyDefault: MOCK_LEAKAGE_INPUT });
  const { data, error } = await supabase.from("revenue_leak_items").select("*").eq("user_id", user.id).eq("resolved", false).order("created_at", { ascending: false });
  if (!error && data?.length) {
    return resolveByMode({ mode: mode as any, realData: data, demoData: MOCK_LEAKAGE_INPUT, emptyDefault: MOCK_LEAKAGE_INPUT });
  }
  return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_LEAKAGE_INPUT, emptyDefault: MOCK_LEAKAGE_INPUT });
}

async function fetchRecoveredValues(mode: string) {
  if (mode !== "real") return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RECOVERED_VALUES, emptyDefault: MOCK_RECOVERED_VALUES });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RECOVERED_VALUES, emptyDefault: MOCK_RECOVERED_VALUES });
  const { data, error } = await supabase.from("revenue_leak_items").select("*").eq("user_id", user.id).eq("resolved", true).order("updated_at", { ascending: false }).limit(20);
  if (!error && data?.length) {
    return resolveByMode({ mode: mode as any, realData: data, demoData: MOCK_RECOVERED_VALUES, emptyDefault: MOCK_RECOVERED_VALUES });
  }
  return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RECOVERED_VALUES, emptyDefault: MOCK_RECOVERED_VALUES });
}

async function fetchRawOpportunities(mode: string) {
  if (mode !== "real") return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RAW_OPPORTUNITIES, emptyDefault: MOCK_RAW_OPPORTUNITIES });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RAW_OPPORTUNITIES, emptyDefault: MOCK_RAW_OPPORTUNITIES });
  const { data, error } = await supabase.from("deals").select("*, customers(name)").eq("user_id", user.id).order("value", { ascending: false }).limit(20);
  if (!error && data?.length) {
    return resolveByMode({ mode: mode as any, realData: data, demoData: MOCK_RAW_OPPORTUNITIES, emptyDefault: MOCK_RAW_OPPORTUNITIES });
  }
  return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_RAW_OPPORTUNITIES, emptyDefault: MOCK_RAW_OPPORTUNITIES });
}

async function fetchCallingContacts(mode: string) {
  if (mode !== "real") return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_CONTACTS, emptyDefault: MOCK_CONTACTS });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_CONTACTS, emptyDefault: MOCK_CONTACTS });
  const { data, error } = await supabase.from("customers").select("*").eq("user_id", user.id).not("phone", "is", null).order("last_contact_at", { ascending: true }).limit(30);
  if (!error && data?.length) {
    return resolveByMode({ mode: mode as any, realData: data, demoData: MOCK_CONTACTS, emptyDefault: MOCK_CONTACTS });
  }
  return resolveByMode({ mode: mode as any, realData: null, demoData: MOCK_CONTACTS, emptyDefault: MOCK_CONTACTS });
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
