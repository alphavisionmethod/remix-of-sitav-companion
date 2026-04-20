import type { ConnectorCapability } from "../types";

export const slackCapability: ConnectorCapability = {
  connectorId: "slack",
  name: "Slack",
  scopes: ["chat:write", "channels:read"],
  edgeFunction: null,
  status: "planned",
  actions: [
    { key: "post-message", label: "Post message", riskClass: "medium", reversible: false },
    { key: "list-channels", label: "List channels", riskClass: "informational", reversible: true },
  ],
};
