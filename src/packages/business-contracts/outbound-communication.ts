// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Outbound Communication Engine
// ═══════════════════════════════════════════════════════════════

export type OutboundChannel = "email" | "sms" | "phone" | "push" | "in-app" | "mail";
export type OutboundPurpose =
  | "prospecting" | "follow-up" | "nurture" | "onboarding"
  | "retention" | "upsell" | "collection" | "renewal"
  | "feedback" | "announcement" | "transactional";

export interface OutboundTemplate {
  id: string;
  name: string;
  channel: OutboundChannel;
  purpose: OutboundPurpose;
  subject?: string;
  bodyTemplate: string;
  variables: string[];
  version: number;
  abVariant?: string;
  performanceStats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    unsubscribed: number;
    bounced: number;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundCampaign {
  id: string;
  name: string;
  purpose: OutboundPurpose;
  templateId: string;
  channel: OutboundChannel;
  audienceFilter: Record<string, unknown>;
  audienceSize: number;
  status: "draft" | "scheduled" | "sending" | "completed" | "paused" | "cancelled";
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue Generated Cents: number;
  requiresApproval: boolean;
  approvedBy?: string;
  proofId?: string;
  createdAt: string;
}

export interface CommunicationPreferences {
  customerId: string;
  optInEmail: boolean;
  optInSms: boolean;
  optInPhone: boolean;
  optInPush: boolean;
  preferredChannel: OutboundChannel;
  preferredTime?: string;
  timezone?: string;
  doNotContact: boolean;
  doNotContactReason?: string;
  unsubscribedTopics: string[];
  lastUpdated: string;
  consentRecordId?: string;
}

export interface SequenceEnrollment {
  id: string;
  contactId: string;
  sequenceId: string;
  currentStep: number;
  totalSteps: number;
  status: "active" | "paused" | "completed" | "bounced" | "replied" | "converted";
  enrolledAt: string;
  lastStepAt?: string;
  nextStepAt?: string;
  completedAt?: string;
  exitReason?: string;
}
