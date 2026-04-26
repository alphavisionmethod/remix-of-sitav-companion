import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { toast } from "sonner";
import { FALLBACK_INBOX_ITEMS, type InboxItem } from "./mock-inbox-data";
import type { LeadScoreResult } from "@/domains/business";
import { computeLeadScore, computeBatchScores } from "@/domains/engines/lead-scoring-engine";

export type InboxFilter = "all" | "new" | "urgent" | "high-quality" | "missing-info" | "duplicates" | "snoozed" | "accepted" | "rejected" | "exceptional" | "recovery" | "at-risk";

export function useLeadInbox() {
  const { user } = useAuth();
  const { primaryMode } = useBusinessProfile();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [explainId, setExplainId] = useState<string | null>(null);

  // Fetch from DB, fallback to mock data for demo
  const inboxQuery = useQuery({
    queryKey: ["lead-inbox-items"],
    queryFn: async () => {
      if (!user?.id) return FALLBACK_INBOX_ITEMS;
      const { data, error } = await fromTable("lead_inbox_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return FALLBACK_INBOX_ITEMS;
      return data as InboxItem[];
    },
  });

  const items = inboxQuery.data ?? FALLBACK_INBOX_ITEMS;

  // Compute scores for all items
  const scoreResults = useMemo(() => {
    return computeBatchScores(items, primaryMode);
  }, [items, primaryMode]);

  const scoreMap = useMemo(() => {
    const map = new Map<string, LeadScoreResult>();
    for (const result of scoreResults) {
      map.set(result.leadId, result);
    }
    return map;
  }, [scoreResults]);

  const filtered = useMemo(() => {
    let result = items;
    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.contact_name.toLowerCase().includes(q) ||
        i.company?.toLowerCase().includes(q) ||
        i.contact_email?.toLowerCase().includes(q) ||
        i.inquiry_text?.toLowerCase().includes(q)
      );
    }
    // Filter
    switch (filter) {
      case "new": return result.filter(i => i.triage_status === "new");
      case "urgent": return result.filter(i => {
        const s = scoreMap.get(i.id);
        return s && (s.urgencyBand === "heating-up" || s.urgencyBand === "needs-response-today") && i.triage_status !== "accepted" && i.triage_status !== "rejected";
      });
      case "high-quality": return result.filter(i => {
        const s = scoreMap.get(i.id);
        return s && s.priorityScore >= 70 && i.triage_status !== "accepted" && i.triage_status !== "rejected";
      });
      case "missing-info": return result.filter(i => i.completeness_score < 70 && i.triage_status !== "accepted" && i.triage_status !== "rejected");
      case "duplicates": return result.filter(i => i.duplicate_status !== "none" && i.triage_status !== "accepted" && i.triage_status !== "rejected");
      case "snoozed": return result.filter(i => i.triage_status === "snoozed");
      case "accepted": return result.filter(i => i.triage_status === "accepted");
      case "rejected": return result.filter(i => i.triage_status === "rejected");
      case "exceptional": return result.filter(i => {
        const s = scoreMap.get(i.id);
        return s?.boardroomWorthy && i.triage_status !== "accepted" && i.triage_status !== "rejected";
      });
      case "recovery": return result.filter(i => {
        const s = scoreMap.get(i.id);
        return s && s.recoveryPotential > 50 && i.triage_status !== "accepted" && i.triage_status !== "rejected";
      });
      case "at-risk": return result.filter(i => {
        const s = scoreMap.get(i.id);
        return s && s.staleRisk > 50 && i.triage_status !== "accepted" && i.triage_status !== "rejected";
      });
      default: return result.filter(i => i.triage_status !== "accepted" && i.triage_status !== "rejected");
    }
  }, [items, filter, search, scoreMap]);

  // Sort filtered by priority score
  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const sa = scoreMap.get(a.id)?.priorityScore ?? 0;
      const sb = scoreMap.get(b.id)?.priorityScore ?? 0;
      return sb - sa;
    });
  }, [filtered, scoreMap]);

  const selected = useMemo(() => items.find(i => i.id === selectedId) ?? null, [items, selectedId]);
  const selectedScore = useMemo(() => selectedId ? scoreMap.get(selectedId) ?? null : null, [selectedId, scoreMap]);
  const explainScore = useMemo(() => explainId ? scoreMap.get(explainId) ?? null : null, [explainId, scoreMap]);

  // Triage actions
  const triageAction = useCallback(async (id: string, action: "accept" | "reject" | "snooze" | "route", dest?: string) => {
    const statusMap = { accept: "accepted", reject: "rejected", snooze: "snoozed", route: "routed" } as const;
    const newStatus = statusMap[action];

    if (user?.id) {
      const update: Record<string, unknown> = { triage_status: newStatus };
      if (action === "accept") update.accepted_at = new Date().toISOString();
      if (action === "route" && dest) update.routed_to = dest;
      await fromTable("lead_inbox_items").update(update).eq("id", id);
    }

    const msgs = {
      accept: "Lead accepted into pipeline",
      reject: "Lead archived",
      snooze: "Lead snoozed for later",
      route: `Routed to ${dest}`,
    };
    toast.success(msgs[action]);
    queryClient.invalidateQueries({ queryKey: ["lead-inbox-items"] });
    if (selectedId === id) setSelectedId(null);
  }, [user, queryClient, selectedId]);

  const toggleCheck = useCallback((id: string, checked: boolean) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }, []);

  const clearChecked = useCallback(() => setCheckedIds(new Set()), []);

  const bulkAction = useCallback(async (action: "accept" | "reject" | "route", dest?: string) => {
    for (const id of checkedIds) {
      await triageAction(id, action, dest);
    }
    clearChecked();
  }, [checkedIds, triageAction, clearChecked]);

  return {
    items, filtered: sortedFiltered, selected, selectedId, selectedScore,
    filter, setFilter, search, setSearch,
    setSelectedId, checkedIds, toggleCheck, clearChecked,
    triageAction, bulkAction,
    isLoading: inboxQuery.isLoading,
    isDemo: !user?.id || (items === FALLBACK_INBOX_ITEMS),
    scoreMap, scoreResults,
    explainId, setExplainId, explainScore,
  };
}
