import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Shield, Zap, Eye, ChevronRight, Users, Gauge,
  MessageSquare, AlertTriangle, Lightbulb, Layers, Search,
  Bot, Target, ArrowRightLeft, Activity
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FULL_ADVISOR_REGISTRY,
  type ExtendedAdvisorConfig } from "@/packages/advisor-config/registry";
import {
  ADVISOR_BEHAVIORAL_PROFILES,
  getBehavioralProfile,
  type AdvisorBehavioralProfile } from "@/packages/advisor-config/behavioral-engine";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

// ── Maturity color mapping ──────────────────────────────────
const MATURITY_COLORS: Record<string, string> = {
  production: "bg-green-500/15 text-green-400 border-green-500/30",
  beta: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  alpha: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  scaffold: "bg-muted text-muted-foreground border-border",
};

const MATURITY_PROGRESS: Record<string, number> = {
  scaffold: 15, alpha: 40, beta: 70, production: 100,
};

const COUNCIL_ICONS: Record<string, typeof Brain> = {
  "customer-facing": Users,
  "internal-ops": Layers,
  "technical": Zap,
  "governance": Shield,
};

function autonomyPct(level: string): number {
  const idx = DEMO_AUTONOMY_LEVELS.indexOf(level);
  return idx >= 0 ? Math.round(((idx + 1) / ([] as any[]).length) * 100) : 0;
}

