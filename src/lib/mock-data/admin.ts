// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Admin / Users / Mission Control
// ═══════════════════════════════════════════════════════════════

import type { UserRowView } from "@/packages/contracts";

export const MOCK_ADMIN_USERS: UserRowView[] = [
  { id: "u1", email: "owner@sita.app", name: "Owner", org: "SITA Org", tier: "enterprise", trustState: "verified", connectorCount: 8, incidentExposure: 0, supportFlags: 0, approvalBurden: 12, lastActive: "2m ago" },
  { id: "u2", email: "partner@family.co", name: "Partner", org: "Family", tier: "professional", trustState: "verified", connectorCount: 3, incidentExposure: 0, supportFlags: 0, approvalBurden: 4, lastActive: "1d ago" },
  { id: "u3", email: "accountant@firm.com", name: "Accountant", org: "Advisory", tier: "professional", trustState: "verified", connectorCount: 2, incidentExposure: 0, supportFlags: 1, approvalBurden: 0, lastActive: "3d ago" },
  { id: "u4", email: "assistant@team.co", name: "Assistant", org: "SITA Org", tier: "starter", trustState: "review", connectorCount: 1, incidentExposure: 2, supportFlags: 1, approvalBurden: 0, lastActive: "20d ago" },
];

export const MOCK_TOKEN_USAGES = [
  { requestId: "r1", userId: "owner", domain: "business", model: "gemini-3-flash-preview", tier: "cheap" as const, inputTokens: 4200, outputTokens: 1800, totalTokens: 6000, cost: 0.0009, cached: false, compressed: false, workflowId: "lead-scoring", advisorId: "business-advisor" },
  { requestId: "r2", userId: "owner", domain: "finance", model: "gpt-4o-mini", tier: "mid" as const, inputTokens: 8500, outputTokens: 3200, totalTokens: 11700, cost: 0.0035, cached: false, compressed: false, workflowId: "cash-timing", advisorId: "money-advisor" },
  { requestId: "r3", userId: "owner", domain: "boardroom", model: "claude-sonnet-4-20250514", tier: "premium" as const, inputTokens: 18000, outputTokens: 6000, totalTokens: 24000, cost: 0.072, cached: false, compressed: false, workflowId: "boardroom-session", advisorId: "strategy-advisor" },
  { requestId: "r4", userId: "owner", domain: "concierge", model: "gemini-3-flash-preview", tier: "cheap" as const, inputTokens: 2100, outputTokens: 900, totalTokens: 3000, cost: 0.00045, cached: true, compressed: false, workflowId: "household-prep", advisorId: "concierge-advisor" },
  { requestId: "r5", userId: "owner", domain: "business", model: "gpt-4o-mini", tier: "mid" as const, inputTokens: 5500, outputTokens: 2200, totalTokens: 7700, cost: 0.0023, cached: false, compressed: false, workflowId: "crm-health-check", advisorId: "business-advisor" },
  { requestId: "r6", userId: "owner", domain: "finance", model: "structured-state", tier: "no_llm" as const, inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0, cached: false, compressed: false, workflowId: "balance-lookup" },
  { requestId: "r7", userId: "owner", domain: "boardroom", model: "gpt-4o-mini", tier: "mid" as const, inputTokens: 6800, outputTokens: 2800, totalTokens: 9600, cost: 0.0029, cached: false, compressed: false, workflowId: "advisor-synthesis", advisorId: "strategy-advisor" },
  { requestId: "r8", userId: "owner", domain: "business", model: "gemini-3-flash-preview", tier: "cheap" as const, inputTokens: 3100, outputTokens: 1200, totalTokens: 4300, cost: 0.00065, cached: true, compressed: false, workflowId: "lead-follow-up", advisorId: "business-advisor" },
];
