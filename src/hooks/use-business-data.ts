// ═══════════════════════════════════════════════════════════════
// SITA OS — Business/Revenue React Query Hooks
// Mode-aware hooks for revenue autopilot, calling, collections
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useRealityProvider } from "@/lib/hooks/useRealityProvider";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { MOCK_LEAKAGE_INPUT, MOCK_RECOVERED_VALUES, MOCK_RAW_OPPORTUNITIES } from "@/lib/mock-data/revenue-autopilot";
import { MOCK_CONTACTS } from "@/lib/mock-data/revenue-calling";

async function fetchRevenueLeaks(mode: string): Promise<any> {
  if (mode !== "real") return MOCK_LEAKAGE_INPUT;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_LEAKAGE_INPUT;
  const { data, error } = await fromTable("revenue_leak_items").select("*").eq("user_id", user.id).eq("resolved", false).order("created_at", { ascending: false });
  return (!error && data?.length) ? data : MOCK_LEAKAGE_INPUT;
}

async function fetchRecoveredValues(mode: string): Promise<any> {
  if (mode !== "real") return MOCK_RECOVERED_VALUES;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_RECOVERED_VALUES;
  const { data, error } = await fromTable("revenue_leak_items").select("*").eq("user_id", user.id).eq("resolved", true).order("updated_at", { ascending: false }).limit(20);
  return (!error && data?.length) ? data : MOCK_RECOVERED_VALUES;
}

async function fetchRawOpportunities(mode: string): Promise<any> {
  if (mode !== "real") return MOCK_RAW_OPPORTUNITIES;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_RAW_OPPORTUNITIES;
  const { data, error } = await fromTable("deals").select("*").eq("user_id", user.id).order("value", { ascending: false }).limit(20);
  return (!error && data?.length) ? data : MOCK_RAW_OPPORTUNITIES;
}

async function fetchCallingContacts(mode: string): Promise<any> {
  if (mode !== "real") return MOCK_CONTACTS;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_CONTACTS;
  const { data, error } = await fromTable("customers").select("*").eq("user_id", user.id).not("phone", "is", null).order("last_contact_at", { ascending: true }).limit(30);
  return (!error && data?.length) ? data : MOCK_CONTACTS;
}

export function useRevenueLeaksData() {
  const { mode } = useRealityProvider();
  return useQuery({ queryKey: ["revenue-leaks-full", mode], queryFn: () => fetchRevenueLeaks(mode) });
}

export function useRecoveredValuesData() {
  const { mode } = useRealityProvider();
  return useQuery({ queryKey: ["recovered-values", mode], queryFn: () => fetchRecoveredValues(mode) });
}

export function useRawOpportunities() {
  const { mode } = useRealityProvider();
  return useQuery({ queryKey: ["raw-opportunities", mode], queryFn: () => fetchRawOpportunities(mode) });
}

export function useCallingContactsData() {
  const { mode } = useRealityProvider();
  return useQuery({ queryKey: ["calling-contacts", mode], queryFn: () => fetchCallingContacts(mode) });
}
