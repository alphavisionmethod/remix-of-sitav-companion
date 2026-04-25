// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Boundary Board (Admin)
// Visual dashboard for layer health, service budget, violations,
// separation maturity, and capability discipline verdicts.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { RuntimeViolationScanner } from "@/platform/admin/components/admin/architecture/RuntimeViolationScanner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Layers, AlertTriangle, CheckCircle2, ArrowRight, Ban, CircleDot, Target, Clock, XCircle } from "lucide-react";
import { LAYERS, ROUTE_LAYER_MAP, SERVICE_LAYER_MAP, type Layer } from "@/platform/architecture/layer-manifest";
import { ALLOWED_IMPORTS, FORBIDDEN_PATTERNS } from "@/platform/architecture/boundary-rules";
import { ROUTE_FAMILIES } from "@/platform/architecture/route-registry";
import { SERVICE_BUDGET, DUPLICATE_SERVICES, KERNEL_SERVICES, OS_SERVICES_LIST, DOMAIN_SERVICES } from "@/platform/architecture/service-ownership-manifest";

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

// ── Separation Maturity Data ────────────────────────────────────

interface MaturityRow {
  layer: Layer;
  boundary_explicit: boolean;
  imports_enforced: boolean;
  routing_correct: boolean;
  ownership_declared: boolean;
  ci_checked: boolean;
}

const MATURITY_DATA: MaturityRow[] = [
  { layer: LAYERS.WEB, boundary_explicit: true, imports_enforced: true, routing_correct: true, ownership_declared: true, ci_checked: true },
  { layer: LAYERS.APP, boundary_explicit: true, imports_enforced: true, routing_correct: true, ownership_declared: true, ci_checked: true },
  { layer: LAYERS.OS_SERVICES, boundary_explicit: true, imports_enforced: true, routing_correct: true, ownership_declared: true, ci_checked: true },
  { layer: LAYERS.OS_KERNEL, boundary_explicit: true, imports_enforced: true, routing_correct: true, ownership_declared: true, ci_checked: true },
  { layer: LAYERS.ADMIN_OPERATOR, boundary_explicit: true, imports_enforced: true, routing_correct: true, ownership_declared: true, ci_checked: true },
  { layer: LAYERS.DOMAIN_CAPABILITY, boundary_explicit: true, imports_enforced: true, routing_correct: true, ownership_declared: true, ci_checked: true },
];

// ── Capability Discipline Verdicts ──────────────────────────────

type Verdict = "build_now" | "partial_only" | "build_later" | "defer_strictly" | "avoid_for_now";

interface CapabilityVerdict {
  name: string;
  verdict: Verdict;
  rationale: string;
}

const CAPABILITY_VERDICTS: CapabilityVerdict[] = [
  { name: "Capability/Tool Routing", verdict: "build_now", rationale: "Reduces kernel bypass risk. Essential for correct execution chain." },
  { name: "Adaptive Router", verdict: "partial_only", rationale: "Bounded, explainable routing only. No black-box model selection." },
  { name: "Consensus Verification", verdict: "partial_only", rationale: "Only for high-stakes flows (financial, irreversible)." },
  { name: "Automated Ingestion", verdict: "partial_only", rationale: "Approved bounded sources only. No broad crawling." },
  { name: "Journey Engine", verdict: "partial_only", rationale: "Selected workflows only. No speculative multi-journey orchestration." },
  { name: "Reasoning Trace Viewer", verdict: "build_later", rationale: "Improves trust but requires stable execution chain first." },
  { name: "Long-Term Memory", verdict: "build_later", rationale: "Requires structured memory governance, privacy tiers, provenance." },
  { name: "Local Model Fallback", verdict: "defer_strictly", rationale: "No proven offline/privacy need. Premature complexity." },
  { name: "Full LoRA / Personalization", verdict: "defer_strictly", rationale: "Architecture trap. No product justification yet." },
  { name: "Model Distillation", verdict: "defer_strictly", rationale: "Requires mature model routing and cost governance first." },
  { name: "Multi-modal Fusion", verdict: "defer_strictly", rationale: "Text-first is correct. Image/audio/video is speculative sprawl." },
  { name: "On-Device Models", verdict: "avoid_for_now", rationale: "No device strategy. No offline mandate. Pure complexity." },
  { name: "Autonomous Self-Healing AI", verdict: "avoid_for_now", rationale: "Violates trust model. Self-learning must never mutate permissions." },
  { name: "Full Autopilot", verdict: "avoid_for_now", rationale: "Category violation. SITA is sovereign-control, not autonomous-agent." },
];

