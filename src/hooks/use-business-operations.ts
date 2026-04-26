// ═══════════════════════════════════════════════════════════════
// SITA OS — useBusinessOperations hook
//
// Aggregates the four operational streams that surface in the
// BusinessOperations page into a single normalized view-model:
//
//   • incidents             → exceptions / outages
//   • council_escalations   → escalations
//   • approval_queue        → queue items awaiting decision
//   • webhook_retry_queue   → bottlenecks / integration stalls
//
// All sources are user-scoped via RLS. Empty results return [].
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export type OperationalCategory =
  | "queue"
  | "escalation"
  | "bottleneck"
  | "delayed"
  | "exception";

export type OperationalStatus =
  | "active"
  | "at-risk"
  | "blocked"
  | "resolved"
  | "overdue";

export type OperationalUrgency = "critical" | "high" | "medium" | "low";

export interface OperationalItemVM {
  id: string;
  title: string;
  category: OperationalCategory;
  status: OperationalStatus;
  urgency: OperationalUrgency;
  owner: string;
  ownerAvatar: string;
  customerImpact: number;
  description: string;
  linkedEntity?: string;
  linkedEntityType?: string;
  age: string;
  ageMs: number;
  nextAction: string;
  source: "incident" | "escalation" | "approval" | "webhook";
}

function ageLabel(iso: string | null | undefined): { label: string; ms: number } {
  if (!iso) return { label: "—", ms: 0 };
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return { label: "—", ms: 0 };
  const ms = Date.now() - t;
  const min = Math.floor(ms / 60_000);
  if (min < 60) return { label: `${min}m`, ms };
  const hr = Math.floor(min / 60);
  if (hr < 24) return { label: `${hr}h`, ms };
  const d = Math.floor(hr / 24);
  const remH = hr % 24;
  if (d < 7) return { label: remH ? `${d}d ${remH}h` : `${d}d`, ms };
  const w = Math.floor(d / 7);
  return { label: `${w}w ${d % 7}d`, ms };
}

function avatarFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "—";
}

function urgencyFromSeverity(sev: string | null | undefined): OperationalUrgency {
  const v = (sev ?? "").toLowerCase();
  if (v === "critical" || v === "p0" || v === "sev0") return "critical";
  if (v === "high" || v === "p1" || v === "sev1") return "high";
  if (v === "low" || v === "p3" || v === "sev3") return "low";
  return "medium";
}

function urgencyFromPriority(pri: string | null | undefined): OperationalUrgency {
  const v = (pri ?? "").toLowerCase();
  if (v === "urgent" || v === "critical" || v === "p0") return "critical";
  if (v === "high" || v === "p1") return "high";
  if (v === "low" || v === "p3") return "low";
  return "medium";
}

async function fetchAll(userId: string) {
  const [incidentsRes, escalationsRes, approvalsRes, webhooksRes] = await Promise.all([
    db.from("incidents").select("id,severity,title,description,status,owner_user_id,created_at,resolved_at,affected_services").eq("user_id", userId).neq("status", "resolved").order("created_at", { ascending: false }).limit(100),
    db.from("council_escalations").select("id,source_agent_id,source_council,target_supervisor,escalation_reason,severity,status,created_at,resolved_at").eq("status", "open").order("created_at", { ascending: false }).limit(100),
    db.from("approval_queue").select("id,title,action_summary,description,priority,status,risk_level,domain,action_type,created_at,decided_at").eq("user_id", userId).eq("status", "pending").order("created_at", { ascending: false }).limit(100),
    db.from("webhook_retry_queue").select("id,event_type,attempt_count,max_attempts,last_error,status,created_at,next_attempt_at").eq("user_id", userId).in("status", ["pending", "failed"]).order("created_at", { ascending: false }).limit(100),
  ]);
  return {
    incidents: (incidentsRes?.data ?? []) as any[],
    escalations: (escalationsRes?.data ?? []) as any[],
    approvals: (approvalsRes?.data ?? []) as any[],
    webhooks: (webhooksRes?.data ?? []) as any[],
  };
}

