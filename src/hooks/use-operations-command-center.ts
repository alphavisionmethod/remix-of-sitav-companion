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
    }> => {
      const [alertsRes, incidentsRes, slosRes] = await Promise.all([
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

      return { services, slos, alerts, incidents };
    },
  });
}