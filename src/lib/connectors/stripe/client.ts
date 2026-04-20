// ═══════════════════════════════════════════════════════════════
// SITA OS — Stripe Client (Per-Provider Binding)
// ═══════════════════════════════════════════════════════════════
import { stripeCapability } from "../capabilities/stripe.capability";
import { createEdgeFunctionClient } from "../clients/createEdgeFunctionClient";
import type { ConnectorCapability, ConnectorClient } from "../types";

export const STRIPE_CAPABILITY: ConnectorCapability = stripeCapability;
export const STRIPE_CONNECTOR_ID = stripeCapability.connectorId;
export const STRIPE_SCOPES = stripeCapability.scopes;
export const STRIPE_ACTIONS = stripeCapability.actions;

export const stripeClient: ConnectorClient = createEdgeFunctionClient(stripeCapability);

export function createStripeClient(): ConnectorClient {
  return stripeClient;
}
