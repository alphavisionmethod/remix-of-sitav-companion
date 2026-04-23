// SITA OS — Business Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/hooks/useRealityProvider";

// Re-export the rich types directly from mock-data for full compatibility
export type { CollectionsAccount } from "@/data/fixtures/mock-data/collections";
import type { CollectionsAccount } from "@/data/fixtures/mock-data/collections";
export interface MockCustomer {
  id: string; name: string; company: string; email: string; phone: string;
  status: string; relationship_type: string; health_score: number;
  lifetime_revenue: number | null; last_contact_at: string; created_at: string; notes: string;
}

const CUSTOMERS: MockCustomer[] = [
  { id: "c1", name: "Sarah Chen", company: "Meridian Ventures", email: "sarah@meridian.vc", phone: "+1-555-0101", status: "active", relationship_type: "investor", health_score: 92, lifetime_revenue: 120000, last_contact_at: "2026-04-02", created_at: "2025-06-15", notes: "Key strategic partner" },
  { id: "c2", name: "Marcus Webb", company: "Atlas Corp", email: "marcus@atlas.co", phone: "+1-555-0102", status: "active", relationship_type: "client", health_score: 78, lifetime_revenue: 85000, last_contact_at: "2026-03-28", created_at: "2025-09-01", notes: "Enterprise license prospect" },
  { id: "c3", name: "Elena Rossi", company: "Vanguard Advisory", email: "elena@vanguard.co", phone: "+1-555-0103", status: "active", relationship_type: "partner", health_score: 95, lifetime_revenue: 45000, last_contact_at: "2026-04-04", created_at: "2025-03-10", notes: "Advisory retainer" },
  { id: "c4", name: "James Park", company: "Nordic Digital", email: "james@nordic.io", phone: "+1-555-0104", status: "prospect", relationship_type: "prospect", health_score: 65, lifetime_revenue: null, last_contact_at: "2026-03-15", created_at: "2026-01-20", notes: "Consulting opportunity" },
];

export async function fetchCustomers(mode: RealityModeKey = "real"): Promise<ModeAwareResult<MockCustomer[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: CUSTOMERS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: CUSTOMERS, emptyDefault: [] });
  const { data, error } = await fromTable("customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const mapped = (!error && data && data.length > 0) ? data.map((c: any): MockCustomer => ({
    id: c.id, name: c.name, company: c.company, email: c.email, phone: c.phone,
    status: c.status, relationship_type: c.relationship_type, health_score: c.health_score,
    lifetime_revenue: c.lifetime_revenue ? Number(c.lifetime_revenue) : null,
    last_contact_at: c.last_contact_at, created_at: c.created_at, notes: c.notes,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: CUSTOMERS, emptyDefault: [] });
}

export async function fetchCollections(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CollectionsAccount[]>> {
  return resolveByMode({ mode, realData: null, demoData: COLLECTIONS_ACCOUNTS, emptyDefault: [] });
}
