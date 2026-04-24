// ═══════════════════════════════════════════════════════════════
// SITA OS — Operations Command Center data hook
// Wires alerts, incidents, internal_agent_slo_snapshots into
// services/SLOs/alerts/incidents view-model for /atlas/operations.
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export interface ServiceRow {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  latency: number;
  lastCheck: string;
}

export interface SloRow {
  name: string;
  target: number;
  current: number;
  budget: number;
  burnRate: number;
  unit?: string;
  window: string;
}

export interface AlertRow {
  id: string;
  title: string;
  source: string;
  severity: string;
  acknowledged: boolean;
  runbookId: string | null;
  time: string;
}

export interface IncidentRow {
  id: string;
  title: string;
  severity: string;
  status: string;
  assignee: string;
  started: string;
}

export interface RunbookRow {
  id: string;
  name: string;
  steps: number;
  domain: string;
  severity: string;
  status: string;
  autoHeal: boolean;
  executions: number;
  lastUsed: string | null;
}

export interface QueueRow {
  name: string;
  owner: string;
  depth: number;
  lagMs: number;
  pressure: "none" | "low" | "medium" | "high";
  capturedAt: string;
}

const SYSTEM_RUNBOOK_OWNER = "00000000-0000-0000-0000-000000000000";

export function useOperationsCommandCenter() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  return useQuery({
    queryKey: ["operations-command-center", uid],
    queryFn: async (): Promise<{
      services: ServiceRow[];
      slos: SloRow[];
      alerts: AlertRow[];
      incidents: IncidentRow[];
      runbooks: RunbookRow[];
      queues: QueueRow[];
    }> => {
      const [alertsRes, incidentsRes, slosRes, runbooksRes] = await Promise.all([
        fromTable("alerts")
          .select("id, title, source, subsystem, severity, status, runbook_id, ack_at, last_seen_at")
          .eq("status", "active")
          .order("last_seen_at", { ascending: false })
          .limit(100),
        uid
          ? fromTable("incidents")
            .select("id, title, severity, status, owner_user_id, created_at")
            .eq("user_id", uid)
            .neq("status", "resolved")
            .order("created_at", { ascending: false })
            .limit(50)
          : Promise.resolve({ data: [] }),
        fromTable("internal_agent_slo_snapshots")
          .select("agent_id, slo_name, target, current, budget_remaining, burn_rate, window, captured_at")
          .order("captured_at", { ascending: false })
          .limit(50),
        fromTable("platform_runbooks")
          .select("id, title, steps, domain, severity, status, auto_heal_enabled, execution_count, last_executed_at, user_id")
          .or(`user_id.eq.${SYSTEM_RUNBOOK_OWNER}${uid ? `,user_id.eq.${uid}` : ""}`)
          .order("severity", { ascending: true })
          .limit(50),
      ]);

      const alerts: AlertRow[] = ((alertsRes as any).data ?? []).map((a: any) => ({
        id: a.id,
        title: a.title,
        source: a.source ?? a.subsystem ?? "system",
        severity: a.severity,
        acknowledged: !!a.ack_at,
        runbookId: a.runbook_id ?? null,
        time: a.last_seen_at,
      }));

      const incidents: IncidentRow[] = ((incidentsRes as any).data ?? []).map((i: any) => ({
        id: i.id,
        title: i.title,
        severity: i.severity,
        status: i.status,
        assignee: i.owner_user_id ? "assigned" : "unassigned",
        started: i.created_at,
      }));

      // Derive services: latest snapshot per agent_id
      const serviceMap = new Map<string, any>();
      ((slosRes as any).data ?? []).forEach((row: any) => {
        if (!serviceMap.has(row.agent_id)) serviceMap.set(row.agent_id, row);
      });
      const services: ServiceRow[] = Array.from(serviceMap.values()).map((row: any) => ({
        name: row.agent_id,
        status: row.budget_remaining > 50 ? "healthy" : row.budget_remaining > 10 ? "degraded" : "down",
        uptime: Math.max(0, Math.min(100, row.current ?? 99)),
        latency: Math.round((row.burn_rate ?? 1) * 100),
        lastCheck: row.captured_at,
      }));

      const slos: SloRow[] = ((slosRes as any).data ?? []).slice(0, 12).map((row: any) => ({
        name: `${row.agent_id} — ${row.slo_name}`,
        target: Number(row.target ?? 99),
        current: Number(row.current ?? 0),
        budget: Math.round(Number(row.budget_remaining ?? 0)),
        burnRate: Number(row.burn_rate ?? 0),
        window: row.window ?? "30d",
      }));

      const runbooks: RunbookRow[] = ((runbooksRes as any).data ?? []).map((r: any) => ({
        id: r.id,
        name: r.title,
        steps: Array.isArray(r.steps) ? r.steps.length : 0,
        domain: r.domain ?? "platform",
        severity: r.severity ?? "info",
        status: r.status ?? "draft",
        autoHeal: !!r.auto_heal_enabled,
        executions: r.execution_count ?? 0,
        lastUsed: r.last_executed_at ?? null,
      }));

      // Derive queue depths from SLO snapshots tagged as queue_*_depth / queue_*_lag.
      const queueAgg = new Map<string, { depth: number; lagMs: number; capturedAt: string; owner: string }>();
      ((slosRes as any).data ?? []).forEach((row: any) => {
        const sloName: string = row.slo_name ?? "";
        const match = sloName.match(/^queue_(.+?)_(depth|lag_ms)$/);
        if (!match) return;
        const [, queueKey, kind] = match;
        const existing = queueAgg.get(queueKey) ?? {
          depth: 0,
          lagMs: 0,
          capturedAt: row.captured_at,
          owner: row.agent_id ?? "platform",
        };
        if (kind === "depth") existing.depth = Math.round(Number(row.current ?? 0));
        if (kind === "lag_ms") existing.lagMs = Math.round(Number(row.current ?? 0));
        if (!existing.capturedAt || row.captured_at > existing.capturedAt) existing.capturedAt = row.captured_at;
        existing.owner = row.agent_id ?? existing.owner;
        queueAgg.set(queueKey, existing);
      });
      const queues: QueueRow[] = Array.from(queueAgg.entries()).map(([key, v]) => {
        const pressure: QueueRow["pressure"] =
          v.depth === 0 && v.lagMs < 50
            ? "none"
            : v.depth < 25 && v.lagMs < 250
              ? "low"
              : v.depth < 100 && v.lagMs < 1000
                ? "medium"
                : "high";
        return {
          name: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          owner: v.owner,
          depth: v.depth,
          lagMs: v.lagMs,
          pressure,
          capturedAt: v.capturedAt,
        };
      });

      return { services, slos, alerts, incidents, runbooks, queues };
    },
  });
}