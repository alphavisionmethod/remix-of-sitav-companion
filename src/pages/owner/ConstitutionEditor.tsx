// ═══════════════════════════════════════════════════════════════
// SITA OS — Personal Constitution Editor
// Natural-language rule authoring with real-time compilation
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect } from "react";
import { SitaPageHeader, SitaCard, SitaButton } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import { ConfidenceBar } from "@/components/sita/primitives/ConfidenceBar";
import { useConstitution } from "@/contexts/SitaKernelContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText, Plus, Trash2, ToggleLeft, ToggleRight, Brain,
  Shield, Clock, DollarSign, Users, Eye, EyeOff, Bell,
  AlertTriangle, Sparkles, ChevronDown, ChevronRight, Lightbulb
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ConstitutionRule, ConstitutionRuleCategory } from "@/lib/services/constitution-compiler";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useActionFn } from "@/hooks/use-action";
import { PlainEnglishPolicyEditor } from "@/components/sita/PlainEnglishPolicyEditor";
import { DEMO_EXAMPLE_RULES } from "@/data/seed/core-pages";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";



// ── Category Config ─────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  schedule: { icon: Clock, color: "text-blue-400 bg-blue-400/10", label: "Schedule" },
  approval: { icon: Shield, color: "text-trust-safe bg-trust-safe/10", label: "Approval" },
  spending: { icon: DollarSign, color: "text-sita-gold bg-sita-gold/10", label: "Spending" },
  privacy: { icon: EyeOff, color: "text-purple-400 bg-purple-400/10", label: "Privacy" },
  notification: { icon: Bell, color: "text-cyan-400 bg-cyan-400/10", label: "Notification" },
  behavior: { icon: Brain, color: "text-primary bg-primary/10", label: "Behavior" },
  delegation: { icon: Users, color: "text-emerald-400 bg-emerald-400/10", label: "Delegation" },
  risk: { icon: AlertTriangle, color: "text-destructive bg-destructive/10", label: "Risk" },
  family: { icon: Users, color: "text-pink-400 bg-pink-400/10", label: "Family" },
  "ui-friction": { icon: Eye, color: "text-amber-400 bg-amber-400/10", label: "UI Friction" },
  memory: { icon: Brain, color: "text-indigo-400 bg-indigo-400/10", label: "Memory" },
  escalation: { icon: ChevronRight, color: "text-orange-400 bg-orange-400/10", label: "Escalation" },
};

// ── Category Badge ──────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.behavior;
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold", config.color)}>
<Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ── Rule Card ───────────────────────────────────────────────────

function RuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: ConstitutionRule;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const affectedSurfaces = useMemo(() => {
    const surfaces: string[] = [];
    if (rule.compiledPolicy) surfaces.push("Policy Engine");
    if (rule.compiledConstraints.length > 0) surfaces.push("Advisor Constraints");
    if (rule.compiledFriction) surfaces.push("UI Friction");
    if (rule.compiledNotification) surfaces.push("Notifications");
    if (rule.compiledApproval) surfaces.push("Approval Chain");
    if (rule.compiledMemory) surfaces.push("Memory Sharing");
    return surfaces;
  }, [rule]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "rounded-xl border bg-card/50 p-4 transition-all",
        rule.active ? "border-border/50" : "border-border/20 opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Switch
          checked={rule.active}
          onCheckedChange={(checked) => onToggle(rule.id, checked)}
          className="mt-0.5 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium", rule.active ? "text-foreground" : "text-muted-foreground")}>
            "{rule.naturalLanguage}"
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <CategoryBadge category={rule.category} />
            <span className={cn(
              "text-[9px] font-semibold rounded-full px-1.5 py-0.5",
              rule.compilationConfidence >= 0.8 ? "text-trust-safe bg-trust-safe/10" :
              rule.compilationConfidence >= 0.6 ? "text-accent bg-accent/10" :
              "text-destructive bg-destructive/10"
            )}>
              {Math.round(rule.compilationConfidence * 100)}% confidence
            </span>
            <span className="text-[9px] text-muted-foreground">
              {rule.compiledPolicy.effect}
            </span>
            {rule.triggerCount > 0 && (
              <span className="text-[9px] text-muted-foreground">
                Triggered {rule.triggerCount}x
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border/30 space-y-3">
              {/* What this rule affects */}
              <div>
                <p className="text-[10px] font-semibold text-foreground mb-1.5">Affects</p>
                <div className="flex flex-wrap gap-1">
                  {affectedSurfaces.map(s => (
                    <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>
                  ))}
                </div>
              </div>

              {/* Compiled policy details */}
              <div>
                <p className="text-[10px] font-semibold text-foreground mb-1">Compiled Policy</p>
                <div className="rounded-lg bg-secondary/30 p-2 font-mono text-[9px] text-muted-foreground">
                  <p>Effect: <span className="text-foreground">{rule.compiledPolicy.effect}</span></p>
                  <p>Condition: <span className="text-foreground">{rule.compiledPolicy.condition.type} {rule.compiledPolicy.condition.operator} {JSON.stringify(rule.compiledPolicy.condition.value)}</span></p>
                  {Object.keys(rule.compiledPolicy.parameters).length > 0 && (
                    <p>Params: <span className="text-foreground">{JSON.stringify(rule.compiledPolicy.parameters)}</span></p>
                  )}
                </div>
              </div>

              {/* Advisor constraints */}
              {rule.compiledConstraints.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-foreground mb-1">Advisor Constraints</p>
                  {rule.compiledConstraints.map((c, i) => (
                    <div key={i} className="rounded-lg bg-secondary/30 p-2 text-[9px] text-muted-foreground mb-1">
                      Advisor <span className="text-foreground">{c.advisorId}</span> → {c.constraint} ({c.scope})
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                <span>Mode: {rule.enforcementMode}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Composer ────────────────────────────────────────────────────

function RuleComposer({ onCompile }: { onCompile: (text: string) => void }) {
  const [input, setInput] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = () => {
    if (input.trim().length < 5) return;
    onCompile(input.trim());
    setInput("");
  };

  return (
    <SitaCard hover={false} className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-foreground">Add a Rule</p>
          <p className="text-[10px] text-muted-foreground">Type in plain English. SITA compiles it into executable policy.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder='e.g. "Never bother me after 8pm"'
          className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <SitaButton onClick={handleSubmit} disabled={input.trim().length < 5}>
          <Plus className="h-4 w-4 mr-1" /> Compile
        </SitaButton>
      </div>

      <button
        onClick={() => setShowExamples(!showExamples)}
        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-2"
      >
        <Lightbulb className="h-3 w-3" />
        {showExamples ? "Hide" : "Show"} examples
      </button>

      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 mt-2">
              {([] as typeof DEMO_EXAMPLE_RULES).map(ex => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className="rounded-full border border-border/50 bg-secondary/30 px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SitaCard>
  );
}

// ── Main Page ───────────────────────────────────────────────────

export default function ConstitutionEditor() {
  const { user, isDemo } = useAuth();
  const { compiler, compileRule, toggleRule, deleteRule } = useConstitution();
  const [tab, setTab] = useState("all");
  const [dbLoaded, setDbLoaded] = useState(false);

  // Kernel action fns for constitution CRUD
  const constitutionCreate = useActionFn("owner", "constitution.create", { silent: true });
  const constitutionUpdate = useActionFn("owner", "constitution.update", { silent: true });
  const constitutionDelete = useActionFn("owner", "constitution.delete", { silent: true });

  // Load persisted rules from DB on mount (skip for demo users)
  useEffect(() => {
    if (dbLoaded || isDemo || !user?.id) return;

    const loadRules = async () => {
      const { data, error } = await fromTable("constitution_rules")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        // Hydrate the in-memory compiler with DB rules
        data.forEach((row: Record<string, any>) => {
          // Only add if not already in compiler
          const existing = compiler.getAllRules();
          if (!existing.find((r: ConstitutionRule) => r.naturalLanguage === row.natural_text)) {
            compileRule(row.natural_text);
            // Sync active state
            const rules = compiler.getAllRules();
            const added = rules.find((r: ConstitutionRule) => r.naturalLanguage === row.natural_text);
            if (added && !row.is_active) {
              toggleRule(added.id, false);
            }
          }
        });
      } else if (!error && (!data || data.length === 0)) {
        // First time — seed defaults and persist them
        const defaults = [
          "Never bother me after 8pm",
          "My spouse must approve transfers above $500",
          "When I'm overwhelmed, reduce options",
        ];
        for (const d of defaults) {
          compileRule(d);
          const rules = compiler.getAllRules();
          const added = rules.find((r: ConstitutionRule) => r.naturalLanguage === d);
          if (added) {
            await constitutionCreate({
              table: "constitution_rules",
              data: {
                user_id: user.id,
                natural_text: d,
                category: added.category,
                priority: (added.compiledPolicy?.parameters?.priority ?? 50) as number,
                enforcement_mode: added.enforcementMode,
                is_active: true,
                compiled_json: JSON.parse(JSON.stringify(added.compiledPolicy ?? null)),
              },
            });
          }
        }
      }
      setDbLoaded(true);
    };

    loadRules();
  }, [user?.id, isDemo, dbLoaded]);

  // Demo fallback: seed in-memory only
  const [seeded, setSeeded] = useState(false);
  if (isDemo && !seeded && compiler.getAllRules().length === 0) {
    const defaults = [
      "Never bother me after 8pm",
      "My spouse must approve transfers above $500",
      "When I'm overwhelmed, reduce options",
    ];
    defaults.forEach(d => compileRule(d));
    setSeeded(true);
  }

  // Wrap compileRule with DB persistence
  const handleCompileRule = useCallback(async (text: string) => {
    compileRule(text);
    if (!isDemo && user?.id) {
      const rules = compiler.getAllRules();
      const added = rules.find((r: ConstitutionRule) => r.naturalLanguage === text);
      if (added) {
        await constitutionCreate({
          table: "constitution_rules",
          data: {
            user_id: user.id,
            natural_text: text,
            category: added.category,
            priority: (added.compiledPolicy?.parameters?.priority ?? 50) as number,
            enforcement_mode: added.enforcementMode,
            is_active: true,
            compiled_json: JSON.parse(JSON.stringify(added.compiledPolicy ?? null)),
          },
        });
      }
    }
  }, [compileRule, isDemo, user?.id, compiler]);

  // Wrap toggleRule with DB persistence
  const handleToggleRule = useCallback(async (id: string, active: boolean) => {
    toggleRule(id, active);
    if (!isDemo && user?.id) {
      const rule = compiler.getAllRules().find((r: ConstitutionRule) => r.id === id);
      if (rule) {
        await constitutionUpdate({
          table: "constitution_rules",
          updates: { is_active: active },
          filters: { user_id: user.id, natural_text: rule.naturalLanguage },
        });
      }
    }
  }, [toggleRule, isDemo, user?.id, compiler]);

  // Wrap deleteRule with DB persistence
  const handleDeleteRule = useCallback(async (id: string) => {
    const rule = compiler.getAllRules().find((r: ConstitutionRule) => r.id === id);
    deleteRule(id);
    if (!isDemo && user?.id && rule) {
      await constitutionDelete({
        table: "constitution_rules",
        filters: { user_id: user.id, natural_text: rule.naturalLanguage },
      });
    }
  }, [deleteRule, isDemo, user?.id, compiler, constitutionDelete]);

  const allRules = compiler.getAllRules();
  const stats = compiler.getStats();

  const categories = useMemo(() => {
    const cats = new Set(allRules.map(r => r.category));
    return Array.from(cats);
  }, [allRules]);

  const filtered = useMemo(() => {
    if (tab === "all") return allRules;
    return allRules.filter(r => r.category === tab);
  }, [allRules, tab]);

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      <SitaPageHeader
        title="Personal Constitution"
        subtitle="Your rules, compiled into machine-enforced policy — not settings, a runtime constitution"
      />

      {/* KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Rules" value={String(stats.total)} icon={ScrollText} sub={`${stats.active} active`} />
        <KPITile
          label="Avg Confidence"
          value={`${Math.round(stats.avgConfidence * 100)}%`}
          icon={Brain}
          sub="Compilation accuracy"
        />
        <KPITile label="Categories" value={String(Object.keys(stats.byCategory).length)} icon={Shield} sub="Rule types" />
        <KPITile label="Triggers" value={String(stats.totalTriggers)} icon={Sparkles} sub="Times enforced" />
      </div>

      {/* Composer */}
      <RuleComposer onCompile={handleCompileRule} />

      {/* Filter tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="glass-panel flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="text-[10px]">All ({allRules.length})</TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="text-[10px]">
              {CATEGORY_CONFIG[cat as string]?.label ?? cat} ({allRules.filter(r => r.category === cat).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <div className="empty-state-premium">
                  <ScrollText className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mt-3">No rules in this category</p>
                </div>
              ) : (
                filtered.map(rule => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={handleToggleRule}
                    onDelete={handleDeleteRule}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