const VERDICT_STYLES: Record<Verdict, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  build_now: { bg: "bg-emerald-500/15", text: "text-emerald-400", icon: CheckCircle2 },
  partial_only: { bg: "bg-blue-500/15", text: "text-blue-400", icon: Target },
  build_later: { bg: "bg-amber-500/15", text: "text-amber-400", icon: Clock },
  defer_strictly: { bg: "bg-orange-500/15", text: "text-orange-400", icon: Ban },
  avoid_for_now: { bg: "bg-red-500/15", text: "text-red-400", icon: XCircle },
};

// ── Layer Ring Visualization ────────────────────────────────────

function LayerRings({ routesByLayer }: { routesByLayer: Record<string, number> }) {
  const layers: { layer: Layer; radius: number; color: string }[] = [
    { layer: LAYERS.OS_KERNEL, radius: 40, color: "hsl(38 92% 50%)" },
    { layer: LAYERS.OS_SERVICES, radius: 65, color: "hsl(265 55% 58%)" },
    { layer: LAYERS.DOMAIN_CAPABILITY, radius: 85, color: "hsl(38 85% 58%)" },
    { layer: LAYERS.APP, radius: 105, color: "hsl(152 55% 48%)" },
    { layer: LAYERS.ADMIN_OPERATOR, radius: 122, color: "hsl(0 72% 51%)" },
    { layer: LAYERS.WEB, radius: 138, color: "hsl(217 91% 60%)" },
  ];

  return (
    <div className="flex items-center justify-center py-4">
      <svg viewBox="0 0 300 300" className="w-64 h-64">
        {layers.map(({ layer, radius, color }, i) => (
          <g key={layer}>
            <circle
              cx="150" cy="150" r={radius}
              fill="none" stroke={color} strokeWidth="14"
              opacity="0.35"
              className="transition-all duration-500"
            />
            <circle
              cx="150" cy="150" r={radius}
              fill="none" stroke={color} strokeWidth="14"
              strokeDasharray={`${(routesByLayer[layer] || 0) * 8} ${2 * Math.PI * radius}`}
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{ animationDelay: `${i * 100}ms` }}
            />
            <text
              x="150" y={150 - radius + 4}
              textAnchor="middle" fill={color}
              fontSize="7" fontWeight="600"
            >
              {LAYER_LABELS[layer]} ({routesByLayer[layer] || 0})
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function ArchitectureBoundaryBoard() {
  const budget = SERVICE_BUDGET;

  const routesByLayer = useMemo(() => {
    const counts: Record<string, number> = {};
    ROUTE_LAYER_MAP.forEach(r => { counts[r.layer] = (counts[r.layer] || 0) + 1; });
    return counts;
  }, []);

  const totalRoutes = ROUTE_LAYER_MAP.length;
  const totalServices = Object.keys(SERVICE_LAYER_MAP).length;

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
          <p className="text-sm text-muted-foreground">6-Layer separation health, service budget, maturity, and capability discipline</p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <p className="text-xs mt-1 text-muted-foreground">shared between services/ & core-services/</p>
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
              <Shield className="h-4 w-4" /> CI Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--trust-safe))]">9</div>
            <p className="text-xs mt-1 text-muted-foreground">boundary enforcement rules active</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" /> Mapped Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalServices}</div>
            <p className="text-xs mt-1 text-muted-foreground">in SERVICE_LAYER_MAP</p>
          </CardContent>
        </Card>
      </div>

      {/* Layer Ring Visualization + Layer Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Layer Ring Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            <LayerRings routesByLayer={routesByLayer} />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Layer Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
      </div>

      {/* Separation Maturity Matrix */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Separation Maturity Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layer</TableHead>
                <TableHead className="text-center">Boundary Explicit</TableHead>
                <TableHead className="text-center">Imports Enforced</TableHead>
                <TableHead className="text-center">Routing Correct</TableHead>
                <TableHead className="text-center">Ownership Declared</TableHead>
                <TableHead className="text-center">CI Checked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MATURITY_DATA.map(row => (
                <TableRow key={row.layer}>
                  <TableCell>
                    <Badge className={`text-xs border ${LAYER_COLORS[row.layer]}`} variant="outline">
                      {LAYER_LABELS[row.layer]}
                    </Badge>
                  </TableCell>
                  {[row.boundary_explicit, row.imports_enforced, row.routing_correct, row.ownership_declared, row.ci_checked].map((v, i) => (
                    <TableCell key={i} className="text-center">
                      {v ? (
                        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))] mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Capability Discipline Verdicts */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="text-base">Implementation Discipline — Capability Verdicts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CAPABILITY_VERDICTS.map(cap => {
              const style = VERDICT_STYLES[cap.verdict];
              const Icon = style.icon;
              return (
                <div key={cap.name} className={`flex items-start gap-3 p-3 rounded-lg border border-border/30 ${style.bg}`}>
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.text}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{cap.name}</span>
                      <Badge variant="outline" className={`text-[10px] ${style.text} border-current`}>
                        {cap.verdict.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{cap.rationale}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Runtime Violation Scanner */}
      <RuntimeViolationScanner />

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
