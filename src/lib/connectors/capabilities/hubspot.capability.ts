import type { ConnectorCapability } from "../types";

export const hubspotCapability: ConnectorCapability = {
  connectorId: "hubspot",
  name: "HubSpot",
  scopes: ["contacts", "deals"],
  edgeFunction: null,
  status: "planned",
  actions: [
    { key: "list-contacts", label: "List contacts", riskClass: "informational", reversible: true },
    { key: "create-contact", label: "Create contact", riskClass: "low", reversible: true },
    { key: "list-deals", label: "List deals", riskClass: "informational", reversible: true },
  ],
};
