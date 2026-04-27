// ═══════════════════════════════════════════════════════════════
// Phase 5 — Follow-Through Queues (live)
//
// Replaces the demo-only FOLLOW_THROUGH_TAB_DATA fixture with a real
// query against `callback_queue` (introduced in Phase 5 migration),
// scoped to the current user via RLS. Demo fixtures continue to be
// rendered ONLY when `isDemo === true` — production users see honest
// empty states.
//
// Anti-duplication: reuses `useRealityModeSafe`, `useAuth`, and
// `fromTable` — no parallel data layer.
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fromTable } from "@/lib/supabase-helpers";
import { useRealityModeSafe } from "@/lib/dual-reality/reality-mode-context";
import { FOLLOW_THROUGH_TAB_DATA, type QueueTab, type QueueItem } from "@/modules/business/pages/_config/FollowThroughCenter.config";

export interface FollowThroughQueue {
  label: string;
  items: QueueItem[];
}

const QUEUE_KINDS: QueueTab[] = ["callbacks", "no-touch", "waiting", "drafts", "overdue", "recovery"];

const QUEUE_LABELS: Record<QueueTab, string> = {
  callbacks: "Callbacks",
  "no-touch": "No-Touch Leads",
  waiting: "Waiting on Reply",
  drafts: "Unsent Drafts",
  overdue: "Overdue Outreach",
  recovery: "Recovery",
};

function emptyQueues(): Record<QueueTab, FollowThroughQueue> {
  return QUEUE_KINDS.reduce((acc, kind) => {
    acc[kind] = { label: QUEUE_LABELS[kind], items: [] };
    return acc;
  }, {} as Record<QueueTab, FollowThroughQueue>);
}

export function useFollowThroughQueues() {
  const { user } = useAuth();
  const { isDemo } = useRealityModeSafe();

  const query = useQuery({
    queryKey: ["follow-through-queues", user?.id ?? "anon", isDemo],
    queryFn: async (): Promise<Record<QueueTab, FollowThroughQueue>> => {
      // Demo mode keeps the canonical narrative fixture for the showcase.
      if (isDemo) return FOLLOW_THROUGH_TAB_DATA;
      if (!user?.id) return emptyQueues();

      const { data, error } = await fromTable("callback_queue")
        .select("id, queue_kind, contact_name, company, reason, channel, urgency, value_cents, days_stale, status, crm_contact_id, crm_company_id, source_support_case_id")
        .eq("user_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const queues = emptyQueues();
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        const kind = (row.queue_kind as QueueTab) ?? "callbacks";
        if (!QUEUE_KINDS.includes(kind)) continue;
        queues[kind].items.push({
          id: row.id as string,
          name: (row.contact_name as string) ?? "Unknown",
          company: (row.company as string) ?? "",
          reason: (row.reason as string) ?? "",
          daysStale: (row.days_stale as number) ?? 0,
          value: row.value_cents != null ? Math.round((row.value_cents as number) / 100) : undefined,
          channel: (row.channel as QueueItem["channel"]) ?? "phone",
          urgency: (row.urgency as QueueItem["urgency"]) ?? "normal",
        });
      }
      return queues;
    },
    enabled: isDemo || !!user?.id,
    staleTime: 30_000,
  });

  return {
    queues: query.data ?? emptyQueues(),
    isLoading: query.isLoading,
    isError: query.isError,
    isDemo,
    isUnauthenticated: !user?.id,
    refetch: query.refetch,
  };
}