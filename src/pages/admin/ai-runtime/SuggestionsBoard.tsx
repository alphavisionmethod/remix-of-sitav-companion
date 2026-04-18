// ═══════════════════════════════════════════════════════════════
// SITA OS — /admin/ai-runtime/suggestions (Phase 3A)
// Implementation suggestion pipeline — admin AI engineering team only.
// Reads ai_implementation_suggestions, calls record_implementation_suggestion_decision
// and propose_implementation_suggestion (via the generator function) RPCs.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  Lightbulb, RefreshCw, Sparkles, Filter, CheckCircle2,
  XCircle, PlayCircle, Award, Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  source_agent_id: string;
  source_council: string;
  source_signal_type: string;
  source_signal_ref: string;
  title: string;
  summary: string;
  rationale: string;
  evidence_refs: any;
  proposed_change_type: string;
  estimated_effort: string;
  expected_value: string;
  priority: string;
  status: string;
  review_comments: string | null;
  reviewer_user_id: string | null;
  reviewed_at: string | null;
  superseded_by: string | null;
  created_at: string;
  updated_at: string;
}

interface SummaryRow {
  status: string;
  priority: string;
  proposed_change_type: string;
  count: number;
}

const STATUS_TONE: Record<string, string> = {
  proposed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  under_review: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  accepted: "bg-green-500/15 text-green-400 border-green-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  in_progress: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  done: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  superseded: "bg-muted text-muted-foreground",
};

const PRIORITY_TONE: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  normal: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  low: "bg-muted text-muted-foreground",
};

const TYPE_TONE: Record<string, string> = {
  reliability: "bg-emerald-500/15 text-emerald-400",
  governance: "bg-violet-500/15 text-violet-400",
  cost: "bg-amber-500/15 text-amber-400",
  security: "bg-red-500/15 text-red-400",
  dependency_upgrade: "bg-cyan-500/15 text-cyan-400",
  ops: "bg-blue-500/15 text-blue-400",
  ux: "bg-pink-500/15 text-pink-400",
  refactor: "bg-indigo-500/15 text-indigo-400",
  new_feature: "bg-green-500/15 text-green-400",
};

