// ═══════════════════════════════════════════════════════════════
// SITA OS — Dropbox Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { dropboxCapability } from "../capabilities/dropbox.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const DROPBOX_CAPABILITY: ConnectorCapability = dropboxCapability;
export const DROPBOX_CONNECTOR_ID = dropboxCapability.connectorId;
export const DROPBOX_SCOPES = dropboxCapability.scopes;
export const DROPBOX_ACTIONS = dropboxCapability.actions;

export const dropboxClient: ConnectorClient = createEdgeFunctionClient(dropboxCapability);

export function createDropboxClient(): ConnectorClient {
  return dropboxClient;
}
