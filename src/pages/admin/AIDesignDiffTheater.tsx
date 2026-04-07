import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Eye, CheckCircle2, ArrowRight, Palette, Layout, Accessibility, Moon, Type, Move } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const DIFFS = [
  {
    id: 1, title: "Admin header — gradient accent upgrade", area: "Admin Shell", agent: "Design Engineer",
    before: { description: "Flat header with icon + title. No depth, no visual hierarchy. Blends with card background.", visual: "border-border bg-card p-4 rounded-lg" },
    after: { description: "Gradient header with accent icon badge, subtitle, and action slot. Creates premium feel.", visual: "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-4 rounded-2xl" },
    rationale: "Improves scannability. Creates visual weight consistent with boardroom surfaces. Guides the eye to title first, then actions.",
    confidence: 84, consistency: 92, impact: "medium", tokens: ["--primary", "--card", "rounded-2xl"], status: "ready" as const
  },
  {
    id: 2, title: "Dark mode — table header contrast fix", area: "Data Tables", agent: "Design Engineer",
    before: { description: "bg-muted/30 with text-muted-foreground. Contrast ratio 3.2:1 — fails WCAG AA.", visual: "bg-muted/30 text-muted-foreground p-3 rounded-lg" },
    after: { description: "bg-muted/50 with text-foreground. Contrast ratio 5.1:1 — passes WCAG AA.", visual: "bg-muted/50 text-foreground p-3 rounded-lg" },
    rationale: "WCAG AA requires 4.5:1 for normal text. Current table headers fail in dark mode. This is a compliance-blocking issue.",
    confidence: 95, consistency: 88, impact: "high", tokens: ["--muted", "--foreground"], status: "applied" as const
  },
  {
    id: 3, title: "Mission Control cards — progressive disclosure", area: "Mission Control", agent: "Design Engineer",
    before: { description: "Dense cards with 8 inline metrics, small badges, and crowded layout. Cognitive overload.", visual: "border-border/40 bg-card p-3 rounded-lg" },
    after: { description: "3 key metrics visible at glance. Expandable detail section for deep data. Cleaner hierarchy.", visual: "border-border/40 bg-card p-4 rounded-xl" },
    rationale: "Operator surfaces should show decision-relevant data first. Detail-on-demand reduces cognitive load by ~40%.",
    confidence: 77, consistency: 85, impact: "medium", tokens: ["rounded-xl", "text-sm"], status: "proposal" as const
  },
  {
    id: 4, title: "Revenue Office stat cards — premium upgrade", area: "Revenue Office", agent: "Design Engineer",
    before: { description: "Plain border cards with centered text and no icon emphasis. Functional but flat.", visual: "border-border/40 bg-card p-4 text-center rounded-xl" },
    after: { description: "Subtle gradient cards with accent icon, trend indicators, and richer typography.", visual: "border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-4 rounded-xl" },
    rationale: "Aligns with premium design language used in Investment Office and Boardroom. Creates consistency across offices.",
    confidence: 82, consistency: 90, impact: "medium", tokens: ["--primary", "gradient"], status: "ready" as const
  },
  {
    id: 5, title: "Sidebar — active state indicator refinement", area: "Navigation", agent: "Design Engineer",
    before: { description: "Active route shown with bg-muted. No left indicator, no color accent. Hard to spot in long lists.", visual: "bg-muted rounded-md p-2" },
    after: { description: "Left accent bar (2px primary) + bg-primary/5 + font-medium. Instantly visible active state.", visual: "border-l-2 border-primary bg-primary/5 rounded-md p-2 font-medium" },
    rationale: "With 40+ sidebar items, fast identification of current location is critical. Left-bar pattern is proven in premium UIs.",
    confidence: 89, consistency: 94, impact: "low", tokens: ["--primary", "border-l-2"], status: "ready" as const
  },
];

const AIDesignDiffTheater = () => {
  const [expanded, setExpanded] = useState<number | null>(1);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <AdminPageHeader icon={Eye} title="Design Diff Theater" subtitle="Before/after design improvements with rationale, confidence, and token compliance" accent="accent" />

      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Ready to Apply", v: DIFFS.filter(d => d.status === "ready").length },
          { l: "Applied", v: DIFFS.filter(d => d.status === "applied").length },
          { l: "Avg Consistency", v: `${Math.round(DIFFS.reduce((a,d) => a + d.consistency, 0) / DIFFS.length)}%` },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className="text-xl font-bold">{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {DIFFS.map(d => (
          <div key={d.id} className="rounded-xl border border-border/40 bg-card overflow-hidden">
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{d.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{d.impact}</Badge>
                  <Badge variant={d.status === "applied" ? "default" : d.status === "ready" ? "outline" : "secondary"}>{d.status}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{d.area} · {d.agent} · Confidence: {d.confidence}%</p>
            </div>

            {expanded === d.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
                {/* Before / After Theater */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-destructive uppercase tracking-wider font-semibold">Before</p>
                    <div className={`rounded-xl border p-4 ${d.before.visual}`}>
                      <p className="text-sm">{d.before.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-[hsl(var(--trust-safe))] uppercase tracking-wider font-semibold">After</p>
                    <div className={`rounded-xl border p-4 ${d.after.visual}`}>
                      <p className="text-sm">{d.after.description}</p>
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
                  <p className="text-sm">{d.rationale}</p>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                    <Progress value={d.confidence} className="h-1.5" />
                    <p className="text-xs mt-1">{d.confidence}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Consistency</p>
                    <Progress value={d.consistency} className="h-1.5" />
                    <p className="text-xs mt-1">{d.consistency}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Design Tokens Used</p>
                    <div className="flex flex-wrap gap-1">{d.tokens.map(t => <Badge key={t} variant="outline" className="text-[9px] font-mono">{t}</Badge>)}</div>
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
