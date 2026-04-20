// ═══════════════════════════════════════════════════════════════
// SITA OS — Twilio Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { twilioCapability } from "../capabilities/twilio.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const TWILIO_CAPABILITY: ConnectorCapability = twilioCapability;
export const TWILIO_CONNECTOR_ID = twilioCapability.connectorId;
export const TWILIO_SCOPES = twilioCapability.scopes;
export const TWILIO_ACTIONS = twilioCapability.actions;

export const twilioClient: ConnectorClient = createEdgeFunctionClient(twilioCapability);

export function createTwilioClient(): ConnectorClient {
  return twilioClient;
}
