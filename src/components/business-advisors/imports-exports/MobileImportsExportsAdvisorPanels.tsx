// ═══════════════════════════════════════════════════════════════
// Mobile-friendly Imports & Exports Advisor: vendor pulse + quick sim.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Ship, FileText, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor, runAdvisorSimulation } from "@/lib/ai-platform/runtime";
import { useToast } from "@/hooks/use-toast";

interface MobileSnap {
  vendorCount: number;
  staleVendorCount: number;
  topVendorName: string | null;
  unclassifiedDocs: number;
  topDocName: string | null;
}

const STALE_DAYS = 30;
const TRADE_DOC_PATTERNS = ["customs", "shipping", "trade", "import", "export", "bill of lading", "invoice"];

export function MobileImportsExportsAdvisorPanels() {
  const { toast } = useToast();
  const [snap, setSnap] = useState<MobileSnap | null>(null);
  const [drafting, setDrafting] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [draft, setDraft] = useState<{ key: string; content: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;
      const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const tradeOr = TRADE_DOC_PATTERNS
        .map((p) => `classification.ilike.%${p}%,filename.ilike.%${p}%`)
        .join(",");

      const [vendorRes, docRes] = await Promise.all([
        supabase
          .from("crm_contacts")
          .select("first_name, last_name, last_contacted_at")
          .eq("user_id", userId)
          .or("source.ilike.%vendor%,source.ilike.%supplier%,tags.cs.{vendor},tags.cs.{supplier}")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("file_metadata")
          .select("filename, classification")
          .eq("user_id", userId)
          .or(tradeOr)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      if (cancelled) return;

      const vendors = (vendorRes.data ?? []) as Array<{ first_name: string | null; last_name: string | null; last_contacted_at: string | null }>;
      const stale = vendors.filter((v) => !v.last_contacted_at || v.last_contacted_at < staleCutoff);
      const docs = (docRes.data ?? []) as Array<{ filename: string; classification: string | null }>;
      const unclassified = docs.filter((d) => !d.classification);

      const topVendor = stale[0];
      const topVendorName = topVendor
        ? [topVendor.first_name, topVendor.last_name].filter(Boolean).join(" ") || "(unnamed)"
        : null;

      setSnap({
        vendorCount: vendors.length,
        staleVendorCount: stale.length,
        topVendorName,
        unclassifiedDocs: unclassified.length,
        topDocName: unclassified[0]?.filename ?? null,
      });
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function quickAsk(key: string, prompt: string) {
    setDrafting(key);
    setDraft(null);
    try {
      const r = await askBusinessAdvisor({ advisorId: "imports-exports-advisor", prompt, intent: "ask" });
      setDraft({ key, content: r.response.content });
    } catch (e) {
      toast({ title: "Advisor unavailable", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally {
      setDrafting(null);
    }
  }

  async function runQuickSim() {
    setSimRunning(true);
    try {
      const r = await runAdvisorSimulation({
        advisorId: "imports-exports-advisor",
        scenarioTitle: "Mobile quick scenario: 3-vendor sourcing comparison",
        inputs: { scenario_type: "sourcing-comparison", delta: 3 },
        assumptions: { source: "mobile-quickrun" },
      });
      toast({
        title: r.status === "completed" ? "Scenario ready" : "Failed",
        description: r.status === "completed" ? `Confidence ${Math.round(r.confidence * 100)}%` : r.riskSummary,
        variant: r.status === "completed" ? "default" : "destructive",
      });
    } finally {
      setSimRunning(false);
    }
  }

  if (!snap) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Vendors</p>
              <p className="text-base font-semibold">{snap.vendorCount}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Unclassified docs</p>
              <p className="text-base font-semibold">{snap.unclassifiedDocs}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Ship className="h-3.5 w-3.5" /> Stale vendors
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.staleVendorCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.staleVendorCount === 0 || drafting === "stale"}
            onClick={() => quickAsk("stale", `My oldest stale vendor is "${snap.topVendorName ?? "(unknown)"}". Recommend a 3-step re-engagement plan. Recommend-only.`)}
          >
            {drafting === "stale" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend re-engagement"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> Unclassified docs
            <Badge variant="outline" className="ml-auto text-[10px] h-4">{snap.unclassifiedDocs}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            disabled={snap.unclassifiedDocs === 0 || drafting === "doc"}
            onClick={() => quickAsk("doc", `My most-recent unclassified trade doc is "${snap.topDocName ?? "(unknown)"}". Recommend the most-likely classification and what to validate. Recommend-only.`)}
          >
            {drafting === "doc" ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Thinking…</> : "Recommend classification"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Quick scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" className="w-full text-xs" disabled={simRunning} onClick={runQuickSim}>
            {simRunning ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Running…</> : "Run 3-vendor sourcing scenario"}
          </Button>
        </CardContent>
      </Card>

      {draft && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs">Imports & Exports Advisor</CardTitle></CardHeader>
          <CardContent className="pt-0"><p className="text-xs whitespace-pre-wrap">{draft.content}</p></CardContent>
        </Card>
      )}
    </div>
  );
}