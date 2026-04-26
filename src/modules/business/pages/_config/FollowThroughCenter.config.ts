export type QueueTab = "callbacks" | "no-touch" | "waiting" | "drafts" | "overdue" | "recovery";

export interface QueueItem {
  id: string; name: string; company: string; reason: string;
  daysStale: number; value?: number; channel: "phone" | "email" | "meeting";
  urgency: "critical" | "high" | "normal" | "low";
}

const CALLBACKS_FIXTURE: QueueItem[] = [
  { id: "cb1", name: "Sarah Chen", company: "Meridian Ventures", reason: "Quote follow-up — $2,500 website redesign", daysStale: 0, value: 2500, channel: "phone", urgency: "high" },
  { id: "cb2", name: "James Rodriguez", company: "Nordic Digital", reason: "Onboarding check-in — started last week", daysStale: 0, value: 4200, channel: "phone", urgency: "normal" },
  { id: "cb3", name: "Emily Watson", company: "Atlas Corp", reason: "No contact in 3 days — stale risk", daysStale: 3, value: 1800, channel: "phone", urgency: "critical" },
];

const NOTOUCH_FIXTURE: QueueItem[] = [
  { id: "nt1", name: "David Kim", company: "Pinnacle LLC", reason: "Lead from website form — never contacted", daysStale: 7, value: 3200, channel: "email", urgency: "high" },
  { id: "nt2", name: "Lisa Park", company: "Summit Labs", reason: "Referred by Sarah Chen — no outreach yet", daysStale: 5, value: 1500, channel: "email", urgency: "normal" },
];

const WAITING_FIXTURE: QueueItem[] = [
  { id: "w1", name: "Marcus Webb", company: "Atlas Corp", reason: "Proposal sent 4 days ago — no response", daysStale: 4, value: 8500, channel: "email", urgency: "normal" },
  { id: "w2", name: "Elena Rossi", company: "Vanguard Advisory", reason: "Contract sent for review — awaiting signature", daysStale: 2, value: 4500, channel: "email", urgency: "low" },
];

const DRAFTS_FIXTURE: QueueItem[] = [
  { id: "d1", name: "Michael Park", company: "Apex Solutions", reason: "Follow-up draft — web design inquiry", daysStale: 1, value: 2000, channel: "email", urgency: "normal" },
];

const OVERDUE_FIXTURE: QueueItem[] = [
  { id: "o1", name: "Karen Lee", company: "Bright Media", reason: "Scheduled call missed — reschedule needed", daysStale: 2, value: 3400, channel: "phone", urgency: "critical" },
  { id: "o2", name: "Tom Jenkins", company: "CoreTech", reason: "Follow-up overdue by 5 days", daysStale: 5, value: 6200, channel: "email", urgency: "high" },
];

const RECOVERY_FIXTURE: QueueItem[] = [
  { id: "r1", name: "Apex Corp", company: "Apex Corp", reason: "Quote expired 3 days ago — $3,200 recoverable", daysStale: 3, value: 3200, channel: "email", urgency: "normal" },
  { id: "r2", name: "Blue Ridge Co", company: "Blue Ridge Co", reason: "Lost deal 14 days ago — re-engage opportunity", daysStale: 14, value: 5800, channel: "phone", urgency: "low" },
];

export const FOLLOW_THROUGH_TAB_DATA: Record<QueueTab, { items: QueueItem[]; label: string }> = {
  callbacks: { items: CALLBACKS_FIXTURE, label: "Callbacks" },
  "no-touch": { items: NOTOUCH_FIXTURE, label: "No-Touch Leads" },
  waiting: { items: WAITING_FIXTURE, label: "Waiting on Reply" },
  drafts: { items: DRAFTS_FIXTURE, label: "Unsent Drafts" },
  overdue: { items: OVERDUE_FIXTURE, label: "Overdue Outreach" },
  recovery: { items: RECOVERY_FIXTURE, label: "Recovery" },
};