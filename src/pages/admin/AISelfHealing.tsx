import { AdminPageHeader } from "@/components/sita/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, Shield, TrendingUp, Clock, RotateCcw, Eye, Settings } from "lucide-react";

const HEALED = [
  { title: "Restarted unhealthy projection rebuild worker", time: "12m ago", risk: "low", verified: true, learned: true },
  { title: "Reverted bad feature flag: revenue-sidebar-v2", time: "1h ago", risk: "low", verified: true, learned: true },
  { title: "Auto-fixed broken internal route /admin/durability", time: "2h ago", risk: "low", verified: true, learned: false },
  { title: "Invalidated stale brand-kit CDN cache", time: "4h ago", risk: "low", verified: true, learned: true },
  { title: "Retried stuck connector sync job (Stripe)", time: "6h ago", risk: "low", verified: true, learned: false },
  { title: "Restored known-good layout variant for mobile sidebar", time: "1d ago", risk: "medium", verified: true, learned: true },
];

const RULES = [
  { rule: "Auto-restart unhealthy noncritical processes", scope: "Infrastructure", risk: "low", enabled: true, healCount: 12 },
  { rule: "Revert recent bad feature flag/config", scope: "Feature Flags", risk: "low", enabled: true, healCount: 4 },
  { rule: "Disable broken panel behind feature flag", scope: "UI Components", risk: "low", enabled: true, healCount: 7 },
  { rule: "Restore known-good layout variant", scope: "UI Layouts", risk: "medium", enabled: true, healCount: 3 },
  { rule: "Retry stuck sync jobs (max 3 attempts)", scope: "Connectors", risk: "low", enabled: true, healCount: 18 },
  { rule: "Invalidate bad cache entries", scope: "Caching", risk: "low", enabled: true, healCount: 9 },
  { rule: "Auto-fix obvious broken route mappings", scope: "Routing", risk: "low", enabled: true, healCount: 2 },
  { rule: "Downgrade degraded integration to safe mode", scope: "Integrations", risk: "medium", enabled: false, healCount: 0 },
];

const BLOCKED = [
  { title: "Schema migration — new column on customers table", reason: "Blast radius too high for auto-heal", risk: "high", agent: "Security Reviewer" },
  { title: "Permission policy change — admin role expansion", reason: "Trust-sensitive change requires human approval", risk: "critical", agent: "Security Reviewer" },
  { title: "Core routing restructure — /admin/* paths", reason: "Affects 20+ routes — exceeds auto-heal scope", risk: "high", agent: "Engineering Lead" },
];

const PATTERNS = [
  { pattern: "Projection rebuild failures cluster after deployments", frequency: "3x in 14 days", action: "Added pre-deploy projection health check", confidence: 78 },
  { pattern: "Feature flag rollbacks happen within 2 hours of activation", frequency: "5x in 30 days", action: "Suggested canary rollout for all feature flags", confidence: 82 },
  { pattern: "CDN cache staleness correlates with brand kit updates", frequency: "Weekly", action: "Auto-invalidate on brand kit mutation", confidence: 91 },
];

const AISelfHealing = () => {
  const [tab, setTab] = useState("recent");

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader icon={Sparkles} title="Self-Healing Center" subtitle="Autonomous maintenance — detect, patch, verify, learn" accent="trust" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { l: "Healed This Week", v: HEALED.length, c: "text-[hsl(var(--trust-safe))]" },
          { l: "Active Rules", v: RULES.filter(r => r.enabled).length, c: "text-primary" },
          { l: "Blocked (Human Needed)", v: BLOCKED.length, c: "text-amber-500" },
          { l: "Patterns Discovered", v: PATTERNS.length, c: "text-primary" },
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
          {HEALED.map((h, i) => (
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
          {RULES.map((r, i) => (
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
          {BLOCKED.map((b, i) => (
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
          {PATTERNS.map((p, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{p.pattern}</span>
                <Badge variant="outline">{p.confidence}% confidence</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Frequency: {p.frequency}</p>
              <div className="rounded-lg bg-muted/30 p-2">
                <p className="text-xs text-primary">→ {p.action}</p>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISelfHealing;
