// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment Office Shell (Phase 4 scaffold)
//
// Canonical entry for /investment in the user product plane. The
// existing per-route pages remain mounted as deep-linkable child
// routes (registered in src/routes/investment-routes.tsx) — this
// shell provides the top-level workspace chrome that future thin
// pages will collapse into as Phase 5 view migrations land.
//
// Why a stub now? It locks the canonical entry point so the
// admin-page-consolidation-map equivalent for the user plane
// (USER_DOMAIN_SURFACE_CONSOLIDATION.md) has a real owner. Detail
// routes still render their own pages via <Outlet />.
// ═══════════════════════════════════════════════════════════════

import { Outlet, useLocation, Link } from "react-router-dom";
import { useMemo } from "react";

const PRIMARY_TABS: ReadonlyArray<{ label: string; path: string; description: string }> = [
  { label: "Boardroom", path: "/investment/boardroom", description: "Daily portfolio command." },
  { label: "Markets", path: "/investment/markets", description: "Market explorer & watchlists." },
  { label: "Portfolio", path: "/investment/portfolio", description: "Positions & allocation." },
  { label: "Strategy", path: "/investment/strategy", description: "Strategy studio." },
  { label: "Execute", path: "/investment/execute", description: "Execution desk." },
  { label: "Research", path: "/investment/research", description: "Research library." },
  { label: "Risk", path: "/investment/risk", description: "Risk office." },
  { label: "Family Office", path: "/investment/family-office", description: "Multi-account view." },
];

export default function InvestmentShellPage() {
  const { pathname } = useLocation();
  const active = useMemo(
    () => PRIMARY_TABS.find((t) => pathname.startsWith(t.path)) ?? PRIMARY_TABS[0],
    [pathname],
  );

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Investment Office</h1>
        <p className="text-sm text-muted-foreground">{active.description}</p>
      </header>
      <nav
        aria-label="Investment Office sections"
        className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2"
      >
        {PRIMARY_TABS.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
              pathname.startsWith(tab.path)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <section className="flex-1 overflow-auto p-6">
        <Outlet />
      </section>
    </div>
  );
}
