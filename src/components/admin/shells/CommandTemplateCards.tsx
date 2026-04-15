import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, Zap, Rocket, DollarSign, Target, Activity, Wrench,
  TrendingUp, Clock, ChevronRight, Play, AlertTriangle, Eye,
  Sparkles, BarChart3, RefreshCw
} from "lucide-react";

interface CommandTemplate {
  id: string;
  title: string;
  description: string;
  directive: string;
  icon: React.ElementType;
  color: string;
  risk: "low" | "medium" | "high";
  estimatedDuration: string;
  category: "reliability" | "security" | "release" | "cost" | "trust" | "performance" | "incident" | "strategic";
  tags: string[];
}

const TEMPLATES: CommandTemplate[] = [
  {
    id: "reliability-sprint",
    title: "Reliability Sprint",
    description: "Analyze sync failures, retry storms, and idempotency gaps. Generate fixes and run validation.",
    directive: "Improve sync reliability across all devices. Analyze failure rates, fix retry logic, and validate with canary rollout.",
    icon: Activity,
    color: "text-emerald-400",
    risk: "medium",
    estimatedDuration: "2-4 hours",
    category: "reliability",
    tags: ["sync", "stability", "retry"],
  },
  {
    id: "security-sweep",
    title: "Security Sweep",
    description: "Run a full security review on storage, sync, auth, and admin systems. Surface findings with severity.",
    directive: "Run a full security review on storage, sync, and admin authentication. Surface all findings by severity.",
    icon: Shield,
    color: "text-blue-400",
    risk: "low",
    estimatedDuration: "1-2 hours",
    category: "security",
    tags: ["audit", "auth", "trust"],
  },
  {
    id: "release-preparation",
    title: "Release Preparation",
    description: "Prepare the next stable release. Run quality gates, check regressions, and stage rollout plan.",
    directive: "Prepare the next stable release but do not ship until quality is excellent. Run all validation gates.",
    icon: Rocket,
    color: "text-purple-400",
    risk: "medium",
    estimatedDuration: "3-6 hours",
    category: "release",
    tags: ["deploy", "canary", "rollout"],
  },
  {
    id: "cost-reduction",
    title: "Cost Reduction Pass",
    description: "Identify expensive AI tasks, optimize model routing, increase cache hits, and reduce token waste.",
    directive: "Reduce AI operating cost by 30% without hurting product quality. Optimize model routing and caching.",
    icon: DollarSign,
    color: "text-amber-400",
    risk: "low",
    estimatedDuration: "1-3 hours",
    category: "cost",
    tags: ["budget", "tokens", "efficiency"],
  },
  {
    id: "trust-calibration",
    title: "Trust Calibration",
    description: "Review trust false positives, adjust thresholds, and simulate the effect on user experience.",
    directive: "Calibrate trust system to reduce false positive prompts by 40% while maintaining security posture.",
    icon: Target,
    color: "text-cyan-400",
    risk: "medium",
    estimatedDuration: "2-4 hours",
    category: "trust",
    tags: ["trust", "thresholds", "UX"],
  },
  {
    id: "incident-stabilization",
    title: "Incident Stabilization",
    description: "Freeze risky rollouts, rollback recent deploys, and run health checks on all subsystems.",
    directive: "Stabilize the platform. Freeze all active rollouts, rollback any recent risky deploys, and verify system health.",
    icon: AlertTriangle,
    color: "text-red-400",
    risk: "high",
    estimatedDuration: "30-60 min",
    category: "incident",
    tags: ["freeze", "rollback", "health"],
  },
  {
    id: "performance-optimization",
    title: "Performance Optimization",
    description: "Profile top latency sources, optimize hot paths, and validate improvements with benchmarks.",
    directive: "Find and fix the biggest performance regressions from this week. Run benchmarks before and after.",
    icon: TrendingUp,
    color: "text-green-400",
    risk: "low",
    estimatedDuration: "2-4 hours",
    category: "performance",
    tags: ["latency", "speed", "regression"],
  },
  {
    id: "platform-simulation",
    title: "Platform Simulation",
    description: "Run a full digital-twin simulation to predict impact of current configuration on key metrics.",
    directive: "Run a full platform simulation. Predict the impact of current rollout state on reliability, cost, and user experience.",
    icon: Sparkles,
    color: "text-violet-400",
    risk: "low",
    estimatedDuration: "1-2 hours",
    category: "strategic",
    tags: ["simulation", "prediction", "impact"],
  },
  {
    id: "workspace-continuity",
    title: "Repair Workspace Continuity",
    description: "Find and repair stuck, orphaned, or inconsistent workspaces. Restore session state and verify integrity.",
    directive: "Repair workspace continuity. Find stuck or orphaned workspaces, restore session state, and verify data integrity across all active workspaces.",
    icon: Wrench,
    color: "text-teal-400",
    risk: "medium",
    estimatedDuration: "1-3 hours",
    category: "reliability",
    tags: ["workspace", "repair", "continuity"],
  },
  {
    id: "storage-cost-optimization",
    title: "Optimize Storage Costs",
    description: "Identify redundant blobs, cold data candidates, and preview generation waste. Move data to cheaper tiers.",
    directive: "Optimize storage costs. Identify redundant files, cold data for archival, excessive preview generation, and recommend tier migrations.",
    icon: BarChart3,
    color: "text-orange-400",
    risk: "low",
    estimatedDuration: "2-4 hours",
    category: "cost",
    tags: ["storage", "archive", "savings"],
  },
  {
    id: "user-friction-investigation",
    title: "Investigate User Friction",
    description: "Analyze drop-off points, error patterns, and support escalation trends to find top user pain points.",
    directive: "Investigate top user friction points. Analyze onboarding drop-offs, error patterns, support escalation trends, and recommend targeted improvements.",
    icon: Eye,
    color: "text-pink-400",
    risk: "low",
    estimatedDuration: "2-3 hours",
    category: "strategic",
    tags: ["UX", "friction", "support"],
  },
  {
    id: "trust-decision-audit",
    title: "Audit Trust Decisions",
    description: "Review all recent trust decisions, challenge false positives, and verify policy alignment with intent.",
    directive: "Audit all trust decisions from the last 7 days. Identify false positives, challenge questionable blocks, and verify policy alignment.",
    icon: Shield,
    color: "text-indigo-400",
    risk: "low",
    estimatedDuration: "1-2 hours",
    category: "trust",
    tags: ["audit", "false-positive", "review"],
  },
  {
    id: "full-platform-review",
    title: "Run Full Platform Review",
    description: "Comprehensive sweep of all subsystems: sync, storage, auth, trust, releases, AI, devices, costs, and incidents.",
    directive: "Run a full platform review. Check every subsystem for health, correctness, cost efficiency, and security. Summarize findings and recommend next steps.",
    icon: RefreshCw,
    color: "text-sky-400",
    risk: "low",
    estimatedDuration: "3-5 hours",
    category: "strategic",
    tags: ["comprehensive", "review", "all-systems"],
  },
];

