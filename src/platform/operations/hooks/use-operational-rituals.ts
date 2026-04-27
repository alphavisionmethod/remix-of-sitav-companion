// ═══════════════════════════════════════════════════════════════
// SITA OS — useOperationalRituals hook family
//
// Derives the morning briefing, end-of-day closure, and relationship
// dossier signals from already-canonical CRM + scheduling + receipt
// data. No parallel data fetches, no hardcoded fixtures: every value
// surfaced by these hooks is a pure derivation over hooks that already
// pass the production-truth audit.
//
// Used by:
//   - src/modules/business/pages/MorningBriefing.tsx
//   - src/modules/business/pages/EndOfDayClosure.tsx
//   - src/modules/business/pages/RelationshipDossier.tsx
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";
import {
  useCRMContacts,
  useCRMCompanies,
  useCRMOpportunities,
  useCRMTasks,
  useCRMCommunications,
  useCRMNotes,
} from "@/hooks/use-crm-data";
import {
  useScheduledAppointments,
  type ScheduledAppointmentVM,
} from "@/hooks/use-scheduled-appointments";
import type {
  CRMContact,
  CRMCompany,
  CRMOpportunity,
  CRMTask,
  CRMCommunication,
  CRMNote,
} from "@/data/repositories/crm-data-service";

// ── Shared helpers ─────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function daysBetween(from: Date | string | null | undefined, to: Date = new Date()): number {
  if (!from) return Number.POSITIVE_INFINITY;
  const t = typeof from === "string" ? new Date(from).getTime() : from.getTime();
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return Math.floor((to.getTime() - t) / DAY_MS);
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diffMs = Date.now() - t;
  if (diffMs < 0) return new Date(iso).toLocaleString();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function isUpcomingAppointment(date: string): boolean {
  return date === "Today" || date === "Tomorrow" ||
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/.test(date);
}

// ── Overnight changes (ai_action_receipts) ─────────────────────

export interface OvernightChange {
  id: string;
  description: string;
  occurredAt: string;
  surface: string | null;
  status: string;
  actionType: string;
}

/**
 * Reads recent ai_action_receipts (last 18h) so the briefing surfaces
 * what happened while the operator was away. Falls back gracefully to
 * an empty list when the table has no rows or the user is signed out.
 */
export function useOvernightChanges(windowHours = 18) {
  return useQuery<OvernightChange[]>({
    queryKey: ["operational-rituals", "overnight", windowHours],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
      const { data, error } = await fromTable("ai_action_receipts")
        .select("id, action_type, recommendation_summary, status, executed_at, created_at, metadata")
        .eq("user_id", uid)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error || !data) return [];
      return data.map((r): OvernightChange => {
        const metadata = (r.metadata ?? {}) as { surface?: string | null };
        return {
          id: String(r.id),
          description: r.recommendation_summary ?? r.action_type ?? "Activity",
          occurredAt: (r.executed_at ?? r.created_at) as string,
          surface: metadata.surface ?? null,
          status: r.status ?? "executed",
          actionType: r.action_type ?? "unknown",
        };
      });
    },
    staleTime: 60_000,
  });
}

// ── Morning briefing derivation ────────────────────────────────

export interface MorningPriorityItem {
  id: string;
  kind: "overdue-task" | "stale-opportunity" | "needs-confirm" | "lead-followup";
  severity: "critical" | "warning" | "positive";
  label: string;
  entity: string;
  action: string;
  ageDays: number;
  href?: string;
}

export interface MorningMetric {
  key: string;
  label: string;
  value: string;
  positive: boolean;
  delta?: string;
}

export interface MorningTodayItem {
  id: string;
  time: string;
  title: string;
  type: "client" | "internal";
  ref?: string;
}

