// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Truth Service
// OAuth flow tracking, sync engine, health monitoring
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface OAuthFlowRecord {
  id: string;
  connector_key: string;
  provider_name: string;
  flow_type: string;
  status: string;
  scopes_requested: string[];
  scopes_granted: string[];
  callback_received: boolean;
  token_obtained: boolean;
  token_expires_at: string | null;
  last_refresh_at: string | null;
  refresh_count: number;
  error_message: string | null;
  created_at: string;
}

export interface SyncJobRecord {
  id: string;
  connector_key: string;
  sync_type: string;
  status: string;
  schedule_cron: string | null;
  last_sync_at: string | null;
  next_sync_at: string | null;
  records_synced: number;
  records_failed: number;
  conflict_resolution: string;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export async function getOAuthFlows(): Promise<OAuthFlowRecord[]> {
  const { data, error } = await supabase
    .from("connector_oauth_flows")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ConnectorTruth] OAuth flows error:", error);
    return [];
  }
  return (data ?? []) as never as OAuthFlowRecord[];
}

export async function getSyncJobs(): Promise<SyncJobRecord[]> {
  const { data, error } = await supabase
    .from("connector_sync_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ConnectorTruth] Sync jobs error:", error);
    return [];
  }
  return (data ?? []) as never as SyncJobRecord[];
}

export async function createOAuthFlow(
  userId: string,
  connectorKey: string,
  providerName: string,
  scopesRequested: string[]
): Promise<string | null> {
  const { data, error } = await supabase
    .from("connector_oauth_flows")
    .insert({
      user_id: userId,
      connector_key: connectorKey,
      provider_name: providerName,
      scopes_requested: scopesRequested,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[ConnectorTruth] Create flow error:", error);
    return null;
  }
  return data?.id ?? null;
}

export async function createSyncJob(
  userId: string,
  connectorKey: string,
  syncType: string = "full"
): Promise<string | null> {
  const { data, error } = await supabase
    .from("connector_sync_jobs")
    .insert({
      user_id: userId,
      connector_key: connectorKey,
      sync_type: syncType,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[ConnectorTruth] Create sync job error:", error);
    return null;
  }
  return data?.id ?? null;
}

export function getConnectorTruthIndex(
  oauthFlows: OAuthFlowRecord[],
  syncJobs: SyncJobRecord[]
): number {
  if (oauthFlows.length === 0 && syncJobs.length === 0) return 0;

  let score = 0;
  const connectors = new Set([
    ...oauthFlows.map(f => f.connector_key),
    ...syncJobs.map(j => j.connector_key),
  ]);

  for (const key of connectors) {
    const flows = oauthFlows.filter(f => f.connector_key === key);
    const jobs = syncJobs.filter(j => j.connector_key === key);

    let connScore = 0;
    if (flows.length > 0) connScore += 25; // has oauth flow architecture
    if (flows.some(f => f.token_obtained)) connScore += 25; // has obtained token
    if (jobs.length > 0) connScore += 25; // has sync architecture
    if (jobs.some(j => j.status === "completed")) connScore += 25; // has completed sync
    score += connScore;
  }

  return Math.round(score / connectors.size);
}

