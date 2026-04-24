// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Service Advisor "Recommendations" panel.
//
// Reads support_cases + customers under RLS and produces evidence-
// backed CS recommendations: aging unresolved cases, urgent SLA
// risks, escalations awaiting reply, at-risk customers.
// Empty-state honest — no fabricated data.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlarmClock, AlertTriangle, HeartPulse, MessageSquareWarning, Loader2, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { CustomerServiceDetailDrawer, type DrawerTarget } from "./CustomerServiceDetailDrawer";

interface CaseRow {
  id: string;
  title: string;
  category: string | null;
  priority: string | null;
  status: string | null;
  escalated_to_role: string | null;
  created_at: string;
  updated_at: string;
}

interface CustomerRow {
  id: string;
  display_name: string;
  health_score: number | null;
  status: string | null;
  updated_at: string;
}

interface CSSnapshot {
  agingCases: CaseRow[];        // open >48h, not urgent
  urgentCases: CaseRow[];       // priority urgent/high, open
  escalatedCases: CaseRow[];    // escalated_to_role set, open
  atRiskCustomers: CustomerRow[];
  totalOpen: number;
  loadedAt: string;
}

const URGENT_PRIORITIES = new Set(["urgent", "high"]);
const RESOLVED = new Set(["resolved", "closed"]);
const AGING_HOURS = 48;