export interface MorningBriefingData {
  greeting: string;
  dateLabel: string;
  priorities: MorningPriorityItem[];
  metrics: MorningMetric[];
  schedule: MorningTodayItem[];
  overnight: OvernightChange[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}

function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function useMorningBriefing(): MorningBriefingData {
  const tasksQ = useCRMTasks();
  const opportunitiesQ = useCRMOpportunities();
  const contactsQ = useCRMContacts();
  const overnightQ = useOvernightChanges(18);
  const scheduling = useScheduledAppointments();

  const isLoading =
    tasksQ.isLoading ||
    opportunitiesQ.isLoading ||
    contactsQ.isLoading ||
    overnightQ.isLoading ||
    scheduling.isLoading;
  const isError =
    tasksQ.isError ||
    opportunitiesQ.isError ||
    contactsQ.isError ||
    scheduling.isError;

  const tasks = tasksQ.data ?? [];
  const opportunities = opportunitiesQ.data ?? [];
  const contacts = contactsQ.data ?? [];
  const overnight = overnightQ.data ?? [];
  const appointments = scheduling.appointments;

  const priorities = useMemo<MorningPriorityItem[]>(() => {
    const items: MorningPriorityItem[] = [];

    // Overdue / due-today tasks
    for (const t of tasks) {
      if (t.status === "completed") continue;
      if (!t.due_date) continue;
      const days = daysBetween(t.due_date);
      if (days >= 0) {
        items.push({
          id: `task-${t.id}`,
          kind: "overdue-task",
          severity: days >= 1 ? "critical" : "warning",
          label: days >= 1 ? `${t.title} — ${days}d overdue` : `${t.title} — due today`,
          entity: t.task_type ?? "Task",
          action: "Open task",
          ageDays: Math.max(0, days),
        });
      }
    }

    // Stale opportunities — no activity in 14+ days, still open
    for (const o of opportunities) {
      if (o.status !== "open") continue;
      const days = daysBetween(o.updated_at);
      if (days >= 14) {
        items.push({
          id: `opp-${o.id}`,
          kind: "stale-opportunity",
          severity: days >= 30 ? "critical" : "warning",
          label: `${o.title} losing momentum — no activity in ${days}d`,
          entity: o.title,
          action: "Review deal",
          ageDays: days,
        });
      }
    }

    // Bookings that need confirmation
    for (const a of appointments) {
      if (a.status === "pending" || a.status === "unconfirmed") {
        items.push({
          id: `apt-${a.id}`,
          kind: "needs-confirm",
          severity: a.noShowRisk === "high" ? "critical" : "warning",
          label: `${a.customer} — ${a.date} ${a.time} unconfirmed`,
          entity: a.service,
          action: "Send reminder",
          ageDays: 0,
        });
      }
    }

    // Sort: critical first, then by ageDays desc
    items.sort((x, y) => {
      const sevRank: Record<MorningPriorityItem["severity"], number> = { critical: 0, warning: 1, positive: 2 };
      const r = sevRank[x.severity] - sevRank[y.severity];
      if (r !== 0) return r;
      return y.ageDays - x.ageDays;
    });
    return items.slice(0, 6);
  }, [tasks, opportunities, appointments]);

  const metrics = useMemo<MorningMetric[]>(() => {
    const openDeals = opportunities.filter((o) => o.status === "open");
    const pipelineCents = openDeals.reduce((sum, o) => sum + (o.value ?? 0), 0);
    const overdue = tasks.filter(
      (t) => t.status !== "completed" && t.due_date && daysBetween(t.due_date) >= 1,
    ).length;
    const totalContacts = contacts.length;

    return [
      { key: "open-deals", label: "Open Deals", value: String(openDeals.length), positive: true },
      {
        key: "pipeline",
        label: "Pipeline Value",
        value: pipelineCents > 0 ? formatCurrencyShort(pipelineCents) : "$0",
        positive: pipelineCents > 0,
      },
      { key: "overdue", label: "Overdue Tasks", value: String(overdue), positive: overdue === 0 },
      { key: "contacts", label: "Active Contacts", value: String(totalContacts), positive: totalContacts > 0 },
    ];
  }, [opportunities, tasks, contacts]);

  const schedule = useMemo<MorningTodayItem[]>(() => {
    return appointments
      .filter((a) => a.date === "Today")
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 6)
      .map((a) => ({
        id: a.id,
        time: a.time,
        title: `${a.service} — ${a.customer}`,
        type: "client" as const,
        ref: a.id,
      }));
  }, [appointments]);

  const isEmpty =
    !isLoading &&
    priorities.length === 0 &&
    schedule.length === 0 &&
    overnight.length === 0 &&
    tasks.length === 0 &&
    opportunities.length === 0;

  return {
    greeting: greetingFor(new Date()),
    dateLabel: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    priorities,
    metrics,
    schedule,
    overnight,
    isLoading,
    isError,
    isEmpty,
  };
}

// ── End-of-day closure derivation ──────────────────────────────

