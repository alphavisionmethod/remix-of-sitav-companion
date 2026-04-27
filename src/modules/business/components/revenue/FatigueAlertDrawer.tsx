import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, BellOff, RefreshCw, ShieldCheck, MessageSquareOff, ListChecks } from "lucide-react";
import type { FatigueAlertRow } from "@/modules/business/hooks/use-revenue-automation-health";
import { fromTable } from "@/lib/supabase-helpers";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Props {
  alert: FatigueAlertRow | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Maps a fatigue signal to a curated set of next-best actions.
 * Server is still source of truth for execution; this surface is advisory.
 */
function recommendedActions(alert: FatigueAlertRow): Array<{
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}> {
  const sig = alert.signal.toLowerCase();
  const base = [
    {
      key: "pause",
      icon: BellOff,
      title: `Pause ${alert.channel} sequence for affected contacts`,
      detail: "Stops further sends until the underlying signal recovers. Reversible from Automation Receipts.",
    },
    {
      key: "frequency-cap",
      icon: ShieldCheck,
      title: "Apply 7-day frequency cap on this channel",
      detail: "Limits to one outbound per contact per week while engagement recovers.",
    },
  ];
  if (sig.includes("unsubscribe")) {
    base.unshift({
      key: "scrub",
      icon: MessageSquareOff,
      title: "Scrub list against fresh suppression set",
      detail: "Re-syncs unsubscribes from the channel provider before any new send.",
    });
  }
  if (sig.includes("sentiment") || sig.includes("complaint")) {
    base.unshift({
      key: "review-copy",
      icon: ListChecks,
      title: "Send last 3 messages to Engagement Coach for review",
      detail: "Advisor returns rewrite suggestions and tone guidance.",
    });
  }
  base.push({
    key: "retest",
    icon: RefreshCw,
    title: "Re-evaluate in 24h and auto-clear if signal recovers",
    detail: "Marks the alert resolved automatically when the threshold returns to baseline.",
  });
  return base;
}

export function FatigueAlertDrawer({ alert, onOpenChange }: Props) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  if (!alert) return null;
  const isAcknowledged = !!alert.acknowledgedAt;
  const evidenceJson = JSON.stringify(alert.evidence ?? {}, null, 2);

  async function acknowledge() {
    if (!alert) return;
    setBusy(true);
    const res = await fromTable("automation_fatigue_alerts")
      .update({ acknowledged_at: new Date().toISOString() } as never)
      .eq("id", alert.id);
    setBusy(false);
    if ((res as { error?: { message?: string } }).error) {
      toast({ title: "Could not acknowledge", description: (res as { error?: { message?: string } }).error?.message ?? "Unknown error", variant: "destructive" });
      return;
    }
    toast({ title: "Alert acknowledged", description: "It will stay visible until resolved." });
    qc.invalidateQueries({ queryKey: ["revenue-automation-health"] });
    onOpenChange(false);
  }

  async function resolve() {
    if (!alert) return;
    setBusy(true);
    const now = new Date().toISOString();
    const res = await fromTable("automation_fatigue_alerts")
      .update({ resolved_at: now, acknowledged_at: alert.acknowledgedAt ?? now } as never)
      .eq("id", alert.id);
    setBusy(false);
    if ((res as { error?: { message?: string } }).error) {
      toast({ title: "Could not resolve", description: (res as { error?: { message?: string } }).error?.message ?? "Unknown error", variant: "destructive" });
      return;
    }
    toast({ title: "Alert resolved" });
    qc.invalidateQueries({ queryKey: ["revenue-automation-health"] });
    onOpenChange(false);
  }

  return (
    <Sheet open={!!alert} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <SheetTitle className="text-base capitalize">{alert.signal.replace(/_/g, " ")}</SheetTitle>
          </div>
          <SheetDescription className="flex items-center gap-2 pt-1">
            <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="capitalize text-[10px]">
              {alert.severity}
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">{alert.channel} channel</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleString()}</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            <section>
              <h3 className="text-xs font-semibold text-foreground mb-2">Recommended next actions</h3>
              <ul className="space-y-2">
                {recommendedActions(alert).map((a) => {
                  const Icon = a.icon;
                  return (
                    <li key={a.key} className="flex gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{a.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{a.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <Separator />

            <section>
              <h3 className="text-xs font-semibold text-foreground mb-2">Evidence</h3>
              {Object.keys(alert.evidence ?? {}).length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No structured evidence was attached when this alert was raised.</p>
              ) : (
                <pre className="text-[11px] bg-muted/40 border border-border/60 rounded-md p-3 overflow-x-auto leading-relaxed text-foreground">
{evidenceJson}
                </pre>
              )}
            </section>

            {alert.automationId && (
              <section>
                <h3 className="text-xs font-semibold text-foreground mb-1">Automation</h3>
                <p className="text-[11px] font-mono text-muted-foreground break-all">{alert.automationId}</p>
              </section>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t border-border bg-card/50 flex-row gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
            Close
          </Button>
          <div className="flex gap-2">
            {!isAcknowledged && (
              <Button variant="outline" size="sm" onClick={acknowledge} disabled={busy}>
                Acknowledge
              </Button>
            )}
            <Button size="sm" onClick={resolve} disabled={busy}>
              Resolve
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}