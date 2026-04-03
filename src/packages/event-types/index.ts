// ═══════════════════════════════════════════════════════════════
// SITA OS — Event Type Contracts
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../contracts";

// ── Base Event ───────────────────────────────────────────────

export interface BaseEvent {
  id: string;
  type: string;
  tenantId: string;
  correlationId: string;
  timestamp: string;
  domain: DomainId;
  metadata: EventMetadata;
}

export interface EventMetadata {
  source: string;
  version: string;
  causedBy?: string;
  idempotencyKey?: string;
}

// ── Business Events ──────────────────────────────────────────

export interface LeadCaptured extends BaseEvent { type: "lead.captured"; payload: { leadId: string; source: string; email: string } }
export interface LeadScored extends BaseEvent { type: "lead.scored"; payload: { leadId: string; score: number; factors: Record<string, number> } }
export interface LeadConverted extends BaseEvent { type: "lead.converted"; payload: { leadId: string; customerId: string } }
export interface CustomerCreated extends BaseEvent { type: "customer.created"; payload: { customerId: string; name: string } }
export interface CustomerHealthChanged extends BaseEvent { type: "customer.health-changed"; payload: { customerId: string; previousScore: number; newScore: number; factors: string[] } }
export interface OpportunityCreated extends BaseEvent { type: "opportunity.created"; payload: { opportunityId: string; accountId: string; valueCents: number } }
export interface OpportunityStageChanged extends BaseEvent { type: "opportunity.stage-changed"; payload: { opportunityId: string; previousStage: string; newStage: string } }
export interface InvoiceCreated extends BaseEvent { type: "invoice.created"; payload: { invoiceId: string; accountId: string; amountCents: number } }
export interface InvoicePaid extends BaseEvent { type: "invoice.paid"; payload: { invoiceId: string; amountCents: number; paidAt: string } }
export interface InvoiceOverdue extends BaseEvent { type: "invoice.overdue"; payload: { invoiceId: string; daysPastDue: number } }
export interface CommunicationSent extends BaseEvent { type: "communication.sent"; payload: { commId: string; type: string; recipientId: string } }

// ── Finance Events ───────────────────────────────────────────

export interface AccountSynced extends BaseEvent { type: "account.synced"; payload: { accountId: string; connectorId: string; transactionCount: number } }
export interface TransactionCategorized extends BaseEvent { type: "transaction.categorized"; payload: { transactionId: string; category: string; method: string } }
export interface BillUpcoming extends BaseEvent { type: "bill.upcoming"; payload: { billId: string; amountCents: number; dueDate: string } }
export interface BillPaid extends BaseEvent { type: "bill.paid"; payload: { billId: string; amountCents: number; paidAt: string } }
export interface SubscriptionDetected extends BaseEvent { type: "subscription.detected"; payload: { subscriptionId: string; name: string; amountCents: number } }
export interface SubscriptionFlaggedWaste extends BaseEvent { type: "subscription.flagged-waste"; payload: { subscriptionId: string; reason: string; savingsCents: number } }
export interface ReserveAllocated extends BaseEvent { type: "reserve.allocated"; payload: { reserveId: string; amountCents: number } }
export interface PaymentExecuted extends BaseEvent { type: "payment.executed"; payload: { paymentId: string; amountCents: number; payee: string; method: string } }
export interface PaymentFailed extends BaseEvent { type: "payment.failed"; payload: { paymentId: string; reason: string } }

// ── Concierge Events ─────────────────────────────────────────

export interface TaskCreated extends BaseEvent { type: "task.created"; payload: { taskId: string; title: string; assignedTo?: string } }
export interface TaskCompleted extends BaseEvent { type: "task.completed"; payload: { taskId: string; completedBy: string } }
export interface BookingConfirmed extends BaseEvent { type: "booking.confirmed"; payload: { bookingId: string; type: string; confirmationNumber: string } }
export interface CalendarConflictDetected extends BaseEvent { type: "calendar.conflict-detected"; payload: { eventIds: string[]; conflictType: string } }
export interface ReminderTriggered extends BaseEvent { type: "reminder.triggered"; payload: { reminderId: string; title: string } }