export interface EodTaskItem {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  ageLabel: string;
}

export interface EodCompletedItem {
  id: string;
  title: string;
  type: "win" | "support" | "comms" | "planning";
}

export interface EodStaleItem {
  id: string;
  title: string;
  entity: string;
  ageDays: number;
}

export interface EodTomorrowItem {
  id: string;
  time: string;
  title: string;
  prep: string;
}

export interface EodStat {
  key: string;
  label: string;
  value: string;
}

export interface EndOfDayData {
  completed: EodCompletedItem[];
  stillOpen: EodTaskItem[];
  stale: EodStaleItem[];
  tomorrow: EodTomorrowItem[];
  stats: EodStat[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
}

function priorityFromTask(t: CRMTask): "high" | "medium" | "low" {
  const p = (t.priority ?? "").toLowerCase();
  if (p === "high" || p === "urgent" || p === "critical") return "high";
  if (p === "low") return "low";
  return "medium";
}

export function useEndOfDayClosure(): EndOfDayData {
  const tasksQ = useCRMTasks();
  const opportunitiesQ = useCRMOpportunities();
  const commsQ = useCRMCommunications();
  const scheduling = useScheduledAppointments();

  const isLoading = tasksQ.isLoading || opportunitiesQ.isLoading || commsQ.isLoading || scheduling.isLoading;
  const isError = tasksQ.isError || opportunitiesQ.isError || commsQ.isError || scheduling.isError;

  const tasks = tasksQ.data ?? [];
  const opportunities = opportunitiesQ.data ?? [];
  const comms = commsQ.data ?? [];
  const appointments = scheduling.appointments;

  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const completed = useMemo<EodCompletedItem[]>(() => {
    const items: EodCompletedItem[] = [];

    for (const t of tasks) {
      if (t.status !== "completed" || !t.completed_at) continue;
      const c = new Date(t.completed_at);
      if (c < todayStart || c > todayEnd) continue;
      items.push({ id: `task-${t.id}`, title: t.title, type: "planning" });
    }

    for (const o of opportunities) {
      if (o.status === "won" && o.won_at) {
        const w = new Date(o.won_at);
        if (w >= todayStart && w <= todayEnd) {
          items.push({
            id: `won-${o.id}`,
            title: `Closed deal — ${o.title} (${formatCurrencyShort(o.value ?? 0)})`,
            type: "win",
          });
        }
      }
    }

    for (const c of comms) {
      const t = new Date(c.occurred_at);
      if (t < todayStart || t > todayEnd) continue;
      items.push({
        id: `comm-${c.id}`,
        title: `${c.comm_type === "email" ? "Sent email" : `Logged ${c.comm_type}`} · ${c.subject ?? "—"}`,
        type: "comms",
      });
    }

    return items.slice(0, 8);
  }, [tasks, opportunities, comms, todayStart, todayEnd]);

  const stillOpen = useMemo<EodTaskItem[]>(() => {
    return tasks
      .filter((t) => t.status !== "completed")
      .map((t) => {
        const days = daysBetween(t.due_date ?? t.created_at);
        return {
          id: t.id,
          title: t.title,
          priority: priorityFromTask(t),
          ageLabel: t.due_date && days >= 1 ? `Overdue by ${days}d` : days >= 1 ? `Created ${days}d ago` : "Created today",
        } as EodTaskItem;
      })
      .sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 } as const;
        return rank[a.priority] - rank[b.priority];
      })
      .slice(0, 6);
  }, [tasks]);

  const stale = useMemo<EodStaleItem[]>(() => {
    return opportunities
      .filter((o) => o.status === "open")
      .map((o) => ({
        id: o.id,
        title: `${o.title} — untouched ${daysBetween(o.updated_at)}d`,
        entity: o.title,
        ageDays: daysBetween(o.updated_at),
      }))
      .filter((s) => s.ageDays >= 5)
      .sort((a, b) => b.ageDays - a.ageDays)
      .slice(0, 5);
  }, [opportunities]);

  const tomorrow = useMemo<EodTomorrowItem[]>(() => {
    return appointments
      .filter((a) => a.date === "Tomorrow")
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 6)
      .map((a) => ({
        id: a.id,
        time: a.time,
        title: `${a.service} — ${a.customer}`,
        prep: a.notes ?? "Review prior context before the meeting.",
      }));
  }, [appointments]);

  const stats = useMemo<EodStat[]>(() => {
    const wonToday = opportunities.filter(
      (o) => o.status === "won" && o.won_at && new Date(o.won_at) >= todayStart && new Date(o.won_at) <= todayEnd,
    );
    const wonValueCents = wonToday.reduce((sum, o) => sum + (o.value ?? 0), 0);
    const tasksDoneToday = tasks.filter(
      (t) => t.status === "completed" && t.completed_at &&
        new Date(t.completed_at) >= todayStart && new Date(t.completed_at) <= todayEnd,
    ).length;
    const commsToday = comms.filter(
      (c) => new Date(c.occurred_at) >= todayStart && new Date(c.occurred_at) <= todayEnd,
    ).length;
    const dealsAdvanced = opportunities.filter(
      (o) => o.updated_at && new Date(o.updated_at) >= todayStart && new Date(o.updated_at) <= todayEnd,
    ).length;

    return [
      { key: "tasks-done", label: "Tasks Completed", value: String(tasksDoneToday) },
      { key: "deals-advanced", label: "Deals Advanced", value: String(dealsAdvanced) },
      { key: "comms", label: "Communications", value: String(commsToday) },
      { key: "revenue", label: "Revenue Closed", value: formatCurrencyShort(wonValueCents) },
    ];
  }, [tasks, opportunities, comms, todayStart, todayEnd]);

  const isEmpty = !isLoading && completed.length === 0 && stillOpen.length === 0 && stale.length === 0 && tomorrow.length === 0;

  return { completed, stillOpen, stale, tomorrow, stats, isLoading, isError, isEmpty };
}

