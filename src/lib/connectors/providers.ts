// ═══════════════════════════════════════════════════════════════
// SITA OS — Per-Provider Connector Client Registry (Canonical Export)
//
// Canonical client-side capability registry that maps every
// catalog connector to its per-provider client module
// (src/lib/connectors/<provider>/client.ts).
//
// This is the single client-side surface app code should use to
// reach connector functionality. Real provider logic lives in the
// edge functions; these per-provider modules expose the typed
// invocation surface + capability/scope manifest for app code,
// agents, and the autonomy gating layer.
//
// Enforced 1:1 with the connector catalog by
// scripts/architecture/checks/check-connector-client-registry.ts
// ═══════════════════════════════════════════════════════════════

import type { ConnectorCapability, ConnectorClient } from "./types";

import {
  GMAIL_CAPABILITY,
  gmailClient,
  createGmailClient,
} from "./gmail/client";
import {
  GOOGLE_CALENDAR_CAPABILITY,
  googleCalendarClient,
  createGoogleCalendarClient,
} from "./google-calendar/client";
import {
  GOOGLE_DRIVE_CAPABILITY,
  googleDriveClient,
  createGoogleDriveClient,
} from "./google-drive/client";
import {
  PLAID_CAPABILITY,
  plaidClient,
  createPlaidClient,
} from "./plaid/client";
import {
  STRIPE_CAPABILITY,
  stripeClient,
  createStripeClient,
} from "./stripe/client";
import {
  QUICKBOOKS_CAPABILITY,
  quickbooksClient,
  createQuickbooksClient,
} from "./quickbooks/client";
import {
  TWILIO_CAPABILITY,
  twilioClient,
  createTwilioClient,
} from "./twilio/client";
import {
  SENDGRID_CAPABILITY,
  sendgridClient,
  createSendgridClient,
} from "./sendgrid/client";
import {
  INSTACART_CAPABILITY,
  instacartClient,
  createInstacartClient,
} from "./instacart/client";
import {
  HUBSPOT_CAPABILITY,
  hubspotClient,
  createHubspotClient,
} from "./hubspot/client";
import {
  SLACK_CAPABILITY,
  slackClient,
  createSlackClient,
} from "./slack/client";
import {
  DROPBOX_CAPABILITY,
  dropboxClient,
  createDropboxClient,
} from "./dropbox/client";

export interface ConnectorProviderEntry {
  connectorId: string;
  capability: ConnectorCapability;
  client: ConnectorClient;
  factory: () => ConnectorClient;
}

export const CONNECTOR_PROVIDER_REGISTRY: ReadonlyArray<ConnectorProviderEntry> = [
  { connectorId: "gmail",            capability: GMAIL_CAPABILITY,            client: gmailClient,           factory: createGmailClient },
  { connectorId: "google-calendar",  capability: GOOGLE_CALENDAR_CAPABILITY,  client: googleCalendarClient,  factory: createGoogleCalendarClient },
  { connectorId: "google-drive",     capability: GOOGLE_DRIVE_CAPABILITY,     client: googleDriveClient,     factory: createGoogleDriveClient },
  { connectorId: "plaid",            capability: PLAID_CAPABILITY,            client: plaidClient,           factory: createPlaidClient },
  { connectorId: "stripe",           capability: STRIPE_CAPABILITY,           client: stripeClient,          factory: createStripeClient },
  { connectorId: "quickbooks",       capability: QUICKBOOKS_CAPABILITY,       client: quickbooksClient,      factory: createQuickbooksClient },
  { connectorId: "twilio",           capability: TWILIO_CAPABILITY,           client: twilioClient,          factory: createTwilioClient },
  { connectorId: "sendgrid",         capability: SENDGRID_CAPABILITY,         client: sendgridClient,        factory: createSendgridClient },
  { connectorId: "instacart",        capability: INSTACART_CAPABILITY,        client: instacartClient,       factory: createInstacartClient },
  { connectorId: "hubspot",          capability: HUBSPOT_CAPABILITY,          client: hubspotClient,         factory: createHubspotClient },
  { connectorId: "slack",            capability: SLACK_CAPABILITY,            client: slackClient,           factory: createSlackClient },
  { connectorId: "dropbox",          capability: DROPBOX_CAPABILITY,          client: dropboxClient,         factory: createDropboxClient },
];

export const CONNECTOR_PROVIDER_BY_ID: Record<string, ConnectorProviderEntry> =
  Object.fromEntries(CONNECTOR_PROVIDER_REGISTRY.map((e) => [e.connectorId, e]));

export function getProviderEntry(connectorId: string): ConnectorProviderEntry | undefined {
  return CONNECTOR_PROVIDER_BY_ID[connectorId];
}

export function getProviderClient(connectorId: string): ConnectorClient | undefined {
  return CONNECTOR_PROVIDER_BY_ID[connectorId]?.client;
}

export function getProviderCapability(connectorId: string): ConnectorCapability | undefined {
  return CONNECTOR_PROVIDER_BY_ID[connectorId]?.capability;
}

export const CONNECTOR_PROVIDER_IDS: ReadonlyArray<string> =
  CONNECTOR_PROVIDER_REGISTRY.map((e) => e.connectorId);
