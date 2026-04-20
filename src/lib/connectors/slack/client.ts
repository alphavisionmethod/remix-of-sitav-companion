// ═══════════════════════════════════════════════════════════════
// SITA OS — Slack Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { slackCapability } from "../capabilities/slack.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const SLACK_CAPABILITY: ConnectorCapability = slackCapability;
export const SLACK_CONNECTOR_ID = slackCapability.connectorId;
export const SLACK_SCOPES = slackCapability.scopes;
export const SLACK_ACTIONS = slackCapability.actions;

export const slackClient: ConnectorClient = createEdgeFunctionClient(slackCapability);

export function createSlackClient(): ConnectorClient {
  return slackClient;
}
