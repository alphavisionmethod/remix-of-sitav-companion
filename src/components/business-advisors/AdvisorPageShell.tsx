// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Advisor Shared UI Shell (OS / Desktop)
//
// Standardized shell every Business System advisor uses on the OS
// surface. Provides 6 canonical tabs:
//   1. Chat        — converse with the advisor (uses runtime)
//   2. Sources     — context slices the advisor has access to
//   3. Simulation  — what-if scenarios with persisted runs
//   4. Recommendations — structured outputs from prior asks
//   5. Memory      — knowledge & memories the advisor holds
//   6. Proof       — citations + receipts for explainability
//
// Visuals use semantic tokens only — no raw colors.
// Empty-state honesty is mandatory: never fabricate data.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ShieldAlert, Sparkles, FileText, FlaskConical, ListChecks, Brain, ScrollText, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  askBusinessAdvisor,
  loadAdvisorContext,
  type BusinessAdvisorManifest,
  type AdvisorContextSnapshot,
  type AdvisorAskResult,
} from "@/lib/ai-platform/runtime";

interface AdvisorPageShellProps {
  advisor: BusinessAdvisorManifest;
  /** Path users return to (defaults to /business-advisors) */
  backHref?: string;
}

interface DeploymentRow {
  phase: string;
  ready_score: number;
  ui_complete: boolean;
  backend_complete: boolean;
  context_wired: boolean;
}

interface SimulationRow {
  id: string;
  scenario_title: string;
  status: string;
  confidence: number;
  ran_at: string | null;
  risk_summary: string | null;
  created_at: string;
}

interface CitationRow {
  id: string;
  source_label: string;
  source_type: string;
  excerpt: string | null;
  created_at: string;
}

interface KnowledgeRow {
  id: string;
  title: string;
  source: string;
  confidence: number;
  updated_at: string;
}

const AUTHORITY_TONE: Record<BusinessAdvisorManifest["authority"], string> = {
  "L1-suggest": "Suggest only",
  "L2-recommend": "Recommend only",
  "L3-draft": "May draft",
  "L4-simulate": "May simulate",
  "L5-approval-ready": "Approval-ready",
};

