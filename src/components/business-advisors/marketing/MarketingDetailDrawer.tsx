// ═══════════════════════════════════════════════════════════════
// SITA OS — Marketing Advisor detail drawer.
//
// Opens when you click a row in any Marketing recommendation list:
//   • channel  → channel mix breakdown + recent inbound
//   • lead     → full lead record + sibling leads from same source
//   • inbox    → raw inbound signal + triage status
// Drafts campaign briefs / channel memos on demand. Read-only —
// Marketing Advisor never launches paid campaigns or sends mail.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Megaphone, Users, Inbox, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";

export type MarketingDrawerTarget =
  | { kind: "channel"; id: string; label: string }
  | { kind: "lead"; id: string; label: string }
  | { kind: "inbox"; id: string; label: string };

interface LeadDetail {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  source: string | null;
  status: string;
  likely_value: number | null;
  opportunity_score: number | null;
  last_contact_at: string | null;
  notes: string | null;
  created_at: string;
}

interface InboxDetail {
  id: string;
  contact_name: string | null;
  contact_email: string | null;
  company: string | null;
  source: string | null;
  inquiry_text: string | null;
  urgency: string | null;
  quality_score: number | null;
  triage_status: string;
  created_at: string;
}

interface ChannelStat {
  source: string;
  leadCount: number;
  qualifiedCount: number;
  shareLeadsPct: number;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

interface Props {
  target: MarketingDrawerTarget | null;
  onOpenChange: (open: boolean) => void;
}

export function MarketingDetailDrawer({ target, onOpenChange }: Props) {
  const open = target !== null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [inbox, setInbox] = useState<InboxDetail | null>(null);
  const [channel, setChannel] = useState<ChannelStat | null>(null);
  const [related, setRelated] = useState<LeadDetail[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    if (!target) {
      setLead(null);
      setInbox(null);
      setChannel(null);
      setRelated([]);
      setDraft(null);
      setError(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: u } = await supabase.auth.getUser();
        const userId = u?.user?.id;
        if (!userId) throw new Error("Not authenticated");

        if (target!.kind === "lead") {
          const r = await supabase
            .from("leads")
            .select("id, name, email, company, source, status, likely_value, opportunity_score, last_contact_at, notes, created_at")
            .eq("id", target!.id)
            .maybeSingle();
          if (cancelled) return;
          if (r.error) throw r.error;
          setLead((r.data ?? null) as LeadDetail | null);

          if (r.data?.source) {
            const sib = await supabase
              .from("leads")
              .select("id, name, email, company, source, status, likely_value, opportunity_score, last_contact_at, notes, created_at")
              .eq("user_id", userId)
              .eq("source", r.data.source)
              .neq("id", r.data.id)
              .order("created_at", { ascending: false })
              .limit(8);
            if (!cancelled) setRelated((sib.data ?? []) as LeadDetail[]);
          }
        } else if (target!.kind === "inbox") {
          const r = await supabase
            .from("lead_inbox_items")
            .select("id, contact_name, contact_email, company, source, inquiry_text, urgency, quality_score, triage_status, created_at")
            .eq("id", target!.id)
            .maybeSingle();
          if (cancelled) return;
          if (r.error) throw r.error;
          setInbox((r.data ?? null) as InboxDetail | null);
        } else {
          // channel rollup — id holds the source key
          const sourceKey = target!.id;
          const r = await supabase
            .from("leads")
            .select("status, source")
            .eq("user_id", userId)
            .eq("source", sourceKey)
            .limit(2000);
          if (cancelled) return;
          if (r.error) throw r.error;
          const totalRes = await supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId);
          const rows = (r.data ?? []) as Array<{ status: string }>;
          const qualified = rows.filter((x) => (x.status ?? "").toLowerCase() === "qualified").length;
          const total = totalRes.count ?? rows.length;
          if (!cancelled) {
            setChannel({
              source: sourceKey,
              leadCount: rows.length,
              qualifiedCount: qualified,
              shareLeadsPct: total > 0 ? (rows.length / total) * 100 : 0,
            });
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load detail");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [target]);

  async function draftMemo() {
    if (!target) return;
    setDrafting(true);
    setDraft(null);
    try {
      let prompt: string | null = null;
      if (target.kind === "lead" && lead) {
        prompt =
          `Draft a brief positioning + outreach angle for this lead — what message would resonate? Under 100 words.\n\n` +
          `Name: ${lead.name ?? "(unknown)"}\nCompany: ${lead.company ?? "(unknown)"}\n` +
          `Source channel: ${lead.source ?? "(unknown)"}\nStatus: ${lead.status}\n` +
          `Opportunity score: ${lead.opportunity_score ?? "—"}\nNotes: ${lead.notes ?? "(none)"}`;
      } else if (target.kind === "inbox" && inbox) {
        prompt =
          `Draft a campaign hypothesis based on this inbound signal — what audience pain is this hinting at, and what creative angle would test it? Under 120 words.\n\n` +
          `From: ${inbox.contact_name ?? "(unknown)"} (${inbox.company ?? "—"})\n` +
          `Channel: ${inbox.source ?? "(unknown)"}\nUrgency: ${inbox.urgency ?? "—"}\n` +
          `Quality score: ${inbox.quality_score ?? "—"}\nInquiry: ${inbox.inquiry_text ?? "(none)"}`;
      } else if (target.kind === "channel" && channel) {
        prompt =
          `Draft a channel memo for the marketing lead. Cover (1) what this channel's volume + qualification rate suggest, (2) two test ideas to lift conversion, (3) recommended budget posture (lean in / hold / cut). Under 150 words.\n\n` +
          `Channel: ${channel.source}\nLeads (rolling): ${channel.leadCount}\n` +
          `Qualified: ${channel.qualifiedCount}\nShare of total leads: ${channel.shareLeadsPct.toFixed(1)}%`;
      }
      if (!prompt) return;
      const r = await askBusinessAdvisor({
        advisorId: "marketing-advertising-advisor",
        prompt,
        intent: "draft",
      });
      setDraft(r.response.content);
    } catch (e) {
      setDraft(e instanceof Error ? e.message : "Advisor unavailable");
    } finally {
      setDrafting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-base">
            {target?.kind === "channel" && (<><Megaphone className="h-4 w-4" /> Channel</>)}
            {target?.kind === "lead" && (<><Users className="h-4 w-4" /> Lead</>)}
            {target?.kind === "inbox" && (<><Inbox className="h-4 w-4" /> Inbound signal</>)}
          </SheetTitle>
          <SheetDescription className="text-xs">{target?.label}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6 mt-3">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && target?.kind === "lead" && lead && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{lead.status}</Badge>
                {lead.source && <Badge variant="outline" className="text-[10px]">{lead.source}</Badge>}
                {lead.opportunity_score != null && (
                  <Badge variant="outline" className="text-[10px]">score {lead.opportunity_score}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Name</p>
                  <p className="font-medium truncate">{lead.name ?? "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Company</p>
                  <p className="font-medium truncate">{lead.company ?? "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2 col-span-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{lead.email ?? "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Likely value</p>
                  <p className="font-medium">{lead.likely_value != null ? `$${Number(lead.likely_value).toFixed(0)}` : "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Last contact</p>
                  <p className="font-medium">{fmtDate(lead.last_contact_at)}</p>
                </div>
              </div>
              {lead.notes && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          )}

          {!loading && !error && target?.kind === "inbox" && inbox && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{inbox.triage_status}</Badge>
                {inbox.source && <Badge variant="outline" className="text-[10px]">{inbox.source}</Badge>}
                {inbox.urgency && <Badge variant="outline" className="text-[10px]">urgency: {inbox.urgency}</Badge>}
                {inbox.quality_score != null && (
                  <Badge variant="outline" className="text-[10px]">quality {inbox.quality_score}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Contact</p>
                  <p className="font-medium truncate">{inbox.contact_name ?? "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Company</p>
                  <p className="font-medium truncate">{inbox.company ?? "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2 col-span-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{inbox.contact_email ?? "—"}</p>
                </div>
              </div>
              {inbox.inquiry_text && (
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Inquiry</p>
                  <p className="text-sm whitespace-pre-wrap">{inbox.inquiry_text}</p>
                </div>
              )}
            </div>
          )}

          {!loading && !error && target?.kind === "channel" && channel && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{channel.source}</Badge>
                <Badge variant="outline" className="text-[10px]">{channel.leadCount} leads</Badge>
                <Badge variant="outline" className="text-[10px]">
                  {channel.shareLeadsPct.toFixed(1)}% of total
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Total leads</p>
                  <p className="font-medium">{channel.leadCount}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Qualified</p>
                  <p className="font-medium">{channel.qualifiedCount}</p>
                </div>
                <div className="rounded-md border border-border p-2 col-span-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Qualification rate</p>
                  <p className="font-medium">
                    {channel.leadCount > 0 ? `${((channel.qualifiedCount / channel.leadCount) * 100).toFixed(1)}%` : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && related.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                <Activity className="h-3 w-3" /> Other leads from same channel ({related.length})
              </p>
              <div className="space-y-1.5">
                {related.map((l) => (
                  <div key={l.id} className="rounded-md border border-border px-2.5 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium truncate">{l.name ?? l.email ?? "(unknown)"}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{l.status}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {l.company ?? "—"} · {new Date(l.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && (
            (target?.kind === "lead" && !lead) ||
            (target?.kind === "inbox" && !inbox) ||
            (target?.kind === "channel" && !channel)
          ) && (
            <p className="text-sm text-muted-foreground">Record not found or no longer accessible.</p>
          )}

          {draft && (
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">
                Marketing Advisor draft (review before using — drafts only, no live launches)
              </p>
              <p className="text-sm whitespace-pre-wrap">{draft}</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border pt-3 mt-3 -mx-6 px-6">
          <Button
            onClick={draftMemo}
            disabled={drafting || loading || (!lead && !inbox && !channel)}
            className="w-full"
            size="sm"
          >
            {drafting ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Drafting…</>
            ) : (
              "Draft marketing memo"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}