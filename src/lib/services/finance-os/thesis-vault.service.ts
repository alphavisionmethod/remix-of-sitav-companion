// ═══════════════════════════════════════════════════════════════
// SITA OS — Finance OS: Thesis Vault Service
// Investment thesis storage and tracking
// ═══════════════════════════════════════════════════════════════

import type { ThesisRecord } from "@/packages/finance-contracts/investment-office";

export function getMockTheses(): ThesisRecord[] {
  return [
    {
      id: "t-ai-infra", title: "AI Infrastructure Capex", status: "active",
      assetClass: "Equities", thesis: "Enterprise AI adoption driving sustained capex in compute, networking, and data infrastructure",
      entryConditions: ["GPU demand exceeding supply", "Cloud capex growing >20% YoY"],
      exitConditions: ["GPU supply normalizes", "Enterprise AI spending flattens"],
      riskFactors: ["Valuation compression", "Regulatory risk"],
      timeHorizon: "12-18 months",
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      lastReviewedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "t-energy-transition", title: "Energy Transition Hedge", status: "active",
      assetClass: "Energy", thesis: "Traditional energy maintaining cash flows while transitioning — dividend play with optionality",
      entryConditions: ["Oil above $70", "Dividend yield >4%"],
      exitConditions: ["Oil below $50 sustained", "Dividend cut"],
      riskFactors: ["Commodity price volatility", "ESG pressure"],
      timeHorizon: "24-36 months",
      createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
      lastReviewedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ];
}

export function assessThesisHealth(thesis: ThesisRecord): { healthy: boolean; staleDays: number; recommendation: string } {
  const staleDays = Math.floor((Date.now() - new Date(thesis.lastReviewedAt).getTime()) / 86400000);
  const healthy = staleDays < 30 && thesis.status === "active";
  const recommendation = staleDays > 60 ? "Thesis stale — review urgently" :
    thesis.status === "monitoring" ? "Under monitoring — consider exit" :
    "On track — next review on schedule";
  return { healthy, staleDays, recommendation };
}
