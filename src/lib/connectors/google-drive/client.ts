// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Drive Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { googleDriveCapability } from "../capabilities/google-drive.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const GOOGLE_DRIVE_CAPABILITY: ConnectorCapability = googleDriveCapability;
export const GOOGLE_DRIVE_CONNECTOR_ID = googleDriveCapability.connectorId;
export const GOOGLE_DRIVE_SCOPES = googleDriveCapability.scopes;
export const GOOGLE_DRIVE_ACTIONS = googleDriveCapability.actions;

export const googleDriveClient: ConnectorClient = createEdgeFunctionClient(googleDriveCapability);

export function createGoogleDriveClient(): ConnectorClient {
  return googleDriveClient;
}
