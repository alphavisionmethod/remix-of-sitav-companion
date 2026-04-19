// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Hardening Truth Panel
// Operator-facing live view for the architecture-hardening closure.
// Reads:
//   • generated/architecture-hardening/architecture-hardening-verification.json
//   • generated/architecture-hardening/portability-hardening-status.json
//   • generated/architecture-hardening/truth-hardening-status.json
//
// All three are static JSONs emitted by the closure pass and refreshed
// by the validators on each release-readiness run.
// Mounted as tab #10 on /admin/ai-runtime.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, ShieldCheck, MapPin, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { TruthPanelActions } from "./TruthPanelActions";

interface VerificationJson {
  verdict?: string;
  ok?: boolean;
  deliverables?: { expected?: number; produced?: number };
  validators?: { wired?: number; expected?: number; list?: string[] };
  blockGates?: { before?: number; after?: number; delta?: number };
  truthPanels?: { before?: number; after?: number; added?: string[] };
  regressions?: number;
  fakeGreens?: number;
  filesDeleted?: number;
  crossReferencedClosures?: string[];
}

interface PortabilityJson {
  ok?: boolean;
  summary?: {
    classifiedHooks?: number;
    leafBrowserOnly?: number;
    shellSpecific?: number;
    adapterRouted?: number;
    unclassifiedViolations?: number;
    shellRuntimeCrossImports?: number;
  };
  canonicalAdapter?: string;
  secondAbstractionPresent?: boolean;
}

