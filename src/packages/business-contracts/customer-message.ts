// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Customer Message
// ═══════════════════════════════════════════════════════════════

export type MessageChannel = "email" | "sms" | "phone" | "chat" | "in-app" | "social" | "letter";
export type MessageDirection = "inbound" | "outbound";
export type MessageSentiment = "positive" | "neutral" | "negative" | "urgent";

export interface CustomerMessage {
  id: string;
  customerId: string;
  accountId: string;
  channel: MessageChannel;
  direction: MessageDirection;
  subject?: string;
  body: string;
  sentiment?: MessageSentiment;
  sentimentScore?: number;
  handledBy: string;
  respondedWithin?: number;
  slaBreached: boolean;
  linkedEntityType?: string;
  linkedEntityId?: string;
  attachments: string[];
  threadId?: string;
  parentMessageId?: string;
  tags: string[];
  readAt?: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  customerId: string;
  subject: string;
  messageCount: number;
  lastMessageAt: string;
  status: "open" | "waiting" | "resolved" | "archived";
  assignedTo?: string;
  priority: "urgent" | "high" | "normal" | "low";
  sentiment: MessageSentiment;
  firstResponseTimeMinutes?: number;
  resolutionTimeMinutes?: number;
}
