// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Provider Family Service
// Canonical service for Google identity + connector separation
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type {
  GoogleProviderFamilyState,
  GoogleIdentityState,
  GoogleConnectorState,
  GoogleOAuthClientInfo,
  GoogleScopePolicyEntry,
  GoogleLaunchHonestyEntry,
  GoogleCapabilityKey,
  GoogleRealityMode,
} from "./types";

// ── Provider Family State ────────────────────────────────────

const EMPTY_IDENTITY: GoogleIdentityState = {
  signedInWithGoogle: false,
  email: null,
  primaryIdentity: false,
  linkId: null,
  providerFamilyId: null,
  launchStage: "alpha",
};

const EMPTY_STATE: GoogleProviderFamilyState = {
  familyId: null,
  familyName: "Google",
  providerKey: "google",
  launchStage: "alpha",
  identity: EMPTY_IDENTITY,
  connectors: [],
  oauthClients: [],
  scopePolicies: [],
  launchHonesty: [],
  realityMode: "real",
  loaded: false,
};

/**
 * Fetch the complete Google Provider Family state.
 * This aggregates identity, connectors, OAuth clients, scopes, and launch honesty.
 */
export async function getGoogleProviderFamilyState(
  realityMode: GoogleRealityMode = "real"
): Promise<GoogleProviderFamilyState> {
  try {
    // 1. Get the Google provider family
    const { data: family } = await supabase
      .from("provider_families")
      .select("id, provider_key, name, launch_stage, active")
      .eq("provider_key", "google")
      .maybeSingle();

    if (!family) return { ...EMPTY_STATE, realityMode };

    // 2. Parallel fetches
    const [identityResult, connectorsResult, clientsResult, policiesResult, honestyResult] =
      await Promise.all([
        fetchGoogleIdentity(family.id),
        fetchGoogleConnectors(family.id, realityMode),
        fetchGoogleOAuthClients(family.id),
        fetchGoogleScopePolicies(family.id),
        fetchGoogleLaunchHonesty(family.id),
      ]);

    return {
      familyId: family.id,
      familyName: "Google",
      providerKey: "google",
      launchStage: (family.launch_stage || "alpha") as never,
      identity: identityResult,
      connectors: connectorsResult,
      oauthClients: clientsResult,
      scopePolicies: policiesResult,
      launchHonesty: honestyResult,
      realityMode,
      loaded: true,
    };
  } catch (err) {
    console.error("[GoogleProviderFamily] Failed to load state:", err);
    return { ...EMPTY_STATE, realityMode };
  }
}

// ── Identity ─────────────────────────────────────────────────

async function fetchGoogleIdentity(familyId: string): Promise<GoogleIdentityState> {
  const { data: link } = await supabase
    .from("identity_provider_links")
    .select("id, email, primary_identity, active, auth_method")
    .eq("provider_family_id", familyId)
    .maybeSingle();

  if (!link) return { ...EMPTY_IDENTITY, providerFamilyId: familyId };

  return {
    signedInWithGoogle: link.active ?? false,
    email: link.email,
    primaryIdentity: link.primary_identity ?? false,
    linkId: link.id,
    providerFamilyId: familyId,
    launchStage: "alpha",
  };
}

// ── Connectors ───────────────────────────────────────────────

async function fetchGoogleConnectors(
  familyId: string,
  mode: GoogleRealityMode
): Promise<GoogleConnectorState[]> {
  const { data: capabilities } = await supabase
    .from("provider_capabilities")
    .select("id, capability_key, display_name, category, launch_stage, sync_support, health_support, upgrade_path_support")
    .eq("provider_family_id", familyId)
    .neq("category", "identity")
    .order("capability_key");

  if (!capabilities?.length) return [];

  // Get connected service links for these capabilities
  const capIds = capabilities.map((c: any) => c.id);
  const { data: services } = await supabase
    .from("connected_service_links")
    .select("*")
    .in("provider_capability_id", capIds);

  return capabilities.map((cap: any): GoogleConnectorState => ({
    capabilityKey: cap.capability_key as GoogleCapabilityKey,
    displayName: cap.display_name,
    connectionStatus: (svc => svc?.connection_status ?? "disconnected")(services?.find((s: any) => s.provider_capability_id === cap.id)) as never,
    healthStatus: (svc => svc?.health_status ?? "unknown")(services?.find((s: any) => s.provider_capability_id === cap.id)) as never,
    permissionLevel: (svc => svc?.permission_level ?? "minimal")(services?.find((s: any) => s.provider_capability_id === cap.id)) as never,
    grantedScopes: services?.find((s: any) => s.provider_capability_id === cap.id)?.granted_scopes ?? [],
    reauthNeeded: services?.find((s: any) => s.provider_capability_id === cap.id)?.reauth_needed ?? false,
    lastSyncAt: services?.find((s: any) => s.provider_capability_id === cap.id)?.last_sync_at ?? null,
    mode,
    launchStage: (cap.launch_stage ?? "planned") as never,
    upgradeAvailable: cap.upgrade_path_support ?? false,
    serviceAccountId: services?.find((s: any) => s.provider_capability_id === cap.id)?.id ?? null,
  }));
}

