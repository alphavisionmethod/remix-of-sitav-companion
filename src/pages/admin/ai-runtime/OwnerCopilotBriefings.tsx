// ═══════════════════════════════════════════════════════════════
// Phase 7B — Owner Copilot Briefings (read-only summaries +
// approve/decline/more-info handoffs back to the workforce)
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdminControlPlaneShell } from "@/platform/admin/components/admin/shells/AdminControlPlaneShell";
import { MessageSquare, Check, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface Briefing {
  id: string; topic: string; summary: string; body: string;
  source_kind: string; confidence: number; status: string; created_at: string;
}

export default function OwnerCopilotBriefings() {
  const [items, setItems] = useState<Briefing[]>([]);
  const [rationale, setRationale] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("owner-copilot-bff", { body: { op: "list" } });
    if (error) toast.error(error.message);
    setItems((data?.briefings as Briefing[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function decide(briefing_id: string, decision: "approved" | "declined" | "more_info") {
    const { error } = await supabase.functions.invoke("owner-copilot-bff?op=handoff", {
      method: "POST",
      body: { briefing_id, decision, rationale: rationale[briefing_id] ?? null },
    });
    if (error) toast.error(error.message);
    else { toast.success(`Briefing ${decision}`); load(); }
  }

  return (
    <AdminControlPlaneShell contextScope="AI Runtime · Owner Copilot">
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" /> Owner Copilot Briefings
          </h1>
          <p className="text-sm text-muted-foreground">
            Phase 7B · read-only signals from the internal workforce. Approving an item hands it back as an actionable task — never auto-executes.
          </p>
        </div>

        <div className="space-y-3">
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!loading && items.length === 0 && (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">No briefings yet.</CardContent></Card>
          )}
          {items.map(b => (
            <Card key={b.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <CardTitle className="text-base">{b.topic}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{b.source_kind}</Badge>
                    <Badge variant="outline">conf {(b.confidence * 100).toFixed(0)}%</Badge>
                    <Badge>{b.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="font-medium">{b.summary}</div>
                <div className="text-muted-foreground whitespace-pre-wrap">{b.body}</div>
                {b.status === "pending" && (
                  <>
                    <Textarea
                      placeholder="Optional rationale (recorded with your decision)"
                      value={rationale[b.id] ?? ""}
                      onChange={e => setRationale(r => ({ ...r, [b.id]: e.target.value }))}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button size="sm" onClick={() => decide(b.id, "approved")}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => decide(b.id, "more_info")}>
                        <HelpCircle className="h-4 w-4 mr-1" /> More info
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => decide(b.id, "declined")}>
                        <X className="h-4 w-4 mr-1" /> Decline
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminControlPlaneShell>
  );
}
