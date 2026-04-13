import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Agents Hook
// CRUD + invocation for autonomous advisor agents
// ═══════════════════════════════════════════════════════════════

export interface AdvisorAgent {
  id: string;
  user_id: string;
  advisor_id: string;
  display_name: string;
  domain: string;
  autonomy_level: number;
  is_active: boolean;
  personality: Record<string, unknown>;
  scope_config: Record<string, unknown>;
  confidence_threshold: number;
  budget_daily_tokens: number;
  tokens_used_today: number;
  invocations_today: number;
  max_invocations_per_hour: number;
  last_observation_at: string | null;
  last_action_at: string | null;
  escalation_target: string;
  mission: string | null;
  special_ability: string | null;
  maturity: string;
  created_at: string;
  updated_at: string;
}

export interface AdvisorAction {
  id: string;
  user_id: string;
  advisor_id: string;
  action_type: string;
  domain: string;
  summary: string;
  payload: Record<string, unknown>;
  confidence: number;
  status: string;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  executed_at: string | null;
  receipt_hash: string | null;
  rollback_payload: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const ADVISOR_DEFAULTS: Array<Omit<AdvisorAgent, "id" | "user_id" | "created_at" | "updated_at">> = [
  {
    advisor_id: "money-guardian", display_name: "Money Guardian", domain: "money",
    autonomy_level: 2, is_active: true, personality: { tone: "calm-professional" },
    scope_config: { tables: ["grocery_items", "grocery_lists", "concierge_recurring_obligations"] },
    confidence_threshold: 0.8, budget_daily_tokens: 10000, tokens_used_today: 0,
    invocations_today: 0, max_invocations_per_hour: 5,
    last_observation_at: null, last_action_at: null, escalation_target: "human",
    mission: "Protect financial health: flag overdue bills, detect waste, ensure cash flow clarity",
    special_ability: "Pattern-aware spending analysis", maturity: "alpha",
  },
  {
    advisor_id: "money-sentinel", display_name: "Money Sentinel", domain: "money",
    autonomy_level: 1, is_active: true, personality: { tone: "vigilant" },
    scope_config: { tables: ["grocery_items", "grocery_lists"] },
    confidence_threshold: 0.9, budget_daily_tokens: 5000, tokens_used_today: 0,
    invocations_today: 0, max_invocations_per_hour: 10,
    last_observation_at: null, last_action_at: null, escalation_target: "human",
    mission: "Watch for anomalies: unusual spending, duplicate charges, fraud indicators",
    special_ability: "Anomaly detection with low false-positive rate", maturity: "alpha",
  },
  {
    advisor_id: "business-scout", display_name: "Business Scout", domain: "business",
    autonomy_level: 2, is_active: true, personality: { tone: "proactive" },
    scope_config: { tables: ["appointments", "service_providers_list"] },
    confidence_threshold: 0.75, budget_daily_tokens: 10000, tokens_used_today: 0,
    invocations_today: 0, max_invocations_per_hour: 5,
    last_observation_at: null, last_action_at: null, escalation_target: "human",
    mission: "Monitor leads, pipeline health, and follow-up cadence",
    special_ability: "Lead scoring and follow-up optimization", maturity: "alpha",
  },
  {
    advisor_id: "business-strategist", display_name: "Business Strategist", domain: "business",
    autonomy_level: 2, is_active: true, personality: { tone: "analytical" },
    scope_config: { tables: ["appointments", "service_providers_list"] },
    confidence_threshold: 0.8, budget_daily_tokens: 8000, tokens_used_today: 0,
    invocations_today: 0, max_invocations_per_hour: 3,
    last_observation_at: null, last_action_at: null, escalation_target: "human",
    mission: "Analyze revenue trends, customer health, and growth forecasts",
    special_ability: "Strategic pattern recognition", maturity: "alpha",
  },
  {
    advisor_id: "concierge-pilot", display_name: "Concierge Pilot", domain: "concierge",
    autonomy_level: 2, is_active: true, personality: { tone: "helpful-calm" },
    scope_config: { tables: ["concierge_errands", "concierge_recurring_obligations", "travel_plans", "appointments"] },
    confidence_threshold: 0.7, budget_daily_tokens: 10000, tokens_used_today: 0,
    invocations_today: 0, max_invocations_per_hour: 8,
    last_observation_at: null, last_action_at: null, escalation_target: "human",
    mission: "Manage errands, groceries, recurring tasks, and travel prep proactively",
    special_ability: "Obligation bundling and deadline tracking", maturity: "alpha",
  },
  {
    advisor_id: "concierge-coordinator", display_name: "Concierge Coordinator", domain: "concierge",
    autonomy_level: 2, is_active: true, personality: { tone: "organized" },
    scope_config: { tables: ["school_activities", "gift_tracker", "appointments", "concierge_errands"] },
    confidence_threshold: 0.75, budget_daily_tokens: 8000, tokens_used_today: 0,
    invocations_today: 0, max_invocations_per_hour: 5,
    last_observation_at: null, last_action_at: null, escalation_target: "human",
    mission: "Coordinate family schedules, school activities, events, and gifts",
    special_ability: "Schedule conflict detection", maturity: "alpha",
  },
];

export function useAdvisorAgents() {
  const queryClient = useQueryClient();

  const agentsQuery = useQuery({
    queryKey: ["advisor-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advisor_agents")
        .select("*")
        .order("domain", { ascending: true });
      if (error) throw error;
      return (data || []) as AdvisorAgent[];
    },
  });

