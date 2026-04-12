import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

export interface ConnectorHealthStatus {
  connectorId: string;
  service: string;
  status: "up" | "down" | "degraded" | "unknown";
  lastChecked: string;
  latencyMs?: number;
  error?: string;
}

export interface ConnectorHealthResult {
  connectors: ConnectorHealthStatus[];
  overallHealth: "healthy" | "degraded" | "critical";
  checkedAt: string;
}

let cachedResult: ConnectorHealthResult | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

export async function fetchConnectorHealth(): Promise<ConnectorHealthResult> {
  const now = Date.now();
  if (cachedResult && now < cacheExpiry) return cachedResult;

  try {
    const { data, error } = await db.functions.invoke("connector-health", {
      method: "GET",
    });

    if (error) throw error;

    const connectors: ConnectorHealthStatus[] = (data?.connectors || []).map((c: any) => ({
      connectorId: c.id || c.connectorId,
      service: c.service,
      status: c.status === "active" ? "up" : c.status === "error" ? "down" : "degraded",
      lastChecked: c.lastChecked || new Date().toISOString(),
      latencyMs: c.latencyMs,
      error: c.error,
    }));

    const downCount = connectors.filter((c: any) => c.status === "down").length;
    const degradedCount = connectors.filter((c: any) => c.status === "degraded").length;
    const overallHealth = downCount > 0 ? "critical" : degradedCount > 0 ? "degraded" : "healthy";

    cachedResult = { connectors, overallHealth, checkedAt: new Date().toISOString() };
    cacheExpiry = now + CACHE_TTL_MS;
    return cachedResult;
  } catch (e) {
    const { data: configs } = await fromDynamicTable("connector_configs").select("id, service, status, last_sync_at");

    const connectors: ConnectorHealthStatus[] = (configs || []).map((c: any) => ({
      connectorId: c.id,
      service: c.service,
      status: c.status === "active" ? "up" : c.status === "error" ? "down" : "degraded",
      lastChecked: c.last_sync_at || new Date().toISOString(),
    }));

    const downCount = connectors.filter((c: any) => c.status === "down").length;
    const degradedCount = connectors.filter((c: any) => c.status === "degraded").length;
    const overallHealth = downCount > 0 ? "critical" : degradedCount > 0 ? "degraded" : "healthy";

    cachedResult = { connectors, overallHealth, checkedAt: new Date().toISOString() };
    cacheExpiry = now + CACHE_TTL_MS;
    return cachedResult;
  }
}

export function clearConnectorHealthCache() {
  cachedResult = null;
  cacheExpiry = 0;
}

