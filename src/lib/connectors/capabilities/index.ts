// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Capability Registry
// Single barrel registering every catalog connector's capability
// declaration. Enforced 1:1 with generated/connector-catalog.json
// by scripts/architecture/checks/check-connector-capability-completeness.ts.
// ═══════════════════════════════════════════════════════════════

import type { ConnectorCapability } from "../types";
import { gmailCapability } from "./gmail.capability";
import { googleCalendarCapability } from "./google-calendar.capability";
import { googleDriveCapability } from "./google-drive.capability";
import { plaidCapability } from "./plaid.capability";
import { stripeCapability } from "./stripe.capability";
import { quickbooksCapability } from "./quickbooks.capability";
import { twilioCapability } from "./twilio.capability";
import { sendgridCapability } from "./sendgrid.capability";
import { instacartCapability } from "./instacart.capability";
import { hubspotCapability } from "./hubspot.capability";
import { slackCapability } from "./slack.capability";
import { dropboxCapability } from "./dropbox.capability";

export const CONNECTOR_CAPABILITIES: ConnectorCapability[] = [
  gmailCapability,
  googleCalendarCapability,
  googleDriveCapability,
  plaidCapability,
  stripeCapability,
  quickbooksCapability,
  twilioCapability,
  sendgridCapability,
  instacartCapability,
  hubspotCapability,
  slackCapability,
  dropboxCapability,
];

export const CONNECTOR_CAPABILITY_BY_ID: Record<string, ConnectorCapability> =
  Object.fromEntries(CONNECTOR_CAPABILITIES.map((c) => [c.connectorId, c]));

export function getCapability(connectorId: string): ConnectorCapability | undefined {
  return CONNECTOR_CAPABILITY_BY_ID[connectorId];
}
