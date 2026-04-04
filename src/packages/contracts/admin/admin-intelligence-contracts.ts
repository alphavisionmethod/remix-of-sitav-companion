// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Contracts: Admin Intelligence
// Intelligence layer for admin decision support
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "../_contract-scaffold";

export type InsightSeverity = "critical" | "high" | "medium" | "low" | "informational";
export type InsightCategory = "cost" | "trust" | "performance" | "security" | "compliance" | "opportunity" | "risk";

export interface AdminInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  domain: DomainId;
  title: string;
  description: string;
  evidence: string[];
  suggestedActions: Array<{
    action: string;
    estimatedImpact: string;
    riskLevel: "low" | "medium" | "high";
  }>;
  generatedAt: string;
  expiresAt?: string;
  isActionable: boolean;
  isDismissed: boolean;
}

export interface AdminIntelligenceDashboard {
  userId: string;
  generatedAt: string;
  insights: AdminInsight[];
  riskScore: number; // 0-100
  healthScore: number; // 0-100
  attentionRequired: number;
  topRisks: string[];
  recentChanges: Array<{ description: string; timestamp: string; impact: string }>;
}