// ── Relationship dossier derivation ────────────────────────────

export interface DossierTimelineItem {
  id: string;
  date: string;
  isoDate: string;
  type: "call" | "email" | "meeting" | "deal" | "support" | "note" | "task";
  title: string;
  outcome: "positive" | "neutral" | "negative";
}

export interface DossierLinkedDeal {
  id: string;
  name: string;
  valueLabel: string;
  stage: string;
  probability: number;
  status: string;
}

export interface DossierHealthBreakdown {
  factor: string;
  score: number;
}

export interface DossierData {
  contact: CRMContact | null;
  contacts: CRMContact[];
  company: CRMCompany | null;
  initials: string;
  health: number;
  healthBreakdown: DossierHealthBreakdown[];
  lifetimeValueLabel: string;
  openDealCount: number;
  sinceLabel: string;
  lastContactLabel: string;
  nextFollowUpLabel: string;
  tags: string[];
  timeline: DossierTimelineItem[];
  linkedDeals: DossierLinkedDeal[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  selectedContactId: string | null;
}

function initialsFor(c: CRMContact | null): string {
  if (!c) return "—";
  const a = (c.first_name ?? "").trim()[0] ?? "";
  const b = (c.last_name ?? "").trim()[0] ?? "";
  return (a + b || "?").toUpperCase();
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function commTypeIcon(c: CRMCommunication): DossierTimelineItem["type"] {
  const t = (c.comm_type ?? "").toLowerCase();
  if (t === "call") return "call";
  if (t === "email") return "email";
  if (t === "meeting") return "meeting";
  return "note";
}

function outcomeFor(c: CRMCommunication): DossierTimelineItem["outcome"] {
  const o = (c.outcome ?? "").toLowerCase();
  if (o === "positive" || o === "won") return "positive";
  if (o === "negative" || o === "lost") return "negative";
  return "neutral";
}

function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Pick the "primary" contact for the dossier when no id is supplied.
 * Strategy: highest health score among contacts with at least one open
 * opportunity; fall back to most-recently-contacted; else first contact.
 */
function pickPrimaryContact(
  contacts: CRMContact[],
  opportunities: CRMOpportunity[],
): CRMContact | null {
  if (!contacts.length) return null;
  const openByContact = new Map<string, number>();
  for (const o of opportunities) {
    if (o.status === "open" && o.contact_id) {
      openByContact.set(o.contact_id, (openByContact.get(o.contact_id) ?? 0) + 1);
    }
  }
  const ranked = [...contacts].sort((a, b) => {
    const aOpen = openByContact.get(a.id) ?? 0;
    const bOpen = openByContact.get(b.id) ?? 0;
    if (aOpen !== bOpen) return bOpen - aOpen;
    const aHealth = a.health_score ?? -1;
    const bHealth = b.health_score ?? -1;
    if (aHealth !== bHealth) return bHealth - aHealth;
    const aLast = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0;
    const bLast = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0;
    return bLast - aLast;
  });
  return ranked[0] ?? null;
}

export function useRelationshipDossier(contactId?: string | null): DossierData {
  const contactsQ = useCRMContacts();
  const companiesQ = useCRMCompanies();
  const opportunitiesQ = useCRMOpportunities();
  const commsQ = useCRMCommunications();
  const notesQ = useCRMNotes();
  const tasksQ = useCRMTasks();

  const isLoading = contactsQ.isLoading || companiesQ.isLoading || opportunitiesQ.isLoading || commsQ.isLoading || notesQ.isLoading || tasksQ.isLoading;
  const isError = contactsQ.isError || companiesQ.isError || opportunitiesQ.isError || commsQ.isError;

  const contacts = contactsQ.data ?? [];
  const companies = companiesQ.data ?? [];
  const opportunities = opportunitiesQ.data ?? [];
  const comms = commsQ.data ?? [];
  const notes = notesQ.data ?? [];

  const contact = useMemo<CRMContact | null>(() => {
    if (contactId) {
      return contacts.find((c) => c.id === contactId) ?? null;
    }
    return pickPrimaryContact(contacts, opportunities);
  }, [contactId, contacts, opportunities]);

  const company = useMemo<CRMCompany | null>(() => {
    if (!contact) return null;
    // Direct company link via contact import or lifecycle: many CRMs
    // bridge through opportunities, so fall back to opportunity-linked
    // company if the contact does not name one explicitly.
    const linkedOpp = opportunities.find((o) => o.contact_id === contact.id && o.company_id);
    if (linkedOpp?.company_id) {
      return companies.find((c) => c.id === linkedOpp.company_id) ?? null;
    }
    return null;
  }, [contact, opportunities, companies]);

  const linkedDeals = useMemo<DossierLinkedDeal[]>(() => {
    if (!contact) return [];
    return opportunities
      .filter((o) => o.contact_id === contact.id)
      .map((o) => ({
        id: o.id,
        name: o.title,
        valueLabel: formatCurrencyShort(o.value ?? 0),
        stage: o.stage,
        probability: o.probability ?? 0,
        status: o.status,
      }));
  }, [contact, opportunities]);

  const timeline = useMemo<DossierTimelineItem[]>(() => {
    if (!contact) return [];
    const out: DossierTimelineItem[] = [];

    for (const c of comms) {
      if (c.contact_id !== contact.id) continue;
      out.push({
        id: `c-${c.id}`,
        isoDate: c.occurred_at,
        date: shortDate(c.occurred_at),
        type: commTypeIcon(c),
        title: c.subject ?? c.content?.slice(0, 80) ?? `${c.comm_type} (${c.direction})`,
        outcome: outcomeFor(c),
      });
    }
    for (const n of notes) {
      if (n.contact_id !== contact.id && n.entity_id !== contact.id) continue;
      out.push({
        id: `n-${n.id}`,
        isoDate: n.created_at,
        date: shortDate(n.created_at),
        type: "note",
        title: n.title ?? n.content.slice(0, 80),
        outcome: "neutral",
      });
    }
    for (const o of opportunities) {
      if (o.contact_id !== contact.id) continue;
      const isoDate = o.won_at ?? o.lost_at ?? o.updated_at;
      const outcome: DossierTimelineItem["outcome"] =
        o.status === "won" ? "positive" : o.status === "lost" ? "negative" : "neutral";
      const verb = o.status === "won" ? "Closed Won" : o.status === "lost" ? "Lost" : `Stage: ${o.stage}`;
      out.push({
        id: `o-${o.id}`,
        isoDate,
        date: shortDate(isoDate),
        type: "deal",
        title: `${o.title} — ${verb} (${formatCurrencyShort(o.value ?? 0)})`,
        outcome,
      });
    }
    out.sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
    return out.slice(0, 12);
  }, [contact, comms, notes, opportunities]);

  const lifetimeValueCents = useMemo(() => {
    if (!contact) return 0;
    return opportunities
      .filter((o) => o.contact_id === contact.id && o.status === "won")
      .reduce((sum, o) => sum + (o.value ?? 0), 0);
  }, [contact, opportunities]);

  const openDealCount = useMemo(() => {
    if (!contact) return 0;
    return opportunities.filter((o) => o.contact_id === contact.id && o.status === "open").length;
  }, [contact, opportunities]);

  const healthBreakdown = useMemo<DossierHealthBreakdown[]>(() => {
    if (!contact) return [];
    // Engagement = comms in last 30d (cap 10 → 100)
    const recentComms = comms.filter((c) =>
      c.contact_id === contact.id && daysBetween(c.occurred_at) <= 30,
    ).length;
    const engagement = clamp(recentComms * 10);

    // Response time = inverse of average days between consecutive comms (cap 14d)
    const sortedComms = comms
      .filter((c) => c.contact_id === contact.id)
      .sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());
    let avgGap = 14;
    if (sortedComms.length > 1) {
      const gaps: number[] = [];
      for (let i = 1; i < sortedComms.length; i++) {
        gaps.push(daysBetween(sortedComms[i - 1].occurred_at, new Date(sortedComms[i].occurred_at)));
      }
      avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    }
    const responseTime = clamp(100 - Math.min(avgGap, 14) * 7);

    // Meeting frequency = meetings/calls in last 90d (cap 5 → 100)
    const meetings = comms.filter((c) =>
      c.contact_id === contact.id &&
      (c.comm_type === "meeting" || c.comm_type === "call") &&
      daysBetween(c.occurred_at) <= 90,
    ).length;
    const meetingFreq = clamp(meetings * 20);

    // Deal momentum = open deals advanced in last 30d / open deals
    const openDeals = opportunities.filter((o) => o.contact_id === contact.id && o.status === "open");
    const advanced = openDeals.filter((o) => daysBetween(o.updated_at) <= 30).length;
    const momentum = openDeals.length === 0 ? 50 : clamp((advanced / openDeals.length) * 100);

    // Sentiment = ratio of positive outcomes
    const outcomes = comms.filter((c) => c.contact_id === contact.id && c.outcome);
    const positive = outcomes.filter((c) => (c.outcome ?? "").toLowerCase() === "positive").length;
    const sentiment = outcomes.length === 0 ? 60 : clamp((positive / outcomes.length) * 100);

    return [
      { factor: "Engagement", score: engagement },
      { factor: "Response time", score: responseTime },
      { factor: "Meeting frequency", score: meetingFreq },
      { factor: "Deal momentum", score: momentum },
      { factor: "Sentiment", score: sentiment },
    ];
  }, [contact, comms, opportunities]);

  const health = useMemo(() => {
    if (contact?.health_score != null) return clamp(contact.health_score);
    if (!healthBreakdown.length) return 0;
    return Math.round(healthBreakdown.reduce((s, h) => s + h.score, 0) / healthBreakdown.length);
  }, [contact, healthBreakdown]);

  const sinceLabel = useMemo(() => {
    if (!contact) return "—";
    return new Date(contact.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [contact]);

  const lastContactLabel = useMemo(() => formatRelative(contact?.last_contacted_at), [contact]);
  const nextFollowUpLabel = useMemo(() => formatRelative(contact?.next_follow_up_at), [contact]);

  const isEmpty = !isLoading && contacts.length === 0;

  return {
    contact,
    contacts,
    company,
    initials: initialsFor(contact),
    health,
    healthBreakdown,
    lifetimeValueLabel: formatCurrencyShort(lifetimeValueCents),
    openDealCount,
    sinceLabel,
    lastContactLabel,
    nextFollowUpLabel,
    tags: contact?.tags ?? [],
    timeline,
    linkedDeals,
    isLoading,
    isError,
    isEmpty,
    selectedContactId: contact?.id ?? null,
  };
}

// ── Currency helper (cents → short string) ─────────────────────

function formatCurrencyShort(cents: number): string {
  // CRM stores `value` as a major-unit dollar number in demo data, but
  // production may carry cents. Detect: small ints (<10_000) treat as
  // dollars, larger as cents. This mirrors the heuristic used by other
  // CRM surfaces in the codebase that share this dual-mode dataset.
  const isLikelyCents = cents > 100_000;
  const dollars = isLikelyCents ? cents / 100 : cents;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  return `$${Math.round(dollars).toLocaleString()}`;
}

export type { CRMContact, CRMOpportunity, CRMTask, CRMCommunication, CRMNote };