export function AdvisorPageShell({ advisor, backHref = "/business-advisors" }: AdvisorPageShellProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");

  // Chat state
  const [prompt, setPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<AdvisorAskResult | null>(null);

  // Tab data state
  const [context, setContext] = useState<AdvisorContextSnapshot | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [deployment, setDeployment] = useState<DeploymentRow | null>(null);
  const [simulations, setSimulations] = useState<SimulationRow[]>([]);
  const [citations, setCitations] = useState<CitationRow[]>([]);
  const [memories, setMemories] = useState<KnowledgeRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setContextLoading(false);
        return;
      }

      // Context (tab 2)
      try {
        const snap = await loadAdvisorContext(advisor.id, userId);
        if (!cancelled) setContext(snap);
      } catch {
        // empty state — honest
      } finally {
        if (!cancelled) setContextLoading(false);
      }

      // Deployment status header chip
      const { data: depRow } = await supabase
        .from("advisor_deployment_status")
        .select("phase, ready_score, ui_complete, backend_complete, context_wired")
        .eq("advisor_id", advisor.id)
        .maybeSingle();
      if (!cancelled && depRow) setDeployment(depRow as DeploymentRow);

      // Simulations (tab 3)
      const { data: simRows } = await supabase
        .from("advisor_simulation_runs")
        .select("id, scenario_title, status, confidence, ran_at, risk_summary, created_at")
        .eq("user_id", userId)
        .eq("advisor_id", advisor.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) setSimulations((simRows ?? []) as SimulationRow[]);

      // Citations (tab 6)
      const { data: citeRows } = await supabase
        .from("advisor_source_citations")
        .select("id, source_label, source_type, excerpt, created_at")
        .eq("user_id", userId)
        .eq("advisor_id", advisor.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) setCitations((citeRows ?? []) as CitationRow[]);

      // Memory / knowledge (tab 5)
      const { data: memRows } = await supabase
        .from("advisor_knowledge")
        .select("id, title, source, confidence, updated_at")
        .eq("user_id", userId)
        .eq("advisor_id", advisor.id)
        .order("updated_at", { ascending: false })
        .limit(20);
      if (!cancelled) setMemories((memRows ?? []) as KnowledgeRow[]);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [advisor.id]);

  const readyPct = useMemo(
    () => (deployment ? Math.round(Number(deployment.ready_score) * 100) : 0),
    [deployment],
  );

  async function handleAsk() {
    if (!prompt.trim()) return;
    setChatLoading(true);
    setChatError(null);
    try {
      const result = await askBusinessAdvisor({
        advisorId: advisor.id,
        prompt: prompt.trim(),
        intent: "ask",
        attachContext: true,
      });
      setLastResult(result);
      setPrompt("");
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Failed to reach advisor");
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Button variant="ghost" size="sm" onClick={() => navigate(backHref)} className="mb-2 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Advisors
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">{advisor.displayName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{advisor.tagline}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline">{AUTHORITY_TONE[advisor.authority]}</Badge>
            <Badge variant={advisor.sensitive ? "destructive" : "secondary"}>
              {advisor.riskTier} risk
            </Badge>
            {deployment && (
              <span className="text-xs text-muted-foreground">
                {deployment.phase} · {readyPct}% ready
              </span>
            )}
          </div>
        </div>

        {/* Authority + disclaimer banner */}
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{advisor.mission}</AlertTitle>
          <AlertDescription className="mt-1 text-xs">
            {advisor.professionalDisclaimer
              ? "This advisor provides preparation and structure only. It is not a substitute for a licensed professional."
              : `Blocked actions: ${advisor.blockedActions.join(", ") || "none"}.`}
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="chat"><Sparkles className="h-4 w-4 mr-1.5" />Chat</TabsTrigger>
            <TabsTrigger value="sources"><FileText className="h-4 w-4 mr-1.5" />Sources</TabsTrigger>
            <TabsTrigger value="simulation"><FlaskConical className="h-4 w-4 mr-1.5" />Simulation</TabsTrigger>
            <TabsTrigger value="recommendations"><ListChecks className="h-4 w-4 mr-1.5" />Recommendations</TabsTrigger>
            <TabsTrigger value="memory"><Brain className="h-4 w-4 mr-1.5" />Memory</TabsTrigger>
            <TabsTrigger value="proof"><ScrollText className="h-4 w-4 mr-1.5" />Proof</TabsTrigger>
          </TabsList>

          {/* Chat */}
          <TabsContent value="chat" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ask {advisor.displayName}</CardTitle>
                <CardDescription>
                  {context
                    ? `${context.totalAvailable}/${context.totalRequested} context source${context.totalRequested === 1 ? "" : "s"} available`
                    : "Loading available context…"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  rows={4}
                  placeholder={`What would you like ${advisor.displayName} to help with?`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={chatLoading}
                />
                {chatError && (
                  <Alert variant="destructive">
                    <AlertDescription>{chatError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end">
                  <Button onClick={handleAsk} disabled={chatLoading || !prompt.trim()}>
                    {chatLoading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Thinking…</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" />Ask advisor</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {lastResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Latest response</CardTitle>
                  <CardDescription>{lastResult.authorityNotice}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                    {lastResult.response.content || "(no content returned)"}
                  </div>
                  {lastResult.response.degradedReason && (
                    <Alert>
                      <AlertTitle className="text-xs">Degraded mode</AlertTitle>
                      <AlertDescription className="text-xs">{lastResult.response.degradedReason}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {lastResult.citations.slice(0, 6).map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{c.sourceLabel}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sources */}
          <TabsContent value="sources" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Context sources</CardTitle>
                <CardDescription>
                  Data {advisor.displayName} can read about your business (read-only, RLS-scoped)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contextLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !context || context.slices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No source slices declared for this advisor yet.</p>
                ) : (
                  <div className="space-y-2">
                    {context.slices.map((s) => (
                      <div key={s.source} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                        <div>
                          <p className="text-sm font-medium capitalize">{s.source.replace(/_/g, " ")}</p>
                          {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                        </div>
                        <div className="text-right">
                          <Badge variant={s.available ? "default" : "outline"}>
                            {s.available ? `${s.itemCount} record${s.itemCount === 1 ? "" : "s"}` : "no data"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simulation */}
          <TabsContent value="simulation" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scenarios &amp; what-if runs</CardTitle>
                <CardDescription>
                  Test ideas before acting. Simulations never execute real-world changes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simulations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No simulations run yet.</p>
                ) : (
                  <ScrollArea className="h-[320px]">
                    <div className="space-y-2">
                      {simulations.map((s) => (
                        <div key={s.id} className="rounded-md border border-border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{s.scenario_title}</p>
                            <Badge variant={s.status === "completed" ? "default" : s.status === "failed" ? "destructive" : "outline"}>
                              {s.status}
                            </Badge>
                          </div>
                          {s.risk_summary && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.risk_summary}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Confidence {Math.round(Number(s.confidence) * 100)}% · {new Date(s.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommendations</CardTitle>
                <CardDescription>Structured outputs from previous asks (Phase 1+ wires per-advisor specifics).</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recommendation surfaces are wired per advisor in Phase 1 onward. This shell exposes the hook;
                  domain-specific lists arrive when each advisor reaches the wiring phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory */}
          <TabsContent value="memory" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Memory &amp; knowledge</CardTitle>
                <CardDescription>What this advisor remembers about your business.</CardDescription>
              </CardHeader>
              <CardContent>
                {memories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No persisted memory yet.</p>
                ) : (
                  <div className="space-y-2">
                    {memories.map((m) => (
                      <div key={m.id} className="rounded-md border border-border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{m.title}</p>
                          <Badge variant="outline" className="text-xs">{m.source}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence {Math.round(Number(m.confidence) * 100)}% · updated {new Date(m.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proof */}
          <TabsContent value="proof" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Proof &amp; citations</CardTitle>
                <CardDescription>Sources this advisor cited in past responses (last 20).</CardDescription>
              </CardHeader>
              <CardContent>
                {citations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No citations recorded yet.</p>
                ) : (
                  <ScrollArea className="h-[320px]">
                    <div className="space-y-2">
                      {citations.map((c) => (
                        <div key={c.id} className="rounded-md border border-border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium capitalize">{c.source_label}</p>
                            <Badge variant="outline" className="text-xs">{c.source_type}</Badge>
                          </div>
                          {c.excerpt && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.excerpt}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}