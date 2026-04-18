// SITA OS — Demo Data: Notes Workspace

export interface DemoNote {
  id: string;
  title: string;
  preview: string;
  content: string;
  folder?: string;
  tags: string[];
  pinned: boolean;
  linkedEntity?: { type: string; label: string };
  updatedAt: string;
  createdAt: string;
  type: "note" | "meeting" | "checklist" | "voice" | "knowledge";
}

export const DEMO_NOTES: DemoNote[] = [
  { id: "1", title: "Q2 Revenue Strategy", preview: "Focus areas: upsell existing clients, reduce churn in SMB segment, explore...", content: "", folder: "Business", tags: ["strategy", "revenue"], pinned: true, linkedEntity: { type: "workspace", label: "Boardroom" }, updatedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), type: "note" },
  { id: "2", title: "Meeting: Client Kickoff — Acme Corp", preview: "Attendees: Sarah, James, Elena. Key decisions: timeline Q3, budget $45k...", content: "", folder: "Meetings", tags: ["meeting", "acme"], pinned: false, linkedEntity: { type: "customer", label: "Acme Corp" }, updatedAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), type: "meeting" },
  { id: "3", title: "Home Renovation Checklist", preview: "☑ Get contractor quotes ☐ Review permits ☐ Schedule inspection...", content: "", folder: "Household", tags: ["home", "project"], pinned: false, updatedAt: new Date(Date.now() - 14400000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), type: "checklist" },
  { id: "4", title: "Voice Memo — Product Ideas", preview: "Transcript: thinking about adding a scheduling feature that integrates...", content: "", folder: "Ideas", tags: ["product", "voice"], pinned: false, updatedAt: new Date(Date.now() - 28800000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), type: "voice" },
  { id: "5", title: "Tax Documentation Guide", preview: "Reference: Required documents for quarterly filing. Keep receipts for...", content: "", folder: "Finance", tags: ["tax", "reference"], pinned: true, linkedEntity: { type: "workspace", label: "Finance" }, updatedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), type: "knowledge" },
  { id: "6", title: "Weekly Planning Template", preview: "Monday: review inbox, set priorities. Tuesday: deep work block...", content: "", folder: "Personal", tags: ["planning", "template"], pinned: false, updatedAt: new Date(Date.now() - 172800000).toISOString(), createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), type: "note" },
];
