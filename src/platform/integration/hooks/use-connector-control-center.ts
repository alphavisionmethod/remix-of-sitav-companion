// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Control Center data hook
// Wires real connector_registry + connector_accounts +
// connector_sync_runs + connector_receipts into one normalized
// view-model for /atlas/connectors.
// ═══════════════════════════════════════════════════════════════
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export interface ConnectorRow {
  id: string;
  connector_id: string;
  name: string;
  status: "active" | "error" | "paused" | "disabled" | "registered";
  health: number;
  capabilities: string[];
  enterprise: boolean;
  approvalRequired: boolean;
  failureCount: number;
  syncStatus: string;
  lastSync: string | null;
  lifecycleState: string;
  auditEntries: number;
}

export interface AuditEntry {
  receiptId: string;
  connector: string;
  action: string;
  actor: string;
  time: string;
}

export function useConnectorControlCenter() {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  return useQuery({
    queryKey: ["connector-control-center", uid],
    queryFn: async (): Promise<{
      connectors: ConnectorRow[];
      auditTimeline: AuditEntry[];
    }> => {
      const { data: registry = [] } = await fromTable("connector_registry")
        .select("id, connector_id, display_name, connector_class, launch_stage, default_scopes, read_supported, write_supported")
        .order("display_name");

      const { data: accounts = [] } = uid
        ? await fromTable("connector_accounts")
          .select("id, registry_id, status, last_sync_at, failure_count")
          .eq("user_id", uid)
        : { data: [] };

      const { data: receipts = [] } = await fromTable("connector_receipts")
        .select("id, connector_id, action, actor_user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      const accountByRegistry = new Map<string, any>();
      (accounts ?? []).forEach((a: any) => accountByRegistry.set(a.registry_id, a));

      const connectors: ConnectorRow[] = (registry ?? []).map((r: any) => {
        const acc = accountByRegistry.get(r.id);
        const failureCount = acc?.failure_count ?? 0;
        const status: ConnectorRow["status"] = !acc
          ? "registered"
          : acc.status === "error"
            ? "error"
            : acc.status === "paused"
              ? "paused"
              : acc.status === "disabled"
                ? "disabled"
                : "active";
        const health = !acc ? 0 : status === "active" ? Math.max(0, 100 - failureCount * 5) : status === "error" ? 0 : 60;
        const caps: string[] = [];
        if (r.read_supported) caps.push("read");
        if (r.write_supported) caps.push("write");
        (r.default_scopes ?? []).slice(0, 3).forEach((s: string) => caps.push(s));
        return {
          id: r.id,
          connector_id: r.connector_id,
          name: r.display_name,
          status,
          health,
          capabilities: caps,
          enterprise: r.launch_stage === "ga",
          approvalRequired: !!r.write_supported,
          failureCount,
          syncStatus: acc?.status ?? "not connected",
          lastSync: acc?.last_sync_at ?? null,
          lifecycleState: status === "registered" ? "registered" : status === "active" ? "active" : status === "paused" ? "paused" : status === "error" ? "error" : "configured",
          auditEntries: 0,
        };
      });

      const auditTimeline: AuditEntry[] = (receipts ?? []).map((r: any) => ({
        receiptId: r.id.slice(0, 8),
        connector: r.connector_id,
        action: r.action,
        actor: r.actor_user_id ? "user" : "system",
        time: r.created_at,
      }));

      return { connectors, auditTimeline };
    },
  });
}