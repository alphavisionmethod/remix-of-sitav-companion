import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Palette, Eye, CheckCircle2, ArrowRight, Sparkles, Sun, Moon, Accessibility, Layout, Type, Move } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const IMPROVEMENTS = [
  { id: 1, title: "Admin header — improve information hierarchy", area: "Admin Shell", type: "layout" as const, before: "Flat header with icon + title, no visual depth", after: "Gradient header with accent icon badge, subtitle, and action slot", rationale: "Improves scannability and creates premium feel consistent with boardroom surfaces", confidence: 84, impact: "medium", consistency: 92, status: "ready" as const },
  { id: 2, title: "Sidebar icons — add consistent sizing and alignment", area: "Navigation", type: "consistency" as const, before: "Mixed icon sizes (h-4, h-5) and inconsistent padding", after: "Standardized h-4 w-4 with 12px padding and active indicator", rationale: "Creates visual rhythm and reduces cognitive load during navigation", confidence: 91, impact: "low", consistency: 96, status: "ready" as const },
  { id: 3, title: "Dark mode — fix low-contrast table headers", area: "Data Tables", type: "accessibility" as const, before: "bg-muted/30 with text-muted-foreground — contrast ratio 3.2:1", after: "bg-muted/50 with text-foreground — contrast ratio 5.1:1", rationale: "WCAG AA requires 4.5:1 for normal text. Current headers fail", confidence: 95, impact: "high", consistency: 88, status: "applied" as const },
  { id: 4, title: "Mission Control cards — reduce visual noise", area: "Mission Control", type: "layout" as const, before: "Dense cards with 8 inline metrics and small badges", after: "Progressive disclosure: 3 key metrics visible, expandable details", rationale: "Operator surfaces should show decision-relevant data first", confidence: 77, impact: "medium", consistency: 85, status: "proposal" as const },
  { id: 5, title: "Revenue Office — modernize stat cards", area: "Revenue Office", type: "visual" as const, before: "Plain border cards with centered text", after: "Subtle gradient cards with icon accent and trend indicators", rationale: "Aligns with premium design language used in Investment Office", confidence: 82, impact: "medium", consistency: 90, status: "ready" as const },
];

const typeIcons: Record<string, typeof Layout> = {
  layout: Layout,
  consistency: Move,
  accessibility: Accessibility,
  visual: Palette,
  typography: Type,
  dark_mode: Moon,
};

const AIDesignStudio = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Palette} title="Design Studio" subtitle="AI design team improvements — before/after, rationale, confidence, and consistency checks" accent="accent" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Improvements Ready", v: IMPROVEMENTS.filter(i => i.status === "ready").length },
          { l: "Applied", v: IMPROVEMENTS.filter(i => i.status === "applied").length },
          { l: "Avg Confidence", v: `${Math.round(IMPROVEMENTS.reduce((a,i) => a + i.confidence, 0) / IMPROVEMENTS.length)}%` },
          { l: "Avg Consistency", v: `${Math.round(IMPROVEMENTS.reduce((a,i) => a + i.consistency, 0) / IMPROVEMENTS.length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {IMPROVEMENTS.map(imp => {
          const TypeIcon = typeIcons[imp.type] || Palette;
          return (
            <div key={imp.id} className="rounded-xl border border-border/40 bg-card overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === imp.id ? null : imp.id)}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{imp.title}</span>
                    <Badge variant="outline" className="text-[10px]">{imp.type}</Badge>
                  </div>
                  <Badge variant={imp.status === "applied" ? "default" : imp.status === "ready" ? "outline" : "secondary"}>{imp.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{imp.area} · Impact: {imp.impact} · Confidence: {imp.confidence}%</p>
              </div>

              {expanded === imp.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-destructive/5 border border-destructive/10 p-3">
                      <p className="text-[10px] text-destructive uppercase tracking-wider mb-1">Before</p>
                      <p className="text-sm">{imp.before}</p>
                    </div>
                    <div className="rounded-lg bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-3">
                      <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider mb-1">After</p>
                      <p className="text-sm">{imp.after}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
                    <p className="text-sm">{imp.rationale}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                      <Progress value={imp.confidence} className="h-1.5 w-24" />
                      <p className="text-xs mt-1">{imp.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Consistency Check</p>
                      <Progress value={imp.consistency} className="h-1.5 w-24" />
                      <p className="text-xs mt-1">{imp.consistency}%</p>
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
