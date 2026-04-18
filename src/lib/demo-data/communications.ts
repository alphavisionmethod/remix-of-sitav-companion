// SITA OS — Demo Data: Communications

export type ChannelType = "email" | "sms" | "call" | "chat";
export type MessageStatus = "sent" | "delivered" | "read" | "failed" | "queued";

export interface DemoCommunicationEntry {
  id: string;
  channel: ChannelType;
  direction: "inbound" | "outbound";
  subject: string;
  preview: string;
  contactName: string;
  status: MessageStatus;
  timestamp: string;
  domain: string;
}

export const DEMO_COMMUNICATIONS: DemoCommunicationEntry[] = [
  { id: "1", channel: "email", direction: "outbound", subject: "Invoice Follow-up", preview: "Regarding your outstanding invoice #4521...", contactName: "Marcus Chen", status: "delivered", timestamp: new Date(Date.now() - 3600000).toISOString(), domain: "business" },
  { id: "2", channel: "sms", direction: "outbound", subject: "Appointment Reminder", preview: "Your appointment is tomorrow at 2pm", contactName: "Sarah Park", status: "read", timestamp: new Date(Date.now() - 7200000).toISOString(), domain: "concierge" },
  { id: "3", channel: "email", direction: "inbound", subject: "Proposal Review", preview: "I've reviewed the proposal and have some feedback...", contactName: "David Liu", status: "read", timestamp: new Date(Date.now() - 14400000).toISOString(), domain: "business" },
  { id: "4", channel: "call", direction: "inbound", subject: "Support Call", preview: "Missed call — voicemail left", contactName: "Elena Torres", status: "delivered", timestamp: new Date(Date.now() - 28800000).toISOString(), domain: "concierge" },
  { id: "5", channel: "email", direction: "outbound", subject: "Payment Confirmation", preview: "Your payment of $2,450 has been processed", contactName: "James Wright", status: "sent", timestamp: new Date(Date.now() - 43200000).toISOString(), domain: "finance" },
  { id: "6", channel: "chat", direction: "inbound", subject: "Quick Question", preview: "Hey, do you have availability next week?", contactName: "Amy Nguyen", status: "read", timestamp: new Date(Date.now() - 86400000).toISOString(), domain: "business" },
];
