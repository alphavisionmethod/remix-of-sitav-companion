// ═══════════════════════════════════════════════════════════════
// SITA OS — Architectural Cleanup Truth Panel
// Read-only truth view of:
//   1. Portability boundary status (classified vs unclassified hooks)
//   2. Edge-function structured-logging coverage
//   3. Truth-manifest health
// Mounted as the 8th tab on AIRuntimeHome (admin AI Engineer hub).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TruthPanelActions } from "./TruthPanelActions";

interface PortabilityStatus {
  totalWindowTouchingHooks: number;
  classifiedInBoundaryModel: number;
  unclassifiedHooks: number;
  totalClassificationsInModel: number;
  byBoundary: Record<string, number>;
  newAdapterMethodsRequired: number;
  validatorsEnforcing: string[];
}

interface LoggingStatus {
  totalEdgeFunctions: number;
  canonicalCompliant: number;
  refactoredThisPass: number;
  refactoredFunctions: string[];
  needsStandardizationRemaining: string[];
  passthroughAcceptableCount: number;
  coverageNow: string;
  coverageBefore: string;
  honestlyTrackedGap: string;
}

interface VerificationStatus {
  verdict: string;
  totalBlockGates: number;
  newBlockGatesThisPass: number;
  newBlockGateNames: string[];
  filesDeleted: number;
  honestWarnsPreserved: boolean;
  fakeGreens: number;
  carryovers: string[];
}

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(path);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export default function ArchitecturalCleanupTruthPanel() {
  const [portability, setPortability] = useState<PortabilityStatus | null>(null);
  const [logging, setLogging] = useState<LoggingStatus | null>(null);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setLoaded(false);
    Promise.all([
      safeFetch<PortabilityStatus>("/generated/architectural-cleanup/portability-cleanup-status.json"),
      safeFetch<LoggingStatus>("/generated/architectural-cleanup/logging-cleanup-status.json"),
      safeFetch<VerificationStatus>("/generated/architectural-cleanup/architectural-cleanup-verification.json"),
    ]).then(([p, l, v]) => {
      setPortability(p);
      setLogging(l);
      setVerification(v);
      setLoaded(true);
    });
  }, [reloadTick]);

  if (!loaded) {
    return <div className="flex flex-col items-center text-xs text-muted-foreground py-12 text-center">Loading cleanup truth…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setReloadTick((t) => t + 1)}
          aria-label="Re-run cleanup checks"
        >
          Re-run cleanup checks
        </Button>
        <TruthPanelActions
          onRefresh={() => setReloadTick((t) => t + 1)}
          refreshing={!loaded}
          sourcePath="/generated/architectural-cleanup/"
        />
      </div>
      <Alert>
        <AlertDescription className="text-xs">
          Architectural cleanup is an additive, audit-first pass. Honest WARN-tier classification is preserved
          where evidence requires execution. Zero deletions this pass — see{" "}
          <code>FILE_REMOVAL_SAFETY_POLICY.md</code> for the 9-check policy.
        </AlertDescription>
      </Alert>

      {/* ── 1. Portability boundary status ───────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Portability Boundary Status</span>
            {portability && portability.unclassifiedHooks === 0 ? (
              <Badge variant="secondary">✓ Closed</Badge>
            ) : (
              <Badge variant="destructive">Drift detected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          {portability ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-muted-foreground">Window-touching hooks</div>
                <div className="font-medium">{portability.totalWindowTouchingHooks}</div>
                <div className="text-muted-foreground">Classified in boundary model</div>
                <div className="font-medium">{portability.classifiedInBoundaryModel}</div>
                <div className="text-muted-foreground">Unclassified</div>
                <div className="font-medium">{portability.unclassifiedHooks}</div>
                <div className="text-muted-foreground">Total classifications</div>
                <div className="font-medium">{portability.totalClassificationsInModel}</div>
                <div className="text-muted-foreground">New adapter methods needed</div>
                <div className="font-medium">{portability.newAdapterMethodsRequired}</div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="text-muted-foreground mb-1">By boundary</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(portability.byBoundary).map(([k, v]) => (
                    <Badge key={k} variant="outline" className="text-[10px]">
                      {k}: {v}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">No portability status available.</div>
          )}
        </CardContent>
      </Card>

      {/* ── 2. Edge-function logging coverage ────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Edge-Function Structured Logging Coverage</span>
            {logging && (
              <Badge variant="outline">
                {logging.coverageBefore} → {logging.coverageNow}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          {logging ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-muted-foreground">Total edge functions</div>
                <div className="font-medium">{logging.totalEdgeFunctions}</div>
                <div className="text-muted-foreground">Canonical-compliant (pre-pass)</div>
                <div className="font-medium">{logging.canonicalCompliant}</div>
                <div className="text-muted-foreground">Refactored this pass</div>
                <div className="font-medium">{logging.refactoredThisPass}</div>
                <div className="text-muted-foreground">Pending standardization (honest)</div>
                <div className="font-medium">{logging.needsStandardizationRemaining.length}</div>
                <div className="text-muted-foreground">Passthrough-acceptable</div>
                <div className="font-medium">{logging.passthroughAcceptableCount}</div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="text-muted-foreground mb-1">Refactored this pass</div>
                <div className="flex flex-wrap gap-1">
                  {logging.refactoredFunctions.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px]">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
              <Alert className="mt-2">
                <AlertDescription className="text-[11px]">{logging.honestlyTrackedGap}</AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="text-muted-foreground">No logging status available.</div>
          )}
        </CardContent>
      </Card>

      {/* ── 3. Truth-manifest health + verification ──────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Truth-Manifest Health & Verification</span>
            {verification && (
              <Badge variant={verification.verdict === "PASS" ? "secondary" : "outline"}>
                {verification.verdict}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          {verification ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-muted-foreground">Total BLOCK gates</div>
                <div className="font-medium">{verification.totalBlockGates}</div>
                <div className="text-muted-foreground">New BLOCK gates this pass</div>
                <div className="font-medium">{verification.newBlockGatesThisPass}</div>
                <div className="text-muted-foreground">Files deleted</div>
                <div className="font-medium">{verification.filesDeleted}</div>
                <div className="text-muted-foreground">Honest WARNs preserved</div>
                <div className="font-medium">{verification.honestWarnsPreserved ? "Yes" : "No"}</div>
                <div className="text-muted-foreground">Fake greens</div>
                <div className="font-medium">{verification.fakeGreens}</div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="text-muted-foreground mb-1">New gates wired</div>
                <div className="flex flex-wrap gap-1">
                  {verification.newBlockGateNames.map((g) => (
                    <Badge key={g} variant="outline" className="text-[10px]">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
              {verification.carryovers.length > 0 && (
                <Alert className="mt-2">
                  <AlertDescription className="text-[11px]">
                    <span className="font-medium">Honest carryovers:</span>{" "}
                    {verification.carryovers.join("; ")}
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">No verification status available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
