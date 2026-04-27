// ═══════════════════════════════════════════════════════════════
// SITA OS — Business/Revenue React Query Hooks
// Mode-aware hooks for revenue autopilot, calling, collections
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useRealityProvider } from "@/hooks/useRealityProvider";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
const LEAKAGE_INPUT: any[] = [];
const RECOVERED_VALUES: any[] = [];
const RAW_OPPORTUNITIES: any[] = [];
const CONTACTS: any[] = [];
async function fetchRevenueLeaks(mode: string): Promise<any> {
  if (mode !== "real") return LEAKAGE_INPUT;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await fromTable("revenue_leak_items").select("*").eq("user_id", user.id).eq("resolved", false).order("created_at", { ascending: false });
  return (!error && data?.length) ? data : [];
}

async function fetchRecoveredValues(mode: string): Promise<any> {
  if (mode !== "real") return RECOVERED_VALUES;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await fromTable("revenue_leak_items").select("*").eq("user_id", user.id).eq("resolved", true).order("updated_at", { ascending: false }).limit(20);
  return (!error && data?.length) ? data : [];
}

async function fetchRawOpportunities(mode: string): Promise<any> {
  if (mode !== "real") return RAW_OPPORTUNITIES;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await fromTable("deals").select("*").eq("user_id", user.id).order("value", { ascending: false }).limit(20);
  return (!error && data?.length) ? data : [];
}

async function fetchCallingContacts(mode: string): Promise<any> {
  if (mode !== "real") return CONTACTS;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await fromTable("customers").select("*").eq("user_id", user.id).not("phone", "is", null).order("last_contact_at", { ascending: true }).limit(30);
  return (!error && data?.length) ? data : [];
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
