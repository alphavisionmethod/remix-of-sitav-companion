// ═══════════════════════════════════════════════════════
// SITA OS — JVC13: Interaction Drift Radar
// Detect mismatches between registry and actual behavior
// ═══════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SURFACE_REGISTRY, type SurfaceEntry } from "@/lib/verification/surface-registry";
import { CUSTOMER_JOURNEY_REGISTRY } from "@/lib/customer-journey/journey-registry";
import { useVerificationSurfaces } from "@/lib/verification/verification-hooks";
import { Radar, AlertTriangle, CheckCircle2, XCircle, GitBranch, Clock, Shield, ArrowRight } from "lucide-react";

interface DriftItem {
  id: string;
  category: "selector" | "redirect" | "form" | "permission" | "shell" | "journey" | "missing";
  severity: "critical" | "warning" | "info";
  surface: string;
  description: string;
  registryValue: string;
  actualValue: string;
  detectedAt: string;
}

function detectDrifts(dbSurfaces: any[]): DriftItem[] {
  const drifts: DriftItem[] = [];
  const now = new Date().toISOString();

  // Check registry entries that might have missing selectors
  SURFACE_REGISTRY.forEach(s => {
    if (s.testPriority === "P0" && s.actionSelector && !s.actionSelector.startsWith("[data-testid")) {
      drifts.push({
        id: `sel-${s.routeKey}`,
        category: "selector",
        severity: "warning",
        surface: s.routeKey,
        description: `Non-standard selector pattern for P0 surface`,
        registryValue: s.actionSelector,
        actualValue: "Should use data-testid pattern",
        detectedAt: now,
      });
    }
  });

  // Check for surfaces in registry but not in DB
  if (dbSurfaces.length > 0) {
    const dbKeys = new Set(dbSurfaces.map((d: any) => d.route_key));
    SURFACE_REGISTRY.forEach(s => {
      if (!dbKeys.has(s.routeKey)) {
        drifts.push({
          id: `missing-${s.routeKey}`,
          category: "missing",
          severity: s.testPriority === "P0" ? "critical" : "info",
          surface: s.routeKey,
          description: `Registry entry not synced to verification_surfaces table`,
          registryValue: "defined in code",
          actualValue: "missing from DB",
          detectedAt: now,
        });
      }
    });
  }

  // Check redirects with wildcard targets
  SURFACE_REGISTRY.filter(s => s.redirectTarget?.includes("*")).forEach(s => {
    drifts.push({
      id: `redirect-wildcard-${s.routeKey}`,
      category: "redirect",
      severity: "info",
      surface: s.routeKey,
      description: `Redirect target uses wildcard — cannot be statically verified`,
      registryValue: s.redirectTarget || "",
      actualValue: "dynamic",
      detectedAt: now,
    });
  });

  // Check journey manifests referencing routes not in registry
  CUSTOMER_JOURNEY_REGISTRY.forEach(j => {
    const hasRoute = SURFACE_REGISTRY.some(s => s.routePath === j.routeFamily || s.routePath.startsWith(j.routeFamily));
    if (!hasRoute) {
      drifts.push({
        id: `journey-${j.journeyKey}`,
        category: "journey",
        severity: "warning",
        surface: j.journeyKey,
        description: `Journey route family not found in surface registry`,
        registryValue: j.routeFamily,
        actualValue: "no matching surface entry",
        detectedAt: now,
      });
    }
  });

  return drifts;
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-destructive/15 text-destructive" },
  warning: { label: "Warning", color: "bg-amber-500/15 text-amber-400" },
  info: { label: "Info", color: "bg-blue-500/15 text-blue-400" },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof AlertTriangle }> = {
  selector: { label: "Selector Drift", icon: GitBranch },
  redirect: { label: "Redirect Change", icon: ArrowRight },
  form: { label: "Form Change", icon: Shield },
  permission: { label: "Permission Change", icon: Shield },
  shell: { label: "Shell/Context Change", icon: AlertTriangle },
  journey: { label: "Journey Mismatch", icon: Clock },
  missing: { label: "Missing Entry", icon: XCircle },
};

export default function JVC13InteractionDriftRadar() {
  const { data: dbSurfaces } = useVerificationSurfaces();
  const [activeTab, setActiveTab] = useState("all");

  const drifts = useMemo(() => detectDrifts(dbSurfaces || []), [dbSurfaces]);

  const categories = [...new Set(drifts.map(d => d.category))];
  const criticalCount = drifts.filter(d => d.severity === "critical").length;
  const warningCount = drifts.filter(d => d.severity === "warning").length;
  const infoCount = drifts.filter(d => d.severity === "info").length;

  const filteredDrifts = activeTab === "all" ? drifts : drifts.filter(d => d.category === activeTab);

  return (
    <div className="space-y-6 p-6" data-testid="jvc13-drift-radar">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Radar className="h-6 w-6 text-primary" />
          JVC13 — Interaction Drift Radar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Detect mismatches between intended and actual behavior</p>
      </div>

      {/* Severity Rail */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold">{drifts.length}</div>
          <div className="text-xs text-muted-foreground">Total Drifts</div>
        </CardContent></Card>
        <Card className={criticalCount > 0 ? "border-destructive/30" : ""}><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{warningCount}</div>
          <div className="text-xs text-muted-foreground">Warnings</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{infoCount}</div>
          <div className="text-xs text-muted-foreground">Info</div>
        </CardContent></Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs">
            All ({drifts.length})
          </TabsTrigger>
          {categories.map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const count = drifts.filter(d => d.category === cat).length;
            return (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {config?.label || cat} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Surface</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Registry</TableHead>
                    <TableHead className="text-xs">Actual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrifts.map(d => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Badge className={`text-[10px] ${SEVERITY_CONFIG[d.severity]?.color || ""}`}>
                          {SEVERITY_CONFIG[d.severity]?.label || d.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {CATEGORY_CONFIG[d.category]?.label || d.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{d.surface}</TableCell>
                      <TableCell className="text-xs">{d.description}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground max-w-[150px] truncate">{d.registryValue}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground max-w-[150px] truncate">{d.actualValue}</TableCell>
                    </TableRow>
                  ))}
                  {filteredDrifts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No drifts detected in this category</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drift Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Recent Drift Events</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {drifts.slice(0, 10).map(d => (
              <div key={d.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                <div className={`w-2 h-2 rounded-full ${
                  d.severity === "critical" ? "bg-destructive" :
                  d.severity === "warning" ? "bg-amber-400" : "bg-blue-400"
                }`} />
                <span className="text-xs font-mono text-muted-foreground">{d.surface}</span>
                <span className="text-xs flex-1">{d.description}</span>
                <Badge className={`text-[10px] ${SEVERITY_CONFIG[d.severity]?.color || ""}`}>
                  {d.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resolution Workflow */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Resolution Workflow</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">1</Badge>
              <span>Identify drift via radar scan</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">2</Badge>
              <span>Classify as intentional change or regression</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">3</Badge>
              <span>Update registry entry or fix implementation</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">4</Badge>
              <span>Re-run verification to confirm resolution</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
