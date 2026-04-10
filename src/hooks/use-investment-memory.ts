// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Memory Hooks
// React Query hooks for all 5 memory domains (user, advisor, thesis, portfolio, event)
// Powers: boardroom "what changed", time machine, post-trade loop,
//         strategy DNA, behavioral firewall, advisor continuity
// ═══════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

function useUserId() {
  const { user } = useAuth();
  return user?.id;
}

// ── 1. USER MEMORY ──────────────────────────────────────────────

/** Investment Office Profile — experience level, office mode, preferences */
export function useInvestmentOfficeProfile() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-office-profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_office_profiles").select("*").eq("user_id", uid!).maybeSingle();
      return data;
    },
  });
}

/** Strategy DNA Profile — inferred behavioral traits and patterns */
export function useStrategyDnaProfile() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["strategy-dna-profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("strategy_dna_profiles").select("*").eq("user_id", uid!).maybeSingle();
      return data;
    },
  });
}

/** Investment Constitution — user's rulebook (position limits, speculative limits, etc.) */
export function useInvestmentConstitution() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-constitution", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_constitutions")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });
}

/** Behavioral Signals — firewall detections (FOMO, panic, overtrading, etc.) */
export function useBehavioralSignals() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["behavioral-signals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_behavioral_signals")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });
}

/** Capital Purpose Buckets — purpose-based allocations */
export function useCapitalPurposeBuckets() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["capital-purpose-buckets-memory", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("capital_purpose_buckets").select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

// ── 2. ADVISOR MEMORY ───────────────────────────────────────────

/** Advisor Profiles — active advisor personas and configurations */
export function useAdvisorProfiles() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-advisor-profiles", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_advisor_profiles")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

/** Advisor Observations — atomic advisor outputs with confidence, uncertainty, reasoning */
export function useAdvisorObservations(ownerId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["advisor-observations", uid, ownerId],
    enabled: !!uid,
    queryFn: async () => {
      let q = fromTable("investment_advisor_observations")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(100);
      if (ownerId) q = q.eq("owner_id", ownerId);
      const { data } = await q;
      return data ?? [];
    },
  });
}

/** Advisor Debates — disagreement/alignment records between advisors */
export function useAdvisorDebates(ownerId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["advisor-debates", uid, ownerId],
    enabled: !!uid,
    queryFn: async () => {
      let q = fromTable("investment_advisor_debates")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(50);
      if (ownerId) q = q.eq("owner_id", ownerId);
      const { data } = await q;
      return data ?? [];
    },
  });
}

/** Chief Synthesis Records — committee summary layer */
export function useChiefSynthesis(ownerId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["chief-synthesis", uid, ownerId],
    enabled: !!uid,
    queryFn: async () => {
      let q = fromTable("chief_synthesis_records")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(20);
      if (ownerId) q = q.eq("owner_id", ownerId);
      const { data } = await q;
      return data ?? [];
    },
  });
}

// ── 3. THESIS MEMORY ────────────────────────────────────────────

/** Thesis Records — investment theses with beliefs, invalidation, outcomes */
export function useThesisRecords() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["thesis-records", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("thesis_records")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

/** Journal Entries — pre/post trade reflections, lessons, emotion checks */
export function useJournalEntries(thesisId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-journal-entries", uid, thesisId],
    enabled: !!uid,
    queryFn: async () => {
      let q = fromTable("investment_journal_entries")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(100);
      if (thesisId) q = q.eq("thesis_id", thesisId);
      const { data } = await q;
      return data ?? [];
    },
  });
}

// ── 4. PORTFOLIO MEMORY ─────────────────────────────────────────

/** Portfolio Positions — canonical position view with regime context */
export function usePortfolioPositionsMemory() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["portfolio-positions-memory", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("portfolio_positions")
        .select("*").eq("user_id", uid!).order("updated_at", { ascending: false });
      return data ?? [];
    },
  });
}

/** Decision Records — all prepared or completed decisions */
export function useDecisionRecords() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-decision-records", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_decision_records")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

/** Execution Records — actual routed executions */
export function useExecutionRecords() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-execution-records", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_execution_records")
        .select("*").eq("user_id", uid!).order("executed_at", { ascending: false });
      return data ?? [];
    },
  });
}

/** Investment Receipts — proof records for all investment actions */
export function useInvestmentReceiptsMemory() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-receipts-memory", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_receipts")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

