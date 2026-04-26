// ═══════════════════════════════════════════════════════════════
// SITA OS — useSupportCases hook
//
// Reads the user's support_cases (+ event reply counts) and exposes
// a normalized SupportIssueVM list for the CustomerSupportCenter.
// Auto-refreshes every 60s. RLS keeps it user-scoped server-side.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export type SupportSeverity = "critical" | "high" | "medium" | "low";
export type SupportIssueStatus =
  | "open"
  | "waiting-on-us"
  | "waiting-on-customer"
  | "escalated"
  | "resolved";

export interface SupportIssueVM {
  id: string;
  customer: string;
  subject: string;
  preview: string;
  severity: SupportSeverity;
  status: SupportIssueStatus;
  owner: string;
  linkedEntity?: string;
  linkedType?: string;
  createdAt: string;
  createdAtISO: string;
  lastAction: string;
  responseCount: number;
  slaHours: number;
  hoursOpen: number;
}

function severityFromPriority(p: string | null | undefined): SupportSeverity {
  const v = (p ?? "").toLowerCase();
  if (v === "urgent" || v === "critical" || v === "p0") return "critical";
  if (v === "high" || v === "p1") return "high";
  if (v === "low" || v === "p3") return "low";
  return "medium";
}

function statusFromCase(s: string | null | undefined, escalatedTo: string | null | undefined): SupportIssueStatus {
  if (escalatedTo) return "escalated";
  const v = (s ?? "").toLowerCase();
  if (v === "resolved" || v === "closed") return "resolved";
  if (v === "waiting_customer" || v === "waiting-on-customer" || v === "pending_customer") return "waiting-on-customer";
  if (v === "in_progress" || v === "investigating" || v === "waiting_on_us" || v === "waiting-on-us") return "waiting-on-us";
  return "open";
}

function slaHoursFor(severity: SupportSeverity): number {
  switch (severity) {
    case "critical": return 2;
    case "high": return 8;
    case "medium": return 24;
    case "low": return 72;
  }
}

function relative(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

function hoursOpen(createdISO: string, resolvedISO: string | null | undefined): number {
  const start = new Date(createdISO).getTime();
  const end = resolvedISO ? new Date(resolvedISO).getTime() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, (end - start) / 3_600_000);
}

async function fetchCases(userId: string) {
  const { data: cases } = await db
    .from("support_cases")
    .select("id,title,description,category,priority,status,assigned_to,escalated_to_role,resolution,resolved_at,created_at,updated_at,correlation_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  const list = (cases ?? []) as any[];
  if (list.length === 0) return { cases: list, eventCounts: new Map<string, { count: number; lastEvent: string | null; lastAt: string | null }>() };

  const ids = list.map((c) => c.id);
  const { data: events } = await db
    .from("support_case_events")
    .select("case_id,event_type,content,created_at")
    .in("case_id", ids)
    .order("created_at", { ascending: false })
    .limit(1000);

  const map = new Map<string, { count: number; lastEvent: string | null; lastAt: string | null }>();
  for (const ev of (events ?? []) as any[]) {
    const cur = map.get(ev.case_id) ?? { count: 0, lastEvent: null, lastAt: null };
    cur.count += 1;
    if (!cur.lastAt) {
      cur.lastAt = ev.created_at;
      cur.lastEvent = ev.event_type ?? "comment";
    }
    map.set(ev.case_id, cur);
  }
  return { cases: list, eventCounts: map };
}

export interface UseSupportCasesResult {
  issues: SupportIssueVM[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: Error | null;
  refetch: () => void;
  metrics: {
    totalOpen: number;
    critical: number;
    breached: number;
    waitingOnUs: number;
    escalated: number;
    resolved: number;
    urgent: number;
    avgResolutionHours: number | null;
  };
}

export function useSupportCases(): UseSupportCasesResult {
  const userQuery = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    staleTime: 60_000,
  });
  const userId = userQuery.data?.id ?? null;

  const casesQuery = useQuery({
    queryKey: ["support-cases", userId],
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      if (!userId) return { cases: [] as any[], eventCounts: new Map() };
      return fetchCases(userId);
    },
  });

  const issues = useMemo<SupportIssueVM[]>(() => {
    const data = casesQuery.data;
    if (!data) return [];
    return data.cases.map((c: any) => {
      const severity = severityFromPriority(c.priority);
      const status = statusFromCase(c.status, c.escalated_to_role);
      const evt = data.eventCounts.get(c.id);
      const sla = slaHoursFor(severity);
      const open = hoursOpen(c.created_at, c.resolved_at);
      return {
        id: c.id,
        customer: c.correlation_id ? `Case ${String(c.id).slice(0, 6)}` : "You",
        subject: c.title ?? "Support case",
        preview: c.description ?? "No description provided.",
        severity,
        status,
        owner: c.assigned_to ? "Assigned" : "Unassigned",
        linkedEntity: c.category && c.category !== "general" ? c.category : undefined,
        linkedType: c.category && c.category !== "general" ? "category" : undefined,
        createdAt: relative(c.created_at),
        createdAtISO: c.created_at,
        lastAction: evt?.lastEvent ? `${evt.lastEvent} ${evt.lastAt ? relative(evt.lastAt) : ""}`.trim() : (c.resolution ? "Resolved" : "New ticket"),
        responseCount: evt?.count ?? 0,
        slaHours: sla,
        hoursOpen: open,
      };
    });
  }, [casesQuery.data]);

  const metrics = useMemo(() => {
    const open = issues.filter((i) => i.status !== "resolved");
    const resolvedHrs = issues.filter((i) => i.status === "resolved").map((i) => i.hoursOpen);
    const avg = resolvedHrs.length ? resolvedHrs.reduce((a, b) => a + b, 0) / resolvedHrs.length : null;
    return {
      totalOpen: open.length,
      critical: issues.filter((i) => i.severity === "critical" && i.status !== "resolved").length,
      breached: issues.filter((i) => i.hoursOpen > i.slaHours && i.status !== "resolved").length,
      waitingOnUs: issues.filter((i) => i.status === "waiting-on-us").length,
      escalated: issues.filter((i) => i.status === "escalated").length,
      resolved: issues.filter((i) => i.status === "resolved").length,
      urgent: issues.filter((i) => (i.severity === "critical" || i.severity === "high") && i.status !== "resolved").length,
      avgResolutionHours: avg,
    };
  }, [issues]);

  return {
    issues,
    isLoading: userQuery.isLoading || casesQuery.isLoading,
    isError: !!casesQuery.error,
    isEmpty: !casesQuery.isLoading && issues.length === 0,
    error: (casesQuery.error as Error | null) ?? null,
    refetch: () => casesQuery.refetch(),
    metrics,
  };
}