// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Empty-State Closure Truth Panel
// Operator-facing live view for the admin-empty-state-closure pass.
// Mounted as tab #12 on /admin/ai-runtime (AI Engineer hub).
//
// Reads:
//   • generated/admin-empty-state-closure/admin-empty-state-verification.json
//   • generated/admin-empty-state-closure/cross-domain-coherence-status.json
//   • generated/admin-empty-state-closure/cost-spotlight-status.json
//   • generated/admin-empty-state-closure/sbom-history-status.json
//
// Two tabs: Canonical Pattern (In-Scope green) + Deferred Surfaces (honest WARN).
// Real onClick + Link satisfy no-museum-boards + admin-action-orientation gates.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutTemplate,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { TruthPanelActions } from "./TruthPanelActions";

interface CanonicalAlt {
  label: string;
  path: string;
}

interface SurfaceStatus {
  surface?: string;
  status?: string;
  scope?: string;
  classification?: string;
  validator?: string;
  deferralDoc?: string;
  expectedPagePath?: string;
  canonicalAlternatives?: CanonicalAlt[];
  requiredForGreen?: string;
  [key: string]: unknown;
}

interface VerificationJson {
  generatedAt?: string;
  scope?: string;
  verdict?: string;
  deferred?: string[];
  aggregatorGatesAdded?: number;
  totalRequiredGates?: number;
  previousRequiredGates?: number;
  validators?: { warnTier?: string[] };
  canonicalPrimitives?: Record<string, string>;
  deliverables?: string[];
  truthPanel?: { mount?: string; tabIndex?: number };
  honestyPolicy?: string;
}

async function loadJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const DEFERRED_SURFACE_IDS: Array<{
  id: string;
  label: string;
  doc: string;
  file: string;
}> = [
  {
    id: "cross-domain-coherence",
    label: "Cross-Domain Coherence",
    doc: "CROSS_DOMAIN_COHERENCE_EMPTY_STATE_SPEC.md",
    file: "cross-domain-coherence-status.json",
  },
  {
    id: "cost-spotlight",
    label: "Cost Spotlight",
    doc: "COST_SPOTLIGHT_EMPTY_STATE_SPEC.md",
    file: "cost-spotlight-status.json",
  },
  {
    id: "sbom-history",
    label: "SBOM History",
    doc: "SBOM_HISTORY_EMPTY_STATE_SPEC.md",
    file: "sbom-history-status.json",
  },
];