// ── OAuth Clients ────────────────────────────────────────────

async function fetchGoogleOAuthClients(familyId: string): Promise<GoogleOAuthClientInfo[]> {
  const { data: clients } = await supabase
    .from("oauth_client_registry")
    .select("id, client_name, client_purpose, allowed_capabilities, environment, launch_stage, active")
    .eq("provider_family_id", familyId)
    .order("client_name");

  return (clients ?? []).map((c: any) => ({
    id: c.id,
    clientName: c.client_name,
    purpose: c.client_purpose,
    allowedCapabilities: c.allowed_capabilities ?? [],
    environment: c.environment ?? "production",
    launchStage: c.launch_stage ?? "planned",
    active: c.active ?? true,
  }));
}

// ── Scope Policies ───────────────────────────────────────────

async function fetchGoogleScopePolicies(familyId: string): Promise<GoogleScopePolicyEntry[]> {
  const { data: policies } = await supabase
    .from("scope_policy_matrix")
    .select("*, provider_capabilities(capability_key, display_name)")
    .order("created_at");

  // Filter to Google capabilities only
  const googleKeys = new Set(["google_identity", "google_drive", "google_gmail", "google_calendar", "google_docs", "google_contacts", "google_tasks"]);
  
  return (policies ?? [])
    .filter((p: any) => googleKeys.has(p.provider_capabilities?.capability_key))
    .map((p: any) => ({
      capabilityKey: p.provider_capabilities?.capability_key,
      displayName: p.provider_capabilities?.display_name ?? "",
      minimumScopes: p.minimum_scopes ?? [],
      optionalScopes: p.optional_scopes ?? [],
      disallowedScopes: p.disallowed_scopes ?? [],
      defaultGrantProfile: p.default_grant_profile ?? "read_only",
      upgradePathAvailable: p.upgrade_path_available ?? false,
      approvalRequired: p.approval_required_for_upgrade ?? false,
    }));
}

// ── Launch Honesty ───────────────────────────────────────────

async function fetchGoogleLaunchHonesty(familyId: string): Promise<GoogleLaunchHonestyEntry[]> {
  const { data: entries } = await supabase
    .from("integration_launch_honesty")
    .select("*, provider_capabilities(capability_key, display_name)")
    .eq("provider_family_id", familyId);

  return (entries ?? []).map((e: any) => ({
    capabilityKey: e.provider_capabilities?.capability_key ?? "unknown",
    displayName: e.provider_capabilities?.display_name ?? "",
    launchLabel: e.launch_label ?? "unknown",
    blockers: e.blockers ?? [],
    publicClaimSafe: (e.blockers ?? []).length === 0,
    qualifierRequired: e.launch_label !== "production",
  }));
}

// ── Consent Ledger ───────────────────────────────────────────

export async function getGoogleConsentHistory(): Promise<any[]> {
  const { data } = await supabase
    .from("consent_ledger")
    .select("*, provider_families(name, provider_key)")
    .order("created_at", { ascending: false })
    .limit(50);
  
  return (data ?? []).filter((c: any) => c.provider_families?.provider_key === "google");
}

// ── Validation Helpers ───────────────────────────────────────

/** Check if Google Sign-In implies any connector access */
export function doesIdentityImplyConnector(): false {
  return false; // NEVER. This is the core architectural rule.
}

/** Determine which OAuth client should be used for a capability */
export function resolveOAuthClient(
  capability: GoogleCapabilityKey,
  clients: GoogleOAuthClientInfo[]
): GoogleOAuthClientInfo | null {
  return clients.find((c) =>
    c.allowedCapabilities.includes(capability) && c.active
  ) ?? null;
}

/** Check if a scope tier upgrade is safe */
export function isScopeUpgradeSafe(
  policy: GoogleScopePolicyEntry,
  requestedScopes: string[]
): { safe: boolean; blocked: string[]; needsApproval: boolean } {
  const blocked = requestedScopes.filter((s) =>
    policy.disallowedScopes.includes(s)
  );
  return {
    safe: blocked.length === 0,
    blocked,
    needsApproval: policy.approvalRequired,
  };
}