interface TruthJson {
  ok?: boolean;
  summary?: {
    subClosuresGoverned?: number;
    totalGeneratedArtifacts?: number;
    duplicateTruthSources?: number;
    staleCanonicalDocs?: number;
    competingActiveManifests?: number;
  };
  canonicalSources?: Record<string, string>;
  driftValidators?: string[];
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

export default function ArchitectureHardeningTruthPanel() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verification, setVerification] = useState<VerificationJson | null>(null);
  const [portability, setPortability] = useState<PortabilityJson | null>(null);
  const [truth, setTruth] = useState<TruthJson | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [v, p, t] = await Promise.all([
      loadJson<VerificationJson>(
        "/generated/architecture-hardening/architecture-hardening-verification.json",
      ),
      loadJson<PortabilityJson>(
        "/generated/architecture-hardening/portability-hardening-status.json",
      ),
      loadJson<TruthJson>("/generated/architecture-hardening/truth-hardening-status.json"),
    ]);
    setVerification(v);
    setPortability(p);
    setTruth(t);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const verdictBadge = verification?.ok ? (
    <Badge variant="outline" className="border-primary text-primary">
      <CheckCircle2 className="mr-1 h-3 w-3" />
      {verification.verdict ?? "PASS"}
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
              <Layers className="h-4 w-4 text-primary" />
              Architecture Hardening Truth
              {!loading && verdictBadge}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Live closure status: 22 deliverables, 6 BLOCK validators, portability boundaries,
              truth-source map. Read-only — refreshed each release-readiness run.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => { void load(); }}
              disabled={refreshing}
              aria-label="Refresh hardening evidence"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh hardening evidence
            </Button>
            <TruthPanelActions
              onRefresh={load}
              refreshing={refreshing}
              sourcePath="/generated/architecture-hardening/architecture-hardening-verification.json"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" onValueChange={(v) => { void v; }}>
            <TabsList>
              <TabsTrigger value="status">Hardening Status</TabsTrigger>
              <TabsTrigger value="portability">Portability Health</TabsTrigger>
              <TabsTrigger value="truth">Truth-Source Map</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-3 pt-3">
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : !verification ? (
                <div className="text-xs text-muted-foreground">
                  Verification report not yet emitted. Run{" "}
                  <code>npm run closure:architecture-hardening:run-all</code>.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="rounded border bg-card p-3">
                      <div className="text-xs uppercase text-muted-foreground">Deliverables</div>
                      <div className="text-2xl font-semibold">
                        {verification.deliverables?.produced ?? 0}/
                        {verification.deliverables?.expected ?? 0}
                      </div>
                    </div>
                    <div className="rounded border bg-card p-3">
                      <div className="text-xs uppercase text-muted-foreground">Validators</div>
                      <div className="text-2xl font-semibold">
                        {verification.validators?.wired ?? 0}/
                        {verification.validators?.expected ?? 0}
                      </div>
                    </div>
                    <div className="rounded border bg-card p-3">
                      <div className="text-xs uppercase text-muted-foreground">BLOCK Gates</div>
                      <div className="text-2xl font-semibold">
                        {verification.blockGates?.after ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{verification.blockGates?.delta ?? 0} this pass
                      </div>
                    </div>
                    <div className="rounded border bg-card p-3">
                      <div className="text-xs uppercase text-muted-foreground">Truth Panels</div>
                      <div className="text-2xl font-semibold">
                        {verification.truthPanels?.after ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{(verification.truthPanels?.added ?? []).length} this pass
                      </div>
                    </div>
                  </div>

                  <div className="rounded border bg-card p-3">
                    <div className="mb-2 text-xs font-medium">New BLOCK validators</div>
                    <div className="flex flex-wrap gap-2">
                      {(verification.validators?.list ?? []).map((v) => (
                        <Badge key={v} variant="secondary" className="font-mono text-[10px]">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded border p-2 text-xs">
                      <span className="text-muted-foreground">Files deleted: </span>
                      <span className="font-mono">{verification.filesDeleted ?? 0}</span>
                    </div>
                    <div className="rounded border p-2 text-xs">
                      <span className="text-muted-foreground">Regressions: </span>
                      <span className="font-mono">{verification.regressions ?? 0}</span>
                    </div>
                    <div className="rounded border p-2 text-xs">
                      <span className="text-muted-foreground">Fake greens: </span>
                      <span className="font-mono">{verification.fakeGreens ?? 0}</span>
                    </div>
                  </div>

                  <div className="rounded border bg-card p-3">
                    <div className="mb-2 text-xs font-medium">Cross-referenced closures</div>
                    <div className="flex flex-wrap gap-2">
                      {(verification.crossReferencedClosures ?? []).map((c) => (
                        <Badge key={c} variant="outline" className="text-[10px]">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="portability" className="space-y-3 pt-3">
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : !portability ? (
                <div className="text-xs text-muted-foreground">
                  Portability status not yet emitted.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Portability boundaries — verified</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded border p-3">
                      <div className="text-xs uppercase text-muted-foreground">
                        Classified hooks
                      </div>
                      <div className="text-2xl font-semibold">
                        {portability.summary?.classifiedHooks ?? 0}
                      </div>
                    </div>
                    <div className="rounded border p-3">
                      <div className="text-xs uppercase text-muted-foreground">
                        Unclassified violations
                      </div>
                      <div className="text-2xl font-semibold">
                        {portability.summary?.unclassifiedViolations ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded border p-2">
                      <div className="text-muted-foreground">leaf-browser-only</div>
                      <div className="font-mono">{portability.summary?.leafBrowserOnly ?? 0}</div>
                    </div>
                    <div className="rounded border p-2">
                      <div className="text-muted-foreground">shell-specific</div>
                      <div className="font-mono">{portability.summary?.shellSpecific ?? 0}</div>
                    </div>
                    <div className="rounded border p-2">
                      <div className="text-muted-foreground">adapter-routed</div>
                      <div className="font-mono">{portability.summary?.adapterRouted ?? 0}</div>
                    </div>
                  </div>

                  <div className="rounded border bg-card p-3 text-xs">
                    <div className="text-muted-foreground">Canonical adapter</div>
                    <div className="font-mono">{portability.canonicalAdapter ?? "—"}</div>
                    <div className="mt-2 text-muted-foreground">
                      Second abstraction present:{" "}
                      <Badge variant="outline" className="ml-1">
                        {portability.secondAbstractionPresent ? "YES (drift)" : "NO"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="truth" className="space-y-3 pt-3">
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : !truth ? (
                <div className="text-xs text-muted-foreground">Truth status not yet emitted.</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Canonical source-of-truth map ({truth.summary?.subClosuresGoverned ?? 0}{" "}
                      sub-closures governed)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded border p-2">
                      <div className="text-muted-foreground">Generated artifacts</div>
                      <div className="font-mono">
                        {truth.summary?.totalGeneratedArtifacts ?? 0}
                      </div>
                    </div>
                    <div className="rounded border p-2">
                      <div className="text-muted-foreground">Duplicate truths</div>
                      <div className="font-mono">{truth.summary?.duplicateTruthSources ?? 0}</div>
                    </div>
                    <div className="rounded border p-2">
                      <div className="text-muted-foreground">Stale docs</div>
                      <div className="font-mono">{truth.summary?.staleCanonicalDocs ?? 0}</div>
                    </div>
                  </div>

                  <div className="rounded border bg-card p-3">
                    <div className="mb-2 text-xs font-medium">Canonical sources</div>
                    <div className="space-y-1 text-xs">
                      {Object.entries(truth.canonicalSources ?? {}).map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2 border-b pb-1 last:border-0">
                          <span className="min-w-[150px] text-muted-foreground">{k}</span>
                          <span className="break-all font-mono text-[10px]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded border bg-card p-3">
                    <div className="mb-2 text-xs font-medium">Drift validators</div>
                    <div className="flex flex-wrap gap-2">
                      {(truth.driftValidators ?? []).map((v) => (
                        <Badge key={v} variant="secondary" className="font-mono text-[10px]">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
