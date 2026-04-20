// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Clients
// Typed client bindings for every "beta" or higher connector.
// Generated thinly via createEdgeFunctionClient — no per-provider
// business logic lives here; edge functions own that.
// ═══════════════════════════════════════════════════════════════

import type { ConnectorClient } from "../types";
import { CONNECTOR_CAPABILITIES } from "../capabilities";
import { createEdgeFunctionClient } from "./createEdgeFunctionClient";

export const CONNECTOR_CLIENTS: Record<string, ConnectorClient> = Object.fromEntries(
  CONNECTOR_CAPABILITIES
    .filter((c) => c.status !== "planned" && c.edgeFunction !== null)
    .map((c) => [c.connectorId, createEdgeFunctionClient(c)]),
);

export function getClient(connectorId: string): ConnectorClient | undefined {
  return CONNECTOR_CLIENTS[connectorId];
}

export const createGmailClient = () => CONNECTOR_CLIENTS["gmail"];
export const createGoogleCalendarClient = () => CONNECTOR_CLIENTS["google-calendar"];
export const createGoogleDriveClient = () => CONNECTOR_CLIENTS["google-drive"];
export const createPlaidClient = () => CONNECTOR_CLIENTS["plaid"];
export const createStripeClient = () => CONNECTOR_CLIENTS["stripe"];
export const createTwilioClient = () => CONNECTOR_CLIENTS["twilio"];