  const actionsQuery = useQuery({
    queryKey: ["advisor-action-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advisor_action_queue")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as AdvisorAction[];
    },
  });

  const seedAgentsMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const inserts = ADVISOR_DEFAULTS.map((a) => ({
        ...a,
        user_id: user.id,
        personality: a.personality as unknown as Record<string, never>,
        scope_config: a.scope_config as unknown as Record<string, never>,
      }));

      const { error } = await supabase.from("advisor_agents").upsert(inserts as any, {
        onConflict: "user_id,advisor_id",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-agents"] });
    },
  });

  const toggleAgentMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("advisor_agents")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-agents"] });
    },
  });

  const updateAutonomyMutation = useMutation({
    mutationFn: async ({ id, autonomy_level }: { id: string; autonomy_level: number }) => {
      const { error } = await supabase
        .from("advisor_agents")
        .update({ autonomy_level: Math.max(0, Math.min(6, autonomy_level)) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-agents"] });
    },
  });

  const approveActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("advisor_action_queue")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", actionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-action-queue"] });
    },
  });

  const rejectActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from("advisor_action_queue")
        .update({ status: "rejected" })
        .eq("id", actionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-action-queue"] });
    },
  });

  const invokeLoopMutation = useMutation({
    mutationFn: async (advisorId?: string) => {
      const { data, error } = await supabase.functions.invoke("advisor-agent-loop", {
        body: advisorId ? { advisor_id: advisorId } : {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-agents"] });
      queryClient.invalidateQueries({ queryKey: ["advisor-action-queue"] });
    },
  });

  return {
    agents: agentsQuery.data || [],
    actions: actionsQuery.data || [],
    isLoading: agentsQuery.isLoading,
    actionsLoading: actionsQuery.isLoading,
    seedAgents: seedAgentsMutation.mutate,
    seedingAgents: seedAgentsMutation.isPending,
    toggleAgent: toggleAgentMutation.mutate,
    updateAutonomy: updateAutonomyMutation.mutate,
    approveAction: approveActionMutation.mutate,
    rejectAction: rejectActionMutation.mutate,
    invokeLoop: invokeLoopMutation.mutate,
    invoking: invokeLoopMutation.isPending,
    invokeResult: invokeLoopMutation.data,
  };
}
