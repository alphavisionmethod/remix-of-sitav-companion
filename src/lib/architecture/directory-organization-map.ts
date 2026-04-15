// ═══════════════════════════════════════════════════════════════
// SITA OS — Directory Organization Map
// Authority file for src/ reorganization via barrel re-exports.
// ═══════════════════════════════════════════════════════════════

export type MigrationStatus = "barrel-only" | "physically-moved" | "planned";

export interface DirectoryMapping {
  canonicalPath: string;
  legacyPaths: string[];
  status: MigrationStatus;
  description: string;
}

export const DIRECTORY_ORGANIZATION_MAP: DirectoryMapping[] = [
  // ── Features (user-facing domains) ──
  { canonicalPath: "src/features/advisors", legacyPaths: ["src/components/advisors"], status: "barrel-only", description: "Advisor council UI" },
  { canonicalPath: "src/features/auth", legacyPaths: ["src/components/auth", "src/pages/auth"], status: "barrel-only", description: "Authentication feature" },
  { canonicalPath: "src/features/boardroom", legacyPaths: ["src/components/sita/apps/boardroom", "src/pages/Boardroom*"], status: "barrel-only", description: "Boardroom decision chamber" },
  { canonicalPath: "src/features/business", legacyPaths: ["src/components/business", "src/pages/business", "src/pages/BusinessCenter.tsx"], status: "barrel-only", description: "Business domain UI" },
  { canonicalPath: "src/features/concierge", legacyPaths: ["src/components/concierge", "src/pages/concierge"], status: "barrel-only", description: "Concierge / life admin" },
  { canonicalPath: "src/features/files", legacyPaths: ["src/components/files", "src/pages/files"], status: "barrel-only", description: "File management" },
  { canonicalPath: "src/features/money", legacyPaths: ["src/components/money", "src/components/finance", "src/pages/money"], status: "barrel-only", description: "Money & finance UI" },
  { canonicalPath: "src/features/intelligence", legacyPaths: ["src/components/intelligence"], status: "barrel-only", description: "Explainability & orchestration flow" },
  { canonicalPath: "src/features/investment-office", legacyPaths: ["src/components/investment", "src/pages/investment-office"], status: "barrel-only", description: "Investment office" },
  { canonicalPath: "src/features/notifications", legacyPaths: ["src/components/notifications"], status: "barrel-only", description: "Notification inbox" },
  { canonicalPath: "src/features/revenue-office", legacyPaths: ["src/components/revenue-office", "src/pages/revenue-office"], status: "barrel-only", description: "Revenue office" },
  { canonicalPath: "src/features/onboarding", legacyPaths: ["src/components/sita/onboarding"], status: "barrel-only", description: "First-use ceremony" },
  { canonicalPath: "src/features/mobile", legacyPaths: ["src/components/mobile", "src/pages/mobile"], status: "barrel-only", description: "Mobile surface" },
  { canonicalPath: "src/features/settings", legacyPaths: ["src/pages/settings"], status: "barrel-only", description: "User settings" },

  // ── Admin modules ──
  { canonicalPath: "src/admin/modules/ai", legacyPaths: ["src/components/admin-ai", "src/pages/admin/ai-*"], status: "barrel-only", description: "AI workforce admin" },
  { canonicalPath: "src/admin/modules/architecture", legacyPaths: ["src/components/admin/architecture"], status: "barrel-only", description: "Architecture governance admin" },
  { canonicalPath: "src/admin/modules/cloud", legacyPaths: ["src/pages/admin/Cloud*"], status: "barrel-only", description: "Cloud admin" },
  { canonicalPath: "src/admin/modules/security", legacyPaths: ["src/pages/admin/SEC*"], status: "barrel-only", description: "Security admin" },
  { canonicalPath: "src/admin/modules/verification", legacyPaths: ["src/pages/admin/ITC*", "src/pages/admin/V*"], status: "barrel-only", description: "Verification / truth admin" },
  { canonicalPath: "src/admin/shell", legacyPaths: ["src/components/admin/shells"], status: "barrel-only", description: "Admin shell components" },

  // ── Platform ──
  { canonicalPath: "src/platform/auth", legacyPaths: ["src/contexts/AuthContext.tsx"], status: "barrel-only", description: "Auth platform layer" },
  { canonicalPath: "src/platform/governance", legacyPaths: ["src/lib/architecture", "src/components/governance"], status: "barrel-only", description: "Architecture governance" },
  { canonicalPath: "src/platform/proof", legacyPaths: ["src/lib/orchestration/proof", "src/lib/services/projections/proof"], status: "barrel-only", description: "Proof orchestration" },

  // ── Runtimes ──
  { canonicalPath: "src/runtimes/shell", legacyPaths: ["src/components/sita/shell", "src/components/sita/os"], status: "barrel-only", description: "Shell / OS runtime" },
  { canonicalPath: "src/runtimes/desktop", legacyPaths: [], status: "barrel-only", description: "Desktop runtime (future)" },
  { canonicalPath: "src/runtimes/mobile", legacyPaths: ["src/components/mobile"], status: "barrel-only", description: "Mobile runtime" },

  // ── Cross-cutting ──
  { canonicalPath: "src/contracts", legacyPaths: ["src/packages/contracts"], status: "barrel-only", description: "Contract types" },
  { canonicalPath: "src/data", legacyPaths: ["src/lib/data-services"], status: "barrel-only", description: "Data access layer" },
  { canonicalPath: "src/app", legacyPaths: ["src/App.tsx", "src/main.tsx"], status: "barrel-only", description: "App bootstrap" },
];

/**
 * Lookup the canonical path for a given legacy path prefix.
 */
export function getCanonicalPath(legacyPath: string): string | undefined {
  const entry = DIRECTORY_ORGANIZATION_MAP.find(m =>
    m.legacyPaths.some(lp => legacyPath.startsWith(lp.replace("*", "")))
  );
  return entry?.canonicalPath;
}
