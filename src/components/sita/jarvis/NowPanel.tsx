// ═══════════════════════════════════════════════════════════════
// SITA OS — NowPanel (Jarvis Bridge)
// "What matters now" — active mission + top briefings + reflection.
// ═══════════════════════════════════════════════════════════════

import { Sparkles, Target, Bell, Calendar, RefreshCw, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useNowSnapshot } from "@/lib/sita-jarvis";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

export function NowPanel() {
  const { snapshot, refresh } = useNowSnapshot();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const generateBriefingNow = async () => {
    if (!user?.id) return;
    setGenerating(true);
    try {
      const { error } = await supabase.functions.invoke("sita-briefings-generate", {
        body: { user_id: user.id, kind: "midday" },
      });
      if (error) throw error;
      toast.success("Briefing generated");
      await refresh();
    } catch (err) {
      toast.error("Could not generate briefing", { description: (err as Error).message });
    } finally {
      setGenerating(false);
    }
  };

  const markSeen = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sita_proactive_briefings" as never)
        .update({ status: "acknowledged", acknowledged_at: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
      await refresh();
    } catch (err) {
      toast.error("Could not mark seen", { description: (err as Error).message });
    }
  };

  if (snapshot.loading && snapshot.generatedAt === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Now</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const nothing = !snapshot.activeMission && snapshot.briefings.length === 0 && snapshot.journal.length === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Now</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => void refresh()} aria-label="Refresh now panel">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {nothing ? (
          <PremiumEmptyState
            variant="first-use"
            title="Sita is still learning your world"
            description="No active mission and no briefings yet. Run a briefing now or open a few apps and check back tomorrow at 06:00."
            actions={[{ label: generating ? "Generating…" : "Generate briefing now", onClick: generateBriefingNow, variant: "primary" }]}
          />
        ) : (
          <>
            {snapshot.activeMission && (
              <div className="rounded-lg border border-border/40 bg-card/60 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="h-3.5 w-3.5" /> Active mission
                </div>
                <div className="mt-1 font-medium">{snapshot.activeMission.title}</div>
                {snapshot.activeMission.description && (
                  <div className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{snapshot.activeMission.description}</div>
                )}
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-[10px]">{snapshot.activeMission.domain}</Badge>
                  {snapshot.activeMission.target_at && (
                    <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(snapshot.activeMission.target_at).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {snapshot.briefings.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Bell className="h-3.5 w-3.5" /> Top briefings
                </div>
                <ul className="space-y-2">
                  {snapshot.briefings.map((b) => (
                    <li key={b.id} className="rounded-md border border-border/30 bg-card/40 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm leading-tight">{b.headline}</div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{b.kind}</Badge>
                      </div>
                      {b.body && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.body}</div>}
                      <div className="mt-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px]"
                          onClick={() => void markSeen(b.id)}
                          aria-label={`Mark briefing ${b.headline} as seen`}
                        >
                          <Check className="h-3 w-3 mr-1" /> Mark seen
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {snapshot.journal.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">What changed since yesterday</div>
                <ul className="space-y-1.5">
                  {snapshot.journal.slice(0, 3).map((j) => (
                    <li key={j.id} className="text-xs text-muted-foreground">
                      <span className="text-foreground font-medium">{j.kind}:</span> {j.summary}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}