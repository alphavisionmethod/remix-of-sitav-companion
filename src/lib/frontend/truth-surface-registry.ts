// ═══════════════════════════════════════════════════════════════
// SITA OS — Truth Surface Registry
// Declares which pages require AI truth disclosures.
// ═══════════════════════════════════════════════════════════════

export interface TruthSurfaceEntry {
  pageId: string;
  route: string;
  requiresDisclosure: boolean;
  disclosureType: "ai-generated" | "ai-assisted" | "simulation" | "none";
  ownerDomain: string;
  description: string;
  requiredPrimitives: readonly string[];
}

export const TRUTH_SURFACE_REGISTRY: readonly TruthSurfaceEntry[] = [
  // ── Original 8 entries ───────────────────────────────────────
  { pageId: "boardroom-main", route: "/boardroom", requiresDisclosure: true, disclosureType: "ai-generated", ownerDomain: "platform", description: "Boardroom recommendations are AI-generated", requiredPrimitives: ["AITruthDisclosure", "EvidenceLink", "ProvenanceChip"] },
  { pageId: "advisor-chat", route: "/advisor/*", requiresDisclosure: true, disclosureType: "ai-generated", ownerDomain: "advisor-intelligence", description: "Advisor responses are AI-generated", requiredPrimitives: ["AITruthDisclosure", "TrustBadge"] },
  { pageId: "business-intelligence", route: "/business/intelligence", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "business-os", description: "Business insights use AI analysis", requiredPrimitives: ["AITruthDisclosure", "ProvenanceChip"] },
  { pageId: "finance-forecast", route: "/money/forecast", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "finance-os", description: "Financial forecasts use AI models", requiredPrimitives: ["AITruthDisclosure", "EvidenceLink"] },
  { pageId: "tax-estimate", route: "/money/tax", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "finance-os", description: "Tax estimates are AI-assisted, not professional advice", requiredPrimitives: ["AITruthDisclosure", "EvidenceLink"] },
  { pageId: "concierge-main", route: "/concierge", requiresDisclosure: true, disclosureType: "ai-generated", ownerDomain: "concierge-os", description: "Concierge responses are AI-generated", requiredPrimitives: ["AITruthDisclosure"] },
  { pageId: "desktop-shell", route: "/", requiresDisclosure: true, disclosureType: "simulation", ownerDomain: "shell", description: "Desktop shell is a simulated OS experience", requiredPrimitives: ["StatusBadge"] },
  { pageId: "boot-sequence", route: "/os/boot", requiresDisclosure: true, disclosureType: "simulation", ownerDomain: "shell", description: "Boot sequence is a UX simulation", requiredPrimitives: ["StatusBadge"] },

  // ── Expanded entries (Phase 13 — Wave 13) ────────────────────
  { pageId: "admin-ai-runtime", route: "/admin/ai-gateway/*", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "admin-ai", description: "AI runtime monitoring surfaces", requiredPrimitives: ["ProvenanceChip", "EvidenceLink", "StatusBadge"] },
  { pageId: "admin-ai-team", route: "/admin/ai-team/*", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "admin-ai", description: "AI team management surfaces", requiredPrimitives: ["ProvenanceChip", "StatusBadge"] },
  { pageId: "admin-approvals", route: "/admin/approvals/*", requiresDisclosure: false, disclosureType: "none", ownerDomain: "admin-ops", description: "Admin approval workflows", requiredPrimitives: ["StatusBadge", "EvidenceLink"] },
  { pageId: "admin-security", route: "/admin/founder/security", requiresDisclosure: false, disclosureType: "none", ownerDomain: "admin-security", description: "Security dashboard", requiredPrimitives: ["StatusBadge", "TrustBadge"] },
  { pageId: "connectors-settings", route: "/connectors/*", requiresDisclosure: false, disclosureType: "none", ownerDomain: "connectors", description: "Integration connector pages", requiredPrimitives: ["StatusBadge", "ProvenanceChip"] },
  { pageId: "payments-overview", route: "/money/payments", requiresDisclosure: false, disclosureType: "none", ownerDomain: "finance-os", description: "Payments overview", requiredPrimitives: ["StatusBadge", "EvidenceLink", "ProofBadge"] },
  { pageId: "investment-office", route: "/investment", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "finance-os", description: "Investment analysis", requiredPrimitives: ["AITruthDisclosure", "ProvenanceChip"] },
  { pageId: "revenue-office", route: "/money/revenue", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "finance-os", description: "Revenue analysis", requiredPrimitives: ["AITruthDisclosure", "ProvenanceChip"] },
  { pageId: "owner-dashboard", route: "/daily-pulse", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "owner", description: "Daily pulse AI summary", requiredPrimitives: ["AITruthDisclosure", "ProvenanceChip"] },
  { pageId: "app-permissions", route: "/apps/*/permissions", requiresDisclosure: false, disclosureType: "none", ownerDomain: "app-platform", description: "App permission management", requiredPrimitives: ["StatusBadge", "TrustBadge"] },
  { pageId: "digital-presence", route: "/digital-presence/*", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "business-os", description: "Digital presence AI analysis", requiredPrimitives: ["AITruthDisclosure", "ProvenanceChip"] },
  { pageId: "approval-chamber", route: "/approval-chamber", requiresDisclosure: false, disclosureType: "none", ownerDomain: "platform", description: "High-stakes approval chamber", requiredPrimitives: ["StatusBadge", "EvidenceLink", "TrustBadge"] },
] as const;

export function requiresDisclosure(route: string): boolean {
  return TRUTH_SURFACE_REGISTRY.some((e) => {
    if (e.route.endsWith("/*")) return route.startsWith(e.route.slice(0, -2));
    return route === e.route;
  });
}

export function getDisclosureType(route: string): TruthSurfaceEntry["disclosureType"] {
  const entry = TRUTH_SURFACE_REGISTRY.find((e) => {
    if (e.route.endsWith("/*")) return route.startsWith(e.route.slice(0, -2));
    return route === e.route;
  });
  return entry?.disclosureType ?? "none";
}