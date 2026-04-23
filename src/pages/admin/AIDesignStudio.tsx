import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Palette, Eye, CheckCircle2, ArrowRight, Sparkles, Sun, Moon, Accessibility, Layout, Type, Move } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const typeIcons: Record<string, typeof Layout> = {
  layout: Layout,
  consistency: Move,
  accessibility: Accessibility,
  visual: Palette,
  typography: Type,
  dark_mode: Moon,
};

const AIDesignStudio = () => {
  const { data: improvements, isDemo } = useAIEngDomain("designDiffs", IMPROVEMENTS);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={Palette} title="Design Studio" subtitle="AI design team improvements — before/after, rationale, confidence, and consistency checks" accent="accent" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Improvements Ready", v: improvements.filter((i: any) => i.status === "ready").length },
          { l: "Applied", v: improvements.filter((i: any) => i.status === "applied").length },
          { l: "Avg Confidence", v: `${Math.round(improvements.reduce((a: number, i: any) => a + (i.confidence || 0), 0) / Math.max(improvements.length, 1))}%` },
          { l: "Avg Consistency", v: `${Math.round(improvements.reduce((a: number, i: any) => a + (i.consistency || i.consistency_score || 0), 0) / Math.max(improvements.length, 1))}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {improvements.map((imp: any) => {
          const TypeIcon = typeIcons[imp.type] || Palette;
          return (
            <div key={imp.id} className="rounded-xl border border-border/40 bg-card overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === imp.id ? null : imp.id)}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{imp.title}</span>
                    <Badge variant="outline" className="text-[10px]">{imp.type || imp.area || "design"}</Badge>
                  </div>
                  <Badge variant={imp.status === "applied" ? "default" : imp.status === "ready" ? "outline" : "secondary"}>{imp.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{imp.area} · Impact: {imp.impact || imp.impact_level || "—"} · Confidence: {imp.confidence}%</p>
              </div>

              {expanded === imp.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
                      <p className="text-[10px] text-destructive uppercase tracking-wider mb-1">Before</p>
                      <p className="text-sm">{imp.before || "—"}</p>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-3">
                      <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider mb-1">After</p>
                      <p className="text-sm">{imp.after || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
                    <p className="text-sm">{imp.rationale || "—"}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                      <Progress value={imp.confidence} className="h-1.5 w-24" />
                      <p className="text-xs mt-1">{imp.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Consistency Check</p>
                      <Progress value={imp.consistency || imp.consistency_score || 0} className="h-1.5 w-24" />
                      <p className="text-xs mt-1">{imp.consistency || imp.consistency_score || 0}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIDesignStudio;
