// ═══════════════════════════════════════════════════════════════
// SITA OS — Gmail Client (Per-Provider Binding)
// Thin client-side capability+invocation surface for the Gmail
// connector. Real provider logic lives in the bound edge function;
// this module exposes the typed action surface, scope manifest,
// and a typed `invoke` proxy for in-app use.
// ═══════════════════════════════════════════════════════════════
import { gmailCapability } from "../capabilities/gmail.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const GMAIL_CAPABILITY: ConnectorCapability = gmailCapability;
export const GMAIL_CONNECTOR_ID = gmailCapability.connectorId;
export const GMAIL_SCOPES = gmailCapability.scopes;
export const GMAIL_ACTIONS = gmailCapability.actions;

export const gmailClient: ConnectorClient = createEdgeFunctionClient(gmailCapability);

export function createGmailClient(): ConnectorClient {
  return gmailClient;
}
