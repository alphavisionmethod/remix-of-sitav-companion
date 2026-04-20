import type { ConnectorCapability } from "../types";

export const googleCalendarCapability: ConnectorCapability = {
  connectorId: "google-calendar",
  name: "Google Calendar",
  scopes: ["calendar"],
  edgeFunction: "connector-operations",
  status: "beta",
  actions: [
    { key: "list-events", label: "List events", riskClass: "informational", reversible: true },
    { key: "create-event", label: "Create event", riskClass: "low", reversible: true },
    { key: "update-event", label: "Update event", riskClass: "low", reversible: true },
    { key: "delete-event", label: "Delete event", riskClass: "medium", reversible: false },
  ],
};
