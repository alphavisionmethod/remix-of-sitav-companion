// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Registry
// Joins capability declaration + client binding for a single
// authoritative read of the connector surface. App code should
// import from here rather than reaching into edge functions
// directly.
// ═══════════════════════════════════════════════════════════════

import type { ConnectorCapability, ConnectorClient } from "./types";
import {
  CONNECTOR_CAPABILITIES,
  CONNECTOR_CAPABILITY_BY_ID,
  getCapability,
} from "./capabilities";
import { CONNECTOR_CLIENTS, getClient } from "./clients";

export interface ConnectorRegistryEntry {
  capability: ConnectorCapability;
  client: ConnectorClient | undefined;
}

export function getConnector(connectorId: string): ConnectorRegistryEntry | undefined {
  const capability = getCapability(connectorId);
  if (!capability) return undefined;
  return { capability, client: getClient(connectorId) };
}

export function listConnectors(): ConnectorRegistryEntry[] {
  return CONNECTOR_CAPABILITIES.map((capability) => ({
    capability,
    client: getClient(capability.connectorId),
  }));
}

export {
  CONNECTOR_CAPABILITIES,
  CONNECTOR_CAPABILITY_BY_ID,
  CONNECTOR_CLIENTS,
};
