// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Framing Grammar
// Canonical rules for page/shell/window structure.
// Every surface MUST follow one of these framing patterns.
// ═══════════════════════════════════════════════════════════════

/**
 * PAGE_FRAMING_GRAMMAR defines the three canonical page structures.
 *
 * 1. **Standalone pages** (settings, admin boards, utility pages):
 *    `<PageShell> → <SitaPageHeader> → content`
 *
 * 2. **Domain app pages** (business, finance, concierge, files, trust):
 *    `<DomainAppShell> → <AppSurface> → content`
 *
 * 3. **Full-bleed pages** (landing, onboarding, OS desktop):
 *    No shell wrapper — intentionally full viewport.
 *
 * Rules:
 * - Every standalone page MUST use PageShell for consistent max-width, padding, entrance animation.
 * - Every domain page MUST use DomainAppShell which provides sidebar, toolbar, command palette.
 * - PageShell renders as `<main>` for accessibility (single landmark per page).
 * - SitaPageHeader renders `<h1>` — one per page.
 * - Domain pages get their `<main>` from AppSurface (as="main").
 */
export const PAGE_FRAMING_GRAMMAR = {
  standalone: {
    shell: "PageShell",
    header: "SitaPageHeader (from SitaCard exports or standalone)",
    widthOptions: ["narrow", "standard", "wide", "full"] as const,
    defaultWidth: "wide" as const,
  },
  domain: {
    shell: "DomainAppShell",
    surface: "AppSurface",
    sidebar: "AppSidebarNav",
    toolbar: "AppToolbar",
  },
  fullBleed: {
    examples: ["LandingPage", "OSDesktop", "OnboardingFlow", "NotFound"],
    note: "No shell — intentionally full viewport",
  },
  admin: {
    shell: "AdminPageHeader",
    note: "Admin pages use AdminPageHeader as their shell pattern. NOT wrapped in PageShell — they have their own consistent framing.",
    examples: ["All /admin/* routes, MissionControl sub-pages"],
  },
} as const;