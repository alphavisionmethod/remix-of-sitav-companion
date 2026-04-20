import type { ConnectorCapability } from "../types";

export const instacartCapability: ConnectorCapability = {
  connectorId: "instacart",
  name: "Instacart",
  scopes: ["orders.read"],
  edgeFunction: null,
  status: "planned",
  actions: [
    { key: "list-orders", label: "List orders", riskClass: "informational", reversible: true },
  ],
};
