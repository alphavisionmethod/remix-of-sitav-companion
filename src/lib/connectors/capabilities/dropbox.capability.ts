import type { ConnectorCapability } from "../types";

export const dropboxCapability: ConnectorCapability = {
  connectorId: "dropbox",
  name: "Dropbox",
  scopes: ["files.content.read"],
  edgeFunction: null,
  status: "planned",
  actions: [
    { key: "list-files", label: "List files", riskClass: "informational", reversible: true },
    { key: "download-file", label: "Download file", riskClass: "low", reversible: true },
  ],
};
