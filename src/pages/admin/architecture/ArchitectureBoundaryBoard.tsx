// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Boundary Board (Admin)
// Visual dashboard for layer health, service budget, violations
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Layers, AlertTriangle, CheckCircle2, ArrowRight, Ban, CircleDot } from "lucide-react";
import { LAYERS, ROUTE_LAYER_MAP, SERVICE_LAYER_MAP, type Layer } from "@/lib/architecture/layer-manifest";
import { ALLOWED_IMPORTS, FORBIDDEN_PATTERNS } from "@/lib/architecture/boundary-rules";
import { ROUTE_FAMILIES } from "@/lib/architecture/route-registry";
import { SERVICE_BUDGET, DUPLICATE_SERVICES, KERNEL_SERVICES, OS_SERVICES_LIST, DOMAIN_SERVICES } from "@/lib/architecture/service-ownership-manifest";

const LAYER_COLORS: Record<Layer, string> = {
  "web": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "app": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "os-services": "bg-[hsl(var(--sita-purple)/0.2)] text-[hsl(var(--sita-purple-light))] border-[hsl(var(--sita-purple)/0.3)]",
  "os-kernel": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "admin-operator": "bg-red-500/20 text-red-400 border-red-500/30",
  "domain-capability": "bg-[hsl(var(--sita-gold)/0.2)] text-[hsl(var(--sita-gold))] border-[hsl(var(--sita-gold)/0.3)]",
};

const LAYER_LABELS: Record<Layer, string> = {
  "web": "Web",
  "app": "App",
  "os-services": "OS Services",
  "os-kernel": "OS Kernel",
  "admin-operator": "Admin/Operator",
  "domain-capability": "Domain Capability",
};

export default function ArchitectureBoundaryBoard() {
  const budget = SERVICE_BUDGET;

  const routesByLayer = useMemo(() => {
    const counts: Record<string, number> = {};
    ROUTE_LAYER_MAP.forEach(r => { counts[r.layer] = (counts[r.layer] || 0) + 1; });
    return counts;
  }, []);

  const totalRoutes = ROUTE_LAYER_MAP.length;
  const importRuleEntries = useMemo(() => {
    const entries: { from: Layer; to: Layer; allowed: boolean }[] = [];
    const allLayers = Object.values(LAYERS) as Layer[];
    for (const from of allLayers) {
      const allowed = ALLOWED_IMPORTS[from] || new Set();
      for (const to of allLayers) {
        if (from === to) continue;
        entries.push({ from, to, allowed: allowed.has(to) });
      }
    }
    return entries;
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[hsl(var(--sita-purple)/0.15)]">
          <Shield className="h-6 w-6 text-[hsl(var(--sita-purple-light))]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Architecture Boundary Board</h1>
          <p className="text-sm text-muted-foreground">6-Layer separation health, service budget, and violation tracking</p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" /> Service Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {budget.total}<span className="text-lg text-muted-foreground">/{budget.maxCanonical}</span>
            </div>
            <Progress value={(budget.total / budget.maxCanonical) * 100} className="mt-2 h-2" />
            <p className="text-xs mt-1 text-muted-foreground">
              {budget.withinBudget ? (
                <span className="text-[hsl(var(--trust-safe))]">✓ Within budget</span>
              ) : (
                <span className="text-destructive">⚠ {budget.overage} over budget</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Duplicate Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--sita-gold))]">{DUPLICATE_SERVICES.length}</div>
            <p className="text-xs mt-1 text-muted-foreground">directories shared between services/ and core-services/</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CircleDot className="h-4 w-4" /> Route Prefixes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalRoutes}</div>
            <p className="text-xs mt-1 text-muted-foreground">across {Object.keys(LAYERS).length} layers</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Forbidden Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--trust-safe))]">{FORBIDDEN_PATTERNS.length}</div>
            <p className="text-xs mt-1 text-muted-foreground">cross-layer violations enforced</p>
          </CardContent>
        </Card>
      </div>

      {/* Layer Distribution */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Layer Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(Object.values(LAYERS) as Layer[]).map(layer => (
              <div key={layer} className={`rounded-lg border p-3 ${LAYER_COLORS[layer]}`}>
                <div className="text-xs font-medium opacity-80">{LAYER_LABELS[layer]}</div>
                <div className="text-2xl font-bold mt-1">{routesByLayer[layer] || 0}</div>
                <div className="text-xs opacity-60">prefixes</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Direction Rules */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Import Direction Rules ({importRuleEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {importRuleEntries.filter(r => r.allowed).map((rule, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                <CheckCircle2 className="h-3 w-3 text-[hsl(var(--trust-safe))] shrink-0" />
                <span className="text-muted-foreground text-xs">{LAYER_LABELS[rule.from]}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-xs">{LAYER_LABELS[rule.to]}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-destructive mb-2">Forbidden Patterns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {FORBIDDEN_PATTERNS.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-destructive/5 border border-destructive/20">
                  <Ban className="h-3 w-3 text-destructive shrink-0" />
                  <span className="text-xs text-muted-foreground">{p.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Layer Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Kernel Services ({KERNEL_SERVICES.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {KERNEL_SERVICES.map(s => (
                <Badge key={s} variant="outline" className="text-xs border-amber-500/30 text-amber-400">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">OS Services ({OS_SERVICES_LIST.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {OS_SERVICES_LIST.map(s => (
                <Badge key={s} variant="outline" className="text-xs border-[hsl(var(--sita-purple)/0.3)] text-[hsl(var(--sita-purple-light))]">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Domain Services ({DOMAIN_SERVICES.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {DOMAIN_SERVICES.map(s => (
                <Badge key={s} variant="outline" className="text-xs border-[hsl(var(--sita-gold)/0.3)] text-[hsl(var(--sita-gold))]">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Services Table */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Duplicate Service Tracker ({DUPLICATE_SERVICES.length})</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service ID</TableHead>
                <TableHead>In services/</TableHead>
                <TableHead>In core-services/</TableHead>
                <TableHead>Canonical</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DUPLICATE_SERVICES.map(d => (
                <TableRow key={d.serviceId}>
                  <TableCell className="font-mono text-xs">{d.serviceId}</TableCell>
                  <TableCell>{d.inServices ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> : "—"}</TableCell>
                  <TableCell>{d.inCoreServices ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))]" /> : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{d.canonicalLocation}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Route Families */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Route Families ({ROUTE_FAMILIES.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Layer</TableHead>
                <TableHead>Routes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROUTE_FAMILIES.map(f => (
                <TableRow key={f.family}>
                  <TableCell className="font-medium text-sm">{f.family}</TableCell>
                  <TableCell className="font-mono text-xs">{f.prefix}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs border ${LAYER_COLORS[f.layer]}`} variant="outline">
                      {LAYER_LABELS[f.layer]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{f.routeCount}</TableCell>
                  <TableCell>
                    <Badge variant={f.status === "correctly_placed" ? "default" : "destructive"} className="text-xs">
                      {f.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
