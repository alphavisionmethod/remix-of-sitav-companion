import type { ConnectorCapability } from "../types";

export const quickbooksCapability: ConnectorCapability = {
  connectorId: "quickbooks",
  name: "QuickBooks",
  scopes: ["accounting"],
  edgeFunction: null,
  status: "planned",
  actions: [
    { key: "list-invoices", label: "List invoices", riskClass: "informational", reversible: true },
    { key: "create-invoice", label: "Create invoice", riskClass: "medium", reversible: true },
  ],
};
