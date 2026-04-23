import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { MessageSquare, Code, Palette, Shield, Gauge, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const stanceColors: Record<string, string> = {
  for: "text-[hsl(var(--trust-safe))]",
  against: "text-destructive",
  modified: "text-amber-500",
  neutral: "text-muted-foreground",
};

const AIAgentDebate = () => {
  const { data: debates, isDemo } = useAIEngDomain("debates", DEMO_DEBATES);
  const [expanded, setExpanded] = useState<number | null>(2);

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={MessageSquare} title="Agent Debate" subtitle="When AI agents disagree — positions, evidence, consensus, and resolution" accent="primary" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Active Debates", v: debates.filter((d: any) => d.status === "active").length },
          { l: "Resolved", v: debates.filter((d: any) => d.status === "resolved").length },
          { l: "Avg Consensus", v: `${Math.round(debates.reduce((a: number, d: any) => a + (d.consensus || d.consensus_score || 0), 0) / Math.max(debates.length, 1))}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {debates.map((d: any) => (
          <div key={d.id} className={`rounded-xl border bg-card ${d.status === "active" ? "border-primary/30" : "border-border/40"}`}>
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{d.topic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === "active" ? "default" : "outline"}>{d.status}</Badge>
                  <span className="text-xs font-bold">{d.consensus || d.consensus_score || 0}% consensus</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{d.participants?.length || 0} participants</p>
            </div>

            {expanded === d.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
                {d.participants?.map((p: any, i: number) => (
                  <div key={i} className="rounded-lg border border-border/30 bg-muted/10 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{p.agent}</span>
                        <Badge variant="outline" className={`text-[10px] ${stanceColors[p.stance] || ""}`}>{p.stance}</Badge>
                      </div>
                      <span className="text-xs font-bold">{p.confidence}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.position}</p>
                  </div>
                ))}

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Consensus Level</span>
                    <span className="text-xs font-bold">{d.consensus || d.consensus_score || 0}%</span>
                  </div>
                  <Progress value={d.consensus || d.consensus_score || 0} className="h-1.5" />
                </div>

                {d.resolution ? (
                  <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-3">
                    <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider font-semibold mb-1">Resolution</p>
                    <p className="text-xs">{d.resolution}</p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-[10px] text-primary uppercase tracking-wider font-semibold mb-1">Awaiting Resolution</p>
                    <p className="text-xs text-muted-foreground">Debate is ongoing. Human input may accelerate consensus.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAgentDebate;
