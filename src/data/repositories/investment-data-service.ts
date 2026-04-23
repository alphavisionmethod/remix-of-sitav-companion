// SITA OS — Investment Data Service (Mode-Aware)
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import type { Position, CapitalBucket, Thesis } from "@/lib/domain-engines/investment-office";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import { resolveByMode, type ModeAwareResult } from "@/hooks/useRealityProvider";

const CAPITAL_BUCKETS: CapitalBucket[] = [
  { id: "b1", name: "Growth Portfolio", type: "personal-cash", balance: 450000, targetBalance: 500000, currency: "USD", entityOwner: "Personal", ringfenced: false },
  { id: "b2", name: "Emergency Reserve", type: "personal-cash", balance: 125000, targetBalance: 150000, currency: "USD", entityOwner: "Personal", ringfenced: true },
  { id: "b3", name: "Opportunity Fund", type: "personal-cash", balance: 75000, targetBalance: 100000, currency: "USD", entityOwner: "Personal", ringfenced: false },
];

const POSITIONS: Position[] = [
  { id: "p1", symbol: "VTI", name: "Vanguard Total Stock Market", assetClass: "equity", quantity: 450, avgCostBasis: 220, currentPrice: 265.30, currency: "USD", venue: "Vanguard", custodyType: "brokerage" },
  { id: "p2", symbol: "AAPL", name: "Apple Inc.", assetClass: "equity", quantity: 200, avgCostBasis: 160, currentPrice: 198.50, currency: "USD", venue: "Schwab", custodyType: "brokerage" },
  { id: "p3", symbol: "BND", name: "Vanguard Total Bond", assetClass: "fixed-income", quantity: 800, avgCostBasis: 70, currentPrice: 72.40, currency: "USD", venue: "Vanguard", custodyType: "brokerage" },
  { id: "p4", symbol: "VNQ", name: "Vanguard Real Estate", assetClass: "real-estate", quantity: 300, avgCostBasis: 87, currentPrice: 84.20, currency: "USD", venue: "Vanguard", custodyType: "brokerage" },
  { id: "p5", symbol: "GLD", name: "SPDR Gold Shares", assetClass: "commodity", quantity: 150, avgCostBasis: 190, currentPrice: 215.80, currency: "USD", venue: "Schwab", custodyType: "brokerage" },
];

const THESES: Thesis[] = [
  { id: "t1", title: "AI Infrastructure Buildout", asset: "NVDA", direction: "long", rationale: "AI compute demand", catalysts: ["GTC"], invalidationConditions: [], sizeLogic: "15%", regimeContext: "bull", confidence: 0.85, status: "active" } as never,
  { id: "t2", title: "Rate Normalization", asset: "BND", direction: "long", rationale: "Rate cuts benefit bonds", catalysts: ["Fed"], invalidationConditions: [], sizeLogic: "10%", regimeContext: "neutral", confidence: 0.65, status: "active" } as never,
];

export async function fetchCapitalBuckets(mode: RealityModeKey = "real"): Promise<ModeAwareResult<CapitalBucket[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: CAPITAL_BUCKETS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: CAPITAL_BUCKETS, emptyDefault: [] });
  const { data, error } = await fromTable("capital_purpose_buckets").select("*").eq("user_id", user.id);
  const mapped = (!error && data && data.length > 0) ? data.map((b: any): CapitalBucket => ({
    id: b.id, name: b.label, type: "personal-cash", balance: b.current_allocation_pct ?? 0,
    targetBalance: b.target_allocation_pct ?? undefined, currency: "USD", entityOwner: "Personal", ringfenced: false,
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: CAPITAL_BUCKETS, emptyDefault: [] });
}

export async function fetchPositions(mode: RealityModeKey = "real"): Promise<ModeAwareResult<Position[]>> {
  if (mode !== "real") return resolveByMode({ mode, realData: null, demoData: POSITIONS, emptyDefault: [] });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return resolveByMode({ mode, realData: null, demoData: POSITIONS, emptyDefault: [] });
  const { data, error } = await fromTable("asset_master").select("*, asset_market_snapshots(price, daily_change)").limit(20);
  const mapped = (!error && data && data.length > 0) ? data.map((a: any): Position => ({
    id: a.id, symbol: a.symbol, name: a.display_name, assetClass: a.asset_class as never, quantity: 0,
    avgCostBasis: 0, currentPrice: a.asset_market_snapshots?.[0]?.price ?? 0,
    currency: "USD", venue: a.exchange_or_venue || "Unknown", custodyType: "brokerage",
  })) : null;
  return resolveByMode({ mode, realData: mapped, demoData: POSITIONS, emptyDefault: [] });
}

export async function fetchTheses(mode: RealityModeKey = "real"): Promise<ModeAwareResult<Thesis[]>> {
  return resolveByMode({ mode, realData: null, demoData: THESES, emptyDefault: [] });
}
