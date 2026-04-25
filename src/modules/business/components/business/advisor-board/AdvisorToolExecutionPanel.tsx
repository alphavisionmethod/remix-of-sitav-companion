// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Tool Execution Panel
// Visual tool registry, execution pipeline, approval gates
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, CheckSquare, UserCog, Calendar, Receipt, MessageSquare, FileText, ClipboardList,
  Play, Check, X, RotateCcw, Shield, Clock, Zap, AlertTriangle, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedConfidenceRing } from "./AnimatedConfidenceRing";
import type {
  ToolDefinition, ToolExecution, ToolExecutionStatus, ToolCategory,
} from "@/domains/engines/advisor-tool-execution-engine";
import { isActionAllowed } from "@/lib/ai-platform/runtime/advisor-permission-matrix";
import { getReversibility } from "@/lib/ai-platform/runtime/advisor-reversibility-map";

const ICON_MAP: Record<string, React.ElementType> = {
  Mail, CheckSquare, UserCog, Calendar, Receipt, MessageSquare, FileText, ClipboardList,
};

const STATUS_CONFIG: Record<ToolExecutionStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending_approval: { label: "Awaiting Approval", color: "hsl(38 85% 58%)", icon: Shield },
  approved: { label: "Approved", color: "hsl(200 80% 55%)", icon: Check },
  executing: { label: "Executing...", color: "hsl(265 55% 58%)", icon: Zap },
  completed: { label: "Completed", color: "hsl(152 55% 48%)", icon: Check },
  failed: { label: "Failed", color: "hsl(0 72% 51%)", icon: AlertTriangle },
  rolled_back: { label: "Rolled Back", color: "hsl(38 85% 58%)", icon: RotateCcw },
  cancelled: { label: "Cancelled", color: "hsl(0 0% 50%)", icon: X },
};

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  communication: "Communication",
  crm: "CRM",
  scheduling: "Scheduling",
  invoicing: "Invoicing",
  tasks: "Tasks",
  files: "Files",
  analytics: "Analytics",
};

interface Props {
  tools: ToolDefinition[];
  executions: ToolExecution[];
  stats: { total: number; pending: number; completed: number; failed: number; rolledBack: number; successRate: number };
  onRequestExecution: (toolId: string, advisorId: string, params: Record<string, unknown>) => void;
  onApprove: (executionId: string) => void;
  onExecute: (executionId: string) => void;
  onRollback: (executionId: string) => void;
  onCancel: (executionId: string) => void;
}

