// ═══════════════════════════════════════════════════════════════
// SITA OS — Taxes & Laws Advisor recommendations.
//
// L1-suggest authority. Surfaces issue-spotting only:
//   1. Tax/legal docs missing classification
//   2. Sensitive tax/legal docs to review storage rules for
//   3. Tax/legal docs that have not been reviewed recently
//
// All values come from real `file_metadata` rows (RLS-scoped).
// Empty-state honest. Persistent disclaimer at top + per-card.
// Buttons are framed as "suggest" (issue-spotting checklist),
// never "draft", "file", "submit", or "advise".
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ShieldAlert, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { TaxesLawsDetailDrawer, type TaxesLawsDrawerTarget } from "./TaxesLawsDetailDrawer";
import { CFOExplainabilityPopover, type CFOExplainability } from "../cfo/CFOExplainabilityPopover";
import { ProfessionalDisclaimerBanner } from "./ProfessionalDisclaimerBanner";
import { TAX_DOC_PATTERNS } from "./TaxesLawsHeaderStats";

interface TaxDocRow {
  id: string;
  filename: string;
  classification: string | null;
  sensitivity: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

interface TaxSnapshot {
  unclassified: TaxDocRow[];
  sensitive: TaxDocRow[];
  stale: TaxDocRow[];
  totalTaxDocs: number;
  loadedAt: string;
}

const STALE_DAYS = 90;
const SENSITIVE_PATTERNS = ["confidential", "restricted", "pii", "secret"];

function buildTaxOr(): string {
  return TAX_DOC_PATTERNS
    .map((p) => `classification.ilike.%${p}%,filename.ilike.%${p}%`)
    .join(",");
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

async function loadTaxSnapshot(userId: string): Promise<TaxSnapshot> {
  const taxOr = buildTaxOr();
  const { data } = await supabase
    .from("file_metadata")
    .select("id, filename, classification, sensitivity, status, created_at, updated_at")
    .eq("user_id", userId)
    .or(taxOr)
    .order("created_at", { ascending: false })
    .limit(200);

  const docs = (data ?? []) as TaxDocRow[];
  const staleCutoff = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;

  const unclassified = docs.filter((d) => !d.classification).slice(0, 10);
  const sensitive = docs
    .filter((d) => d.sensitivity && SENSITIVE_PATTERNS.some((p) => d.sensitivity!.toLowerCase().includes(p)))
    .slice(0, 10);
  const stale = docs
    .filter((d) => new Date(d.updated_at).getTime() < staleCutoff)
    .slice(0, 10);

  return {
    unclassified,
    sensitive,
    stale,
    totalTaxDocs: docs.length,
    loadedAt: new Date().toISOString(),
  };
}

export function TaxesLawsRecommendations() {
  const [snapshot, setSnapshot] = useState<TaxSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerTarget, setDrawerTarget] = useState<TaxesLawsDrawerTarget | null>(null);
  const [askLoading, setAskLoading] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }
      const snap = await loadTaxSnapshot(userId);
      if (!cancelled) {
        setSnapshot(snap);
        setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  // Suggest-only: intent is always "ask" — never "draft", never "analyze".
  // The Taxes & Laws advisor must not author filings, contracts, or final
  // legal/tax content. We scope it to checklists and issue-spotting.
  async function askForSuggestion(key: string, prompt: string) {
    setAskLoading(key);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "taxes-laws-advisor",
        prompt: `${prompt}\n\nReply as a SUGGESTION CHECKLIST only — do not draft filings, contracts, or final language; do not provide tax or legal advice. Remind the user to verify with a licensed professional.`,
        intent: "ask",
      });
      setSuggestions((d) => ({ ...d, [key]: r.response.content }));
    } finally {
      setAskLoading(null);
    }
  }

  const groups = useMemo(() => {
    if (!snapshot) return [];
    const snapTime = new Date(snapshot.loadedAt).toLocaleString();
    const firstUnclass = snapshot.unclassified[0];
    const firstSens = snapshot.sensitive[0];
    const firstStale = snapshot.stale[0];

    return [
      {
        key: "unclassified-tax",
        icon: FileText,
        title: "Tax / legal docs missing classification",
        description:
          snapshot.totalTaxDocs === 0
            ? "No tax-flavoured documents uploaded yet — upload returns, contracts, or compliance docs to surface them here."
            : snapshot.unclassified.length === 0
              ? `All ${snapshot.totalTaxDocs} tax/legal document${snapshot.totalTaxDocs === 1 ? "" : "s"} are classified.`
              : `${snapshot.unclassified.length} tax/legal document${snapshot.unclassified.length === 1 ? "" : "s"} need classification.`,
        action: firstUnclass
          ? {
              label: "Issue-spotting checklist",
              prompt: `Tax/legal document "${firstUnclass.filename}" is uploaded with no classification. Suggest a checklist of (a) the most-likely document categories (e.g. tax return, 1099, W-9, NDA, contract, compliance certificate), (b) what the operator should verify before classifying, and (c) the questions a licensed professional would want answered. Suggestion only — do not classify or advise.`,
            }
          : null,
        explain: {
          subject: "Unclassified tax/legal document detection",
          sources: [
            {
              table: "file_metadata",
              purpose: "Files matching tax/legal keywords (RLS-scoped).",
              rowCount: snapshot.totalTaxDocs,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Tax/legal scope = filename or classification matches one of: ${TAX_DOC_PATTERNS.slice(0, 6).join(", ")}, …`,
            "Missing = classification IS NULL.",
            "Output is suggestion only — never tax or legal advice.",
          ],
          steps: [
            { label: "Pull tax/legal docs", detail: "SELECT file_metadata matching tax keywords (RLS).", output: `${snapshot.totalTaxDocs} row${snapshot.totalTaxDocs === 1 ? "" : "s"}` },
            { label: "Filter missing", detail: "Keep classification IS NULL.", output: `${snapshot.unclassified.length} flagged` },
          ],
          footer: `Snapshot taken ${snapTime} · row-level security enforced.`,
        } satisfies CFOExplainability,
        items: snapshot.unclassified.map((d) => ({
          id: d.id,
          primary: d.filename,
          secondary: `${d.status ?? "no status"} · uploaded ${new Date(d.created_at).toLocaleDateString()}`,
          chip: "unclassified",
          chipVariant: "destructive" as const,
          explain: {
            subject: `${d.filename} — classification missing`,
            sources: [{ table: "file_metadata", purpose: "Single document record.", rowCount: 1, asOf: d.created_at }],
            assumptions: ["File matches tax/legal keyword pattern.", "classification is NULL."],
            steps: [
              { label: "Match tax keyword", detail: "Filename or prior classification matches a tax/legal pattern.", output: d.filename },
              { label: "Read classification", detail: "Confirm NULL.", output: "missing" },
            ],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "sensitive-tax",
        icon: ShieldAlert,
        title: "Sensitive tax / legal docs to review",
        description:
          snapshot.totalTaxDocs === 0
            ? "No tax-flavoured documents uploaded yet."
            : snapshot.sensitive.length === 0
              ? "No tax/legal docs are tagged confidential/restricted/PII."
              : `${snapshot.sensitive.length} sensitive tax/legal document${snapshot.sensitive.length === 1 ? "" : "s"} — confirm storage / access rules.`,
        action: firstSens
          ? {
              label: "Storage-review checklist",
              prompt: `Tax/legal document "${firstSens.filename}" is tagged "${firstSens.sensitivity}". Suggest a checklist for the operator to verify: (a) who should be able to access it, (b) what retention / deletion policy applies, (c) what redaction is appropriate before sharing externally. Suggestion only — never legal/tax advice.`,
            }
          : null,
        explain: {
          subject: "Sensitive tax/legal document detection",
          sources: [
            {
              table: "file_metadata",
              purpose: "Tax/legal files with sensitivity markers (RLS-scoped).",
              rowCount: snapshot.totalTaxDocs,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Sensitive = sensitivity contains one of: ${SENSITIVE_PATTERNS.join(", ")}.`,
            "Output is suggestion only — never tax or legal advice.",
          ],
          steps: [
            { label: "Pull tax/legal docs", detail: "SELECT file_metadata matching tax keywords (RLS).", output: `${snapshot.totalTaxDocs}` },
            { label: "Filter sensitive", detail: `Keep sensitivity matching ${SENSITIVE_PATTERNS.join("/")}.`, output: `${snapshot.sensitive.length}` },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.sensitive.map((d) => ({
          id: d.id,
          primary: d.filename,
          secondary: `sensitivity: ${d.sensitivity ?? "—"}`,
          chip: d.sensitivity ?? "sensitive",
          chipVariant: "destructive" as const,
          explain: {
            subject: `${d.filename} — sensitive`,
            sources: [{ table: "file_metadata", purpose: "Single document record.", rowCount: 1, asOf: d.created_at }],
            assumptions: ["Sensitivity tag matches confidential/restricted/PII."],
            steps: [{ label: "Read sensitivity", detail: "Confirm sensitive marker.", output: d.sensitivity ?? "n/a" }],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "stale-tax",
        icon: Clock,
        title: `Tax / legal docs not updated in > ${STALE_DAYS}d`,
        description:
          snapshot.totalTaxDocs === 0
            ? "No tax-flavoured documents uploaded yet."
            : snapshot.stale.length === 0
              ? `Every tax/legal doc was touched within ${STALE_DAYS} days.`
              : `${snapshot.stale.length} tax/legal document${snapshot.stale.length === 1 ? "" : "s"} stale — verify they're still authoritative.`,
        action: firstStale
          ? {
              label: "Refresh-checklist",
              prompt: `Tax/legal document "${firstStale.filename}" has not been updated in over ${STALE_DAYS} days (last touched ${new Date(firstStale.updated_at).toLocaleDateString()}). Suggest a refresh checklist: (a) what to verify is still current, (b) what jurisdictional changes the operator should ask their professional about, (c) when to escalate. Suggestion only — never tax or legal advice.`,
            }
          : null,
        explain: {
          subject: "Stale tax/legal document detection",
          sources: [
            {
              table: "file_metadata",
              purpose: "Tax/legal files (RLS-scoped).",
              rowCount: snapshot.totalTaxDocs,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Stale = updated_at older than ${STALE_DAYS} days.`,
            "Output is suggestion only — never tax or legal advice.",
          ],
          steps: [
            { label: "Pull tax/legal docs", detail: "SELECT file_metadata matching tax keywords (RLS).", output: `${snapshot.totalTaxDocs}` },
            { label: "Filter stale", detail: `Keep updated_at older than ${STALE_DAYS}d.`, output: `${snapshot.stale.length}` },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.stale.map((d) => {
          const days = daysSince(d.updated_at);
          return {
            id: d.id,
            primary: d.filename,
            secondary: `last updated ${days}d ago · classification: ${d.classification ?? "—"}`,
            chip: `${days}d`,
            chipVariant: "outline" as const,
            explain: {
              subject: `${d.filename} — stale`,
              sources: [{ table: "file_metadata", purpose: "Single document record.", rowCount: 1, asOf: d.updated_at }],
              assumptions: [`updated_at is older than ${STALE_DAYS}d.`],
              steps: [{ label: "Read updated_at", detail: "Compute staleness.", output: `${days}d ago` }],
            } satisfies CFOExplainability,
          };
        }),
      },
    ];
  }, [snapshot]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading tax/legal preparation prompts…
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sign in to see tax/legal preparation prompts.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <ProfessionalDisclaimerBanner />
      {groups.map((g) => {
        const Icon = g.icon;
        return (
          <Card key={g.key}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{g.title}</CardTitle>
                  <CFOExplainabilityPopover
                    data={g.explain}
                    triggerLabel={`Explain how ${g.title} was computed`}
                  />
                  <ProfessionalDisclaimerBanner variant="inline" />
                </div>
                {g.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => askForSuggestion(g.key, g.action!.prompt)}
                    disabled={askLoading === g.key}
                    className="text-xs"
                  >
                    {askLoading === g.key ? (
                      <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Suggesting…</>
                    ) : (
                      g.action.label
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{g.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              {g.items.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Nothing to flag right now.</p>
              ) : (
                <ScrollArea className="max-h-[280px] pr-3">
                  <ul className="space-y-1.5">
                    {g.items.map((it) => (
                      <li
                        key={`${g.key}-${it.id}`}
                        className="rounded-md border border-border bg-background hover:bg-muted/40 transition-colors cursor-pointer px-2 py-1.5"
                        onClick={() => setDrawerTarget({ id: it.id, label: it.primary })}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium truncate">{it.primary}</p>
                              <CFOExplainabilityPopover data={it.explain} />
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{it.secondary}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${it.chipVariant === "destructive" ? "border-destructive/40 text-destructive" : "border-border text-muted-foreground"}`}>
                            {it.chip}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
              {suggestions[g.key] && (
                <div className="mt-2 rounded-md border border-border bg-muted/30 p-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase text-muted-foreground">Advisor suggestion</p>
                    <ProfessionalDisclaimerBanner variant="inline" />
                  </div>
                  <p className="text-xs whitespace-pre-wrap">{suggestions[g.key]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      <TaxesLawsDetailDrawer
        target={drawerTarget}
        onClose={() => setDrawerTarget(null)}
      />
    </div>
  );
}