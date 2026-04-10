// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering Realtime Subscriptions
// Subscribes to all ai_* tables and invalidates react-query caches
// so dashboards update live without page refresh.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useQueryClient } from "@tanstack/react-query";

/** Maps each Supabase table to the react-query keys it should invalidate */
const TABLE_QUERY_MAP: Record<string, string[][]> = {
  ai_engineering_missions: [
    ["ai-eng", "missions"],
    ["ai-eng-all"],
  ],
  ai_fix_proposals: [
    ["ai-eng", "fixes"],
    ["ai-eng-all"],
  ],
  ai_change_plans: [
    ["ai-eng", "changePlans"],
    ["ai-eng-all"],
  ],
  ai_design_diffs: [
    ["ai-eng", "designDiffs"],
    ["ai-eng-all"],
  ],
  ai_agent_debate_records: [
    ["ai-eng", "debates"],
    ["ai-eng-all"],
  ],
  ai_learning_patterns: [
    ["ai-eng", "learningPatterns"],
    ["ai-eng-all"],
  ],
  ai_compliance_violations: [
    ["ai-eng", "violations"],
    ["ai-eng-all"],
  ],
  ai_efficiency_scores: [
    ["ai-eng", "efficiencyScores"],
    ["ai-eng-all"],
  ],
  ai_self_healing_rules: [
    ["ai-eng", "selfHealingRules"],
    ["ai-eng-all"],
  ],
  approval_queue: [
    ["ai-eng", "approvals"],
    ["ai-eng-all"],
    ["approvals"],
    ["approval-queue"],
  ],
};

const AI_TABLES = Object.keys(TABLE_QUERY_MAP);

export interface AIRealtimeEvent {
  id: string;
  table: string;
  eventType: string;
  timestamp: string;
}

/**
 * Subscribe to all AI engineering Supabase tables in a single channel.
 * On any INSERT/UPDATE/DELETE → invalidate the matching react-query keys
 * so useAIEngDomain / useAIEngineeringData refetch automatically.
 *
 * In demo mode or when unauthenticated, the subscription is disabled.
 */
export function useAIEngineeringRealtime() {
  const { user } = useAuth();
  const { isLiveMode } = useDataMode();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<AIRealtimeEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!isLiveMode || !user) {
      setIsConnected(false);
      return;
    }

    // Build a single channel with listeners for every AI table
    let channel = supabase.channel("ai-engineering-realtime");

    for (const table of AI_TABLES) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          const row = payload.new as Record<string, unknown> | undefined;
          const evt: AIRealtimeEvent = {
            id: (row?.id as string) ?? crypto.randomUUID(),
            table,
            eventType: payload.eventType,
            timestamp: new Date().toISOString(),
          };
          setLastEvent(evt);
          setEventCount((c) => c + 1);

          // Invalidate all matching query keys for this table
          const keys = TABLE_QUERY_MAP[table];
          if (keys) {
            for (const key of keys) {
              queryClient.invalidateQueries({ queryKey: key });
            }
          }
        },
      );
    }

    channel.subscribe((status) => {
      setIsConnected(status === "SUBSCRIBED");
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isLiveMode, user, queryClient]);

  return { isConnected, lastEvent, eventCount };
}
