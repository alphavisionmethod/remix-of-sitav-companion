// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Scope Truth Panel (AI Engineer team view)
//
// Read-only summary of mobile-native scope truth. Loads the canonical
// machine-readable artifact emitted by:
//   scripts/validation/emit-mobile-scope-artifacts.ts
// → generated/mobile-scope-closure/mobile-scope-verification.json
//
// Mounted ONLY inside /admin/ai-runtime as a tab — there is no
// duplicate user-facing dashboard.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Smartphone, ShieldCheck, Archive, ExternalLink, BookOpen } from "lucide-react";
import { TruthPanelActions } from "./TruthPanelActions";

interface VerificationDoc {
  generatedAt: string;
  ok: boolean;
  status: "GREEN" | "RED";
  checks: Record<string, boolean>;
  failed_checks: string[];
  stray_generated_mobile_truth: string[];
  capacitor_deps_remaining: string[];
  acceptance: Record<string, boolean>;
}

const VERIFICATION_URL =
  "/generated/mobile-scope-closure/mobile-scope-verification.json";

const REACTIVATION_CONDITIONS = [
  "Strategic decision with named owner",
  "Apple Developer + Google Play accounts active",
  "Production signing material in CI secrets",
  "APNs + FCM push transports verified end-to-end",
  "Real-device QA matrix passing",
  "Archived assets restored from archive/",
  "Mobile-scope BLOCK validators reconfigured for live posture",
  "First TestFlight + internal-track build accepted",
];

function tone(ok: boolean) {
  return ok
    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
    : "bg-destructive/15 text-destructive border-destructive/30";
}

export default function MobileScopeTruthPanel() {
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
        <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> Mobile Scope Truth
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Native iOS/Android are <span className="font-medium">ARCHIVED / FUTURE_VISION_ONLY</span>.
              Active deployment surfaces: Web SPA, Ubuntu-native ISO, Electron desktop.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {doc && (
              <Badge variant="outline" className={tone(doc.ok)}>
                {doc.status}
              </Badge>
            )}
            <Link to="/docs/MOBILE_HONESTY.md" target="_blank" rel="noopener noreferrer">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => undefined}
                aria-label="Open MOBILE_HONESTY.md"
              >
                <BookOpen className="mr-1 h-3 w-3" />
                Open MOBILE_HONESTY.md
              </Button>
            </Link>
            <TruthPanelActions
              onRefresh={() => setReloadTick((t) => t + 1)}
              refreshing={loading}
              sourcePath={VERIFICATION_URL}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">Loading mobile scope truth…</p>
          )}
          {!loading && error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                Could not load <code>{VERIFICATION_URL}</code>: {error}. Run{" "}
                <code>npm run mobile:scope:emit</code> to regenerate.
              </AlertDescription>
            </Alert>
          )}
          {!loading && doc && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(doc.acceptance).map(([k, v]) => (
                  <div
                    key={k}
                    className="border rounded-md p-3 bg-card flex items-center justify-between gap-2"
                  >
                    <div className="text-xs">{k.replace(/_/g, " ")}</div>
                    <Badge variant="outline" className={tone(v)}>
                      {v ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="border rounded-md p-3 bg-card">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Containment checks
                </div>
                <dl className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(doc.checks).map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted-foreground">{k.replace(/_/g, " ")}</dt>
                      <dd className={v ? "text-emerald-600" : "text-destructive"}>
                        {v ? "ok" : "drift"}
                      </dd>
                    </div>
                  ))}
                </dl>
                {doc.capacitor_deps_remaining.length > 0 && (
                  <p className="text-xs text-destructive mt-2">
                    Capacitor deps still present: {doc.capacitor_deps_remaining.join(", ")}
                  </p>
                )}
                {doc.stray_generated_mobile_truth.length > 0 && (
                  <p className="text-xs text-destructive mt-2">
                    Stray mobile JSON in generated/: {doc.stray_generated_mobile_truth.join(", ")}
                  </p>
                )}
              </div>

              <div className="border rounded-md p-3 bg-card">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Archive className="h-4 w-4" /> Reactivation conditions
                </div>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {REACTIVATION_CONDITIONS.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <span className="text-muted-foreground">☐</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Full checklist:{" "}
                  <code>generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md</code>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                <div>Last emission: {new Date(doc.generatedAt).toLocaleString()}</div>
                <a
                  href="/docs/MOBILE_HONESTY.md"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Mobile honesty doc <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
