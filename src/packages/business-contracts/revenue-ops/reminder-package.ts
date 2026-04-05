// SITA OS — Revenue Ops: Reminder Package
export interface ReminderPackage {
  id: string;
  invoiceId: string;
  accountId: string;
  reminderType: "friendly" | "formal" | "urgent" | "final-notice";
  channel: "email" | "sms" | "phone" | "letter";
  scheduledAt: string;
  sentAt?: string;
  templateId?: string;
  personalizedMessage?: string;
  result?: "sent" | "delivered" | "opened" | "responded" | "bounced" | "no-response";
  respondedAt?: string;
  paymentPromisedDate?: string;
  proofId?: string;
  createdAt: string;
}
