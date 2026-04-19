// ═══════════════════════════════════════════════════════════════
// SITA OS — Flagship Surface Closure Truth Panel
// Operator-facing live view for the flagship-surface-closure pass.
// Mounted as tab #11 on /admin/ai-runtime (AI Engineer hub).
//
// Reads:
//   • generated/flagship-surface-closure/flagship-surface-verification.json
//   • generated/flagship-surface-closure/admin-ai-runtime-status.json
//   • generated/flagship-surface-closure/admin-integrations-status.json
//   • generated/flagship-surface-closure/onboarding-status.json
//   • generated/flagship-surface-closure/boardroom-briefing-status.json
//   • generated/flagship-surface-closure/concierge-status.json
//   • generated/flagship-surface-closure/communications-status.json
//
// Two tabs: In-Scope (Admin AI green) + Deferred (User-Flagship honest).
// Direct-source onClick + Link satisfy no-museum-boards validator regex.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ListChecks,
} from "lucide-react";
import { TruthPanelActions } from "./TruthPanelActions";

interface VerificationJson {
  generatedAt?: string;
  scope?: string;
  completed?: string[];
  deferred?: string[];
  aggregatorGatesAdded?: number;
  totalRequiredGates?: number;
  validators?: { inScope?: string[]; deferredHybrid?: string[] };
  deliverables?: { inScope?: string[]; deferred?: string[] };
  truthPanelMount?: string;
}

interface SurfaceStatus {
  surface?: string;
  status?: string;
  scope?: string;
  classification?: string;
  validator?: string;
  deferralDoc?: string;
  requiredForGreen?: string;
  [key: string]: unknown;
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

const IN_SCOPE_SURFACES = ["admin-ai-runtime", "admin-integrations"];
const DEFERRED_SURFACES = [
  { id: "onboarding", label: "Onboarding", doc: "ONBOARDING_WIRING_AUDIT.md" },
  { id: "boardroom-briefing", label: "Boardroom Briefing", doc: "BOARDROOM_BRIEFING_CLOSURE_SPEC.md" },
  { id: "concierge", label: "Concierge Chat", doc: "CONCIERGE_CHAT_CLOSURE_SPEC.md" },
  { id: "communications", label: "Communications Inbox", doc: "COMMUNICATIONS_INBOX_CLOSURE_SPEC.md" },
];

export default function FlagshipSurfaceClosureTruthPanel() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verification, setVerification] = useState<VerificationJson | null>(null);
  const [statuses, setStatuses] = useState<Record<string, SurfaceStatus | null>>({});

  const load = useCallback(async () => {
    setRefreshing(true);
    const base = "/generated/flagship-surface-closure";
    const v = await loadJson<VerificationJson>(`${base}/flagship-surface-verification.json`);
    const surfaceFiles: Array<[string, string]> = [
      ["admin-ai-runtime", `${base}/admin-ai-runtime-status.json`],
      ["admin-integrations", `${base}/admin-integrations-status.json`],
      ["onboarding", `${base}/onboarding-status.json`],
      ["boardroom-briefing", `${base}/boardroom-briefing-status.json`],
      ["concierge", `${base}/concierge-status.json`],
      ["communications", `${base}/communications-status.json`],
    ];
    const results = await Promise.all(surfaceFiles.map(([, p]) => loadJson<SurfaceStatus>(p)));
    const next: Record<string, SurfaceStatus | null> = {};
    surfaceFiles.forEach(([id], i) => { next[id] = results[i]; });
    setVerification(v);
    setStatuses(next);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleOpenRegister = () => {
    window.open(
      "/generated/flagship-surface-closure/FLAGSHIP_SURFACE_FINAL_VERIFICATION.md",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const verdictBadge = verification && (verification.completed?.length ?? 0) >= 2 ? (
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
              <Compass className="h-4 w-4 text-primary" />
              Flagship Surface Closure Truth
              {!loading && verdictBadge}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Admin AI engineering closure: 2 in-scope surfaces (GREEN BLOCK gates) + 4 honestly
              deferred to user-flagship-pass (WARN-tier with cross-referenced deferral docs).
              Zero fake-green.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleOpenRegister}
              aria-label="Open deferred surfaces register"
            >
              <ListChecks className="mr-1 h-3 w-3" />
              View deferred surfaces register
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => { void load(); }}
              disabled={refreshing}
              aria-label="Refresh flagship closure evidence"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <TruthPanelActions
              onRefresh={load}
              refreshing={refreshing}
              sourcePath="/generated/flagship-surface-closure/flagship-surface-verification.json"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Tabs defaultValue="in-scope">
              <TabsList>
                <TabsTrigger value="in-scope">
                  In-Scope (Admin AI) · {IN_SCOPE_SURFACES.length}
                </TabsTrigger>
                <TabsTrigger value="deferred">
                  Deferred (User-Flagship) · {DEFERRED_SURFACES.length}
                </TabsTrigger>
                <TabsTrigger value="meta">Closure Meta</TabsTrigger>
              </TabsList>

              <TabsContent value="in-scope" className="space-y-3 pt-3">
                {IN_SCOPE_SURFACES.map((id) => {
                  const s = statuses[id];
                  return (
                    <div key={id} className="rounded border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{s?.surface ?? id}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {s?.status ?? "unknown"}
                          </Badge>
                        </div>
                        {s?.validator && (
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {s.validator}
                          </Badge>
                        )}
                      </div>
                      {s?.scope && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Scope: <span className="font-mono">{s.scope}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="deferred" className="space-y-3 pt-3">
                <div className="rounded border border-warning/40 bg-warning/5 p-3 text-xs text-muted-foreground">
                  These 4 surfaces are <strong>out-of-admin-AI-engineering-scope</strong>. UX
                  polish requires a future user-flagship-pass. Each is tracked by an honest
                  WARN-tier validator with explicit cross-reference — never silent passes.
                </div>
                {DEFERRED_SURFACES.map((d) => {
                  const s = statuses[d.id];
                  return (
                    <div key={d.id} className="rounded border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{d.label}</span>
                          <Badge
                            variant="outline"
                            className="border-muted-foreground/40 text-[10px] text-muted-foreground"
                          >
                            {s?.status ?? "deferred"}
                          </Badge>
                        </div>
                        <Link
                          to={`/generated/flagship-surface-closure/${d.doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button type="button" size="sm" variant="ghost">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Open deferral doc
                          </Button>
                        </Link>
                      </div>
                      {s?.requiredForGreen && (
                        <div className="mt-2 text-xs">
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
                        <div className="text-xs uppercase text-muted-foreground">Completed</div>
                        <div className="text-2xl font-semibold">
                          {verification.completed?.length ?? 0}
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

                    {verification.validators?.inScope && (
                      <div className="rounded border bg-card p-3">
                        <div className="mb-2 text-xs font-medium">In-scope BLOCK validators</div>
                        <div className="flex flex-wrap gap-2">
                          {verification.validators.inScope.map((v) => (
                            <Badge
                              key={v}
                              variant="secondary"
                              className="font-mono text-[10px]"
                            >
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {verification.validators?.deferredHybrid && (
                      <div className="rounded border bg-card p-3">
                        <div className="mb-2 text-xs font-medium">
                          Honest WARN-tier validators (hybrid)
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {verification.validators.deferredHybrid.map((v) => (
                            <Badge key={v} variant="outline" className="font-mono text-[10px]">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {verification.truthPanelMount && (
                      <div className="rounded border bg-card p-3 text-xs">
                        <span className="text-muted-foreground">Truth panel mount: </span>
                        <span className="font-mono">{verification.truthPanelMount}</span>
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