export default function SuggestionsBoard() {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [councilFilter, setCouncilFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [decisionInFlight, setDecisionInFlight] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [itemsRes, summRes] = await Promise.all([
      supabase
        .from("ai_implementation_suggestions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.rpc("summarize_implementation_suggestions"),
    ]);
    if (itemsRes.error) toast.error("Suggestions load failed", { description: itemsRes.error.message });
    else setItems((itemsRes.data ?? []) as Suggestion[]);
    if (summRes.error) toast.error("Summary load failed", { description: summRes.error.message });
    else setSummary((summRes.data ?? []) as SummaryRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-suggestions-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_implementation_suggestions" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const runGenerator = useCallback(async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("internal-agent-suggestion-generator", { body: {} });
      if (error) throw error;
      const total = (data?.results ?? []).reduce((acc: number, r: any) => acc + Number(r.proposed ?? 0), 0);
      toast.success("Suggestion pass complete", { description: `${total} new suggestion(s) proposed` });
      await load();
    } catch (e: any) {
      toast.error("Suggestion generator failed", { description: e?.message ?? String(e) });
    } finally {
      setGenerating(false);
    }
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (statusFilter === "open") {
        if (!["proposed", "under_review"].includes(it.status)) return false;
      } else if (statusFilter !== "all" && it.status !== statusFilter) return false;
      if (typeFilter !== "all" && it.proposed_change_type !== typeFilter) return false;
      if (councilFilter !== "all" && it.source_council !== councilFilter) return false;
      return true;
    });
  }, [items, statusFilter, typeFilter, councilFilter]);

  const totals = useMemo(() => {
    const t = { open: 0, accepted: 0, done: 0, urgent: 0 };
    for (const r of summary) {
      const c = Number(r.count ?? 0);
      if (["proposed", "under_review"].includes(r.status)) t.open += c;
      if (r.status === "accepted") t.accepted += c;
      if (r.status === "done") t.done += c;
      if (r.priority === "urgent") t.urgent += c;
    }
    return t;
  }, [summary]);

  const councils = useMemo(() => Array.from(new Set(items.map((i) => i.source_council))).sort(), [items]);
  const types = useMemo(() => Array.from(new Set(items.map((i) => i.proposed_change_type))).sort(), [items]);

  const decide = useCallback(async (action: "accept" | "reject" | "mark_in_progress" | "mark_done" | "supersede") => {
    if (!selected) return;
    setDecisionInFlight(true);
    try {
      const { error } = await supabase.rpc("record_implementation_suggestion_decision", {
        p_suggestion_id: selected.id,
        p_action: action,
        p_review_comments: reviewComments || null,
      });
      if (error) throw error;
      toast.success(`Suggestion ${action.replace("_", " ")}`);
      setSelected(null);
      setReviewComments("");
      await load();
    } catch (e: any) {
      toast.error("Decision failed", { description: e?.message ?? String(e) });
    } finally {
      setDecisionInFlight(false);
    }
  }, [selected, reviewComments, load]);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Implementation Suggestions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phase 3 — evidence-backed proposals from internal AI workforce signals (drift, repeated failure, cost anomaly, dependency, policy drift).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={runGenerator} disabled={generating}>
            <Sparkles className={cn("h-4 w-4 mr-2", generating && "animate-pulse")} />
            Run generator now
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Open</div><div className="text-2xl font-semibold mt-0.5">{totals.open}</div></CardContent></Card>
        <Card className="bg-red-500/5"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Urgent</div><div className="text-2xl font-semibold mt-0.5 text-red-400">{totals.urgent}</div></CardContent></Card>
        <Card className="bg-green-500/5"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Accepted</div><div className="text-2xl font-semibold mt-0.5 text-green-400">{totals.accepted}</div></CardContent></Card>
        <Card className="bg-emerald-500/5"><CardContent className="p-3"><div className="text-xs text-muted-foreground">Done</div><div className="text-2xl font-semibold mt-0.5 text-emerald-400">{totals.done}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 px-2 text-xs rounded-md border bg-background">
            <option value="open">Open (proposed + under review)</option>
            <option value="all">All statuses</option>
            <option value="proposed">Proposed</option>
            <option value="under_review">Under review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="superseded">Superseded</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 px-2 text-xs rounded-md border bg-background">
            <option value="all">All types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={councilFilter} onChange={(e) => setCouncilFilter(e.target.value)} className="h-8 px-2 text-xs rounded-md border bg-background">
            <option value="all">All councils</option>
            {councils.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Badge variant="outline" className="ml-auto">{filtered.length} shown</Badge>
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">
          <Inbox className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {loading ? "Loading…" : "No suggestions match the filter. Run the generator to ingest the latest signals."}
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((s) => (
            <Card key={s.id} className="cursor-pointer hover:border-primary/40 transition" onClick={() => { setSelected(s); setReviewComments(s.review_comments ?? ""); }}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">{s.title}</CardTitle>
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", STATUS_TONE[s.status])}>{s.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">{s.summary}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className={cn("text-[10px]", TYPE_TONE[s.proposed_change_type])}>{s.proposed_change_type}</Badge>
                  <Badge variant="outline" className={cn("text-[10px]", PRIORITY_TONE[s.priority])}>{s.priority}</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">{s.source_council}</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">{s.source_agent_id}</Badge>
                  <Badge variant="outline" className="text-[10px]">effort: {s.estimated_effort}</Badge>
                  <Badge variant="outline" className="text-[10px]">value: {s.expected_value}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {s.source_signal_type} · {s.source_signal_ref}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Drilldown sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setReviewComments(""); } }}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>
                  {selected.source_council} · {selected.source_agent_id} · {new Date(selected.created_at).toLocaleString()}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={cn("text-[11px]", STATUS_TONE[selected.status])}>{selected.status}</Badge>
                  <Badge variant="outline" className={cn("text-[11px]", TYPE_TONE[selected.proposed_change_type])}>{selected.proposed_change_type}</Badge>
                  <Badge variant="outline" className={cn("text-[11px]", PRIORITY_TONE[selected.priority])}>{selected.priority}</Badge>
                  <Badge variant="outline" className="text-[11px]">effort: {selected.estimated_effort}</Badge>
                  <Badge variant="outline" className="text-[11px]">value: {selected.expected_value}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Summary</div>
                  <p>{selected.summary}</p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Rationale</div>
                  <p className="whitespace-pre-wrap">{selected.rationale}</p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Source signal</div>
                  <code className="text-[11px] block bg-muted p-2 rounded">{selected.source_signal_type} · {selected.source_signal_ref}</code>
                </div>
                {selected.evidence_refs && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Evidence references</div>
                    <pre className="text-[11px] bg-muted p-2 rounded overflow-x-auto max-h-64">
                      {JSON.stringify(selected.evidence_refs, null, 2)}
                    </pre>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Review comments</div>
                  <Textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Operator notes (optional)…"
                    rows={3}
                  />
                </div>
                <Tabs defaultValue="triage">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="triage">Triage</TabsTrigger>
                    <TabsTrigger value="advance">Advance</TabsTrigger>
                  </TabsList>
                  <TabsContent value="triage" className="space-y-2 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="default" disabled={decisionInFlight} onClick={() => decide("accept")}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Accept
                      </Button>
                      <Button variant="destructive" disabled={decisionInFlight} onClick={() => decide("reject")}>
                        <XCircle className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="advance" className="space-y-2 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="secondary" disabled={decisionInFlight} onClick={() => decide("mark_in_progress")}>
                        <PlayCircle className="h-4 w-4 mr-2" /> In progress
                      </Button>
                      <Button variant="secondary" disabled={decisionInFlight} onClick={() => decide("mark_done")}>
                        <Award className="h-4 w-4 mr-2" /> Done
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full" disabled={decisionInFlight} onClick={() => decide("supersede")}>
                      Mark superseded
                    </Button>
                  </TabsContent>
                </Tabs>
                {selected.review_comments && (
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    Last decision by {selected.reviewer_user_id?.slice(0, 8) ?? "—"}
                    {selected.reviewed_at && ` on ${new Date(selected.reviewed_at).toLocaleString()}`}
                    : <span className="italic">{selected.review_comments}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