export function AdvisorToolExecutionPanel({ tools, executions, stats, onApprove, onExecute, onRollback, onCancel }: Props) {
  const [view, setView] = useState<"executions" | "registry">("executions");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");

  const pending = executions.filter(e => e.status === "pending_approval");
  const recent = executions.filter(e => e.status !== "pending_approval").slice(0, 20);
  const filteredTools = selectedCategory === "all" ? tools : tools.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* ── Stats Bar ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "hsl(265 55% 58%)" },
          { label: "Pending", value: stats.pending, color: "hsl(38 85% 58%)" },
          { label: "Completed", value: stats.completed, color: "hsl(152 55% 48%)" },
          { label: "Failed", value: stats.failed, color: "hsl(0 72% 51%)" },
          { label: "Success Rate", value: `${Math.round(stats.successRate * 100)}%`, color: "hsl(152 55% 48%)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 text-center">
            <div className="text-lg font-display font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── View Toggle ───────────────────────────────── */}
      <div className="flex gap-2">
        <Button variant={view === "executions" ? "default" : "ghost"} size="sm" className="text-[10px] h-7" onClick={() => setView("executions")}>
          Executions {pending.length > 0 && <Badge variant="destructive" className="ml-1 text-[8px] h-4 px-1">{pending.length}</Badge>}
        </Button>
        <Button variant={view === "registry" ? "default" : "ghost"} size="sm" className="text-[10px] h-7" onClick={() => setView("registry")}>
          Tool Registry ({tools.length})
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {view === "executions" ? (
          <motion.div key="executions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Pending Approvals */}
            {pending.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-display font-semibold text-[hsl(38_85%_58%)] flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Awaiting Your Approval ({pending.length})
                </h3>
                {pending.map(exec => (
                  <ExecutionCard key={exec.id} execution={exec} tool={tools.find(t => t.toolId === exec.toolId)} onApprove={onApprove} onCancel={onCancel} />
                ))}
              </div>
            )}

            {/* Recent Executions */}
            <div className="space-y-2">
              <h3 className="text-xs font-display font-semibold text-muted-foreground">Recent Executions</h3>
              {recent.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground/50">No executions yet — advisors will use tools as they act on recommendations</div>
              ) : (
                recent.map(exec => (
                  <ExecutionCard key={exec.id} execution={exec} tool={tools.find(t => t.toolId === exec.toolId)} onExecute={onExecute} onRollback={onRollback} />
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="registry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              <Button variant={selectedCategory === "all" ? "default" : "ghost"} size="sm" className="text-[10px] h-6" onClick={() => setSelectedCategory("all")}>All</Button>
              {(Object.keys(CATEGORY_LABELS) as ToolCategory[]).map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "ghost"} size="sm" className="text-[10px] h-6" onClick={() => setSelectedCategory(cat)}>
                  {CATEGORY_LABELS[cat]}
                </Button>
              ))}
            </div>

            {/* Tool Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTools.map(tool => (
                <ToolCard key={tool.toolId} tool={tool} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-Components ──────────────────────────────────────────────

function ExecutionCard({ execution, tool, onApprove, onExecute, onRollback, onCancel }: {
  execution: ToolExecution;
  tool?: ToolDefinition;
  onApprove?: (id: string) => void;
  onExecute?: (id: string) => void;
  onRollback?: (id: string) => void;
  onCancel?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[execution.status];
  const StatusIcon = config.icon;
  const ToolIcon = ICON_MAP[tool?.icon ?? "Zap"] ?? Zap;
  const elapsed = execution.completedAt ? `${((execution.completedAt - execution.requestedAt) / 1000).toFixed(1)}s` : null;

  return (
    <motion.div
      layout
      className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 cursor-pointer hover:bg-[hsl(0_0%_100%/0.04)] transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
          <ToolIcon className="h-4 w-4" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate">{tool?.name ?? execution.toolId}</span>
            <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-[hsl(0_0%_100%/0.1)]" style={{ color: config.color }}>
              <StatusIcon className="h-2.5 w-2.5 mr-0.5" /> {config.label}
            </Badge>
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            by {execution.advisorName} · {execution.impactSummary}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <AnimatedConfidenceRing value={execution.confidenceAtRequest} size={28} strokeWidth={2.5} />
          {elapsed && <span className="text-[9px] text-muted-foreground">{elapsed}</span>}
          <ChevronRight className={`h-3 w-3 text-muted-foreground/30 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 pt-3 border-t border-[hsl(0_0%_100%/0.06)] space-y-2">
              {/* Parameters */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(execution.parameters).map(([key, val]) => (
                  <div key={key} className="text-[10px]">
                    <span className="text-muted-foreground">{key}:</span>{" "}
                    <span className="text-foreground">{String(val)}</span>
                  </div>
                ))}
              </div>

              {/* Result */}
              {execution.result && (
                <div className={`text-[10px] p-2 rounded-lg ${execution.result.success ? "bg-[hsl(152_55%_48%/0.08)] text-[hsl(152_55%_48%)]" : "bg-[hsl(0_72%_51%/0.08)] text-[hsl(0_72%_51%)]"}`}>
                  {execution.result.message}
                  {execution.result.sideEffects.length > 0 && (
                    <div className="mt-1 text-[9px] opacity-70">
                      Side effects: {execution.result.sideEffects.join(" · ")}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                {execution.status === "pending_approval" && onApprove && (
                  <>
                    <Button size="sm" className="text-[10px] h-6 bg-[hsl(152_55%_48%)] hover:bg-[hsl(152_55%_55%)]" onClick={(e) => { e.stopPropagation(); onApprove(execution.id); }}>
                      <Check className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    {onCancel && (
                      <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={(e) => { e.stopPropagation(); onCancel(execution.id); }}>
                        <X className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    )}
                  </>
                )}
                {execution.status === "approved" && onExecute && (
                  <Button size="sm" className="text-[10px] h-6 bg-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_65%)]" onClick={(e) => { e.stopPropagation(); onExecute(execution.id); }}>
                    <Play className="h-3 w-3 mr-1" /> Execute
                  </Button>
                )}
                {execution.status === "completed" && tool?.rollbackCapable && onRollback && (
                  <Button variant="ghost" size="sm" className="text-[10px] h-6 text-[hsl(38_85%_58%)]" onClick={(e) => { e.stopPropagation(); onRollback(execution.id); }}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Rollback
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ToolCard({ tool }: { tool: ToolDefinition }) {
  const ToolIcon = ICON_MAP[tool.icon] ?? Zap;
  const riskColors: Record<string, string> = {
    safe: "hsl(152 55% 48%)", low: "hsl(200 80% 55%)", medium: "hsl(38 85% 58%)", high: "hsl(0 72% 51%)", critical: "hsl(0 72% 40%)",
  };

  return (
    <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4 hover:bg-[hsl(0_0%_100%/0.04)] transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[hsl(265_55%_58%/0.1)] flex items-center justify-center shrink-0">
          <ToolIcon className="h-4.5 w-4.5 text-[hsl(265_55%_58%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">{tool.name}</span>
            <Badge variant="outline" className="text-[8px] h-4 px-1" style={{ color: riskColors[tool.riskLevel], borderColor: `${riskColors[tool.riskLevel]}40` }}>
              {tool.riskLevel}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
          <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground/60">
            {tool.requiresApproval && <span className="flex items-center gap-0.5"><Shield className="h-2.5 w-2.5" /> Approval</span>}
            {tool.rollbackCapable && <span className="flex items-center gap-0.5"><RotateCcw className="h-2.5 w-2.5" /> Rollback</span>}
            <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {tool.maxDailyExecutions}/day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
