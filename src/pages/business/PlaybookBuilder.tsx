// ═══════════════════════════════════════════════════════════════
// SITA OS — Playbook Builder
// Visual drag-and-drop automation sequence builder with custom
// triggers, conditional logic, and step configuration
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import PlaybookSimulator from "@/components/business/PlaybookSimulator";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { KPITile } from "@/components/sita/SitaComponents";
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  Mail, Phone, MessageSquare, AlertTriangle, Clock, Zap,
  Shield, ArrowRight, Save, Play, Eye, Copy, Settings,
  GitBranch, Target, DollarSign, Users, Bell, CheckCircle,
  XCircle, Pause, RefreshCw, Filter, ArrowUpRight
} from "lucide-react";
import type { AutoActionType } from "@/lib/domain-engines/autopilot-engine";
// ── Types ────────────────────────────────────────────────────────

interface BuilderStep {
  id: string;
  type: "action" | "condition" | "delay" | "gate";
  action?: AutoActionType;
  name: string;
  description: string;
  config: Record<string, string>;
  delay?: string;
  approvalRequired: boolean;
  enabled: boolean;
  conditions: BuilderCondition[];
  branches?: { label: string; steps: BuilderStep[] }[];
}

interface BuilderCondition {
  id: string;
  field: string;
  operator: "gt" | "lt" | "eq" | "contains" | "between" | "exists" | "not_eq";
  value: string;
}

interface BuilderTrigger {
  type: "event" | "schedule" | "threshold" | "manual";
  event?: string;
  schedule?: string;
  threshold?: { field: string; operator: string; value: string };
}

interface PlaybookDraft {
  id: string;
  name: string;
  description: string;
  category: "recovery" | "growth" | "retention" | "efficiency";
  trigger: BuilderTrigger;
  steps: BuilderStep[];
  createdAt: number;
  updatedAt: number;
}

// ── Constants ────────────────────────────────────────────────────

const ACTION_TYPES: { type: AutoActionType; label: string; icon: typeof Mail; color: string }[] = [
  { type: "email", label: "Send Email", icon: Mail, color: "bg-primary/15 text-primary" },
  { type: "sms", label: "Send SMS", icon: MessageSquare, color: "bg-accent/15 text-accent" },
  { type: "call", label: "Schedule Call", icon: Phone, color: "bg-trust-safe/15 text-trust-safe" },
  { type: "task", label: "Create Task", icon: CheckCircle, color: "bg-urgency-high/15 text-urgency-high" },
  { type: "escalation", label: "Escalate", icon: AlertTriangle, color: "bg-destructive/15 text-destructive" },
  { type: "discount", label: "Offer Discount", icon: DollarSign, color: "bg-trust-safe/15 text-trust-safe" },
  { type: "follow-up", label: "Follow Up", icon: RefreshCw, color: "bg-primary/15 text-primary" },
  { type: "upsell", label: "Upsell Offer", icon: ArrowUpRight, color: "bg-accent/15 text-accent" },
];

const STEP_TYPES: { type: BuilderStep["type"]; label: string; icon: typeof Zap; description: string }[] = [
  { type: "action", label: "Action", icon: Zap, description: "Execute an automation action" },
  { type: "condition", label: "Condition", icon: GitBranch, description: "Branch based on criteria" },
  { type: "delay", label: "Wait", icon: Clock, description: "Pause before next step" },
  { type: "gate", label: "Approval Gate", icon: Shield, description: "Require human approval" },
];

import { OPERATORS, DELAY_OPTIONS } from "@/lib/constants/ui-config";
import { DEMO_BIZ_CATEGORIES as DEMO_CATEGORIES, DEMO_CONDITION_FIELDS, DEMO_TRIGGER_EVENTS } from "@/data/seed/business";
import { useDataMode } from "@/contexts/DataModeContext";

// ── Helpers ──────────────────────────────────────────────────────

let _stepCounter = 0;
const newId = () => `step-${Date.now()}-${++_stepCounter}`;

