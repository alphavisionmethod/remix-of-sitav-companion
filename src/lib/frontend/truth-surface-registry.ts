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
}

export const TRUTH_SURFACE_REGISTRY: readonly TruthSurfaceEntry[] = [
  { pageId: "boardroom-main", route: "/boardroom", requiresDisclosure: true, disclosureType: "ai-generated", ownerDomain: "platform", description: "Boardroom recommendations are AI-generated" },
  { pageId: "advisor-chat", route: "/advisor/*", requiresDisclosure: true, disclosureType: "ai-generated", ownerDomain: "advisor-intelligence", description: "Advisor responses are AI-generated" },
  { pageId: "business-intelligence", route: "/business/intelligence", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "business-os", description: "Business insights use AI analysis" },
  { pageId: "finance-forecast", route: "/money/forecast", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "finance-os", description: "Financial forecasts use AI models" },
  { pageId: "tax-estimate", route: "/money/tax", requiresDisclosure: true, disclosureType: "ai-assisted", ownerDomain: "finance-os", description: "Tax estimates are AI-assisted, not professional advice" },
  { pageId: "concierge-main", route: "/concierge", requiresDisclosure: true, disclosureType: "ai-generated", ownerDomain: "concierge-os", description: "Concierge responses are AI-generated" },
  { pageId: "desktop-shell", route: "/", requiresDisclosure: true, disclosureType: "simulation", ownerDomain: "shell", description: "Desktop shell is a simulated OS experience" },
  { pageId: "boot-sequence", route: "/os/boot", requiresDisclosure: true, disclosureType: "simulation", ownerDomain: "shell", description: "Boot sequence is a UX simulation" },
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