export default function AdminEmptyStateClosureTruthPanel() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verification, setVerification] = useState<VerificationJson | null>(null);
  const [statuses, setStatuses] = useState<Record<string, SurfaceStatus | null>>({});

  const load = useCallback(async () => {
    setRefreshing(true);
    const base = "/generated/admin-empty-state-closure";
    const v = await loadJson<VerificationJson>(`${base}/admin-empty-state-verification.json`);
    const results = await Promise.all(
      DEFERRED_SURFACE_IDS.map((d) => loadJson<SurfaceStatus>(`${base}/${d.file}`)),
    );
    const next: Record<string, SurfaceStatus | null> = {};
    DEFERRED_SURFACE_IDS.forEach((d, i) => {
      next[d.id] = results[i];
    });
    setVerification(v);
    setStatuses(next);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleOpenRegister = () => {
    window.open(
      "/generated/admin-empty-state-closure/ADMIN_EMPTY_STATE_FINAL_VERIFICATION.md",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const isFullyShipped = verification?.verdict?.includes("GREEN-fully-shipped");
  const verdictBadge = isFullyShipped ? (
    <Badge variant="outline" className="border-primary text-primary">
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Fully shipped · GREEN
    </Badge>
  ) : verification?.verdict?.includes("GREEN") ? (
    <Badge variant="outline" className="border-primary text-primary">
      <CheckCircle2 className="mr-1 h-3 w-3" />
      In-scope GREEN
    </Badge>
  ) : (
    <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
      <AlertTriangle className="mr-1 h-3 w-3" />
      pending
    </Badge>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <LayoutTemplate className="h-4 w-4 text-primary" />
              Admin Empty-State Closure Truth
              {!loading && verdictBadge}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {isFullyShipped
                ? "All 3 admin empty-state surfaces shipped using the canonical PremiumEmptyState primitive. Cross-Domain Coherence, Cost Spotlight, and SBOM History are live in their canonical hubs with operator-grade copy, real /admin/* destinations, and explicit non-live labeling for preview content. Zero duplicates."
                : "Admin AI engineering closure: 3 canonical empty-state primitives confirmed in-scope · 3 surfaces honestly deferred to verification/health/releases domain passes (WARN-tier with cross-referenced deferral docs). Zero fake-green."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleOpenRegister}
              aria-label="Open deferral register"
            >
              <ListChecks className="mr-1 h-3 w-3" />
              View deferral register
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                void load();
              }}
              disabled={refreshing}
              aria-label="Refresh empty-state closure evidence"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <TruthPanelActions
              onRefresh={load}
              refreshing={refreshing}
              sourcePath="/generated/admin-empty-state-closure/admin-empty-state-verification.json"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Tabs defaultValue="canonical">
              <TabsList>
                <TabsTrigger value="canonical">
                  Canonical Pattern (In-Scope) ·{" "}
                  {verification?.canonicalPrimitives
                    ? Object.keys(verification.canonicalPrimitives).length
                    : 3}
                </TabsTrigger>
                <TabsTrigger value="deferred">
                  {isFullyShipped ? "Shipped Surfaces" : "Deferred Surfaces"} ·{" "}
                  {DEFERRED_SURFACE_IDS.length}
                </TabsTrigger>
                <TabsTrigger value="meta">Closure Meta</TabsTrigger>
              </TabsList>

              <TabsContent value="canonical" className="space-y-3 pt-3">
                <div className="rounded border border-primary/40 bg-primary/5 p-3 text-xs text-muted-foreground">
                  Three canonical primitives ALREADY EXIST and are reusable. No new admin
                  empty-state component was introduced (no-duplicates rule enforced).
                </div>
                {verification?.canonicalPrimitives &&
                  Object.entries(verification.canonicalPrimitives).map(([name, path]) => (
                    <div key={name} className="rounded border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            canonical
                          </Badge>
                        </div>
                        <code className="text-[10px] text-muted-foreground">{path}</code>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="deferred" className="space-y-3 pt-3">
                <div
                  className={`rounded border p-3 text-xs text-muted-foreground ${
                    isFullyShipped
                      ? "border-primary/40 bg-primary/5"
                      : "border-muted-foreground/30 bg-muted/30"
                  }`}
                >
                  {isFullyShipped ? (
                    <>
                      All 3 surfaces are <strong>shipped</strong> with the canonical{" "}
                      <code>PremiumEmptyState</code> primitive. Each surface is registered in its
                      canonical domain hub and reachable via a direct route. Open buttons below
                      navigate to the live boards.
                    </>
                  ) : (
                    <>
                      These 3 surfaces are <strong>out-of-admin-AI-engineering-scope</strong>.
                      UX build requires the verification, health, and releases domain passes
                      respectively. Each is tracked by an honest WARN-tier validator with
                      explicit cross-reference — never silent passes.
                    </>
                  )}
                </div>
                {DEFERRED_SURFACE_IDS.map((d) => {
                  const s = statuses[d.id];
                  const shipped = s?.status === "implemented-canonical-primitive-adopted";
                  return (
                    <div key={d.id} className="rounded border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {shipped ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">{d.label}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              shipped
                                ? "border-primary text-primary"
                                : "border-muted-foreground/40 text-muted-foreground"
                            }`}
                          >
                            {shipped ? "shipped" : (s?.status ?? "deferred")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {shipped && s?.surface && (
                            <Link to={s.surface}>
                              <Button type="button" size="sm" variant="default">
                                <ArrowRight className="mr-1 h-3 w-3" />
                                Open live board
                              </Button>
                            </Link>
                          )}
                          <Link
                            to={`/generated/admin-empty-state-closure/${d.doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button type="button" size="sm" variant="ghost">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Spec
                            </Button>
                          </Link>
                        </div>
                      </div>
                      {s?.surface && (
                        <div className="mt-2 text-xs">
                          <span className="text-muted-foreground">Expected route: </span>
                          <code className="font-mono text-[10px]">{s.surface}</code>
                        </div>
                      )}
                      {s?.expectedPagePath && (
                        <div className="mt-1 text-xs">
                          <span className="text-muted-foreground">Expected page: </span>
                          <code className="font-mono text-[10px]">{s.expectedPagePath}</code>
                        </div>
                      )}
                      {s?.requiredForGreen && (
                        <div className="mt-1 text-xs">
                          <span className="text-muted-foreground">Required for green: </span>
                          <span>{s.requiredForGreen}</span>
                        </div>
                      )}
                      {s?.validator && (
                        <div className="mt-1 text-xs">
                          <span className="text-muted-foreground">Validator: </span>
                          <span className="font-mono text-[10px]">{s.validator}</span>
                        </div>
                      )}
                      {s?.canonicalAlternatives && s.canonicalAlternatives.length > 0 && (
                        <div className="mt-3 border-t border-border/50 pt-3">
                          <div className="mb-2 text-[11px] font-medium uppercase text-muted-foreground">
                            Canonical destinations meanwhile (real navigable routes)
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {s.canonicalAlternatives.map((alt) => (
                              <Link key={alt.path} to={alt.path}>
                                <Button type="button" size="sm" variant="outline">
                                  <ArrowRight className="mr-1 h-3 w-3" />
                                  {alt.label}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="meta" className="space-y-3 pt-3">
                {!verification ? (
                  <div className="text-xs text-muted-foreground">
                    Verification artifact not yet emitted.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded border bg-card p-3">
                        <div className="text-xs uppercase text-muted-foreground">
                          Canonical primitives
                        </div>
                        <div className="text-2xl font-semibold">
                          {verification.canonicalPrimitives
                            ? Object.keys(verification.canonicalPrimitives).length
                            : 0}
                        </div>
                      </div>
                      <div className="rounded border bg-card p-3">
                        <div className="text-xs uppercase text-muted-foreground">Deferred</div>
                        <div className="text-2xl font-semibold">
                          {verification.deferred?.length ?? 0}
                        </div>
                      </div>
                      <div className="rounded border bg-card p-3">
                        <div className="text-xs uppercase text-muted-foreground">
                          Aggregator gates added
                        </div>
                        <div className="text-2xl font-semibold">
                          {verification.aggregatorGatesAdded ?? 0}
                        </div>
                      </div>
                    </div>

                    {verification.validators?.warnTier && (
                      <div className="rounded border bg-card p-3">
                        <div className="mb-2 text-xs font-medium">
                          Honest WARN-tier validators
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {verification.validators.warnTier.map((v) => (
                            <Badge key={v} variant="outline" className="font-mono text-[10px]">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {verification.totalRequiredGates && (
                      <div className="rounded border bg-card p-3 text-xs">
                        <span className="text-muted-foreground">Release gate count: </span>
                        <span className="font-mono">
                          {verification.previousRequiredGates ?? "?"} →{" "}
                          {verification.totalRequiredGates}
                        </span>
                      </div>
                    )}

                    {verification.honestyPolicy && (
                      <div className="rounded border bg-card p-3 text-xs">
                        <span className="text-muted-foreground">Honesty policy: </span>
                        <span>{verification.honestyPolicy}</span>
                      </div>
                    )}

                    {verification.truthPanel?.mount && (
                      <div className="rounded border bg-card p-3 text-xs">
                        <span className="text-muted-foreground">Truth panel mount: </span>
                        <span className="font-mono">{verification.truthPanel.mount}</span>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