// ── Detail Panel ────────────────────────────────────────────
function AdvisorDetailPanel({ advisor }: { advisor: ExtendedAdvisorConfig }) {
  const profile = getBehavioralProfile(advisor.id);
  const personality = profile.personality;
  const escalation = profile.escalation;
  const proactivity = profile.proactivity;
  const disagreement = profile.disagreement;
  const learning = profile.learningLoop;

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
<div className="space-y-4 pr-2">
        {/* Header */}
        <SitaCard hover={false} glow className="p-5">
          <SitaCardTitle sub={`${advisor.domain} · ${advisor.council}`}>{advisor.name}</SitaCardTitle>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{advisor.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Autonomy</p>
              <div className="flex items-center gap-2">
                <Progress value={autonomyPct(advisor.maxAutonomy)} className="h-1.5 flex-1" />
                <span className="text-[11px] font-mono text-foreground">{advisor.maxAutonomy}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Confidence</p>
              <div className="flex items-center gap-2">
                <Progress value={advisor.confidenceThreshold * 100} className="h-1.5 flex-1" />
                <span className="text-[11px] font-mono text-foreground">{Math.round(advisor.confidenceThreshold * 100)}%</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] ${MATURITY_COLORS[advisor.maturity]}`}>{advisor.maturity}</Badge>
            <TrustBadge level={advisor.maturity === "production" ? "verified" : advisor.maturity === "alpha" ? "safe" : "low-confidence"} label={advisor.maturity} size="sm" />
          </div>
        </SitaCard>

        {/* Capabilities */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">Capabilities ({advisor.capabilities.length})</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {advisor.capabilities.map((cap, i) => (
              <span key={i} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{cap}</span>
            ))}
          </div>
        </SitaCard>

        {/* Behavioral Profile */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">Behavioral Profile</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Tone</span><span className="text-foreground capitalize">{personality.tone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Verbosity</span><span className="text-foreground capitalize">{personality.verbosity}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Formality</span><span className="text-foreground">{Math.round(personality.formality * 100)}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Emoji Usage</span><span className="text-foreground capitalize">{personality.emojiUsage}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Max Tokens</span><span className="text-foreground font-mono">{personality.maxResponseTokens}</span></div>
            {personality.signaturePhrase && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-[10px] text-muted-foreground mb-1">Signature Phrase</p>
                <p className="text-xs italic text-foreground/80">"{personality.signaturePhrase}"</p>
              </div>
            )}
          </div>
        </SitaCard>

        {/* Escalation Rules */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <p className="text-xs font-semibold text-foreground">Escalation Rules ({escalation.rules.length})</p>
          </div>
          <div className="space-y-2">
            {escalation.rules.map((rule, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] p-1.5 rounded bg-muted/50">
                <span className="text-foreground font-medium">{rule.trigger}</span>
                <span className="text-muted-foreground">→ {rule.target}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Graceful degradation: {escalation.gracefulDegradation ? "✓ Enabled" : "✗ Disabled"}</p>
        </SitaCard>

        {/* Proactivity */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-xs font-semibold text-foreground">Proactivity Profile</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={proactivity.enabled ? "text-green-400" : "text-muted-foreground"}>{proactivity.enabled ? "Active" : "Disabled"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Max/Day</span><span className="text-foreground">{proactivity.maxProactiveMessagesPerDay}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Quiet Hours</span><span className="text-foreground">{proactivity.quietHours.startHour}:00 – {proactivity.quietHours.endHour}:00</span></div>
            <Separator className="my-2" />
            {proactivity.rules.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-foreground">{r.trigger}</span>
                <span className="text-muted-foreground">{r.maxFrequencyPerDay}/day</span>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Disagreement Protocol */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="h-3.5 w-3.5 text-orange-400" />
            <p className="text-xs font-semibold text-foreground">Disagreement Protocol</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">User Overrule</span><span className="text-foreground capitalize">{disagreement.whenOverruledByUser.replace(/-/g, " ")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Council Overrule</span><span className="text-foreground capitalize">{disagreement.whenOverruledByCouncil.replace(/-/g, " ")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Data Contradiction</span><span className="text-foreground capitalize">{disagreement.whenContradictedByData.replace(/-/g, " ")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Max Pushback</span><span className="text-foreground">{disagreement.maxPushbackAttempts}</span></div>
          </div>
        </SitaCard>

        {/* Learning Loop */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <p className="text-xs font-semibold text-foreground">Learning Loop</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={learning.enabled ? "text-green-400" : "text-muted-foreground"}>{learning.enabled ? "Active" : "Disabled"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reset After</span><span className="text-foreground">{learning.resetAfterDays} days</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Min Interactions</span><span className="text-foreground">{learning.requiresMinInteractions}</span></div>
            <Separator className="my-2" />
            {learning.rules.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-foreground">{r.signal}</span>
                <span className="text-muted-foreground">w={r.weight}</span>
              </div>
            ))}
          </div>
        </SitaCard>

        {/* Handoff Targets */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">Handoff Targets</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {advisor.handoffTargets.map((t, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">{t}</Badge>
            ))}
          </div>
        </SitaCard>

        {/* Blocked Actions */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-3.5 w-3.5 text-destructive" />
            <p className="text-xs font-semibold text-foreground">Blocked Actions</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {advisor.blockedActions.map((a, i) => (
              <span key={i} className="rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">{a}</span>
            ))}
          </div>
        </SitaCard>

        {/* KPIs */}
        <SitaCard hover={false} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">Performance KPIs</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {advisor.performanceKpis.map((kpi, i) => (
              <span key={i} className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">{kpi}</span>
            ))}
          </div>
        </SitaCard>
      </div>
    </ScrollArea>
  );
}

// ── Main Page ───────────────────────────────────────────────
const AdvisorRegistry = () => {
  const [council, setCouncil] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Fetch DB advisors and merge with config registry
  const { data: dbAdvisors = [] } = useQuery({
    queryKey: ["advisor-registry-db"],
    queryFn: async () => {
      const { data, error } = await fromTable("advisor_registry").select("*").order("display_name");
      if (error) throw error;
      return data || [];
    },
  });

  // Merge: config advisors are canonical, DB advisors that don't match a config entry are appended
  const mergedRegistry = useMemo(() => {
    const configIds = new Set<string>(FULL_ADVISOR_REGISTRY.map(a => a.id));
    const dbOnly = dbAdvisors
      .filter(db => !configIds.has(db.id as string) && !configIds.has(db.advisor_type as string))
      .map(db => ({
        id: db.id,
        name: db.display_name,
        domain: db.domain || "general",
        council: "internal-ops" as const,
        description: `DB-registered ${db.advisor_type} advisor`,
        capabilities: Array.isArray((db.capabilities as never)) ? (db.capabilities as string[]) : [],
        maxAutonomy: "L1-diagnose" as const,
        confidenceThreshold: db.trust_threshold || 0.7,
        maturity: "alpha" as "alpha",
        handoffTargets: [],
        blockedActions: [],
        performanceKpis: [],
      })) as ExtendedAdvisorConfig[];
    return [...FULL_ADVISOR_REGISTRY, ...dbOnly];
  }, [dbAdvisors]);

  const councils = useMemo(() => {
    const set = new Set(mergedRegistry.map(a => a.council));
    return ["all", ...Array.from(set)];
  }, [mergedRegistry]);

  const filtered = useMemo(() => {
    let list = mergedRegistry;
    if (council !== "all") list = list.filter(a => a.council === council);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.domain.toLowerCase().includes(q) ||
        a.capabilities.some(c => c.includes(q))
      );
    }
    return list;
  }, [council, search, mergedRegistry]);

  const selected = mergedRegistry.find(a => a.id === selectedId) ?? null;

  const maturityCounts = useMemo(() => {
    const m = { scaffold: 0, alpha: 0, beta: 0, production: 0 };
    mergedRegistry.forEach(a => m[a.maturity]++);
    return m;
  }, [mergedRegistry]);

  return (
    <motion.div className="mx-auto max-w-7xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <SitaPageHeader title="Advisor Registry" subtitle={`${mergedRegistry.length} advisors — capabilities, behavioral profiles, and governance${dbAdvisors.length > 0 ? ` (${dbAdvisors.length} from DB)` : ""}`} />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Total Advisors" value={mergedRegistry.length} icon={Bot} />
        <KPITile label="Alpha+" value={maturityCounts.alpha + maturityCounts.beta + maturityCounts.production} icon={Zap} />
        <KPITile label="Councils" value={councils.length - 1} icon={Users} />
        <KPITile label="Total Capabilities" value={mergedRegistry.reduce((s, a) => s + a.capabilities.length, 0)} icon={Layers} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search advisors, capabilities, domains…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Council Tabs */}
      <SitaTabs
        tabs={councils.map(c => ({
          key: c,
          label: c === "all" ? "All" : c.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          count: c === "all" ? mergedRegistry.length : mergedRegistry.filter(a => a.council === c).length,
        }))}
        active={council}
        onChange={setCouncil}
      />

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState icon={Brain} title="No advisors match" description="Try a different search or filter." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* List */}
          <div className="lg:col-span-3">
            <ScrollArea className="h-[calc(100vh-420px)]">
              <div className="space-y-2 pr-2">
                <AnimatePresence mode="popLayout">
                  {filtered.map((adv, i) => {
                    const CouncilIcon = COUNCIL_ICONS[adv.council] ?? Brain;
                    return (
                      <motion.div
                        key={adv.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.015 }}
                      >
                        <SitaCard selected={selectedId === adv.id} onClick={() => setSelectedId(adv.id)} className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <CouncilIcon className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground truncate">{adv.name}</p>
                                  <Badge variant="outline" className={`text-[9px] shrink-0 ${MATURITY_COLORS[adv.maturity]}`}>{adv.maturity}</Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">{adv.domain} · {adv.maxAutonomy} · {adv.capabilities.length} caps</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="hidden sm:flex items-center gap-1">
                                {adv.capabilities.slice(0, 2).map((c, j) => (
                                  <span key={j} className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{c}</span>
                                ))}
                                {adv.capabilities.length > 2 && (
                                  <span className="text-[9px] text-muted-foreground">+{adv.capabilities.length - 2}</span>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          {/* Maturity bar */}
                          <div className="mt-2">
                            <Progress value={MATURITY_PROGRESS[adv.maturity]} className="h-1" />
                          </div>
                        </SitaCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <AdvisorDetailPanel advisor={selected} />
                </motion.div>
              ) : (
                <EmptyState icon={Eye} title="Select an advisor" description="Click any advisor to view capabilities, behavioral profile, escalation rules, and governance." />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdvisorRegistry;
