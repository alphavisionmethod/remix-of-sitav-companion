// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Source Diagnostics View
// For any route/page: shows active mode, active provider,
// real vs demo source, scenario binding, launch honesty
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Database, Shield, CheckCircle, AlertTriangle,
  XCircle, Eye, ArrowRight, Globe, Code
} from "lucide-react";
import { DEMO_ROUTES } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

type LaunchHonesty = "truthful" | "demo-backed" | "mixed" | "overstated" | "blocked";

interface RouteSource {
  path: string;
  pageName: string;
  domain: string;
  activeProvider: "real" | "demo" | "mixed" | "none";
  dataServices: string[];
  mockImports: string[];
  scenarioBinding: string | null;
  launchHonesty: LaunchHonesty;
  notes: string;
}

const honestyConfig: Record<LaunchHonesty, { label: string; color: string; icon: typeof CheckCircle }> = {
  truthful: { label: "Truthful", color: "bg-primary/10 text-primary", icon: CheckCircle },
  "demo-backed": { label: "Demo-Backed", color: "bg-amber-500/10 text-amber-600", icon: Shield },
  mixed: { label: "Mixed", color: "bg-orange-500/10 text-orange-600", icon: AlertTriangle },
  overstated: { label: "Overstated", color: "bg-destructive/10 text-destructive", icon: XCircle },
  blocked: { label: "Blocked", color: "bg-muted text-muted-foreground", icon: XCircle },
};

export default function RouteSourceDiagnostics() {
  const { isDemoMode } = useDataMode();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return DEMO_ROUTES;
    const q = search.toLowerCase();
    return (isDemoMode ? DEMO_ROUTES : [] as typeof DEMO_ROUTES).filter(r => r.path.includes(q) || r.pageName.toLowerCase().includes(q) || r.domain.toLowerCase().includes(q));
  }, [search]);

  const truthful = (isDemoMode ? DEMO_ROUTES : [] as typeof DEMO_ROUTES).filter(r => r.launchHonesty === "truthful").length;
  const demoBacked = (isDemoMode ? DEMO_ROUTES : [] as typeof DEMO_ROUTES).filter(r => r.launchHonesty === "demo-backed").length;
  const mixed = (isDemoMode ? DEMO_ROUTES : [] as typeof DEMO_ROUTES).filter(r => r.launchHonesty === "mixed").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Route Source Diagnostics" subtitle="Per-route data source, provider, mode, and launch honesty classification" />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Truthful Routes", value: truthful, color: "text-primary" },
          { label: "Demo-Backed Routes", value: demoBacked, color: "text-amber-500" },
          { label: "Mixed Routes", value: mixed, color: "text-orange-500" },
        ].map(kpi => (
          <SitaCard key={kpi.label} className="p-4 text-center">
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </SitaCard>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search routes, pages, or domains..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <SitaCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <SitaCardTitle>Route Reality Map ({filtered.length} routes)</SitaCardTitle>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(r => {
            const cfg = honestyConfig[r.launchHonesty];
            const Icon = cfg.icon;
            return (
              <div key={r.path} className="p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs text-primary font-mono">{r.path}</code>
                      <span className="text-xs text-muted-foreground">→ {r.pageName}</span>
                      <Badge variant="outline" className="text-[10px]">{r.domain}</Badge>
                      <Badge className={cfg.color} variant="secondary">{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {r.dataServices.join(", ")}</span>
                      {r.mockImports.length > 0 && <span className="flex items-center gap-1"><Code className="h-3 w-3" /> mock: {r.mockImports.join(", ")}</span>}
                      {r.scenarioBinding && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> scenario: {r.scenarioBinding}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 italic">{r.notes}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SitaCard>
    </div>
  );
}
