// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Provider Family Service
// Canonical service for Google identity + connector separation
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;
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
    const { data: family } = await db.from("provider_families")
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
  const { data: link } = await db.from("identity_provider_links")
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
  const { data: capabilities } = await db.from("provider_capabilities")
    .select("id, capability_key, display_name, category, launch_stage, sync_support, health_support, upgrade_path_support")
    .eq("provider_family_id", familyId)
    .neq("category", "identity")
    .order("capability_key");

  if (!capabilities?.length) return [];

  // Get connected service links for these capabilities
  const capIds = capabilities.map((c: Record<string, unknown>) => c.id as string);
  const { data: services } = await db.from("connected_service_links")
    .select("*")
    .in("provider_capability_id", capIds);

  type SvcRecord = Record<string, unknown>;
  const findSvc = (capId: unknown) => services?.find((s: SvcRecord) => s.provider_capability_id === capId);

  return capabilities.map((cap: Record<string, unknown>): GoogleConnectorState => {
    const svc = findSvc(cap.id);
    return {
      capabilityKey: cap.capability_key as GoogleCapabilityKey,
      displayName: String(cap.display_name ?? ""),
      connectionStatus: (svc?.connection_status ?? "disconnected") as GoogleConnectorState["connectionStatus"],
      healthStatus: (svc?.health_status ?? "unknown") as GoogleConnectorState["healthStatus"],
      permissionLevel: (svc?.permission_level ?? "minimal") as GoogleConnectorState["permissionLevel"],
      grantedScopes: (svc?.granted_scopes as string[]) ?? [],
      reauthNeeded: (svc?.reauth_needed as boolean) ?? false,
      lastSyncAt: (svc?.last_sync_at as string) ?? null,
      mode,
      launchStage: (cap.launch_stage ?? "planned") as GoogleConnectorState["launchStage"],
      upgradeAvailable: (cap.upgrade_path_support as boolean) ?? false,
      serviceAccountId: (svc?.id as string) ?? null,
    };
  });
}

// ── OAuth Clients ────────────────────────────────────────────

async function fetchGoogleOAuthClients(familyId: string): Promise<GoogleOAuthClientInfo[]> {
  const { data: clients } = await db.from("oauth_client_registry")
    .select("id, client_name, client_purpose, allowed_capabilities, environment, launch_stage, active")
    .eq("provider_family_id", familyId)
    .order("client_name");

  return (clients ?? []).map((c: Record<string, unknown>): GoogleOAuthClientInfo => ({
    id: c.id as string,
    clientName: c.client_name as string,
    purpose: c.client_purpose as GoogleOAuthClientInfo["purpose"],
    allowedCapabilities: (c.allowed_capabilities as GoogleCapabilityKey[]) ?? [],
    environment: (c.environment as string) ?? "production",
    launchStage: (c.launch_stage ?? "planned") as GoogleOAuthClientInfo["launchStage"],
    active: (c.active as boolean) ?? true,
  }));
}

// ── Scope Policies ───────────────────────────────────────────

async function fetchGoogleScopePolicies(familyId: string): Promise<GoogleScopePolicyEntry[]> {
  const { data: policies } = await db.from("scope_policy_matrix")
    .select("*, provider_capabilities(capability_key, display_name)")
    .order("created_at");

  // Filter to Google capabilities only
  const googleKeys = new Set(["google_identity", "google_drive", "google_gmail", "google_calendar", "google_docs", "google_contacts", "google_tasks"]);
  
  type PolicyRecord = Record<string, unknown> & { provider_capabilities?: { capability_key?: string; display_name?: string } };
  return (policies ?? [])
    .filter((p: PolicyRecord) => googleKeys.has(p.provider_capabilities?.capability_key ?? ""))
    .map((p: PolicyRecord): GoogleScopePolicyEntry => ({
      capabilityKey: (p.provider_capabilities?.capability_key ?? "") as GoogleCapabilityKey,
      displayName: p.provider_capabilities?.display_name ?? "",
      minimumScopes: (p.minimum_scopes as string[]) ?? [],
      optionalScopes: (p.optional_scopes as string[]) ?? [],
      disallowedScopes: (p.disallowed_scopes as string[]) ?? [],
      defaultGrantProfile: ((p.default_grant_profile as string) ?? "read_only") as GoogleScopePolicyEntry["defaultGrantProfile"],
      upgradePathAvailable: (p.upgrade_path_available as boolean) ?? false,
      approvalRequired: (p.approval_required_for_upgrade as boolean) ?? false,
    }));
}

// ── Launch Honesty ───────────────────────────────────────────

async function fetchGoogleLaunchHonesty(familyId: string): Promise<GoogleLaunchHonestyEntry[]> {
  const { data: entries } = await db.from("integration_launch_honesty")
    .select("*, provider_capabilities(capability_key, display_name)")
    .eq("provider_family_id", familyId);

  type HonestyRecord = Record<string, unknown> & { provider_capabilities?: { capability_key?: string; display_name?: string } };
  return (entries ?? []).map((e: HonestyRecord): GoogleLaunchHonestyEntry => ({
    capabilityKey: (e.provider_capabilities?.capability_key ?? "unknown") as GoogleCapabilityKey,
    displayName: e.provider_capabilities?.display_name ?? "",
    launchLabel: ((e.launch_label as string) ?? "unknown") as GoogleLaunchHonestyEntry["launchLabel"],
    blockers: (e.blockers as string[]) ?? [],
    publicClaimSafe: ((e.blockers as string[]) ?? []).length === 0,
    qualifierRequired: e.launch_label !== "production",
  }));
}

// ── Consent Ledger ───────────────────────────────────────────

export async function getGoogleConsentHistory(): Promise<Array<Record<string, unknown>>> {
  const { data } = await db.from("consent_ledger")
    .select("*, provider_families(name, provider_key)")
    .order("created_at", { ascending: false })
    .limit(50);
  
  type ConsentRecord = Record<string, unknown> & { provider_families?: { provider_key?: string } };
  return ((data ?? []) as ConsentRecord[]).filter((c) => c.provider_families?.provider_key === "google");
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