// ── Platform Events ──────────────────────────────────────────

export interface FileUploaded extends BaseEvent { type: "file.uploaded"; payload: { fileId: string; filename: string; sizeBytes: number } }
export interface FileClassified extends BaseEvent { type: "file.classified"; payload: { fileId: string; classification: string; sensitive: boolean } }
export interface WorkflowStarted extends BaseEvent { type: "workflow.started"; payload: { workflowId: string; type: string } }
export interface WorkflowCompleted extends BaseEvent { type: "workflow.completed"; payload: { workflowId: string; durationMs: number } }
export interface WorkflowFailed extends BaseEvent { type: "workflow.failed"; payload: { workflowId: string; error: string; retryable: boolean } }
export interface ApprovalRequested extends BaseEvent { type: "approval.requested"; payload: { approvalId: string; actionType: string; requiredApprovers: number } }
export interface ApprovalDecided extends BaseEvent { type: "approval.decided"; payload: { approvalId: string; decision: string; decidedBy: string } }
export interface ReceiptCreated extends BaseEvent { type: "receipt.created"; payload: { receiptId: string; type: string; actionId: string } }

// ── Boardroom Events ─────────────────────────────────────────

export interface BoardroomSessionStarted extends BaseEvent { type: "boardroom.session-started"; payload: { sessionId: string; templateId: string } }
export interface BoardroomDecisionRecorded extends BaseEvent { type: "boardroom.decision-recorded"; payload: { sessionId: string; decisionId: string; topic: string } }

// ── Advisor Events ───────────────────────────────────────────

export interface AdvisorRecommendation extends BaseEvent { type: "advisor.recommendation-generated"; payload: { advisorId: string; recommendation: string; confidence: number } }
export interface AdvisorDisagreement extends BaseEvent { type: "advisor.disagreement-surfaced"; payload: { topic: string; advisorA: string; advisorB: string } }

// ── Internal Agent Events ────────────────────────────────────

export interface AgentFinding extends BaseEvent { type: "agent.finding-reported"; payload: { agentId: string; finding: string; severity: string } }
export interface AgentAction extends BaseEvent { type: "agent.action-taken"; payload: { agentId: string; action: string; result: string } }
export interface AgentEscalated extends BaseEvent { type: "agent.escalated"; payload: { agentId: string; escalatedTo: string; reason: string } }

// ── Store Events ─────────────────────────────────────────────

export interface PackInstalled extends BaseEvent { type: "pack.installed"; payload: { packId: string; version: string } }
export interface PackUpdated extends BaseEvent { type: "pack.updated"; payload: { packId: string; fromVersion: string; toVersion: string } }
export interface PackUninstalled extends BaseEvent { type: "pack.uninstalled"; payload: { packId: string; reason?: string } }

// ── Union Type ───────────────────────────────────────────────

export type SitaEvent =
  | LeadCaptured | LeadScored | LeadConverted | CustomerCreated | CustomerHealthChanged
  | OpportunityCreated | OpportunityStageChanged | InvoiceCreated | InvoicePaid | InvoiceOverdue | CommunicationSent
  | AccountSynced | TransactionCategorized | BillUpcoming | BillPaid | SubscriptionDetected | SubscriptionFlaggedWaste
  | ReserveAllocated | PaymentExecuted | PaymentFailed
  | TaskCreated | TaskCompleted | BookingConfirmed | CalendarConflictDetected | ReminderTriggered
  | FileUploaded | FileClassified | WorkflowStarted | WorkflowCompleted | WorkflowFailed
  | ApprovalRequested | ApprovalDecided | ReceiptCreated
  | BoardroomSessionStarted | BoardroomDecisionRecorded
  | AdvisorRecommendation | AdvisorDisagreement
  | AgentFinding | AgentAction | AgentEscalated
  | PackInstalled | PackUpdated | PackUninstalled;
