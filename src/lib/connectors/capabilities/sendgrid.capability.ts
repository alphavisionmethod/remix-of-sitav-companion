import type { ConnectorCapability } from "../types";

export const sendgridCapability: ConnectorCapability = {
  connectorId: "sendgrid",
  name: "SendGrid",
  scopes: ["mail.send"],
  edgeFunction: null,
  status: "planned",
  actions: [
    { key: "send-mail", label: "Send mail", riskClass: "medium", reversible: false },
  ],
};
