// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Elimination Command Center
// Shows remaining direct mock imports, migration status per domain
// ═══════════════════════════════════════════════════════════════

import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, Database, Shield, ArrowRight } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

type DomainStatus = "real" | "demo_provider" | "mock_direct" | "mixed" | "blocked";

interface DomainMigration {
  domain: string;
  status: DomainStatus;
  totalPages: number;
  migratedPages: number;
  realProviderReady: boolean;
  demoProviderReady: boolean;
  tablesExist: boolean;
  blockers: string[];
  priority: "critical" | "high" | "medium" | "low";
}

const statusConfig: Record<DomainStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  real: { label: "Real", color: "bg-primary/10 text-primary", icon: CheckCircle },
  demo_provider: { label: "Demo Provider", color: "bg-amber-500/10 text-amber-600", icon: Shield },
  mock_direct: { label: "Direct Mock", color: "bg-destructive/10 text-destructive", icon: XCircle },
  mixed: { label: "Mixed", color: "bg-orange-500/10 text-orange-600", icon: AlertTriangle },
  blocked: { label: "Blocked", color: "bg-muted text-muted-foreground", icon: XCircle },
};

export default function MockEliminationCenter() {
const DOMAIN_MIGRATIONS: any[] = [];
  const totalPages = DOMAIN_MIGRATIONS.reduce((s, d) => s + d.totalPages, 0);
  const migratedPages = DOMAIN_MIGRATIONS.reduce((s, d) => s + d.migratedPages, 0);
  const migrationPct = Math.round((migratedPages / totalPages) * 100);
  const domainsConverted = DOMAIN_MIGRATIONS.filter(d => d.status !== "mock_direct" && d.status !== "blocked").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
<SitaPageHeader title="Mock Elimination Command Center" subtitle="Track domain-by-domain conversion from direct mock imports to mode-aware providers" />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pages Migrated", value: `${migratedPages}/${totalPages}`, sub: `${migrationPct}%` },
          { label: "Domains Converted", value: `${domainsConverted}/${DOMAIN_MIGRATIONS.length}`, sub: "off direct mocks" },
          { label: "Data Services", value: "12", sub: "mode-aware" },
          { label: "Demo Providers", value: "8", sub: "scenario-backed" },
        ].map(kpi => (
          <SitaCard key={kpi.label} className="p-4">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </SitaCard>
        ))}
      </div>

      <SitaCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <SitaCardTitle>Overall Migration Progress</SitaCardTitle>
          <span className="text-sm font-medium text-foreground">{migrationPct}%</span>
        </div>
        <Progress value={migrationPct} className="h-3" />
      </SitaCard>

      {/* Domain Table */}
      <SitaCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <SitaCardTitle>Domain Reality Conversion Status</SitaCardTitle>
        </div>
        <div className="divide-y divide-border">
          {DOMAIN_MIGRATIONS.map(d => {
            const cfg = statusConfig[d.status];
            const Icon = cfg.icon;
            const pct = Math.round((d.migratedPages / d.totalPages) * 100);
            return (
              <div key={d.domain} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{d.domain}</p>
                    <Badge className={cfg.color} variant="secondary">{cfg.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{d.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <Progress value={pct} className="h-1.5 flex-1 max-w-[200px]" />
                    <span className="text-xs text-muted-foreground">{d.migratedPages}/{d.totalPages} pages</span>
                    {d.tablesExist && <Database className="h-3 w-3 text-primary" />}
                    {d.realProviderReady && <span className="text-[10px] text-primary">Real ✓</span>}
                    {d.demoProviderReady && <span className="text-[10px] text-amber-500">Demo ✓</span>}
                  </div>
                  {d.blockers.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <span className="text-[10px] text-amber-500">{d.blockers.join(", ")}</span>
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      </SitaCard>
    </div>
  );
}
