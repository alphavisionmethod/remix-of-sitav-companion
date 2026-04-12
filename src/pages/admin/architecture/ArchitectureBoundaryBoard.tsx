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
import { IMPORT_RULES, FORBIDDEN_PATTERNS } from "@/lib/architecture/boundary-rules";
import { ROUTE_REGISTRY } from "@/lib/architecture/route-registry";
import { SERVICE_BUDGET, DUPLICATE_SERVICES, KERNEL_SERVICES, OS_SERVICES_LIST, DOMAIN_SERVICES } from "@/lib/architecture/service-ownership-manifest";

const LAYER_COLORS: Record<Layer, string> = {
  web: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  app: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  os_services: "bg-[hsl(var(--sita-purple)/0.2)] text-[hsl(var(--sita-purple-light))] border-[hsl(var(--sita-purple)/0.3)]",
  os_kernel: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  admin_operator: "bg-red-500/20 text-red-400 border-red-500/30",
  domain_capability: "bg-[hsl(var(--sita-gold)/0.2)] text-[hsl(var(--sita-gold))] border-[hsl(var(--sita-gold)/0.3)]",
};

const LAYER_LABELS: Record<Layer, string> = {
  web: "Web",
  app: "App",
  os_services: "OS Services",
  os_kernel: "OS Kernel",
  admin_operator: "Admin/Operator",
  domain_capability: "Domain Capability",
};

export default function ArchitectureBoundaryBoard() {
  const budget = SERVICE_BUDGET;

  const routesByLayer = useMemo(() => {
    const counts: Record<Layer, number> = { web: 0, app: 0, os_services: 0, os_kernel: 0, admin_operator: 0, domain_capability: 0 };
    ROUTE_REGISTRY.forEach(r => { counts[r.layer] = (counts[r.layer] || 0) + 1; });
    return counts;
  }, []);

  const totalRoutes = useMemo(() => Object.values(routesByLayer).reduce((s, n) => s + n, 0), [routesByLayer]);

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
        {/* Service Budget */}
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

        {/* Duplicate Count */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Duplicate Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{DUPLICATE_SERVICES.length}</div>
            <p className="text-xs mt-1 text-muted-foreground">directories shared between services/ and core-services/</p>
          </CardContent>
        </Card>

        {/* Total Routes */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CircleDot className="h-4 w-4" /> Total Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalRoutes}</div>
            <p className="text-xs mt-1 text-muted-foreground">across {Object.keys(LAYERS).length} layers</p>
          </CardContent>
        </Card>

        {/* Import Rules */}
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Boundary Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--trust-safe))]">{IMPORT_RULES.length}</div>
            <p className="text-xs mt-1 text-muted-foreground">{FORBIDDEN_PATTERNS.length} forbidden patterns enforced</p>
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
            {(Object.keys(LAYERS) as Layer[]).map(layer => (
              <div key={layer} className={`rounded-lg border p-3 ${LAYER_COLORS[layer]}`}>
                <div className="text-xs font-medium opacity-80">{LAYER_LABELS[layer]}</div>
                <div className="text-2xl font-bold mt-1">{routesByLayer[layer] || 0}</div>
                <div className="text-xs opacity-60">routes</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Direction Rules */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Import Direction Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {IMPORT_RULES.map((rule, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                <Badge variant={rule.allowed ? "default" : "destructive"} className="text-xs w-6 h-6 p-0 flex items-center justify-center">
                  {rule.allowed ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                </Badge>
                <span className="text-muted-foreground">{LAYER_LABELS[rule.from]}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{LAYER_LABELS[rule.to]}</span>
                {rule.restricted && <Badge variant="outline" className="text-xs">restricted</Badge>}
              </div>
            ))}
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
          <CardTitle className="text-base">Duplicate Service Directory Tracker ({DUPLICATE_SERVICES.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service ID</TableHead>
                <TableHead>In services/</TableHead>
                <TableHead>In core-services/</TableHead>
                <TableHead>Canonical Location</TableHead>
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

      {/* Route Family Matrix */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Route Registry ({ROUTE_REGISTRY.length} entries)</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead>Layer</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROUTE_REGISTRY.slice(0, 50).map(r => (
                <TableRow key={r.path}>
                  <TableCell className="font-mono text-xs">{r.path}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs border ${LAYER_COLORS[r.layer]}`} variant="outline">
                      {LAYER_LABELS[r.layer]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.domain || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{r.risk}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {ROUTE_REGISTRY.length > 50 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">Showing 50 of {ROUTE_REGISTRY.length} routes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
