// ════════════════════════════════════════════════════════════
// Finance OS — Module Barrel (Phase 2)
// ════════════════════════════════════════════════════════════
// User-facing label is "Finance OS"; route prefix remains /money/*
// (with /finance/* and /investment-office aliases) for URL stability.

import type { PillarCapability, PillarManifest } from "@/platform/contracts/pillar-contract";

export const FINANCE_CAPABILITIES: readonly PillarCapability[] = [
  { id: "budget", label: "Budget", route: "/money/budget", maturity: "active", trustTier: "medium" },
  { id: "cash-flow", label: "Cash Flow", route: "/money/cash-flow", maturity: "active", trustTier: "high" },
  { id: "accounts", label: "Accounts", route: "/money/accounts", maturity: "active", trustTier: "critical" },
  { id: "spending", label: "Spending", route: "/money/spending", maturity: "active", trustTier: "medium" },
  { id: "saving", label: "Saving", route: "/money/saving", maturity: "active", trustTier: "medium" },
  { id: "obligations", label: "Obligations & Bills", route: "/money/obligations", maturity: "active", trustTier: "high" },
  { id: "payment-scheduling", label: "Payment Scheduling", route: "/money/payments", maturity: "active", trustTier: "critical" },
  { id: "investments", label: "Investments", route: "/investment-office", maturity: "active", trustTier: "critical" },
  { id: "simulation", label: "Financial Simulation", route: "/money/simulator", maturity: "active", trustTier: "low" },
  { id: "planning", label: "Financial Planning", route: "/money/planning", maturity: "active", trustTier: "high" },
] as const;

export const FINANCE_PILLAR = {
  id: "finance",
  label: "Finance OS",
  routePrefix: "/money",
  routeAliases: ["/finance", "/investment-office"] as const,
  description: "Budget · Cash flow · Investments · Tax · Net Worth · Family Office",
  launcherPriority: 3,
  capabilities: FINANCE_CAPABILITIES,
} as const satisfies PillarManifest;

export type FinancePillar = typeof FINANCE_PILLAR;