export interface UseBusinessOperationsResult {
  items: OperationalItemVM[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
  refetch: () => void;
  metrics: {
    total: number;
    critical: number;
    queues: number;
    escalations: number;
    bottlenecks: number;
    delayed: number;
    exceptions: number;
    customerImpact: number;
  };
}

export function useBusinessOperations(): UseBusinessOperationsResult {
  const userQuery = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    staleTime: 60_000,
  });
  const userId = userQuery.data?.id ?? null;

  const opsQuery = useQuery({
    queryKey: ["business-operations", userId],
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      if (!userId) return { incidents: [], escalations: [], approvals: [], webhooks: [] };
      return fetchAll(userId);
    },
  });

  const items = useMemo<OperationalItemVM[]>(() => {
    const data = opsQuery.data;
    if (!data) return [];
    const out: OperationalItemVM[] = [];

    for (const inc of data.incidents) {
      const a = ageLabel(inc.created_at);
      const urgency = urgencyFromSeverity(inc.severity);
      const services = Array.isArray(inc.affected_services) ? inc.affected_services : [];
      out.push({
        id: `incident:${inc.id}`,
        title: inc.title ?? "Incident",
        category: "exception",
        status: inc.status === "open" ? "active" : inc.status === "investigating" ? "at-risk" : "blocked",
        urgency,
        owner: inc.owner_user_id ? "Assigned" : "Unassigned",
        ownerAvatar: inc.owner_user_id ? "ON" : "—",
        customerImpact: services.length,
        description: inc.description ?? "Open incident requires investigation.",
        linkedEntity: services[0] ? String(services[0]) : undefined,
        linkedEntityType: services[0] ? "Service" : undefined,
        age: a.label,
        ageMs: a.ms,
        nextAction: urgency === "critical" ? "Mitigate immediately" : "Investigate and triage",
        source: "incident",
      });
    }

    for (const esc of data.escalations) {
      const a = ageLabel(esc.created_at);
      out.push({
        id: `escalation:${esc.id}`,
        title: `Council escalation — ${esc.source_council ?? "council"}`,
        category: "escalation",
        status: "active",
        urgency: urgencyFromSeverity(esc.severity),
        owner: esc.target_supervisor ?? "Supervisor",
        ownerAvatar: avatarFromName(esc.target_supervisor ?? "Supervisor"),
        customerImpact: 0,
        description: esc.escalation_reason ?? "Escalation reason unspecified.",
        linkedEntity: esc.source_agent_id,
        linkedEntityType: "Agent",
        age: a.label,
        ageMs: a.ms,
        nextAction: "Review and resolve",
        source: "escalation",
      });
    }

    for (const ap of data.approvals) {
      const a = ageLabel(ap.created_at);
      const overdueMs = 24 * 60 * 60 * 1000;
      const isOverdue = a.ms > overdueMs;
      out.push({
        id: `approval:${ap.id}`,
        title: ap.title ?? ap.action_summary ?? "Pending approval",
        category: "queue",
        status: isOverdue ? "overdue" : "active",
        urgency: urgencyFromPriority(ap.priority),
        owner: "Owner",
        ownerAvatar: "ON",
        customerImpact: 0,
        description: ap.description ?? ap.action_summary ?? "Approval pending decision.",
        linkedEntity: ap.action_type ?? ap.domain,
        linkedEntityType: ap.domain ? "Domain" : "Action",
        age: a.label,
        ageMs: a.ms,
        nextAction: "Approve or decline",
        source: "approval",
      });
    }

    for (const wh of data.webhooks) {
      const a = ageLabel(wh.created_at);
      const exhausted = (wh.attempt_count ?? 0) >= (wh.max_attempts ?? 5);
      out.push({
        id: `webhook:${wh.id}`,
        title: `Webhook retry — ${wh.event_type ?? "event"}`,
        category: "bottleneck",
        status: exhausted ? "blocked" : "at-risk",
        urgency: exhausted ? "critical" : "high",
        owner: "Integrations",
        ownerAvatar: "IT",
        customerImpact: wh.attempt_count ?? 0,
        description: wh.last_error ?? `Retry pending (attempt ${wh.attempt_count ?? 0}/${wh.max_attempts ?? 5}).`,
        linkedEntity: wh.event_type,
        linkedEntityType: "Event",
        age: a.label,
        ageMs: a.ms,
        nextAction: exhausted ? "Move to DLQ or replay manually" : "Wait for next retry attempt",
        source: "webhook",
      });
    }

    out.sort((a, b) => b.ageMs - a.ageMs);
    return out;
  }, [opsQuery.data]);

  const metrics = useMemo(() => ({
    total: items.length,
    critical: items.filter((i) => i.urgency === "critical").length,
    queues: items.filter((i) => i.category === "queue").length,
    escalations: items.filter((i) => i.category === "escalation").length,
    bottlenecks: items.filter((i) => i.category === "bottleneck").length,
    delayed: items.filter((i) => i.category === "delayed" || i.category === "exception").length,
    exceptions: items.filter((i) => i.category === "exception").length,
    customerImpact: items.reduce((s, i) => s + (Number.isFinite(i.customerImpact) ? i.customerImpact : 0), 0),
  }), [items]);

  return {
    items,
    isLoading: userQuery.isLoading || opsQuery.isLoading,
    isError: !!opsQuery.error,
    isEmpty: !opsQuery.isLoading && items.length === 0,
    error: (opsQuery.error as Error | null) ?? null,
    refetch: () => opsQuery.refetch(),
    metrics,
  };
}