const RISK_STYLES = {
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-red-500/10 text-red-400 border-red-500/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  reliability: "Reliability",
  security: "Security",
  release: "Release",
  cost: "Cost",
  trust: "Trust",
  performance: "Performance",
  incident: "Incident",
  strategic: "Strategic",
};

interface CommandTemplateCardsProps {
  onSelectTemplate?: (directive: string) => void;
  compact?: boolean;
}

export function CommandTemplateCards({ onSelectTemplate, compact = false }: CommandTemplateCardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const categories = ["all", ...new Set(TEMPLATES.map(t => t.category))];
  const filtered = selectedCategory === "all" ? TEMPLATES : TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
              selectedCategory === cat
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-white/[0.03] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.06]"
            )}
          >
            {cat === "all" ? "All Templates" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
        <AnimatePresence mode="popLayout">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group relative rounded-xl border p-4 transition-all cursor-pointer",
                "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]",
                hoveredId === template.id && "ring-1 ring-primary/20"
              )}
              onClick={() => onSelectTemplate?.(template.directive)}
            >
              <div className="flex items-start gap-3">
                <div className={cn("rounded-lg p-2 bg-white/[0.04]", template.color)}>
                  <template.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground truncate">{template.title}</h4>
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", RISK_STYLES[template.risk])}>
                      {template.risk}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{template.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {template.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover action */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredId === template.id ? 1 : 0 }}
                className="absolute inset-0 rounded-xl flex items-center justify-center bg-background/60 backdrop-blur-sm"
              >
                <Button size="sm" className="gap-2" variant="default">
                  <Play className="h-3.5 w-3.5" />
                  Run Template
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
