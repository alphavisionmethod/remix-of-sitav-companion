import type { ConnectorCapability } from "../types";

export const stripeCapability: ConnectorCapability = {
  connectorId: "stripe",
  name: "Stripe",
  scopes: ["read", "write"],
  edgeFunction: "connector-operations",
  status: "beta",
  actions: [
    { key: "list-charges", label: "List charges", riskClass: "informational", reversible: true },
    { key: "list-customers", label: "List customers", riskClass: "informational", reversible: true },
    { key: "create-refund", label: "Create refund", riskClass: "irreversible", reversible: false },
  ],
};
