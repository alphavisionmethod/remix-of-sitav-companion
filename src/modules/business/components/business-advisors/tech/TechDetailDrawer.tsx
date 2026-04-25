// ═══════════════════════════════════════════════════════════════
// SITA OS — Tech Advisor detail drawer.
// Opens when a row is clicked in any Tech recommendation list:
//   • incident → full incident record
//   • error    → full error_event record
// Drafts a Tech memo on demand. Read-only — Tech Advisor never
// deploys, modifies infra, or commits breaking changes live.
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
import { Loader2, AlertTriangle, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";

export type TechDrawerTarget =
  | { kind: "incident"; id: string; label: string }
  | { kind: "error"; id: string; label: string };

interface IncidentDetail {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  affected_services: unknown;
  remediation_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  primary_runbook_id: string | null;
}

interface ErrorDetail {
  id: string;
  fingerprint: string;
  message: string;
  severity: string;
  source: string;
  route: string | null;
  count: number;
  release: string | null;
  environment: string;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
}

interface DetailState {
  incident?: IncidentDetail | null;
  error?: ErrorDetail | null;
  loading: boolean;
}

interface Props {
  target: TechDrawerTarget | null;
  onClose: () => void;
}

export function TechDetailDrawer({ target, onClose }: Props) {
  const [state, setState] = useState<DetailState>({ loading: false });
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDraft(null);
    if (!target) {
      setState({ loading: false });
      return;
    }
    setState({ loading: true });

    async function load() {
      if (!target) return;
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) setState({ loading: false });
        return;
      }

      if (target.kind === "incident") {
        const { data: incident } = await supabase
          .from("incidents")
          .select("id, title, description, severity, status, affected_services, remediation_notes, resolved_at, created_at, primary_runbook_id")
          .eq("user_id", userId)
          .eq("id", target.id)
          .maybeSingle();
        if (!cancelled) {
          setState({ loading: false, incident: (incident ?? null) as IncidentDetail | null });
        }
      } else {
        const { data: error } = await supabase
          .from("error_events")
          .select("id, fingerprint, message, severity, source, route, count, release, environment, first_seen_at, last_seen_at, resolved_at")
          .eq("user_id", userId)
          .eq("id", target.id)
          .maybeSingle();
        if (!cancelled) {
          setState({ loading: false, error: (error ?? null) as ErrorDetail | null });
        }
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
    try {
      let prompt = "";
      if (target.kind === "incident" && state.incident) {
        prompt = `Incident "${state.incident.title}" — severity ${state.incident.severity}, status ${state.incident.status}. ${state.incident.description ?? ""}. Recommend the top 3 next remediation steps and what owner-side validation is needed before each. Recommend-only.`;
      } else if (target.kind === "error" && state.error) {
        prompt = `Error fingerprint "${state.error.fingerprint}" — ${state.error.severity} on route "${state.error.route ?? "unknown"}", ${state.error.count} occurrences across ${state.error.source}, last seen ${state.error.last_seen_at}. Message: ${state.error.message}. Recommend the top 2 likely root causes and a triage step for each. Recommend-only.`;
      } else {
        return;
      }
      const r = await askBusinessAdvisor({
        advisorId: "tech-advisor",
        prompt,
        intent: "draft",
      });
      setDraft(r.response.content);
    } finally {
      setDrafting(false);
    }
  }

  return (
    <Sheet open={!!target} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md w-full overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-base flex items-center gap-2">
            {target?.kind === "incident" && <AlertTriangle className="h-4 w-4" />}
            {target?.kind === "error" && <Bug className="h-4 w-4" />}
            {target?.label ?? "Tech detail"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Read-only — Tech Advisor never deploys, modifies infra, or commits breaking changes.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-3 mt-3">
          {state.loading && <Skeleton className="h-32 w-full" />}

          {!state.loading && target?.kind === "incident" && state.incident && (
            <div className="space-y-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Incident</p>
                <p className="text-sm font-semibold">{state.incident.title}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="text-muted-foreground">Severity: </span>{state.incident.severity}</div>
                  <div><span className="text-muted-foreground">Status: </span>{state.incident.status}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Created: </span>{new Date(state.incident.created_at).toLocaleString()}</div>
                  {state.incident.resolved_at && (
                    <div className="col-span-2"><span className="text-muted-foreground">Resolved: </span>{new Date(state.incident.resolved_at).toLocaleString()}</div>
                  )}
                  {state.incident.primary_runbook_id && (
                    <div className="col-span-2"><span className="text-muted-foreground">Runbook: </span>{state.incident.primary_runbook_id}</div>
                  )}
                </div>
                {state.incident.description && (
                  <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{state.incident.description}</p>
                )}
                {state.incident.remediation_notes && (
                  <div className="mt-2">
                    <p className="text-[10px] uppercase text-muted-foreground">Remediation notes</p>
                    <p className="text-xs whitespace-pre-wrap">{state.incident.remediation_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!state.loading && target?.kind === "error" && state.error && (
            <div className="space-y-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[10px] uppercase text-muted-foreground">Error event</p>
                <p className="text-sm font-semibold break-all">{state.error.fingerprint}</p>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap break-words">{state.error.message}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div><span className="text-muted-foreground">Severity: </span>{state.error.severity}</div>
                  <div><span className="text-muted-foreground">Source: </span>{state.error.source}</div>
                  <div><span className="text-muted-foreground">Count: </span>{state.error.count}</div>
                  <div><span className="text-muted-foreground">Env: </span>{state.error.environment}</div>
                  {state.error.route && (
                    <div className="col-span-2"><span className="text-muted-foreground">Route: </span>{state.error.route}</div>
                  )}
                  {state.error.release && (
                    <div className="col-span-2"><span className="text-muted-foreground">Release: </span>{state.error.release}</div>
                  )}
                  <div className="col-span-2"><span className="text-muted-foreground">First seen: </span>{new Date(state.error.first_seen_at).toLocaleString()}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Last seen: </span>{new Date(state.error.last_seen_at).toLocaleString()}</div>
                </div>
                <Badge variant={state.error.resolved_at ? "outline" : "destructive"} className="text-[10px] h-4 mt-2">
                  {state.error.resolved_at ? "resolved" : "unresolved"}
                </Badge>
              </div>
            </div>
          )}

          {!state.loading && target && !state.incident && !state.error && (
            <Alert>
              <AlertDescription className="text-xs">
                Could not load this record — it may have been removed or you no longer have access.
              </AlertDescription>
            </Alert>
          )}

          {draft && (
            <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Tech Advisor draft
              </p>
              <p className="text-xs whitespace-pre-wrap">{draft}</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border pt-3 mt-2">
          <Button
            onClick={draftMemo}
            disabled={drafting || state.loading}
            className="w-full"
            size="sm"
          >
            {drafting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Drafting…</>
            ) : (
              "Draft Tech memo"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}