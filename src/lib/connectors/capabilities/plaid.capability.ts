import type { ConnectorCapability } from "../types";

export const plaidCapability: ConnectorCapability = {
  connectorId: "plaid",
  name: "Plaid",
  scopes: ["transactions", "accounts"],
  edgeFunction: "connector-operations",
  status: "beta",
  actions: [
    { key: "list-accounts", label: "List accounts", riskClass: "informational", reversible: true },
    { key: "list-transactions", label: "List transactions", riskClass: "informational", reversible: true },
    { key: "sync-transactions", label: "Sync transactions", riskClass: "low", reversible: true },
  ],
};
