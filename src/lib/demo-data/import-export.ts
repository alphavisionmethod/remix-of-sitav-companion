// SITA OS — Demo Data: Import/Export Center

export interface DemoUploadItem { id: string; name: string; type: string; size: string; status: "uploading" | "processing" | "complete" | "failed"; progress: number; destination?: string; }
export interface DemoExportItem { id: string; name: string; type: string; size: string; status: "generating" | "ready" | "expired" | "failed"; createdAt: string; }

export const DEMO_UPLOADS: DemoUploadItem[] = [
  { id: "1", name: "Q2-financials.xlsx", type: "spreadsheet", size: "2.1 MB", status: "complete", progress: 100, destination: "Finance" },
  { id: "2", name: "contract-acme.pdf", type: "pdf", size: "450 KB", status: "processing", progress: 80, destination: "CRM" },
  { id: "3", name: "team-photo.jpg", type: "image", size: "3.5 MB", status: "uploading", progress: 45 },
];

export const DEMO_EXPORTS: DemoExportItem[] = [
  { id: "1", name: "Revenue Report March 2024.pdf", type: "pdf", size: "1.2 MB", status: "ready", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", name: "Client List Export.csv", type: "csv", size: "340 KB", status: "ready", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", name: "Proof Bundle #4521.zip", type: "bundle", size: "8.7 MB", status: "generating", createdAt: new Date().toISOString() },
];
