// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Revenue Calling Page
// ═══════════════════════════════════════════════════════════════

export interface CallingContact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  stage: "new" | "contacted" | "qualified" | "proposal" | "negotiation";
  value: number;
  lastContact: number | null;
  notes: string;
  priority: "hot" | "warm" | "cold";
  callCount: number;
}

export interface CallingCallLog {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  direction: "outbound" | "inbound";
  status: "completed" | "no-answer" | "busy" | "voicemail" | "failed";
  duration: number;
  outcome: "interested" | "callback" | "not-interested" | "voicemail" | "no-answer" | "closed-won" | "closed-lost";
  notes: string;
  recordingUrl: string | null;
  timestamp: number;
  revenue: number | null;
}

export interface CallingCallScript {
  id: string;
  name: string;
  stage: string;
  opener: string;
  talkingPoints: string[];
  objectionHandlers: { objection: string; response: string }[];
  closer: string;
}

export const MOCK_CONTACTS: CallingContact[] = [
  { id: "c1", name: "Sarah Chen", company: "TechCorp", email: "sarah@techcorp.com", phone: "(555) 123-4567", lastContact: Date.now() - 864e5 * 2, stage: "negotiation", value: 84000, priority: "hot", callCount: 4, notes: "Waiting on proposal review" },
  { id: "c2", name: "Marcus Johnson", company: "Startup IO", email: "marcus@startup.io", phone: "(555) 234-5678", lastContact: Date.now() - 864e5 * 7, stage: "qualified", value: 36000, priority: "warm", callCount: 1, notes: "" },
  { id: "c3", name: "Dr. Priya Patel", company: "Enterprise Co", email: "priya@enterprise.co", phone: "(555) 345-6789", lastContact: Date.now() - 864e5 * 3, stage: "proposal", value: 120000, priority: "hot", callCount: 3, notes: "Very interested in premium tier" },
];

export const MOCK_CALL_LOGS: CallingCallLog[] = [
  { id: "cl1", contactId: "c1", contactName: "Sarah Chen", phone: "(555) 123-4567", timestamp: Date.now() - 864e5 * 2, duration: 754, outcome: "interested", direction: "outbound", notes: "Reviewed proposal, asked for revised pricing", status: "completed", revenue: null, recordingUrl: null },
  { id: "cl2", contactId: "c2", contactName: "Marcus Johnson", phone: "(555) 234-5678", timestamp: Date.now() - 864e5 * 7, duration: 0, outcome: "voicemail", direction: "outbound", notes: "Left message about discovery call", status: "voicemail", revenue: null, recordingUrl: null },
  { id: "cl3", contactId: "c3", contactName: "Dr. Priya Patel", phone: "(555) 345-6789", timestamp: Date.now() - 864e5 * 3, duration: 501, outcome: "interested", direction: "outbound", notes: "Discussed premium features, scheduling demo", status: "completed", revenue: null, recordingUrl: null },
];

export const MOCK_CALL_SCRIPTS: CallingCallScript[] = [
  { id: "sc1", name: "Discovery Call", stage: "discovery", opener: "Hi, this is [name] from [company]. I noticed you recently...", talkingPoints: ["What challenges are you facing?", "How are you currently handling this?", "What would success look like?"], objectionHandlers: [{ objection: "Too expensive", response: "I understand budget concerns. Let me show you the ROI..." }, { objection: "Already have a solution", response: "Great — how is it working for you? Many clients find..." }], closer: "Based on what you've shared, I think we can help. Can we schedule a follow-up?" },
  { id: "sc2", name: "Follow-up Call", stage: "follow-up", opener: "Hi [name], following up on our conversation about...", talkingPoints: ["Last time we discussed...", "Have you had a chance to review?"], objectionHandlers: [{ objection: "Need more time", response: "Of course. When would be a good time to reconnect?" }], closer: "Shall we move forward with the proposal?" },
  { id: "sc3", name: "Closing Call", stage: "closing", opener: "Hi [name], excited to finalize things today...", talkingPoints: ["We agreed on...", "The investment is..."], objectionHandlers: [{ objection: "Need to check with team", response: "Absolutely. Would it help if I joined that conversation?" }], closer: "Great — I'll send over the agreement today." },
];
