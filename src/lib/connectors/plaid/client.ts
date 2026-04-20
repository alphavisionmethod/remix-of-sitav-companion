// ═══════════════════════════════════════════════════════════════
// SITA OS — Plaid Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { plaidCapability } from "../capabilities/plaid.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const PLAID_CAPABILITY: ConnectorCapability = plaidCapability;
export const PLAID_CONNECTOR_ID = plaidCapability.connectorId;
export const PLAID_SCOPES = plaidCapability.scopes;
export const PLAID_ACTIONS = plaidCapability.actions;

export const plaidClient: ConnectorClient = createEdgeFunctionClient(plaidCapability);

export function createPlaidClient(): ConnectorClient {
  return plaidClient;
}