async function loadCSSnapshot(userId: string): Promise<CSSnapshot> {
  const agingCutoff = new Date(Date.now() - AGING_HOURS * 60 * 60 * 1000).toISOString();

  const [casesRes, customersRes] = await Promise.all([
    supabase
      .from("support_cases")
      .select("id, title, category, priority, status, escalated_to_role, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("customers")
      .select("id, display_name, health_score, status, updated_at")
      .eq("user_id", userId)
      .lt("health_score", 40)
      .order("health_score", { ascending: true })
      .limit(10),
  ]);

  const cases = (casesRes.data ?? []) as CaseRow[];
  const open = cases.filter((c) => !RESOLVED.has((c.status ?? "open").toLowerCase()));
  const urgent = open.filter((c) => URGENT_PRIORITIES.has((c.priority ?? "").toLowerCase())).slice(0, 8);
  const escalated = open.filter((c) => Boolean(c.escalated_to_role)).slice(0, 8);
  const aging = open
    .filter((c) => c.created_at < agingCutoff && !URGENT_PRIORITIES.has((c.priority ?? "").toLowerCase()))
    .slice(0, 8);

  return {
    agingCases: aging,
    urgentCases: urgent,
    escalatedCases: escalated,
    atRiskCustomers: (customersRes.data ?? []) as CustomerRow[],
    totalOpen: open.length,
    loadedAt: new Date().toISOString(),
  };
}

function ageLabel(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h old`;
  return `${Math.floor(hours / 24)}d old`;
}

export function CustomerServiceRecommendations() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CSSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<{ key: string; content: string } | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) {
          setError("Sign in to view Customer Service Advisor recommendations.");
          setLoading(false);
        }
        return;
      }
      try {
        const snap = await loadCSSnapshot(userId);
        if (!cancelled) setSnapshot(snap);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load support context");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => { cancelled = true; };
  }, []);

  async function askForDraft(key: string, prompt: string) {
    setAskLoading(key);
    setAskResult(null);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "customer-service-advisor",
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
        key: "urgent",
        icon: AlarmClock,
        title: "Urgent / SLA-risk cases",
        description: `${snapshot.urgentCases.length} open case${snapshot.urgentCases.length === 1 ? "" : "s"} marked high or urgent`,
        items: snapshot.urgentCases.map((c) => ({
          id: c.id,
          kind: "case" as const,
          primary: c.title,
          secondary: `${c.category ?? "general"} · ${ageLabel(c.created_at)}`,
          chip: c.priority ?? "—",
        })),
        action: snapshot.urgentCases.length > 0
          ? {
              label: "Draft urgent reply template",
              prompt: `I have ${snapshot.urgentCases.length} urgent/high-priority support cases across categories: ${
                Array.from(new Set(snapshot.urgentCases.map((c) => c.category).filter(Boolean))).join(", ") || "general"
              }. Draft an empathetic, action-oriented reply template I can adapt — under 120 words, set clear next steps.`,
            }
          : null,
      },
      {
        key: "escalated",
        icon: AlertTriangle,
        title: "Escalated cases awaiting follow-up",
        description: `${snapshot.escalatedCases.length} case${snapshot.escalatedCases.length === 1 ? "" : "s"} routed to a higher tier`,
        items: snapshot.escalatedCases.map((c) => ({
          id: c.id,
          kind: "case" as const,
          primary: c.title,
          secondary: `escalated to ${c.escalated_to_role} · ${ageLabel(c.updated_at)}`,
          chip: c.status ?? "open",
        })),
        action: snapshot.escalatedCases.length > 0
          ? {
              label: "Draft escalation hand-off note",
              prompt: `Draft a concise internal hand-off note summarising context, customer impact, and recommended next step for ${snapshot.escalatedCases.length} escalated cases. Keep each under 60 words.`,
            }
          : null,
      },
      {
        key: "aging",
        icon: MessageSquareWarning,
        title: `Aging cases (>${AGING_HOURS}h, no urgent flag)`,
        description: `${snapshot.agingCases.length} case${snapshot.agingCases.length === 1 ? "" : "s"} quietly waiting`,
        items: snapshot.agingCases.map((c) => ({
          id: c.id,
          kind: "case" as const,
          primary: c.title,
          secondary: `${c.category ?? "general"} · ${ageLabel(c.created_at)}`,
          chip: c.priority ?? "normal",
        })),
        action: snapshot.agingCases.length > 0
          ? {
              label: "Draft check-in messages",
              prompt: `I have ${snapshot.agingCases.length} aging support cases (>${AGING_HOURS}h old, normal priority). Draft 3 short check-in message variants I can pick from to re-engage these customers without sounding automated.`,
            }
          : null,
      },
      {
        key: "at-risk",
        icon: HeartPulse,
        title: "At-risk customers (health < 40)",
        description: `${snapshot.atRiskCustomers.length} customer${snapshot.atRiskCustomers.length === 1 ? "" : "s"} flagged for retention attention`,
        items: snapshot.atRiskCustomers.map((c) => ({
          id: c.id,
          kind: "customer" as const,
          primary: c.display_name,
          secondary: `health ${c.health_score ?? "—"} · ${c.status ?? "active"}`,
          chip: `score ${c.health_score ?? "?"}`,
        })),
        action: snapshot.atRiskCustomers.length > 0
          ? {
              label: "Draft retention outreach",
              prompt: `Draft a short, human retention check-in for ${snapshot.atRiskCustomers.length} at-risk customers (health score < 40). Acknowledge friction, ask one open question, propose one concrete improvement. Under 100 words.`,
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

  function openDrawer(item: { id: string; kind: "case" | "customer"; primary: string }) {
    setDrawerTarget(
      item.kind === "case"
        ? { kind: "case", id: item.id, title: item.primary }
        : { kind: "customer", id: item.id, displayName: item.primary },
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Support load overview</CardTitle>
              <CardDescription>Open case volume across your RLS-scoped support queue</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{snapshot.totalOpen} open</span>
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
                    onClick={() => askForDraft(g.key, g.action!.prompt)}
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
                <p className="text-sm text-muted-foreground">Nothing to flag — clean queue here.</p>
              ) : (
                <ScrollArea className="max-h-[240px]">
                  <div className="space-y-2">
                    {g.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openDrawer(item)}
                        className="w-full flex items-center justify-between rounded-md border border-border px-3 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Open detail for ${item.primary}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.primary}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.secondary}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">{item.chip}</Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {askResult?.key === g.key && (
                <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Customer Service Advisor draft (review before sending):</p>
                  <div className="text-sm whitespace-pre-wrap">{askResult.content}</div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <CustomerServiceDetailDrawer
        target={drawerTarget}
        onOpenChange={(open) => { if (!open) setDrawerTarget(null); }}
      />
    </div>
  );
}