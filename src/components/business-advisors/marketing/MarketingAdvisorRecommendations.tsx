// ═══════════════════════════════════════════════════════════════
// SITA OS — Marketing & Advertising Advisor recommendations.
//
// Surfaces three real, RLS-scoped patterns:
//   1. Channel concentration risk — over-reliance on one source
//   2. Stale leads — qualified but no recent contact
//   3. Untriaged inbound — campaign signals waiting on attention
// All values come from real tables; empty-state honest.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Megaphone, Inbox, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { MarketingDetailDrawer, type MarketingDrawerTarget } from "./MarketingDetailDrawer";
import { CFOExplainabilityPopover, type CFOExplainability } from "../cfo/CFOExplainabilityPopover";

interface InboxRow {
  id: string;
  contact_name: string | null;
  company: string | null;
  source: string | null;
  triage_status: string;
  urgency: string | null;
  quality_score: number | null;
  created_at: string;
}

interface LeadRow {
  id: string;
  name: string | null;
  company: string | null;
  source: string | null;
  status: string;
  opportunity_score: number | null;
  last_contact_at: string | null;
  created_at: string;
}

interface ChannelRow {
  source: string;
  count: number;
  sharePct: number;
}

interface MarketingSnapshot {
  channels: ChannelRow[];
  staleLeads: LeadRow[];
  untriaged: InboxRow[];
  totalLeadsScanned: number;
  totalInboxScanned: number;
  loadedAt: string;
}

const STALE_DAYS = 14;
const CHANNEL_CONCENTRATION_THRESHOLD = 0.5; // 50% of leads from a single source

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

