import type { ConnectorCapability } from "../types";

export const googleDriveCapability: ConnectorCapability = {
  connectorId: "google-drive",
  name: "Google Drive",
  scopes: ["drive.readonly"],
  edgeFunction: "connector-operations",
  status: "beta",
  actions: [
    { key: "list-files", label: "List files", riskClass: "informational", reversible: true },
    { key: "get-file", label: "Get file", riskClass: "informational", reversible: true },
    { key: "download-file", label: "Download file", riskClass: "low", reversible: true },
  ],
};
