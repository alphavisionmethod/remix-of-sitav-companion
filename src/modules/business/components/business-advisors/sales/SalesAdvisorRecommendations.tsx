// ═══════════════════════════════════════════════════════════════
// SITA OS — Sales Advisor specialised "Recommendations" panel.
//
// Reads the user's real CRM substrate (leads, opportunities, deals,
// quotes) under RLS and produces evidence-backed Sales Advisor
// recommendations. Empty-state honest — no fabricated data.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flame, Hourglass, Target, FileWarning, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";

interface OpportunityRow {
  id: string;
  title: string | null;
  stage: string | null;
  value: number | null;
  probability: number | null;
  expected_close_date: string | null;
  status: string | null;
  updated_at: string;
}

interface LeadRow {
  id: string;
  name: string | null;
  company: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
}

interface QuoteRow {
  id: string;
  title: string | null;
  status: string | null;
  updated_at: string;
}

interface SalesSnapshot {
  newLeads: LeadRow[];
  hotOpportunities: OpportunityRow[];
  stalledOpportunities: OpportunityRow[];
  draftQuotes: QuoteRow[];
  pipelineValue: number;
  loadedAt: string;
}

const STALE_DAYS = 14;

async function loadSalesSnapshot(userId: string): Promise<SalesSnapshot> {
  const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const staleAgo = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [leadsRes, oppsRes, quotesRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, name, company, source, status, created_at")
      .eq("user_id", userId)
      .gte("created_at", sevenAgo)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("crm_opportunities")
      .select("id, title, stage, value, probability, expected_close_date, status, updated_at")
      .eq("user_id", userId)
      .order("value", { ascending: false })
      .limit(50),
    supabase
      .from("quotes")
      .select("id, title, status, updated_at")
      .eq("user_id", userId)
      .in("status", ["draft", "pending"])
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const opps = (oppsRes.data ?? []) as OpportunityRow[];
  const open = opps.filter((o) => o.status !== "won" && o.status !== "lost" && o.status !== "closed");
  const hot = open
    .filter((o) => (o.probability ?? 0) >= 60)
    .slice(0, 6);
  const stalled = open
    .filter((o) => o.updated_at < staleAgo)
    .slice(0, 6);
  const pipelineValue = open.reduce((sum, o) => sum + Number(o.value ?? 0), 0);

  return {
    newLeads: (leadsRes.data ?? []) as LeadRow[],
    hotOpportunities: hot,
    stalledOpportunities: stalled,
    draftQuotes: (quotesRes.data ?? []) as QuoteRow[],
    pipelineValue,
    loadedAt: new Date().toISOString(),
  };
}

function fmtMoney(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SalesAdvisorRecommendations() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<SalesSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<{ key: string; content: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) {
          setError("Sign in to view Sales Advisor recommendations.");
          setLoading(false);
        }
        return;
      }
      try {
        const snap = await loadSalesSnapshot(userId);
        if (!cancelled) setSnapshot(snap);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load CRM context");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function askForPlan(key: string, prompt: string) {
    setAskLoading(key);
    setAskResult(null);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "sales-advisor",
        prompt,
        intent: "draft",
      });
      setAskResult({ key, content: r.response.content });
    } catch (e) {
      setAskResult({ key, content: e instanceof Error ? e.message : "Advisor unavailable" });
    } finally {
      setAskLoading(null);
    }
  }

  const groups = useMemo(() => {
    if (!snapshot) return [];
    return [
      {
        key: "new-leads",
        icon: Sparkles,
        title: "Fresh leads to qualify",
        description: `${snapshot.newLeads.length} lead${snapshot.newLeads.length === 1 ? "" : "s"} arrived in the last 7 days`,
        items: snapshot.newLeads.map((l) => ({
          id: l.id,
          primary: l.name ?? "Unnamed lead",
          secondary: [l.company, l.source].filter(Boolean).join(" · ") || "no company info",
          chip: l.status ?? "new",
        })),
        action: snapshot.newLeads.length > 0
          ? {
              label: "Draft qualification questions",
              prompt: `I have ${snapshot.newLeads.length} new leads from sources: ${
                Array.from(new Set(snapshot.newLeads.map((l) => l.source).filter(Boolean))).join(", ") || "unknown"
              }. Draft a tight 6-question qualification script I can use this week.`,
            }
          : null,
      },
      {
        key: "hot-opps",
        icon: Flame,
        title: "High-probability opportunities",
        description: `${snapshot.hotOpportunities.length} opportunit${snapshot.hotOpportunities.length === 1 ? "y" : "ies"} at ≥60% probability`,
        items: snapshot.hotOpportunities.map((o) => ({
          id: o.id,
          primary: o.title ?? "Untitled deal",
          secondary: `${fmtMoney(Number(o.value ?? 0))} · ${o.probability ?? 0}% · ${o.stage ?? "no stage"}`,
          chip: o.expected_close_date ? new Date(o.expected_close_date).toLocaleDateString() : "no close date",
        })),
        action: snapshot.hotOpportunities.length > 0
          ? {
              label: "Draft close plan",
              prompt: `I have ${snapshot.hotOpportunities.length} high-probability deals worth ${fmtMoney(
                snapshot.hotOpportunities.reduce((s, o) => s + Number(o.value ?? 0), 0),
              )}. Build a one-week close plan with specific next steps for each.`,
            }
          : null,
      },
      {
        key: "stalled",
        icon: Hourglass,
        title: "Stalled deals (>14 days quiet)",
        description: `${snapshot.stalledOpportunities.length} deal${snapshot.stalledOpportunities.length === 1 ? "" : "s"} need re-engagement`,
        items: snapshot.stalledOpportunities.map((o) => ({
          id: o.id,
          primary: o.title ?? "Untitled deal",
          secondary: `${fmtMoney(Number(o.value ?? 0))} · last touched ${new Date(o.updated_at).toLocaleDateString()}`,
          chip: o.stage ?? "—",
        })),
        action: snapshot.stalledOpportunities.length > 0
          ? {
              label: "Draft re-engagement messages",
              prompt: `Draft 3 distinct re-engagement message variants for stalled deals at these stages: ${Array.from(
                new Set(snapshot.stalledOpportunities.map((o) => o.stage).filter(Boolean)),
              ).join(", ") || "various"}. Keep each under 80 words.`,
            }
          : null,
      },
      {
        key: "draft-quotes",
        icon: FileWarning,
        title: "Open quotes awaiting follow-up",
        description: `${snapshot.draftQuotes.length} draft/pending quote${snapshot.draftQuotes.length === 1 ? "" : "s"}`,
        items: snapshot.draftQuotes.map((q) => ({
          id: q.id,
          primary: q.title ?? "Untitled quote",
          secondary: `Updated ${new Date(q.updated_at).toLocaleDateString()}`,
          chip: q.status ?? "draft",
        })),
        action: snapshot.draftQuotes.length > 0
          ? {
              label: "Draft quote follow-up",
              prompt: `I have ${snapshot.draftQuotes.length} quotes still in draft/pending. Draft a polite, value-anchored follow-up template I can adapt per quote.`,
            }
          : null,
      },
    ];
  }, [snapshot]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!snapshot) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Pipeline overview</CardTitle>
              <CardDescription>Open deal value, weighted by RLS-scoped CRM data</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{fmtMoney(snapshot.pipelineValue)}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {groups.map((g) => {
        const Icon = g.icon;
        return (
          <Card key={g.key}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{g.title}</CardTitle>
                </div>
                {g.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => askForPlan(g.key, g.action!.prompt)}
                    disabled={askLoading === g.key}
                  >
                    {askLoading === g.key ? (
                      <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Drafting…</>
                    ) : (
                      g.action.label
                    )}
                  </Button>
                )}
              </div>
              <CardDescription>{g.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {g.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing to flag — clean slate here.</p>
              ) : (
                <ScrollArea className="max-h-[240px]">
                  <div className="space-y-2">
                    {g.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.primary}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.secondary}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">{item.chip}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {askResult?.key === g.key && (
                <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Sales Advisor draft (review before using):</p>
                  <div className="text-sm whitespace-pre-wrap">{askResult.content}</div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}