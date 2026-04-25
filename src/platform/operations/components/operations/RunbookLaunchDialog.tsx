import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Play, BookOpen, AlertCircle } from "lucide-react";
import type { RunbookRow } from "@/hooks/use-operations-command-center";
import { useState } from "react";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  runbook: RunbookRow | null;
  onOpenChange: (open: boolean) => void;
}

export function RunbookLaunchDialog({ runbook, onOpenChange }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [justification, setJustification] = useState("");
  const [parametersText, setParametersText] = useState("{}");
  const [submitting, setSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!runbook) return null;

  async function submit() {
    if (!runbook || !user) return;
    let parameters: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(parametersText || "{}");
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Parameters must be a JSON object.");
      }
      parameters = parsed as Record<string, unknown>;
      setParseError(null);
    } catch (e) {
      setParseError((e as Error).message);
      return;
    }
    if (!justification.trim() || justification.trim().length < 10) {
      setParseError("Justification must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    const res = await fromTable("runbook_launch_requests").insert({
      user_id: user.id,
      runbook_id: runbook.id,
      trigger_reason: "manual_launch",
      justification: justification.trim(),
      parameters: parameters as never,
      status: "queued",
      evidence: { source: "operations_command_center", runbook_name: runbook.name } as never,
    } as never);
    setSubmitting(false);

    const err = (res as { error?: { message?: string } }).error;
    if (err) {
      toast({ title: "Could not queue runbook", description: err.message ?? "Unknown error", variant: "destructive" });
      return;
    }
    toast({ title: "Runbook queued", description: `${runbook.name} is queued for execution.` });
    qc.invalidateQueries({ queryKey: ["operations-command-center"] });
    setJustification("");
    setParametersText("{}");
    onOpenChange(false);
  }

  return (
    <Dialog open={!!runbook} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <DialogTitle className="text-base">Launch runbook</DialogTitle>
          </div>
          <DialogDescription>
            Queues the runbook for execution. The platform may require approval before it runs based on the
            runbook's severity and policy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-sm font-medium text-foreground">{runbook.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <Badge variant="secondary" className="text-[10px] capitalize">{runbook.domain}</Badge>
              <Badge variant="outline" className="text-[10px] capitalize">severity: {runbook.severity}</Badge>
              <Badge variant="outline" className="text-[10px]">{runbook.steps} steps</Badge>
              <Badge variant={runbook.autoHeal ? "default" : "outline"} className="text-[10px]">
                {runbook.autoHeal ? "auto-heal" : "manual"}
              </Badge>
              <Badge variant="outline" className="text-[10px]">{runbook.executions} prior runs</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="rb-justification" className="text-xs">
              Justification <span className="text-muted-foreground">(required, ≥10 chars)</span>
            </Label>
            <Textarea
              id="rb-justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Why is this runbook being launched now? Link any incident or alert ID."
              className="text-xs min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rb-params" className="text-xs">
              Parameters <span className="text-muted-foreground">(JSON object)</span>
            </Label>
            <Textarea
              id="rb-params"
              value={parametersText}
              onChange={(e) => setParametersText(e.target.value)}
              spellCheck={false}
              className="text-xs font-mono min-h-24"
            />
          </div>

          {parseError && (
            <div className="flex items-start gap-2 text-[11px] text-destructive">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={submitting} className="gap-1">
            <Play className="h-3 w-3" />
            {submitting ? "Queuing…" : "Queue execution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}