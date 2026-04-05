import { supabase } from "@/integrations/supabase/client";
import { MOCK_CAPITAL_BUCKETS, MOCK_POSITIONS, MOCK_THESES } from "@/lib/mock-data/investment";
import type { Position, CapitalBucket, Thesis } from "@/lib/domain-engines/investment-office";

export async function fetchCapitalBuckets(): Promise<CapitalBucket[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_CAPITAL_BUCKETS;

  const { data, error } = await supabase.from("capital_purpose_buckets").select("*").eq("user_id", user.id);
  if (error || !data || data.length === 0) return MOCK_CAPITAL_BUCKETS;

  return data.map((b: any): CapitalBucket => ({
    id: b.id, name: b.label, type: "personal-cash",
    balance: b.current_allocation_pct ?? 0,
    targetBalance: b.target_allocation_pct ?? undefined,
    currency: "USD", entityOwner: "Personal", ringfenced: false,
  }));
}

export async function fetchPositions(): Promise<Position[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return MOCK_POSITIONS;

  const { data, error } = await supabase.from("asset_master").select("*, asset_market_snapshots(price, daily_change)").limit(20);
  if (error || !data || data.length === 0) return MOCK_POSITIONS;

  return data.map((a: any): Position => ({
    id: a.id, symbol: a.symbol, name: a.display_name,
    assetClass: a.asset_class as any, quantity: 0,
    avgCostBasis: 0, currentPrice: a.asset_market_snapshots?.[0]?.price ?? 0,
    currency: "USD", venue: a.exchange_or_venue || "Unknown", custodyType: "brokerage",
  }));
}

export async function fetchTheses(): Promise<Thesis[]> {
  return MOCK_THESES;
}
