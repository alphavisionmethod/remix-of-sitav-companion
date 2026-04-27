// ═══════════════════════════════════════════════════════════════
// SITA OS — useGoogleProviderFamily Hook
// React hook for Google Provider Family state management
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { useRealityModeSafe } from "@/lib/dual-reality";
import {
  getGoogleProviderFamilyState,
  getGoogleDemoState,
  doesIdentityImplyConnector,
  resolveOAuthClient,
  type GoogleProviderFamilyState,
  type GoogleCapabilityKey,
  type GoogleRealityMode,
} from "@/lib/services/google-provider-family";

export function useGoogleProviderFamily() {
  const { mode } = useRealityModeSafe();
  const realityMode = (mode === "demo" || mode === "dev_demo" ? "demo" : mode === "real" ? "real" : "internal_test") as GoogleRealityMode;

  const { data: state, isLoading, error, refetch } = useQuery<GoogleProviderFamilyState>({
    queryKey: ["google-provider-family", realityMode],
    queryFn: async () => {
      if (realityMode === "demo") return getGoogleDemoState("demo");
      if (realityMode === "internal_test") return getGoogleDemoState("internal_test");
      return getGoogleProviderFamilyState("real");
    },
    staleTime: 30_000,
  });

  const loaded = state?.loaded ?? false;
  const identity = state?.identity ?? null;
  const connectors = state?.connectors ?? [];
  const oauthClients = state?.oauthClients ?? [];
  const scopePolicies = state?.scopePolicies ?? [];
  const launchHonesty = state?.launchHonesty ?? [];

  /** Identity NEVER implies connector access */
  const identityImpliesConnector = doesIdentityImplyConnector();

  /** Get the correct OAuth client for a capability */
  const getClientFor = (capability: GoogleCapabilityKey) =>
    resolveOAuthClient(capability, oauthClients);

  /** Check which connectors are actually connected */
  const connectedServices = connectors.filter((c) => c.connectionStatus === "connected");
  const disconnectedServices = connectors.filter((c) => c.connectionStatus !== "connected");

  /** Summary for UI badges */
  const summary = {
    signedInWithGoogle: identity?.signedInWithGoogle ?? false,
    driveConnected: connectors.find((c) => c.capabilityKey === "google_drive")?.connectionStatus === "connected",
    gmailConnected: connectors.find((c) => c.capabilityKey === "google_gmail")?.connectionStatus === "connected",
    calendarConnected: connectors.find((c) => c.capabilityKey === "google_calendar")?.connectionStatus === "connected",
    totalConnected: connectedServices.length,
    totalAvailable: connectors.length,
    anyReauthNeeded: connectors.some((c) => c.reauthNeeded),
    anyDegraded: connectors.some((c) => c.healthStatus === "degraded" || c.healthStatus === "error"),
    realityMode,
  };

  return {
    state,
    isLoading,
    error,
    refetch,
    loaded,
    identity,
    connectors,
    connectedServices,
    disconnectedServices,
    oauthClients,
    scopePolicies,
    launchHonesty,
    identityImpliesConnector,
    getClientFor,
    summary,
    realityMode,
  };
}
