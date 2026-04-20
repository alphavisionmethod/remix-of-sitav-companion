import type { ConnectorCapability } from "../types";

export const gmailCapability: ConnectorCapability = {
  connectorId: "gmail",
  name: "Gmail",
  scopes: ["gmail.readonly", "gmail.send"],
  edgeFunction: "connector-operations",
  status: "beta",
  actions: [
    { key: "list-messages", label: "List messages", riskClass: "informational", reversible: true },
    { key: "get-message", label: "Get message", riskClass: "informational", reversible: true },
    { key: "send-message", label: "Send message", riskClass: "medium", reversible: false },
  ],
};
