import type { ConnectorCapability } from "../types";

export const twilioCapability: ConnectorCapability = {
  connectorId: "twilio",
  name: "Twilio",
  scopes: ["sms", "voice"],
  edgeFunction: "connector-operations",
  status: "beta",
  actions: [
    { key: "send-sms", label: "Send SMS", riskClass: "medium", reversible: false },
    { key: "list-messages", label: "List messages", riskClass: "informational", reversible: true },
  ],
};
