// ═══════════════════════════════════════════════════════════════
// Mobile-friendly Taxes & Laws Advisor: tax-doc pulse + quick
// suggestion. Persistent professional disclaimer at top + per-card.
// L1-suggest authority — NEVER drafts, files, or advises.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, FileText, ShieldAlert, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";
import { ProfessionalDisclaimerBanner } from "./ProfessionalDisclaimerBanner";
import { TAX_DOC_PATTERNS } from "./TaxesLawsHeaderStats";

interface MobileSnap {
  taxDocCount: number;
  unclassifiedCount: number;
  sensitiveCount: number;
  topUnclassifiedName: string | null;
  topSensitiveName: string | null;
}

const SENSITIVE_PATTERNS = ["confidential", "restricted", "pii", "secret"];

export function MobileTaxesLawsAdvisorPanels() {
  const { toast } = useToast();
  const [snap, setSnap] = useState<MobileSnap | null>(null);
  const [suggesting, setSuggesting] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [suggestion, setSuggestion] = useState<{ key: string; content: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;
      const taxOr = TAX_DOC_PATTERNS
        .map((p) => `classification.ilike.%${p}%,filename.ilike.%${p}%`)
        .join(",");

      const { data } = await supabase
        .from("file_metadata")
        .select("filename, classification, sensitivity")
        .eq("user_id", userId)
        .or(taxOr)
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;

      const docs = (data ?? []) as Array<{ filename: string; classification: string | null; sensitivity: string | null }>;
      const unclassified = docs.filter((d) => !d.classification);
      const sensitive = docs.filter(
        (d) => d.sensitivity && SENSITIVE_PATTERNS.some((p) => d.sensitivity!.toLowerCase().includes(p)),
      );
      setSnap({
        taxDocCount: docs.length,
        unclassifiedCount: unclassified.length,
        sensitiveCount: sensitive.length,
        topUnclassifiedName: unclassified[0]?.filename ?? null,
        topSensitiveName: sensitive[0]?.filename ?? null,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickSuggest(key: string, prompt: string) {
    setSuggesting(key);
    setSuggestion(null);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "taxes-laws-advisor",
        prompt: `${prompt}\n\nReply as a SUGGESTION CHECKLIST only — never draft filings, contracts, or advice. Remind the user to verify with a licensed professional.`,
        intent: "ask",
      });
      setSuggestion({ key, content: r.response.content });
    } catch (e) {
      toast({ title: "Advisor unavailable", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally {
      setSuggesting(null);
    }
  }

  async function runQuickDiscussion() {
    setSimRunning(true);
    try {
      const r = await runAdvisorSimulation({
        advisorId: "taxes-laws-advisor",
        scenarioTitle: "Mobile quick discussion: 3-entity-structure prep",
        inputs: { scenario_type: "entity-structure-discussion", delta: 3, suggest_only: true },
        assumptions: { source: "mobile-quickrun", disclaimer: "preparation only — not legal/tax advice" },
      });
      toast({
        title: r.status === "completed" ? "Discussion ready" : "Failed",
        description:
          r.status === "completed"
            ? `Confidence ${Math.round(r.confidence * 100)}% — verify with a licensed professional.`
            : r.riskSummary,
        variant: r.status === "completed" ? "default" : "destructive",
      });
    } finally {
      setSimRunning(false);
    }
  }

  if (!snap) {
    return (
      <div className="space-y-2">
        <ProfessionalDisclaimerBanner variant="compact" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ProfessionalDisclaimerBanner variant="compact" />

      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Tax/legal</p>
              <p className="text-base font-semibold">{snap.taxDocCount}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Unclassified</p>
              <p className="text-base font-semibold">{snap.unclassifiedCount}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Sensitive</p>
              <p className="text-base font-semibold">{snap.sensitiveCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> Unclassified docs
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.unclassifiedCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.unclassifiedCount === 0 || suggesting === "unclass"}
            onClick={() => quickSuggest(
              "unclass",
              `My most-recent unclassified tax/legal doc is "${snap.topUnclassifiedName ?? "(unknown)"}". Suggest an issue-spotting checklist of likely categories and what to verify before classifying.`,
            )}
          >
            {suggesting === "unclass"
              ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Suggesting…</>
              : "Suggest issue-spotting checklist"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5" /> Sensitive docs
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.sensitiveCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.sensitiveCount === 0 || suggesting === "sens"}
            onClick={() => quickSuggest(
              "sens",
              `My most-recent sensitive tax/legal doc is "${snap.topSensitiveName ?? "(unknown)"}". Suggest a storage-review checklist (access rules, retention, redaction).`,
            )}
          >
            {suggesting === "sens"
              ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Suggesting…</>
              : "Suggest storage-review checklist"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Quick discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" className="w-full text-xs" disabled={simRunning} onClick={runQuickDiscussion}>
            {simRunning
              ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Preparing…</>
              : "Prepare 3-entity-structure discussion"}
          </Button>
        </CardContent>
      </Card>

      {suggestion && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center justify-between gap-2">
              <span>Taxes & Laws Advisor</span>
              <ProfessionalDisclaimerBanner variant="inline" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0"><p className="text-xs whitespace-pre-wrap">{suggestion.content}</p></CardContent>
        </Card>
      )}
    </div>
  );
}