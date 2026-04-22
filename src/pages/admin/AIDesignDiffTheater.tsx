import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Eye, CheckCircle2, ArrowRight, Palette, Layout, Accessibility, Moon, Type, Move } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";


// Production fallback — seed data removed
const DEMO_DIFFS: any[] = [];

const AIDesignDiffTheater = () => {
  const { data: diffs, isDemo } = useAIEngDomain("designDiffs", DEMO_DIFFS);
  const [expanded, setExpanded] = useState<number | null>(1);

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={Eye} title="Design Diff Theater" subtitle="Before/after design improvements with rationale, confidence, and token compliance" accent="accent" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Ready to Apply", v: diffs.filter((d: any) => d.status === "ready").length },
          { l: "Applied", v: diffs.filter((d: any) => d.status === "applied").length },
          { l: "Avg Consistency", v: `${Math.round(diffs.reduce((a: number, d: any) => a + (d.consistency || d.consistency_score || 0), 0) / Math.max(diffs.length, 1))}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {diffs.map((d: any) => (
          <div key={d.id} className="rounded-xl border border-border/40 bg-card overflow-hidden">
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{d.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{d.impact || d.impact_level || "—"}</Badge>
                  <Badge variant={d.status === "applied" ? "default" : d.status === "ready" ? "outline" : "secondary"}>{d.status}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{d.area} · {d.agent || d.proposed_by_agent || "—"} · Confidence: {d.confidence}%</p>
            </div>

            {expanded === d.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-destructive uppercase tracking-wider font-semibold">Before</p>
                    <div className={`rounded-xl border p-4 ${d.before?.visual || ""}`}>
                      <p className="text-sm">{d.before?.description || JSON.stringify(d.before_state) || "—"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider font-semibold">After</p>
                    <div className={`rounded-xl border p-4 ${d.after?.visual || ""}`}>
                      <p className="text-sm">{d.after?.description || JSON.stringify(d.after_state) || "—"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
                  <p className="text-sm">{d.rationale || "—"}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                    <Progress value={d.confidence} className="h-1.5" />
                    <p className="text-xs mt-1">{d.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Consistency</p>
                    <Progress value={d.consistency || d.consistency_score || 0} className="h-1.5" />
                    <p className="text-xs mt-1">{d.consistency || d.consistency_score || 0}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Design Tokens Used</p>
                    <div className="flex flex-wrap gap-1">{(d.tokens || d.design_tokens_used || []).map((t: string) => <Badge key={t} variant="outline" className="text-[9px] font-mono">{t}</Badge>)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIDesignDiffTheater;
