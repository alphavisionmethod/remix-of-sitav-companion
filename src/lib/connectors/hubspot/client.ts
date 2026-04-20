// ═══════════════════════════════════════════════════════════════
// SITA OS — HubSpot Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { hubspotCapability } from "../capabilities/hubspot.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const HUBSPOT_CAPABILITY: ConnectorCapability = hubspotCapability;
export const HUBSPOT_CONNECTOR_ID = hubspotCapability.connectorId;
export const HUBSPOT_SCOPES = hubspotCapability.scopes;
export const HUBSPOT_ACTIONS = hubspotCapability.actions;

export const hubspotClient: ConnectorClient = createEdgeFunctionClient(hubspotCapability);

export function createHubspotClient(): ConnectorClient {
  return hubspotClient;
}
