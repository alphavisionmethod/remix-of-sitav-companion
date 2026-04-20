// ═══════════════════════════════════════════════════════════════
// SITA OS — Google Calendar Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { googleCalendarCapability } from "../capabilities/google-calendar.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const GOOGLE_CALENDAR_CAPABILITY: ConnectorCapability = googleCalendarCapability;
export const GOOGLE_CALENDAR_CONNECTOR_ID = googleCalendarCapability.connectorId;
export const GOOGLE_CALENDAR_SCOPES = googleCalendarCapability.scopes;
export const GOOGLE_CALENDAR_ACTIONS = googleCalendarCapability.actions;

export const googleCalendarClient: ConnectorClient = createEdgeFunctionClient(googleCalendarCapability);

export function createGoogleCalendarClient(): ConnectorClient {
  return googleCalendarClient;
}
