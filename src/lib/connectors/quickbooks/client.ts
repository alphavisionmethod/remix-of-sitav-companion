// ═══════════════════════════════════════════════════════════════
// SITA OS — QuickBooks (Intuit) Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { quickbooksCapability } from "../capabilities/quickbooks.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const QUICKBOOKS_CAPABILITY: ConnectorCapability = quickbooksCapability;
export const QUICKBOOKS_CONNECTOR_ID = quickbooksCapability.connectorId;
export const QUICKBOOKS_SCOPES = quickbooksCapability.scopes;
export const QUICKBOOKS_ACTIONS = quickbooksCapability.actions;

export const quickbooksClient: ConnectorClient = createEdgeFunctionClient(quickbooksCapability);

export function createQuickbooksClient(): ConnectorClient {
  return quickbooksClient;
}
