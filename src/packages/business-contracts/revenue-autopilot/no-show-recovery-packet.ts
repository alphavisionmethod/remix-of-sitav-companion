export interface NoShowRecoveryPacket {
  id: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  scheduledAt: string;
  noShowDetectedAt: string;
  estimatedRevenueLostCents: number;
  recoveryAction: "reschedule" | "charge-fee" | "follow-up" | "waive";
  followUpChannel: "email" | "phone" | "sms";
  followUpSentAt?: string;
  rescheduledTo?: string;
  recoveredCents: number;
  status: "detected" | "contacted" | "rescheduled" | "recovered" | "written-off";
}