async function loadMarketingSnapshot(userId: string): Promise<MarketingSnapshot> {
  const staleCutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [allLeadsRes, staleRes, inboxRes] = await Promise.all([
    supabase
      .from("leads")
      .select("source")
      .eq("user_id", userId)
      .limit(2000),
    supabase
      .from("leads")
      .select("id, name, company, source, status, opportunity_score, last_contact_at, created_at")
      .eq("user_id", userId)
      .in("status", ["qualified", "engaged", "working"])
      .or(`last_contact_at.lt.${staleCutoff},last_contact_at.is.null`)
      .order("last_contact_at", { ascending: true, nullsFirst: true })
      .limit(15),
    supabase
      .from("lead_inbox_items")
      .select("id, contact_name, company, source, triage_status, urgency, quality_score, created_at")
      .eq("user_id", userId)
      .in("triage_status", ["new", "pending", "needs_review"])
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const allLeads = (allLeadsRes.data ?? []) as Array<{ source: string | null }>;
  const channelCounts = new Map<string, number>();
  for (const l of allLeads) {
    const k = (l.source ?? "(unknown)").toLowerCase().trim() || "(unknown)";
    channelCounts.set(k, (channelCounts.get(k) ?? 0) + 1);
  }
  const channels: ChannelRow[] = [...channelCounts.entries()]
    .map(([source, count]) => ({
      source,
      count,
      sharePct: allLeads.length > 0 ? (count / allLeads.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    channels,
    staleLeads: (staleRes.data ?? []) as LeadRow[],
    untriaged: (inboxRes.data ?? []) as InboxRow[],
    totalLeadsScanned: allLeads.length,
    totalInboxScanned: inboxRes.data?.length ?? 0,
    loadedAt: new Date().toISOString(),
  };
}

export function MarketingAdvisorRecommendations() {
  const [snapshot, setSnapshot] = useState<MarketingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerTarget, setDrawerTarget] = useState<MarketingDrawerTarget | null>(null);
  const [askLoading, setAskLoading] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

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
      const snap = await loadMarketingSnapshot(userId);
      if (!cancelled) {
        setSnapshot(snap);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function openDrawer(item: { id: string; kind: "channel" | "lead" | "inbox"; primary: string }) {
    setDrawerTarget({ kind: item.kind, id: item.id, label: item.primary });
  }

  async function askForDraft(key: string, prompt: string) {
    setAskLoading(key);
    try {
      const r = await askBusinessAdvisor({
        advisorId: "marketing-advertising-advisor",
        prompt,
        intent: "draft",
      });
      setDrafts((d) => ({ ...d, [key]: r.response.content }));
    } finally {
      setAskLoading(null);
    }
  }

  const groups = useMemo(() => {
    if (!snapshot) return [];
    const snapTime = new Date(snapshot.loadedAt).toLocaleString();
    const topChannel = snapshot.channels[0];
    const overConcentrated = topChannel && topChannel.sharePct >= CHANNEL_CONCENTRATION_THRESHOLD * 100;

    return [
      {
        key: "channels",
        icon: Megaphone,
        title: "Channel mix — concentration risk",
        description:
          snapshot.channels.length === 0
            ? "No leads recorded yet — channel mix not measurable."
            : overConcentrated
              ? `Heavy reliance on ${topChannel!.source} (${topChannel!.sharePct.toFixed(0)}%) — diversify.`
              : `${snapshot.channels.length} channels active — mix looks balanced.`,
        action: overConcentrated
          ? {
              label: "Diversification ideas",
              prompt: `Our top channel "${topChannel!.source}" supplies ${topChannel!.sharePct.toFixed(0)}% of leads. Recommend 3 alternative channels worth testing this quarter, with one experiment idea each. Recommend-only.`,
            }
          : null,
        explain: {
          subject: "Channel mix concentration analysis",
          sources: [
            {
              table: "leads",
              purpose: "All leads in your account, RLS-scoped, used to compute channel share.",
              rowCount: snapshot.totalLeadsScanned,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            "Channel = lead.source (lowercased + trimmed).",
            `Concentration threshold: a channel is "over-concentrated" if it represents ≥${(CHANNEL_CONCENTRATION_THRESHOLD * 100).toFixed(0)}% of all leads.`,
            "Top 8 channels by lead count are surfaced.",
            "Missing source values are bucketed as '(unknown)'.",
          ],
          steps: [
            { label: "Pull all leads", detail: "SELECT source FROM leads WHERE user_id matches (RLS).", output: `${snapshot.totalLeadsScanned} lead${snapshot.totalLeadsScanned === 1 ? "" : "s"}` },
            { label: "Group by source", detail: "Count leads per channel, lowercased to merge near-duplicates.", output: `${snapshot.channels.length} channel${snapshot.channels.length === 1 ? "" : "s"}` },
            { label: "Compute share", detail: "Divide each channel's count by the total lead count.", output: topChannel ? `top: ${topChannel.source} (${topChannel.sharePct.toFixed(1)}%)` : "—" },
            { label: "Flag concentration", detail: `Mark over-concentrated if top share ≥ ${(CHANNEL_CONCENTRATION_THRESHOLD * 100).toFixed(0)}%.`, output: overConcentrated ? "OVER-CONCENTRATED" : "balanced" },
          ],
          footer: `Snapshot taken ${snapTime} · row-level security enforced.`,
        } satisfies CFOExplainability,
        items: snapshot.channels.map((c) => ({
          id: c.source,
          kind: "channel" as const,
          primary: c.source,
          secondary: `${c.count} lead${c.count === 1 ? "" : "s"} · ${c.sharePct.toFixed(1)}% of total`,
          chip: `${c.sharePct.toFixed(0)}%`,
          chipVariant: c.sharePct >= CHANNEL_CONCENTRATION_THRESHOLD * 100 ? ("destructive" as const) : ("outline" as const),
          explain: {
            subject: `${c.source} — ${c.sharePct.toFixed(1)}% of all leads`,
            sources: [{ table: "leads", purpose: `Leads where source = '${c.source}'.`, rowCount: c.count, asOf: snapshot.loadedAt }],
            assumptions: [
              "Share = leads from this source ÷ total leads across all sources.",
              c.sharePct >= CHANNEL_CONCENTRATION_THRESHOLD * 100
                ? `Flagged because ≥ ${(CHANNEL_CONCENTRATION_THRESHOLD * 100).toFixed(0)}% threshold.`
                : "Below the concentration threshold.",
            ],
            steps: [
              { label: "Filter by source", detail: `Keep leads where source = '${c.source}'.`, output: `${c.count} lead${c.count === 1 ? "" : "s"}` },
              { label: "Divide", detail: "count ÷ total leads.", output: `${c.sharePct.toFixed(2)}%` },
              { label: "Compare to threshold", detail: `Threshold = ${(CHANNEL_CONCENTRATION_THRESHOLD * 100).toFixed(0)}%.`, output: c.sharePct >= CHANNEL_CONCENTRATION_THRESHOLD * 100 ? "over" : "under" },
            ],
          } satisfies CFOExplainability,
        })),
      },
      {
        key: "stale",
        icon: Users,
        title: `Stale leads — no contact in ${STALE_DAYS}+ days`,
        description:
          snapshot.staleLeads.length === 0
            ? "All active leads contacted recently."
            : `${snapshot.staleLeads.length} active lead${snapshot.staleLeads.length === 1 ? "" : "s"} going cold`,
        action: snapshot.staleLeads.length > 0
          ? {
              label: "Re-engagement plan",
              prompt: `${snapshot.staleLeads.length} active leads have not been contacted in ${STALE_DAYS}+ days. Recommend a 3-touch re-engagement sequence (channel + angle each). Recommend-only — do not send anything.`,
            }
          : null,
        explain: {
          subject: `Active leads dormant for ${STALE_DAYS}+ days`,
          sources: [
            {
              table: "leads",
              purpose: "Active-pipeline leads that have gone cold (last_contact_at older than cutoff or null).",
              rowCount: snapshot.staleLeads.length,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            `Stale = last_contact_at < ${STALE_DAYS} days ago, OR no last_contact_at recorded.`,
            "Only statuses 'qualified', 'engaged', or 'working' considered active.",
            "Sorted by oldest contact first so the coldest leads surface at the top.",
          ],
          steps: [
            { label: "Pull active leads", detail: "SELECT from leads where user matches AND status in (qualified, engaged, working).", output: "active pipeline rows" },
            { label: "Filter to stale", detail: `Keep rows where last_contact_at older than ${STALE_DAYS} days, or null.`, output: `${snapshot.staleLeads.length} stale` },
            { label: "Rank by coldness", detail: "Order by last_contact_at ascending so coldest is first.", output: snapshot.staleLeads[0]?.last_contact_at ? `oldest contact ${new Date(snapshot.staleLeads[0]!.last_contact_at!).toLocaleDateString()}` : "never contacted" },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.staleLeads.map((l) => {
          const days = daysSince(l.last_contact_at);
          return {
            id: l.id,
            kind: "lead" as const,
            primary: l.name ?? l.company ?? "(unnamed lead)",
            secondary: `${l.source ?? "—"} · ${l.status}${days != null ? ` · ${days}d cold` : " · never contacted"}`,
            chip: days != null ? `${days}d` : "never",
            chipVariant: "outline" as const,
            explain: {
              subject: `${l.name ?? "(unnamed)"} — ${days != null ? `${days}d cold` : "never contacted"}`,
              sources: [{ table: "leads", purpose: "Single lead record.", rowCount: 1, asOf: l.created_at }],
              assumptions: [
                "Coldness measured from last_contact_at to now.",
                `Status '${l.status}' qualifies as active pipeline.`,
              ],
              steps: [
                { label: "Read last_contact_at", detail: "Pull the lead's most recent recorded contact.", output: l.last_contact_at ? new Date(l.last_contact_at).toLocaleString() : "never" },
                { label: "Compute days cold", detail: "Subtract from current time.", output: days != null ? `${days} days` : "n/a" },
                { label: "Flag", detail: `Surfaced because ≥ ${STALE_DAYS}d or never contacted.`, output: "needs re-engagement" },
              ],
            } satisfies CFOExplainability,
          };
        }),
      },
      {
        key: "untriaged",
        icon: Inbox,
        title: "Untriaged inbound signals",
        description:
          snapshot.untriaged.length === 0
            ? "Inbound is cleared — every signal has been triaged."
            : `${snapshot.untriaged.length} signal${snapshot.untriaged.length === 1 ? "" : "s"} waiting on triage`,
        action: null,
        explain: {
          subject: "Untriaged inbound campaign signals",
          sources: [
            {
              table: "lead_inbox_items",
              purpose: "Raw inbound from any channel before it becomes a lead.",
              rowCount: snapshot.untriaged.length,
              asOf: snapshot.loadedAt,
            },
          ],
          assumptions: [
            "Untriaged = triage_status in (new, pending, needs_review).",
            "Newest first so freshest opportunities surface at the top.",
            "Top 15 are returned to keep the list scannable.",
          ],
          steps: [
            { label: "Pull inbox", detail: "SELECT from lead_inbox_items where user matches (RLS).", output: "RLS-scoped inbox rows" },
            { label: "Filter to untriaged", detail: "Keep rows where triage_status ∈ {new, pending, needs_review}.", output: `${snapshot.untriaged.length} signal${snapshot.untriaged.length === 1 ? "" : "s"}` },
            { label: "Rank by recency", detail: "Order by created_at descending.", output: snapshot.untriaged[0] ? `latest ${new Date(snapshot.untriaged[0].created_at).toLocaleDateString()}` : "—" },
          ],
          footer: `Snapshot taken ${snapTime}.`,
        } satisfies CFOExplainability,
        items: snapshot.untriaged.map((i) => ({
          id: i.id,
          kind: "inbox" as const,
          primary: i.contact_name ?? i.company ?? "(anonymous inbound)",
          secondary: `${i.source ?? "—"} · ${new Date(i.created_at).toLocaleDateString()}${i.urgency ? ` · ${i.urgency}` : ""}`,
          chip: i.triage_status,
          chipVariant: (i.urgency ?? "").toLowerCase() === "high" ? ("destructive" as const) : ("outline" as const),
          explain: {
            subject: `Inbound from ${i.contact_name ?? i.company ?? "(anon)"} via ${i.source ?? "unknown"}`,
            sources: [{ table: "lead_inbox_items", purpose: "Single inbound signal.", rowCount: 1, asOf: i.created_at }],
            assumptions: [
              `Status '${i.triage_status}' qualifies as untriaged.`,
              i.quality_score != null ? `Quality score recorded: ${i.quality_score}/100.` : "No quality score recorded.",
            ],
            steps: [
              { label: "Read status", detail: "Take the row's triage_status.", output: i.triage_status },
              { label: "Read urgency", detail: "Take urgency if recorded.", output: i.urgency ?? "none" },
              { label: "Surface", detail: "Show in the untriaged group for owner review.", output: "needs triage" },
            ],
          } satisfies CFOExplainability,
        })),
      },
    ];
  }, [snapshot]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading marketing recommendations…
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Sign in to see marketing recommendations.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const Icon = g.icon;
        return (
          <Card key={g.key}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{g.title}</CardTitle>
                  <CFOExplainabilityPopover
                    data={g.explain}
                    triggerLabel={`Explain how ${g.title} was computed`}
                  />
                </div>
                {g.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => askForDraft(g.key, g.action!.prompt)}
                    disabled={askLoading === g.key}
                  >
                    {askLoading === g.key ? (
                      <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Drafting…</>
                    ) : (
                      g.action.label
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{g.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              {g.items.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No items in this group.</p>
              ) : (
                <ScrollArea className="max-h-[260px] pr-2">
                  <div className="space-y-1.5">
                    {g.items.map((item) => (
                      <button
                        key={`${g.key}-${item.id}`}
                        type="button"
                        onClick={() => openDrawer(item)}
                        className="w-full flex items-center justify-between rounded-md border border-border px-3 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Open detail for ${item.primary}`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.primary}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.secondary}</p>
                        </div>
                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                          <CFOExplainabilityPopover
                            data={item.explain}
                            triggerLabel={`Explain why ${item.primary} is flagged`}
                          />
                          <Badge variant={item.chipVariant} className="text-xs">{item.chip}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {drafts[g.key] && (
                <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">
                    Marketing Advisor draft (review before using)
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{drafts[g.key]}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      <MarketingDetailDrawer target={drawerTarget} onOpenChange={(o) => !o && setDrawerTarget(null)} />
    </div>
  );
}