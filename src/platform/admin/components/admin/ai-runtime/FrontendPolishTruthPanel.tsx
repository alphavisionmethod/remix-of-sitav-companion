// ═══════════════════════════════════════════════════════════════
// SITA OS — Frontend Polish Closure
// FrontendPolishTruthPanel — read-only live truth view of the polish
// closure verification artifact emitted by:
//   scripts/validation/emit-frontend-polish-artifacts.ts
// → /generated/frontend-polish-closure/frontend-polish-verification.json
//
// Mirrors the MobileScopeTruthPanel pattern. Mounted ONLY inside
// /admin/ai-runtime as a tab — there is no duplicate user-facing dashboard.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, ShieldCheck, Layers, FileCheck2, RefreshCw } from "lucide-react";
import { TruthPanelActions } from "./TruthPanelActions";

interface VerificationDoc {
  generatedAt: string;
  ok: boolean;
  status: "GREEN" | "RED";
  scope: string;
  boards_total: number;
  boards_polished: number;
  empty_state_violations: number;
  cta_violations: number;
  shell_only_violations: number;
  state_handling_violations: number;
  trust_copy_violations: number;
  responsive_violations: number;
  acceptance: Record<string, boolean>;
  failed_checks: string[];
}

const VERIFICATION_URL =
  "/generated/frontend-polish-closure/frontend-polish-verification.json";

function tone(ok: boolean) {
  return ok
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
    : "bg-destructive/15 text-destructive border-destructive/30";
}

export default function FrontendPolishTruthPanel() {
  const [doc, setDoc] = useState<VerificationDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(VERIFICATION_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as VerificationDoc;
        if (!cancelled) {
          setDoc(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Frontend Polish Truth — Admin AI Engineer hub
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Live verification of the frontend reality &amp; polish closure pass:
              empty-state coverage, CTA integrity, state handling, trust copy,
              and responsive integrity for every board on this hub.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {doc && (
              <Badge className={tone(doc.ok)} variant="outline">
                {doc.status}
              </Badge>
            )}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setReloadTick((t) => t + 1)}
              disabled={loading}
              aria-label="Refresh polish verification"
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh polish verification
            </Button>
            <TruthPanelActions
              onRefresh={() => setReloadTick((t) => t + 1)}
              refreshing={loading}
              sourcePath={VERIFICATION_URL}
            />
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-3">
          {loading && (
            <p className="text-muted-foreground">Loading verification…</p>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Verification artifact not available yet. Run{" "}
                <code className="text-[11px]">npm run polish:closure:emit</code>{" "}
                to generate it. ({error})
              </AlertDescription>
            </Alert>
          )}
          {doc && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Stat label="Boards in scope" value={doc.boards_total} />
                <Stat
                  label="Polished"
                  value={`${doc.boards_polished}/${doc.boards_total}`}
                  ok={doc.boards_polished === doc.boards_total}
                />
                <Stat
                  label="Empty-state issues"
                  value={doc.empty_state_violations}
                  ok={doc.empty_state_violations === 0}
                />
                <Stat
                  label="Dead CTAs"
                  value={doc.cta_violations}
                  ok={doc.cta_violations === 0}
                />
                <Stat
                  label="Shell-only pages"
                  value={doc.shell_only_violations}
                  ok={doc.shell_only_violations === 0}
                />
                <Stat
                  label="State handling"
                  value={doc.state_handling_violations}
                  ok={doc.state_handling_violations === 0}
                />
                <Stat
                  label="Trust copy"
                  value={doc.trust_copy_violations}
                  ok={doc.trust_copy_violations === 0}
                />
                <Stat
                  label="Responsive"
                  value={doc.responsive_violations}
                  ok={doc.responsive_violations === 0}
                />
              </div>

              {doc.failed_checks.length > 0 && (
                <div className="border-t border-border/40 pt-3">
                  <div className="font-medium mb-1 text-destructive">
                    Failed checks
                  </div>
                  <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                    {doc.failed_checks.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                Generated {new Date(doc.generatedAt).toLocaleString()} · scope{" "}
                <span className="font-mono">{doc.scope}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" /> Closure dimensions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1.5">
          {[
            ["Empty-state coverage", "check-empty-state-coverage"],
            ["CTA integrity", "check-cta-integrity"],
            ["No shell-only pages", "check-no-shell-only-production-pages"],
            ["State handling consistency", "check-state-handling-consistency"],
            ["Admin board polish", "check-admin-board-polish"],
            ["Trust copy quality", "check-trust-copy-quality"],
            ["Responsive surface integrity", "check-responsive-surface-integrity"],
          ].map(([label, gate]) => (
            <div
              key={gate}
              className="flex items-center justify-between border-b border-border/30 pb-1 last:border-0"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-3 w-3 text-muted-foreground" />
                <span>{label}</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {gate}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Acceptance criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1.5">
          {doc &&
            Object.entries(doc.acceptance).map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between border-b border-border/30 pb-1 last:border-0"
              >
                <span>{k}</span>
                <Badge variant="outline" className={tone(v)}>
                  {v ? "GREEN" : "RED"}
                </Badge>
              </div>
            ))}
          {!doc && (
            <p className="text-muted-foreground">
              Run the closure emitter to populate acceptance state.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  ok,
}: {
  label: string;
  value: number | string;
  ok?: boolean;
}) {
  return (
    <div className="rounded-md border border-border/40 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-lg font-semibold mt-0.5 ${
          ok === undefined
            ? ""
            : ok
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
