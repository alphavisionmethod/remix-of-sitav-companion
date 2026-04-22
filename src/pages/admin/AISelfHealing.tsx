import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, Shield, TrendingUp, Clock, RotateCcw, Eye, Settings } from "lucide-react";
import { useAIEngDomain } from "@/hooks/use-ai-engineering-data";
import { DEMO_BLOCKED, DEMO_HEALED } from "@/data/seed/admin-platform";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// Production fallback — seed data removed
const DEMO_PATTERNS: any[] = [];

const AISelfHealing = () => {
  const { data: patterns, isDemo } = useAIEngDomain("learningPatterns", DEMO_PATTERNS);
  const [tab, setTab] = useState("recent");

  return (
    <div className="space-y-6 p-6">
<AdminPageHeader icon={Sparkles} title="Self-Healing Center" subtitle="Autonomous maintenance — detect, patch, verify, learn" accent="trust" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Healed This Week", v: ([] as typeof DEMO_HEALED).length, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Active Rules", v: ([] as typeof DEMO_RULES).filter(r => r.enabled).length, c: "text-primary" },
          { l: "Blocked (Human Needed)", v: ([] as typeof DEMO_BLOCKED).length, c: "text-amber-500" },
          { l: "Patterns Discovered", v: (patterns).length, c: "text-primary" },
        ].map(c => (
          <div key={c.l} className="rounded-xl border border-border/40 bg-card p-4 text-center">
            <p className={`text-xl font-bold ${c.c}`}>{c.v}</p>
            <p className="text-[11px] text-muted-foreground">{c.l}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="recent"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Recently Healed</TabsTrigger>
          <TabsTrigger value="rules"><Settings className="h-3.5 w-3.5 mr-1" />Rules</TabsTrigger>
          <TabsTrigger value="blocked"><AlertTriangle className="h-3.5 w-3.5 mr-1" />Blocked</TabsTrigger>
          <TabsTrigger value="patterns"><TrendingUp className="h-3.5 w-3.5 mr-1" />Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-2 mt-4">
          {([] as typeof DEMO_HEALED).map((h, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust-safe))] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{h.title}</p>
                <p className="text-xs text-muted-foreground">{h.time} · Risk: {h.risk}</p>
              </div>
              <div className="flex items-center gap-2">
                {h.verified && <Badge variant="outline" className="text-[10px] text-[hsl(var(--trust-safe))]">Verified</Badge>}
                {h.learned && <Badge variant="outline" className="text-[10px] text-primary">Learned</Badge>}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="rules" className="space-y-2 mt-4">
          {([] as typeof DEMO_RULES).map((r, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
              <Shield className={`h-4 w-4 shrink-0 ${r.enabled ? "text-[hsl(var(--trust-safe))]" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{r.rule}</p>
                <p className="text-xs text-muted-foreground">{r.scope} · Risk: {r.risk} · Healed: {r.healCount}x</p>
              </div>
              <Badge variant={r.enabled ? "default" : "secondary"}>{r.enabled ? "Active" : "Disabled"}</Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="blocked" className="space-y-2 mt-4">
          {([] as typeof DEMO_BLOCKED).map((b, i) => (
            <div key={i} className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-semibold">{b.title}</span>
                <Badge variant="destructive" className="text-[10px]">{b.risk}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{b.reason}</p>
              <p className="text-xs text-muted-foreground mt-1">Escalated to: {b.agent}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-3 mt-4">
          {(patterns).map((p: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{p.pattern || p.pattern_description}</span>
                <Badge variant="outline">{p.confidence}% confidence</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Frequency: {p.frequency}</p>
              <div className="rounded-lg bg-muted/30 p-2">
                <p className="text-xs text-primary">→ {p.action || p.action_taken || "—"}</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISelfHealing;
