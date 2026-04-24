// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Service Advisor detail drawer.
//
// Opens when you click an item in any recommendations list. For a
// support case it loads full case fields + the latest events from
// support_case_events; for a customer it loads recent cases + key
// metadata. Drafts an in-context advisor reply on demand.
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
import { Loader2, AlarmClock, MessageSquare, ShieldAlert, User, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";

export type DrawerTarget =
  | { kind: "case"; id: string; title: string }
  | { kind: "customer"; id: string; displayName: string };

interface CaseDetail {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string | null;
  status: string | null;
  assigned_to: string | null;
  escalated_to_role: string | null;
  resolution: string | null;
  resolved_at: string | null;
  self_repair_attempted: boolean;
  self_repair_result: string | null;
  created_at: string;
  updated_at: string;
}

interface CaseEvent {
  id: string;
  event_type: string;
  content: string | null;
  created_at: string;
}

interface CustomerDetail {
  id: string;
  display_name: string;
  primary_email: string | null;
  primary_phone: string | null;
  status: string | null;
  health_score: number | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface CustomerCase {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  created_at: string;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function ageLabel(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Props {
  target: DrawerTarget | null;
  onOpenChange: (open: boolean) => void;
}

export function CustomerServiceDetailDrawer({ target, onOpenChange }: Props) {
  const open = target !== null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [caseEvents, setCaseEvents] = useState<CaseEvent[]>([]);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [customerCases, setCustomerCases] = useState<CustomerCase[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    if (!target) {
      setCaseDetail(null);
      setCaseEvents([]);
      setCustomerDetail(null);
      setCustomerCases([]);
      setDraft(null);
      setError(null);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (target!.kind === "case") {
          const [caseRes, eventsRes] = await Promise.all([
            supabase
              .from("support_cases")
              .select(
                "id, title, description, category, priority, status, assigned_to, escalated_to_role, resolution, resolved_at, self_repair_attempted, self_repair_result, created_at, updated_at",
              )
              .eq("id", target!.id)
              .maybeSingle(),
            supabase
              .from("support_case_events")
              .select("id, event_type, content, created_at")
              .eq("case_id", target!.id)
              .order("created_at", { ascending: false })
              .limit(20),
          ]);
          if (cancelled) return;
          if (caseRes.error) throw caseRes.error;
          setCaseDetail((caseRes.data ?? null) as CaseDetail | null);
          setCaseEvents((eventsRes.data ?? []) as CaseEvent[]);
        } else {
          const [custRes, casesRes] = await Promise.all([
            supabase
              .from("customers")
              .select(
                "id, display_name, primary_email, primary_phone, status, health_score, tags, created_at, updated_at",
              )
              .eq("id", target!.id)
              .maybeSingle(),
            supabase
              .from("support_cases")
              .select("id, title, status, priority, created_at")
              .order("created_at", { ascending: false })
              .limit(10),
          ]);
          if (cancelled) return;
          if (custRes.error) throw custRes.error;
          setCustomerDetail((custRes.data ?? null) as CustomerDetail | null);
          setCustomerCases((casesRes.data ?? []) as CustomerCase[]);
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

  async function draftReply() {
    if (!target) return;
    setDrafting(true);
    setDraft(null);
    try {
      const prompt =
        target.kind === "case" && caseDetail
          ? `Draft a single empathetic, action-oriented reply to this support case. Keep it under 120 words, set one clear next step.\n\nTitle: ${caseDetail.title}\nCategory: ${caseDetail.category ?? "general"}\nPriority: ${caseDetail.priority ?? "normal"}\nStatus: ${caseDetail.status ?? "open"}\nDescription: ${caseDetail.description ?? "(none)"}`
          : target.kind === "customer" && customerDetail
            ? `Draft a short retention check-in for this customer. Acknowledge friction, ask one open question, propose one concrete improvement. Under 100 words.\n\nCustomer: ${customerDetail.display_name}\nHealth score: ${customerDetail.health_score ?? "?"}\nStatus: ${customerDetail.status ?? "active"}\nRecent open cases: ${customerCases.filter((c) => c.status !== "resolved" && c.status !== "closed").length}`
            : null;
      if (!prompt) return;
      const r = await askBusinessAdvisor({
        advisorId: "customer-service-advisor",
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
            {target?.kind === "case" ? (
              <><MessageSquare className="h-4 w-4" /> Support case</>
            ) : (
              <><User className="h-4 w-4" /> Customer</>
            )}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {target?.kind === "case" ? target.title : target?.displayName}
          </SheetDescription>
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

          {!loading && !error && target?.kind === "case" && caseDetail && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">
                  {caseDetail.priority ?? "normal"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {caseDetail.status ?? "open"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {caseDetail.category ?? "general"}
                </Badge>
                {caseDetail.escalated_to_role && (
                  <Badge variant="destructive" className="text-[10px]">
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    escalated → {caseDetail.escalated_to_role}
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {caseDetail.description?.trim() || "(no description provided)"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Created</p>
                  <p className="font-medium">{ageLabel(caseDetail.created_at)}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtDate(caseDetail.created_at)}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Last activity</p>
                  <p className="font-medium">{ageLabel(caseDetail.updated_at)}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtDate(caseDetail.updated_at)}</p>
                </div>
              </div>

              {caseDetail.resolution && (
                <div className="rounded-md border border-border bg-muted/30 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Resolution</p>
                  <p className="text-sm whitespace-pre-wrap">{caseDetail.resolution}</p>
                  {caseDetail.resolved_at && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Resolved {fmtDate(caseDetail.resolved_at)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Activity className="h-3 w-3" /> Recent events ({caseEvents.length})
                </p>
                {caseEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No events recorded yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {caseEvents.map((ev) => (
                      <div key={ev.id} className="rounded-md border border-border px-2.5 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary" className="text-[9px] h-4">{ev.event_type}</Badge>
                          <span className="text-[10px] text-muted-foreground">{ageLabel(ev.created_at)}</span>
                        </div>
                        {ev.content && (
                          <p className="text-xs mt-1 whitespace-pre-wrap text-muted-foreground">{ev.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !error && target?.kind === "customer" && customerDetail && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">
                  {customerDetail.status ?? "active"}
                </Badge>
                <Badge
                  variant={customerDetail.health_score != null && customerDetail.health_score < 40 ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  health {customerDetail.health_score ?? "—"}
                </Badge>
                {customerDetail.tags?.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{customerDetail.primary_email || "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Phone</p>
                  <p className="font-medium">{customerDetail.primary_phone || "—"}</p>
                </div>
                <div className="rounded-md border border-border p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Customer since</p>
                  <p className="font-medium">{fmtDate(customerDetail.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                  <AlarmClock className="h-3 w-3" /> Recent cases ({customerCases.length})
                </p>
                {customerCases.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No support cases on record.</p>
                ) : (
                  <div className="space-y-1.5">
                    {customerCases.map((c) => (
                      <div key={c.id} className="rounded-md border border-border px-2.5 py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium truncate">{c.title}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0">{c.status ?? "open"}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {c.priority ?? "normal"} · {ageLabel(c.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !error && (
            (target?.kind === "case" && !caseDetail) ||
            (target?.kind === "customer" && !customerDetail)
          ) && (
            <p className="text-sm text-muted-foreground">Record not found or no longer accessible.</p>
          )}

          {draft && (
            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">
                Customer Service Advisor draft (review before sending)
              </p>
              <p className="text-sm whitespace-pre-wrap">{draft}</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border pt-3 mt-3 -mx-6 px-6">
          <Button
            onClick={draftReply}
            disabled={drafting || loading || (!caseDetail && !customerDetail)}
            className="w-full"
            size="sm"
          >
            {drafting ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Drafting…</>
            ) : target?.kind === "customer" ? (
              "Draft retention check-in"
            ) : (
              "Draft reply for this case"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}