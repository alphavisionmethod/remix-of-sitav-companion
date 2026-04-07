// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval History Service
// Queries/aggregates past approval decisions
// ═══════════════════════════════════════════════════════════════

import type { ApprovalRequest } from "@/packages/contracts";

export interface ApprovalMetrics {
  totalDecisions: number;
  approved: number;
  rejected: number;
  expired: number;
  averageDecisionTimeMs: number;
  approvalRate: number;
  rejectionRate: number;
  byDomain: Record<string, { approved: number; rejected: number; expired: number }>;
}

const history: ApprovalRequest[] = [];

export function recordApproval(request: ApprovalRequest): void {
  history.push({ ...request });
}

export function getApprovalHistory(filters?: {
  domain?: string;
  status?: string;
  since?: string;
  limit?: number;
}): ApprovalRequest[] {
  let results = [...history];
  if (filters?.domain) results = results.filter((r) => r.context?.domain === filters.domain);
  if (filters?.status) results = results.filter((r) => r.status === filters.status);
  if (filters?.since) {
    const since = new Date(filters.since).getTime();
    results = results.filter((r) => new Date(r.requestedAt).getTime() >= since);
  }
  results.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  if (filters?.limit) results = results.slice(0, filters.limit);
  return results;
}

export function computeMetrics(requests?: ApprovalRequest[]): ApprovalMetrics {
  const data = requests || history;
  const approved = data.filter((r) => r.status === "approved").length;
  const rejected = data.filter((r) => r.status === "rejected").length;
  const expired = data.filter((r) => r.status === "expired").length;
  const total = data.length || 1;

  const decisionTimes = data
    .filter((r) => r.currentApprovals.length > 0)
    .map((r) => {
      const first = r.currentApprovals[0];
      return first.decidedAt ? new Date(first.decidedAt).getTime() - new Date(r.requestedAt).getTime() : 0;
    })
    .filter((t) => t > 0);

  const avgTime = decisionTimes.length > 0
    ? decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length
    : 0;

  const byDomain: Record<string, { approved: number; rejected: number; expired: number }> = {};
  for (const r of data) {
    const domain = (r.context?.domain as string) || "unknown";
    if (!byDomain[domain]) byDomain[domain] = { approved: 0, rejected: 0, expired: 0 };
    if (r.status === "approved") byDomain[domain].approved++;
    if (r.status === "rejected") byDomain[domain].rejected++;
    if (r.status === "expired") byDomain[domain].expired++;
  }

  return {
    totalDecisions: data.length,
    approved,
    rejected,
    expired,
    averageDecisionTimeMs: avgTime,
    approvalRate: approved / total,
    rejectionRate: rejected / total,
    byDomain,
  };
}

