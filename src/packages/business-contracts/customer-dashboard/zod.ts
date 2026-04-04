// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Contracts: Customer Dashboard Zod Schemas
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ── Customer Health Score Schema ───────────────────────────────
export const CustomerHealthScoreSchema = z.object({
  customerId: z.string(),
  overallScore: z.number().min(0).max(100),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  engagementScore: z.number().min(0).max(100),
  adoptionScore: z.number().min(0).max(100),
  satisfactionScore: z.number().min(0).max(100),
  paymentHealthScore: z.number().min(0).max(100),
  trend: z.enum(["improving", "stable", "declining"]),
  computedAt: z.string(),
});

// ── Customer Risk Summary Schema ───────────────────────────────
export const CustomerRiskSummarySchema = z.object({
  customerId: z.string(),
  churnProbability: z.number().min(0).max(1),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  topRiskFactors: z.array(z.string()),
  suggestedInterventions: z.array(z.string()),
  lastAssessedAt: z.string(),
});

// ── Customer Timeline Item Schema ──────────────────────────────
export const CustomerTimelineItemSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  eventType: z.enum(["call", "email", "meeting", "ticket", "purchase", "renewal", "escalation", "note", "stage-change"]),
  title: z.string(),
  description: z.string(),
  actor: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

// ── Next Best Action Schema ────────────────────────────────────
export const NextBestActionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  category: z.enum(["retention", "expansion", "engagement", "support", "onboarding", "renewal"]),
  action: z.string(),
  reasoning: z.string(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  estimatedImpactCents: z.number().optional(),
  confidence: z.number().min(0).max(1),
  suggestedBy: z.enum(["advisor", "system", "playbook"]),
  dueBy: z.string().optional(),
});

// ── Dashboard View Schema ──────────────────────────────────────
export const CustomerDashboardViewSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  lifecycleStage: z.enum(["prospect", "lead", "qualified", "onboarding", "active", "expansion", "at-risk", "churning", "churned", "win-back", "dormant"]),
  healthGrade: z.enum(["A", "B", "C", "D", "F"]),
  healthScore: z.number().min(0).max(100),
  lifetimeValueCents: z.number(),
  openTickets: z.number(),
  lastContactDate: z.string(),
  nextActionDue: z.string().optional(),
  accountManagerName: z.string().optional(),
});

// ── Onboarding Bootstrap Packet Schema ─────────────────────────
export const OnboardingCustomerBootstrapPacketSchema = z.object({
  customerId: z.string(),
  accountId: z.string(),
  contractId: z.string(),
  primaryContactEmail: z.string().email(),
  servicesSubscribed: z.array(z.string()),
  onboardingTemplate: z.string(),
  kickoffDate: z.string(),
  estimatedCompletionDate: z.string(),
  assignedTeam: z.array(z.string()),
  customFields: z.record(z.unknown()),
});

// ── Service Continuity View Schema ─────────────────────────────
export const ServiceContinuityViewSchema = z.object({
  customerId: z.string(),
  overallStatus: z.enum(["healthy", "at-risk", "disrupted", "recovering"]),
  activeServices: z.number(),
  disruptedServices: z.number(),
  slaCompliancePct: z.number().min(0).max(100),
  nextRenewalDate: z.string(),
  backupContactAvailable: z.boolean(),
  lastIncidentDate: z.string().optional(),
  recoveryTimeObjectiveHours: z.number(),
});