/** Scenario Sets — modeled scenarios for strategies/assets */
export function useScenarioSets(ownerId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-scenario-sets", uid, ownerId],
    enabled: !!uid,
    queryFn: async () => {
      let q = fromTable("investment_scenario_sets")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(50);
      if (ownerId) q = q.eq("owner_id", ownerId);
      const { data } = await q;
      return data ?? [];
    },
  });
}

/** Strategy Records — hypothetical or active strategies */
export function useStrategyRecordsMemory() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["strategy-records-memory", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_strategy_records")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
}

// ── 5. EVENT MEMORY ─────────────────────────────────────────────

/** Market Memory Events — investment-specific what-changed feed */
export function useMarketMemoryEvents() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["market-memory-events", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("market_memory_events")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
}

/** Time Machine Snapshots — historical replay packages */
export function useTimeMachineSnapshots(ownerId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["time-machine-snapshots", uid, ownerId],
    enabled: !!uid,
    queryFn: async () => {
      let q = fromTable("time_machine_snapshots")
        .select("*").eq("user_id", uid!).order("captured_at", { ascending: false }).limit(50);
      if (ownerId) q = q.eq("owner_id", ownerId);
      const { data } = await q;
      return data ?? [];
    },
  });
}

/** Catalyst Events — upcoming market catalysts */
export function useCatalystEvents() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["catalyst-events", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("catalyst_events")
        .select("*").eq("user_id", uid!).order("scheduled_at", { ascending: true });
      return data ?? [];
    },
  });
}

/** Investment Signals — alerts and meaningful market events */
export function useInvestmentSignals() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-signals", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_signals")
        .select("*").eq("user_id", uid!).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });
}

/** Connected Investment Platforms — broker/exchange connections */
export function useConnectedPlatforms() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["connected-investment-platforms", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("connected_investment_platforms")
        .select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

/** Investment Accounts — specific accounts/subaccounts */
export function useInvestmentAccounts() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["investment-accounts", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await fromTable("investment_accounts")
        .select("*").eq("user_id", uid!);
      return data ?? [];
    },
  });
}

// ── CROSS-DOMAIN AGGREGATION ────────────────────────────────────

/**
 * Unified memory hook — returns all 5 memory domains for cross-cutting features.
 * Used by: boardroom "what changed", time machine, strategy DNA, behavioral firewall
 */
export function useInvestmentMemory() {
  const profile = useInvestmentOfficeProfile();
  const dna = useStrategyDnaProfile();
  const constitution = useInvestmentConstitution();
  const behavioralSignals = useBehavioralSignals();
  const advisorObservations = useAdvisorObservations();
  const advisorDebates = useAdvisorDebates();
  const chiefSynthesis = useChiefSynthesis();
  const theses = useThesisRecords();
  const journals = useJournalEntries();
  const positions = usePortfolioPositionsMemory();
  const decisions = useDecisionRecords();
  const executions = useExecutionRecords();
  const receipts = useInvestmentReceiptsMemory();
  const memoryEvents = useMarketMemoryEvents();
  const snapshots = useTimeMachineSnapshots();
  const catalysts = useCatalystEvents();
  const signals = useInvestmentSignals();

  const isLoading =
    profile.isLoading || dna.isLoading || constitution.isLoading ||
    behavioralSignals.isLoading || advisorObservations.isLoading ||
    theses.isLoading || positions.isLoading || memoryEvents.isLoading;

  return {
    isLoading,
    // User memory
    user: {
      profile: profile.data,
      strategyDna: dna.data,
      constitution: constitution.data,
      behavioralSignals: behavioralSignals.data ?? [],
    },
    // Advisor memory
    advisor: {
      observations: advisorObservations.data ?? [],
      debates: advisorDebates.data ?? [],
      chiefSynthesis: chiefSynthesis.data ?? [],
    },
    // Thesis memory
    thesis: {
      records: theses.data ?? [],
      journals: journals.data ?? [],
    },
    // Portfolio memory
    portfolio: {
      positions: positions.data ?? [],
      decisions: decisions.data ?? [],
      executions: executions.data ?? [],
      receipts: receipts.data ?? [],
    },
    // Event memory
    events: {
      memoryEvents: memoryEvents.data ?? [],
      snapshots: snapshots.data ?? [],
      catalysts: catalysts.data ?? [],
      signals: signals.data ?? [],
    },
  };
}
