// ═══════════════════════════════════════════════════════════════
// SITA OS — SendGrid Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { sendgridCapability } from "../capabilities/sendgrid.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const SENDGRID_CAPABILITY: ConnectorCapability = sendgridCapability;
export const SENDGRID_CONNECTOR_ID = sendgridCapability.connectorId;
export const SENDGRID_SCOPES = sendgridCapability.scopes;
export const SENDGRID_ACTIONS = sendgridCapability.actions;

export const sendgridClient: ConnectorClient = createEdgeFunctionClient(sendgridCapability);

export function createSendgridClient(): ConnectorClient {
  return sendgridClient;
}
