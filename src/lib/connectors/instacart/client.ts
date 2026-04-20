// ═══════════════════════════════════════════════════════════════
// SITA OS — Instacart Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { instacartCapability } from "../capabilities/instacart.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const INSTACART_CAPABILITY: ConnectorCapability = instacartCapability;
export const INSTACART_CONNECTOR_ID = instacartCapability.connectorId;
export const INSTACART_SCOPES = instacartCapability.scopes;
export const INSTACART_ACTIONS = instacartCapability.actions;

export const instacartClient: ConnectorClient = createEdgeFunctionClient(instacartCapability);

export function createInstacartClient(): ConnectorClient {
  return instacartClient;
}
