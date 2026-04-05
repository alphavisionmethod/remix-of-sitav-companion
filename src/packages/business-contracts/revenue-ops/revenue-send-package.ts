// SITA OS — Revenue Ops: Revenue Send Package
export interface RevenueSendPackage {
  id: string;
  entityType: "quote" | "invoice" | "estimate" | "proposal" | "receipt" | "credit-note";
  entityId: string;
  recipientEmail: string;
  recipientName: string;
  channel: "email" | "portal" | "sms" | "print";
  subject: string;
  body: string;
  attachments: Array<{ filename: string; storagePath: string; mimeType: string }>;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  status: "queued" | "sent" | "delivered" | "opened" | "bounced" | "failed";
  proofId?: string;
  createdAt: string;
}