const createStep = (type: BuilderStep["type"], action?: AutoActionType): BuilderStep => ({
  id: newId(),
  type,
  action: type === "action" ? (action || "email") : undefined,
  name: type === "action"
    ? (ACTION_TYPES.find(a => a.type === action)?.label || "Send Email")
    : type === "condition" ? "Check Condition"
    : type === "delay" ? "Wait"
    : "Approval Gate",
  description: "",
  config: {},
  delay: type === "delay" ? "1 day" : undefined,
  approvalRequired: type === "gate",
  enabled: true,
  conditions: type === "condition" ? [{ id: newId(), field: "customer.ltv", operator: "gt", value: "1000" }] : [],
  branches: type === "condition" ? [
    { label: "If True", steps: [] },
    { label: "If False", steps: [] },
  ] : undefined,
});

const defaultDraft = (): PlaybookDraft => ({
  id: newId(),
  name: "",
  description: "",
  category: "recovery",
  trigger: { type: "event", event: "invoice-overdue" },
  steps: [
    createStep("action", "email"),
    createStep("delay"),
    createStep("condition"),
    createStep("action", "call"),
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// ── Step Card Component ──────────────────────────────────────────

const StepCard = ({
  step, index, totalSteps, onUpdate, onRemove, onDuplicate,
}: {
  step: BuilderStep; index: number; totalSteps: number;
  onUpdate: (s: BuilderStep) => void; onRemove: () => void; onDuplicate: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const actionMeta = step.action ? ACTION_TYPES.find(a => a.type === step.action) : null;
  const stepMeta = STEP_TYPES.find(s => s.type === step.type);
  const Icon = actionMeta?.icon || stepMeta?.icon || Zap;
  const colorClass = step.type === "action" ? (actionMeta?.color || "bg-secondary text-foreground")
    : step.type === "condition" ? "bg-accent/15 text-accent"
    : step.type === "delay" ? "bg-muted text-muted-foreground"
    : "bg-destructive/15 text-destructive";

  return (
    <motion.div layout className="group relative">
{/* Connector line */}
      {index < totalSteps - 1 && (
        <div className="absolute left-6 top-full w-px h-3 bg-border z-0" />
      )}

      <div className={`rounded-xl border transition-all ${expanded ? "border-primary/30 bg-card shadow-md" : "border-border bg-card/60 hover:border-primary/20"}`}>
        {/* Header row */}
        <div className="flex items-center gap-2 p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="cursor-grab active:cursor-grabbing touch-none">
            <GripVertical className="h-4 w-4 text-muted-foreground/40" />
          </div>

          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">{step.type === "gate" ? "Gate" : step.type}</span>
              <span className="text-[9px] text-muted-foreground">Step {index + 1}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{step.name}</p>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Copy className="h-3 w-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          <button onClick={(e) => { e.stopPropagation(); onUpdate({ ...step, enabled: !step.enabled }); }}
            className={`p-1 rounded-md transition-colors ${step.enabled ? "text-trust-safe" : "text-muted-foreground"}`}>
            {step.enabled ? <CheckCircle className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>

          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>

        {/* Expanded config */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden">
              <div className="p-4 space-y-3">
                {/* Name */}
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Step Name</label>
                  <input value={step.name} onChange={e => onUpdate({ ...step, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>

                {/* Action-specific config */}
                {step.type === "action" && (
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Action Type</label>
                    <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                      {ACTION_TYPES.map(at => (
                        <button key={at.type} onClick={() => onUpdate({ ...step, action: at.type, name: at.label })}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium transition-all ${
                            step.action === at.type ? `${at.color} ring-1 ring-current/20` : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                          }`}>
                          <at.icon className="h-3.5 w-3.5" />
                          {at.label.split(" ").pop()}
                        </button>
                      ))}
                    </div>
                    {/* Template field */}
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase mt-3 block">Template / Message</label>
                    <textarea value={step.config.template || ""} onChange={e => onUpdate({ ...step, config: { ...step.config, template: e.target.value } })}
                      placeholder={`Enter ${step.action} template...`} rows={2}
                      className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  </div>
                )}

                {/* Delay config */}
                {step.type === "delay" && (
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Wait Duration</label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {DELAY_OPTIONS.map(d => (
                        <button key={d} onClick={() => onUpdate({ ...step, delay: d, name: `Wait ${d}` })}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                            step.delay === d ? "gradient-sita text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}>{d}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Condition config */}
                {step.type === "condition" && (
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Conditions</label>
                    <div className="mt-1.5 space-y-2">
                      {step.conditions.map((cond, ci) => (
                        <div key={cond.id} className="flex items-center gap-2">
                          <select value={cond.field} onChange={e => {
                            const updated = [...step.conditions];
                            updated[ci] = { ...cond, field: e.target.value };
                            onUpdate({ ...step, conditions: updated });
                          }}
                            className="flex-1 rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-[11px] text-foreground focus:outline-none">
                            {(isDemoMode ? DEMO_CONDITION_FIELDS : [] as typeof DEMO_CONDITION_FIELDS).map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                          <select value={cond.operator} onChange={e => {
                            const updated = [...step.conditions];
                            updated[ci] = { ...cond, operator: e.target.value as BuilderCondition["operator"] };
                            onUpdate({ ...step, conditions: updated });
                          }}
                            className="w-16 rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-[11px] text-foreground text-center focus:outline-none">
                            {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <input value={cond.value} onChange={e => {
                            const updated = [...step.conditions];
                            updated[ci] = { ...cond, value: e.target.value };
                            onUpdate({ ...step, conditions: updated });
                          }}
                            className="w-24 rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-[11px] text-foreground focus:outline-none" placeholder="Value" />
                          <button onClick={() => onUpdate({ ...step, conditions: step.conditions.filter((_, i) => i !== ci) })}
                            className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      ))}
                      <button onClick={() => onUpdate({ ...step, conditions: [...step.conditions, { id: newId(), field: "customer.ltv", operator: "gt", value: "" }] })}
                        className="text-[10px] font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Add condition
                      </button>
                    </div>

                    {/* Branch labels */}
                    {step.branches && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {step.branches.map((b, bi) => (
                          <div key={bi} className={`p-2.5 rounded-lg border ${bi === 0 ? "border-trust-safe/20 bg-trust-safe/5" : "border-destructive/20 bg-destructive/5"}`}>
                            <p className={`text-[10px] font-semibold ${bi === 0 ? "text-trust-safe" : "text-destructive"}`}>{b.label}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              {b.steps.length > 0 ? `${b.steps.length} step(s)` : "No steps — continues to next"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Gate config */}
                {step.type === "gate" && (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-[11px] text-foreground font-medium">This step pauses execution until a human approves.</p>
                    <p className="text-[10px] text-muted-foreground mt-1">The owner will receive an in-app notification and email.</p>
                    <label className="flex items-center gap-2 mt-2">
                      <input type="checkbox" checked={step.config.notifySms === "true"} onChange={e => onUpdate({ ...step, config: { ...step.config, notifySms: String(e.target.checked) } })}
                        className="rounded border-border" />
                      <span className="text-[10px] text-muted-foreground">Also notify via SMS</span>
                    </label>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Notes (optional)</label>
                  <input value={step.description} onChange={e => onUpdate({ ...step, description: e.target.value })}
                    placeholder="Add context for this step..."
                    className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Add Step Menu ────────────────────────────────────────────────

const AddStepMenu = ({ onAdd }: { onAdd: (type: BuilderStep["type"], action?: AutoActionType) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-center">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
        <Plus className="h-3.5 w-3.5" /> Add Step
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute top-full mt-2 z-20 rounded-xl border border-border bg-card shadow-xl p-3 w-72">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Step Type</p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {STEP_TYPES.filter(s => s.type !== "action").map(st => (
                <button key={st.type} onClick={() => { onAdd(st.type); setOpen(false); }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-left transition-colors">
                  <st.icon className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-[11px] font-medium text-foreground">{st.label}</p><p className="text-[9px] text-muted-foreground">{st.description}</p></div>
                </button>
              ))}
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Actions</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ACTION_TYPES.map(at => (
                <button key={at.type} onClick={() => { onAdd("action", at.type); setOpen(false); }}
                  className={`flex items-center gap-2 p-2 rounded-lg hover:ring-1 hover:ring-current/20 transition-all ${at.color}`}>
                  <at.icon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium">{at.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Trigger Config Panel ─────────────────────────────────────────

const TriggerPanel = ({ trigger, onChange }: { trigger: BuilderTrigger; onChange: (t: BuilderTrigger) => void }) => (
  <SitaCard className="p-4" hover={false}>
    <SitaCardTitle sub="What starts this playbook">Trigger</SitaCardTitle>
    <div className="mt-3 space-y-3">
      <div className="flex gap-2">
        {(["event", "schedule", "threshold", "manual"] as const).map(t => (
          <button key={t} onClick={() => onChange({ ...trigger, type: t })}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${
              trigger.type === t ? "gradient-sita text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
        ))}
      </div>

      {trigger.type === "event" && (
        <select value={trigger.event || ""} onChange={e => onChange({ ...trigger, event: e.target.value })}
          className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
          {(isDemoMode ? DEMO_TRIGGER_EVENTS : [] as typeof DEMO_TRIGGER_EVENTS).map(te => <option key={te.value} value={te.value}>{te.label}</option>)}
        </select>
      )}

      {trigger.type === "schedule" && (
        <div className="flex gap-2">
          {["Every hour", "Every 6 hours", "Daily", "Weekly", "Monthly"].map(s => (
            <button key={s} onClick={() => onChange({ ...trigger, schedule: s })}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                trigger.schedule === s ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{s}</button>
          ))}
        </div>
      )}

      {trigger.type === "threshold" && (
        <div className="flex items-center gap-2">
          <select value={trigger.threshold?.field || "customer.ltv"} onChange={e => onChange({ ...trigger, threshold: { ...trigger.threshold!, field: e.target.value, operator: trigger.threshold?.operator || "gt", value: trigger.threshold?.value || "" } })}
            className="flex-1 rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-[11px] text-foreground focus:outline-none">
            {(isDemoMode ? DEMO_CONDITION_FIELDS : [] as typeof DEMO_CONDITION_FIELDS).map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={trigger.threshold?.operator || "gt"} onChange={e => onChange({ ...trigger, threshold: { ...trigger.threshold!, operator: e.target.value } })}
            className="w-16 rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-[11px] text-foreground text-center focus:outline-none">
            {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input value={trigger.threshold?.value || ""} onChange={e => onChange({ ...trigger, threshold: { ...trigger.threshold!, value: e.target.value } })}
            placeholder="Value" className="w-24 rounded-lg border border-border bg-secondary/50 px-2 py-1.5 text-[11px] text-foreground focus:outline-none" />
        </div>
      )}

      {trigger.type === "manual" && (
        <div className="p-3 rounded-lg bg-secondary/30">
          <p className="text-[11px] text-muted-foreground">This playbook will only run when manually triggered from the Command Center.</p>
        </div>
      )}
    </div>
  </SitaCard>
);

// ── Preview Panel ────────────────────────────────────────────────

const PreviewPanel = ({
  draft }: { draft: PlaybookDraft }) => {
  const { isDemoMode } = useDataMode();
  const triggerLabel = draft.trigger.type === "event"
    ? (isDemoMode ? DEMO_TRIGGER_EVENTS : [] as typeof DEMO_TRIGGER_EVENTS).find(e => e.value === draft.trigger.event)?.label || draft.trigger.event
    : draft.trigger.type === "schedule" ? draft.trigger.schedule
    : draft.trigger.type === "threshold" ? `${draft.trigger.threshold?.field} ${draft.trigger.threshold?.operator} ${draft.trigger.threshold?.value}`
    : "Manual trigger";

  return (
    <SitaCard className="p-4" hover={false}>
      <SitaCardTitle sub="Visual flow preview">Sequence Preview</SitaCardTitle>
      <div className="mt-3 space-y-1">
        {/* Trigger */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-medium text-primary">TRIGGER</span>
          <span className="text-[10px] text-muted-foreground ml-auto truncate max-w-[140px]">{triggerLabel}</span>
        </div>

        {draft.steps.map((step, i) => {
          const actionMeta = step.action ? ACTION_TYPES.find(a => a.type === step.action) : null;
          const Icon = actionMeta?.icon || STEP_TYPES.find(s => s.type === step.type)?.icon || Zap;
          return (
            <div key={step.id}>
              <div className="flex justify-center"><div className="w-px h-2 bg-border" /></div>
              <div className={`flex items-center gap-2 p-2 rounded-lg ${!step.enabled ? "opacity-40" : ""} ${
                step.type === "condition" ? "bg-accent/5 border border-accent/10" :
                step.type === "gate" ? "bg-destructive/5 border border-destructive/10" :
                step.type === "delay" ? "bg-muted border border-border" :
                "bg-secondary/30 border border-border"
              }`}>
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-foreground truncate">{step.name}</span>
                {step.type === "delay" && <span className="text-[9px] text-muted-foreground ml-auto">{step.delay}</span>}
                {step.type === "condition" && <GitBranch className="h-3 w-3 text-accent ml-auto" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-sm font-bold text-foreground">{draft.steps.length}</p>
            <p className="text-[9px] text-muted-foreground">Steps</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-sm font-bold text-foreground">{draft.steps.filter(s => s.type === "gate").length}</p>
            <p className="text-[9px] text-muted-foreground">Gates</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-sm font-bold text-foreground">{draft.steps.filter(s => s.type === "condition").length}</p>
            <p className="text-[9px] text-muted-foreground">Branches</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-sm font-bold text-foreground">{draft.steps.filter(s => s.enabled).length}</p>
            <p className="text-[9px] text-muted-foreground">Active</p>
          </div>
        </div>
      </div>
    </SitaCard>
  );
};

// ── Main Component ───────────────────────────────────────────────

const PlaybookBuilder = () => {
  const { primaryMode } = useBusinessProfile();
const [draft, setDraft] = useState<PlaybookDraft>(defaultDraft);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<"build" | "simulate">("build");

  const updateStep = useCallback((index: number, step: BuilderStep) => {
    setDraft(prev => {
      const steps = [...prev.steps];
      steps[index] = step;
      return { ...prev, steps, updatedAt: Date.now() };
    });
  }, []);

  const removeStep = useCallback((index: number) => {
    setDraft(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index), updatedAt: Date.now() }));
  }, []);

  const duplicateStep = useCallback((index: number) => {
    setDraft(prev => {
      const steps = [...prev.steps];
      steps.splice(index + 1, 0, { ...steps[index], id: newId() });
      return { ...prev, steps, updatedAt: Date.now() };
    });
  }, []);

  const addStep = useCallback((type: BuilderStep["type"], action?: AutoActionType) => {
    setDraft(prev => ({ ...prev, steps: [...prev.steps, createStep(type, action)], updatedAt: Date.now() }));
  }, []);

  const handleReorder = useCallback((newOrder: BuilderStep[]) => {
    setDraft(prev => ({ ...prev, steps: newOrder, updatedAt: Date.now() }));
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button onClick={() => setMode("build")} className={`px-3 py-1.5 text-[11px] font-medium transition-all flex items-center gap-1.5 micro-press ${mode === "build" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <Settings className="h-3 w-3" /> Build
          </button>
          <button onClick={() => setMode("simulate")} className={`px-3 py-1.5 text-[11px] font-medium transition-all flex items-center gap-1.5 micro-press ${mode === "simulate" ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <Eye className="h-3 w-3" /> Simulate
          </button>
        </div>
        {mode === "build" && (
          <div className="flex items-center gap-2">
            <SitaButton variant="secondary" size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" /> {saved ? "Saved ✓" : "Save Draft"}
            </SitaButton>
            <SitaButton variant="primary" size="sm" onClick={() => setMode("simulate")}>
              <Play className="h-3.5 w-3.5" /> Simulate
            </SitaButton>
          </div>
        )}
      </div>

      {mode === "simulate" ? (
        <PlaybookSimulator
          draft={draft}
          onBack={() => setMode("build")}
          onActivate={() => {
            setSaved(true);
            setMode("build");
            setTimeout(() => setSaved(false), 2000);
          }}
        />
      ) : (
        <>
          {/* Playbook meta */}
          <SitaCard className="p-4" hover={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Playbook Name</label>
                <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Win-Back Churned Customers"
                  className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Category</label>
                <div className="mt-1.5 flex gap-2">
                  {(isDemoMode ? DEMO_CATEGORIES : [] as typeof DEMO_CATEGORIES).map(c => (
                    <button key={c.value} onClick={() => setDraft(d => ({ ...d, category: c.value }))}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium capitalize transition-all ${
                        draft.category === c.value ? `${c.color} ring-1 ring-current/20` : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}>{c.label}</button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Description</label>
                <input value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                  placeholder="Describe what this playbook does..."
                  className="mt-1 w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
            </div>
          </SitaCard>

          <div className="grid gap-5 lg:grid-cols-3">
            {/* Left: Builder */}
            <div className="lg:col-span-2 space-y-4">
              {/* Trigger */}
              <TriggerPanel trigger={draft.trigger} onChange={trigger => setDraft(d => ({ ...d, trigger, updatedAt: Date.now() }))} />

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Automation Steps</h3>
                  <span className="text-[10px] text-muted-foreground">{draft.steps.length} steps · drag to reorder</span>
                </div>

                <Reorder.Group axis="y" values={draft.steps} onReorder={handleReorder} className="space-y-3">
                  {draft.steps.map((step, i) => (
                    <Reorder.Item key={step.id} value={step}>
                      <StepCard
                        step={step} index={i} totalSteps={draft.steps.length}
                        onUpdate={s => updateStep(i, s)}
                        onRemove={() => removeStep(i)}
                        onDuplicate={() => duplicateStep(i)}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <div className="mt-4">
                  <AddStepMenu onAdd={addStep} />
                </div>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              <PreviewPanel draft={draft} />

              {/* Quick stats */}
              <SitaCard className="p-4" hover={false}>
                <SitaCardTitle sub="Estimated based on similar playbooks">Expected Impact</SitaCardTitle>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-trust-safe/5">
                    <span className="text-[11px] text-muted-foreground">Est. Revenue Recovery</span>
                    <span className="text-sm font-bold text-trust-safe">$12,400/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-accent/5">
                    <span className="text-[11px] text-muted-foreground">Est. Time Saved</span>
                    <span className="text-sm font-bold text-accent">18 hrs/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                    <span className="text-[11px] text-muted-foreground">Customers Reached</span>
                    <span className="text-sm font-bold text-primary">~45/mo</span>
                  </div>
                </div>
              </SitaCard>

              {/* Templates */}
              <SitaCard className="p-4" hover={false}>
                <SitaCardTitle sub="Start from a template">Quick Start</SitaCardTitle>
                <div className="mt-3 space-y-1.5">
                  {[
                    { label: "Overdue Invoice Chase", steps: 5, category: "recovery" },
                    { label: "Cold Lead Re-engagement", steps: 4, category: "growth" },
                    { label: "Churn Prevention", steps: 6, category: "retention" },
                  ].map(t => (
                    <button key={t.label} className="w-full flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left">
                      <div>
                        <p className="text-[11px] font-medium text-foreground">{t.label}</p>
                        <p className="text-[9px] text-muted-foreground">{t.steps} steps · {t.category}</p>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </SitaCard>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PlaybookBuilder;
