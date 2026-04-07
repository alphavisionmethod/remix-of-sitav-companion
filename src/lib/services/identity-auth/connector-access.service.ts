// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Access Service
// Manages external service connections (NOT sign-in identity)
// "What can SITA access on your behalf?"
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type {
  ConnectedServiceLink,
  ConnectedAccountView,
  ConnectorDisconnectionEvent,
  ConnectorDisconnectionEventInsert,
  PermissionUpgradeRequest,
  PermissionUpgradeRequestInsert,
} from "./types";

// ── Connected services ─────────────────────────────────────────
export async function getConnectedServices(): Promise<ConnectedServiceLink[]> {
  const { data, error } = await supabase
    .from("connected_service_links")
    .select("*, provider_families(name), provider_capabilities(display_name, capability_key)")
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function getConnectedServicesByStatus(status: string): Promise<ConnectedServiceLink[]> {
  const { data, error } = await supabase
    .from("connected_service_links")
    .select("*, provider_families(name), provider_capabilities(display_name, capability_key)")
    .eq("connection_status", status)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

// ── Connected accounts center view ─────────────────────────────
export async function getConnectedAccountsCenter(): Promise<ConnectedAccountView[]> {
  const { data, error } = await supabase
    .from("v_connected_accounts_center")
    .select("*");
  if (error) throw error;
  return (data ?? []) as unknown as ConnectedAccountView[];
}

// ── Disconnection events ───────────────────────────────────────
export async function logDisconnection(event: ConnectorDisconnectionEventInsert): Promise<void> {
  const { error } = await supabase
    .from("connector_disconnection_events")
    .insert(event);
  if (error) throw error;
}

export async function getDisconnectionHistory(limit = 50): Promise<ConnectorDisconnectionEvent[]> {
  const { data, error } = await supabase
    .from("connector_disconnection_events")
    .select("*, provider_families(name)")
    .order("disconnected_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Permission upgrade requests ────────────────────────────────
export async function requestPermissionUpgrade(
  request: PermissionUpgradeRequestInsert
): Promise<PermissionUpgradeRequest> {
  const { data, error } = await supabase
    .from("permission_upgrade_requests")
    .insert(request)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPendingUpgradeRequests(): Promise<PermissionUpgradeRequest[]> {
  const { data, error } = await supabase
    .from("permission_upgrade_requests")
    .select("*, connected_service_links(provider_families(name))")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
