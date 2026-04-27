import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

export function usePortfolioPositions() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["portfolio-positions", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("portfolio_positions").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useTradeOrders() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["trade-orders", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("trade_orders").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useMarketWatchlistItems() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["market-watchlist-items", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("market_watchlist_items").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useInvestmentDecisions() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-decisions", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_decisions").select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

export function useRiskScenarios() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["risk-scenarios", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("risk_scenarios").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useInvestmentWatchlists() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-watchlists", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_watchlists").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useInvestmentStrategyRecords() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-strategy-records", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_strategy_records").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useCapitalPurposeBuckets() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["capital-purpose-buckets", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("capital_purpose_buckets").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

export function useInvestmentThesisEntries() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-thesis-entries", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_thesis_entries").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}
