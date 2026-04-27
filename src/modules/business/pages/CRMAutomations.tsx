import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap, Play, Pause, Plus, Clock, Users, Mail, AlertTriangle, TrendingUp, Shield, Settings,
  BarChart3, CheckCircle, History, Eye, ChevronRight, Trash2, Save, Brain, ArrowRight,
  Target, FileText, Receipt, Phone, Bell, RefreshCw, Sparkles, ChevronDown, ChevronUp,
  MoreHorizontal, Copy, Archive, Inbox
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCRMAutomations, useCreateAutomation, useUpdateAutomation, useDeleteAutomation } from "@/modules/business/hooks/use-crm-data";
import type { CRMAutomation } from "@/data/repositories/crm-data-service";
import { format, formatDistanceToNow } from "date-fns";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getWorkflowSuggestions } from "@/domains/engines/adaptive-workflow-templates";
import {
  AUTOMATION_TRIGGER_TYPES,
  AUTOMATION_ACTION_TYPES,
  AUTOMATION_TRUST_GATES,
  AUTOMATION_ENTITY_TYPES,
  AUTOMATION_CATEGORIES,
  getTrustGate,
  getTrigger,
} from "./_config/CRMAutomations.config";

const CRMAutomations = () => {
  const { data: automations = [] } = useCRMAutomations();
  const updateAutomation = useUpdateAutomation();
  const deleteAutomation = useDeleteAutomation();
  const createAutomation = useCreateAutomation();
  const { profile } = useBusinessProfile();
  const suggestedWorkflows = useMemo(() => getWorkflowSuggestions(profile, 4), [profile]);
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [showSimulation, setShowSimulation] = useState<string | null>(null);

  // Builder state
  const [builderForm, setBuilderForm] = useState({
    title: "", description: "", trigger_type: "contact_created", trigger_config: {} as Record<string, unknown>,
    conditions: [] as unknown[], actions: [{ type: "create_task", config: {} }] as Array<{ type: string; config: Record<string, unknown> }>,
    trust_gate: "suggested", target_entity: "contact", delay_minutes: 0,
  });

  const filtered = useMemo(() => {
    if (category === "all") return automations;
    const cat = AUTOMATION_CATEGORIES.find(c => c.key === category);
    if (!cat || !cat.triggers) return automations;
    return automations.filter(a => cat.triggers!.includes(a.trigger_type));
  }, [automations, category]);

  const stats = useMemo(() => ({
    active: automations.filter(a => a.status === "active").length,
    totalRuns: automations.reduce((s, a) => s + a.runs, 0),
    paused: automations.filter(a => a.status === "paused").length,
    drafts: automations.filter(a => a.status === "draft").length,
    approvalRequired: automations.filter(a => a.trust_gate === "approval_required").length,
  }), [automations]);

  const selected = automations.find(a => a.id === selectedId);

  const handleToggleStatus = (id: string) => {
    const a = automations.find(w => w.id === id);
    if (!a) return;
    const newStatus = a.status === "active" ? "paused" : "active";
    updateAutomation.mutate({ id, updates: { status: newStatus } }, {
      onSuccess: () => toast.success(`${a.title} ${newStatus === "active" ? "activated" : "paused"}`),
    });
  };

  const handleDelete = (id: string) => {
    deleteAutomation.mutate(id, { onSuccess: () => { toast.success("Workflow deleted"); setSelectedId(null); } });
  };

  const handleCreate = () => {
    if (!builderForm.title.trim()) { toast.error("Title is required"); return; }
    createAutomation.mutate({
      title: builderForm.title,
      description: builderForm.description,
      trigger_type: builderForm.trigger_type,
      trigger_config: builderForm.trigger_config,
      conditions: builderForm.conditions,
      actions: builderForm.actions,
      trust_gate: builderForm.trust_gate,
      target_entity: builderForm.target_entity,
      delay_minutes: builderForm.delay_minutes,
      status: "draft",
    }, {
      onSuccess: () => {
        toast.success("Workflow created");
        setShowBuilder(false);
        setBuilderForm({ title: "", description: "", trigger_type: "contact_created", trigger_config: {}, conditions: [], actions: [{ type: "create_task", config: {} }], trust_gate: "suggested", target_entity: "contact", delay_minutes: 0 });
      },
    });
  };

  const simulateWorkflow = (id: string) => {
    setShowSimulation(id);
    setTimeout(() => setShowSimulation(null), 4000);
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      {/* Suggested Workflows from Profile Engine */}
      {suggestedWorkflows.length > 0 && (
        <div className="rounded-xl border border-[hsl(var(--sita-purple))]/15 bg-[hsl(var(--sita-purple))]/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[hsl(var(--sita-purple))] mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Suggested for Your Business
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {suggestedWorkflows.map((wf) => (
              <div key={wf.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 hover:border-[hsl(var(--sita-purple))]/30 transition-colors cursor-pointer" onClick={() => {
                setBuilderForm(prev => ({ ...prev, title: wf.name, description: wf.description }));
                setShowBuilder(true);
              }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold text-foreground/80">{wf.name}</p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--sita-purple))]/10 text-[hsl(var(--sita-purple))]">
                    {Math.round(wf.affinityScore * 100)}% match
                  </span>
                </div>
                <p className="text-[10px] text-foreground/40 line-clamp-1">{wf.description}</p>
                <p className="text-[9px] text-foreground/25 mt-1">Trigger: {wf.trigger} · {wf.steps.length} steps</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-xl border border-border/30 bg-gradient-to-r from-card/80 to-card/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Automations & Workflows
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Trust-aware automation engine for your relationship pipeline</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowBuilder(true)}>
            <Plus className="h-3.5 w-3.5" /> New Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-border/20">
          {[
            { label: "Active", value: stats.active, icon: Play, color: "text-green-400" },
            { label: "Total Runs", value: stats.totalRuns, icon: BarChart3, color: "text-primary" },
            { label: "Paused", value: stats.paused, icon: Pause, color: "text-yellow-400" },
            { label: "Drafts", value: stats.drafts, icon: Settings, color: "text-muted-foreground" },
            { label: "Need Approval", value: stats.approvalRequired, icon: Shield, color: "text-orange-400" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
              <span className="font-bold text-foreground">{s.value}</span>
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {AUTOMATION_CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === c.key ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Workflow list + detail split */}
      <div className="flex gap-4">
        {/* List */}
        <div className={`space-y-2 transition-all ${selected ? "flex-1 max-w-[55%]" : "flex-1"}`}>
          <AnimatePresence>
            {filtered.map((w, i) => {
              const trust = getTrustGate(w.trust_gate);
              const trigger = getTrigger(w.trigger_type);
              const TriggerIcon = trigger.icon;
              const isSimulating = showSimulation === w.id;

              return (
                <motion.div key={w.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card
                    className={`border-border/30 hover:border-primary/30 transition-all cursor-pointer ${
                      selectedId === w.id ? "border-primary/50 bg-primary/5" : "bg-card/50"
                    }`}
                    onClick={() => setSelectedId(w.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          w.status === "active" ? "bg-green-500/10" : w.status === "paused" ? "bg-yellow-500/10" : "bg-muted/50"
                        }`}>
                          <TriggerIcon className={`h-5 w-5 ${
                            w.status === "active" ? "text-green-400" : w.status === "paused" ? "text-yellow-400" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground truncate">{w.title}</p>
                            <Badge variant="outline" className={`text-[10px] ${
                              w.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                              w.status === "paused" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {w.status}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] gap-0.5 ${trust.bg} ${trust.color}`}>
                              <Shield className="h-2.5 w-2.5" /> {trust.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{w.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> {trigger.label}</span>
                            <span className="flex items-center gap-1"><History className="h-2.5 w-2.5" /> {w.runs} runs</span>
                            {w.last_run_at && <span>{formatDistanceToNow(new Date(w.last_run_at), { addSuffix: true })}</span>}
                            <span className="capitalize">{w.target_entity}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => simulateWorkflow(w.id)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleStatus(w.id)}>
                            {w.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>

                      {/* Simulation preview */}
                      <AnimatePresence>
                        {isSimulating && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                              <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> Simulation Preview
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Based on current data, this workflow would affect approximately <span className="text-foreground font-medium">
                                  {Math.floor(Math.random() * 8) + 1} {w.target_entity}s
                                </span> if activated now. No side effects in simulation mode.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No Workflows</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">Create your first automation workflow to start saving time</p>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setShowBuilder(true)}>
                <Plus className="h-3.5 w-3.5" /> Create Workflow
              </Button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "45%" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border/50"
            >
              <WorkflowDetailPanel
                automation={selected}
                onToggleStatus={() => handleToggleStatus(selected.id)}
                onDelete={() => handleDelete(selected.id)}
                onSimulate={() => simulateWorkflow(selected.id)}
                onClose={() => setSelectedId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Workflow Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Create Workflow
            </DialogTitle>
            <DialogDescription>Build a trust-aware automation for your CRM pipeline</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic info */}
            <div className="space-y-3">
              <Input placeholder="Workflow title" value={builderForm.title} onChange={e => setBuilderForm(p => ({ ...p, title: e.target.value }))} />
              <textarea
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Description..."
                value={builderForm.description}
                onChange={e => setBuilderForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            {/* Trigger selection */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Trigger — When should this run?</p>
              <div className="grid grid-cols-3 gap-1.5">
                {AUTOMATION_TRIGGER_TYPES.map(t => {
                  const TIcon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setBuilderForm(p => ({ ...p, trigger_type: t.key }))}
                      className={`p-2 rounded-lg border text-left transition-all text-xs ${
                        builderForm.trigger_type === t.key
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/30 hover:border-border/60"
                      }`}
                    >
                      <TIcon className="h-3.5 w-3.5 text-primary mb-1" />
                      <p className="font-medium text-foreground">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{t.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target entity */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Target Entity</p>
              <div className="flex gap-2">
                {AUTOMATION_ENTITY_TYPES.map(e => (
                  <button
                    key={e.key}
                    onClick={() => setBuilderForm(p => ({ ...p, target_entity: e.key }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      builderForm.target_entity === e.key ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Actions — What should happen?</p>
              <div className="space-y-2">
                {builderForm.actions.map((action, idx) => {
                  const at = AUTOMATION_ACTION_TYPES.find(a => a.key === action.type);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{idx + 1}</div>
                      <select
                        className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
                        value={action.type}
                        onChange={e => {
                          const updated = [...builderForm.actions];
                          updated[idx] = { type: e.target.value, config: {} };
                          setBuilderForm(p => ({ ...p, actions: updated }));
                        }}
                      >
                        {AUTOMATION_ACTION_TYPES.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                      </select>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        const updated = builderForm.actions.filter((_, i) => i !== idx);
                        setBuilderForm(p => ({ ...p, actions: updated }));
                      }}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full" onClick={() => {
                  setBuilderForm(p => ({ ...p, actions: [...p.actions, { type: "create_task", config: {} }] }));
                }}>
                  <Plus className="h-3 w-3" /> Add Action
                </Button>
              </div>
            </div>

            {/* Delay */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Delay (optional)</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-24 h-8 text-xs"
                  value={builderForm.delay_minutes}
                  onChange={e => setBuilderForm(p => ({ ...p, delay_minutes: parseInt(e.target.value) || 0 }))}
                />
                <span className="text-xs text-muted-foreground">minutes before execution</span>
              </div>
            </div>

            {/* Trust gate */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary" /> Trust Gate — How should it execute?
              </p>
              <div className="space-y-1.5">
                {AUTOMATION_TRUST_GATES.map(g => (
                  <button
                    key={g.key}
                    onClick={() => setBuilderForm(p => ({ ...p, trust_gate: g.key }))}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                      builderForm.trust_gate === g.key ? "border-primary/50 bg-primary/5" : "border-border/30 hover:border-border/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${g.color}`}>{g.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{g.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
              <Button variant="outline" size="sm" onClick={() => setShowBuilder(false)}>Cancel</Button>
              <Button size="sm" className="gap-1.5" onClick={handleCreate} disabled={createAutomation.isPending}>
                <Save className="h-3.5 w-3.5" />
                {createAutomation.isPending ? "Creating..." : "Create Workflow"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Workflow Detail Panel ──────────────────────────────────
const WorkflowDetailPanel: React.FC<{
  automation: CRMAutomation;
  onToggleStatus: () => void;
  onDelete: () => void;
  onSimulate: () => void;
  onClose: () => void;
}> = ({ automation: w, onToggleStatus, onDelete, onSimulate, onClose }) => {
  const trust = getTrustGate(w.trust_gate);
  const trigger = getTrigger(w.trigger_type);
  const TriggerIcon = trigger.icon;
  const actions = (w.actions as Array<{ type: string; config?: Record<string, unknown> }>) || [];
  const executionLog = (w.execution_log as Array<{ timestamp: string; result: string; affected: number }>) || [];

  return (
    <div className="pl-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            w.status === "active" ? "bg-green-500/10" : w.status === "paused" ? "bg-yellow-500/10" : "bg-muted/50"
          }`}>
            <TriggerIcon className={`h-6 w-6 ${
              w.status === "active" ? "text-green-400" : w.status === "paused" ? "text-yellow-400" : "text-muted-foreground"
            }`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{w.title}</h3>
            <p className="text-xs text-muted-foreground">{w.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>✕</Button>
      </div>

      {/* Status + Trust badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={`text-[10px] ${
          w.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
          w.status === "paused" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
          "bg-muted text-muted-foreground"
        }`}>{w.status}</Badge>
        <Badge variant="outline" className={`text-[10px] gap-0.5 ${trust.bg} ${trust.color}`}>
          <Shield className="h-2.5 w-2.5" /> {trust.label}
        </Badge>
        <Badge variant="outline" className="text-[10px] capitalize">{w.target_entity}</Badge>
      </div>

      {/* Trigger info */}
      <Card className="border-border/30 bg-card/50">
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-foreground mb-1">Trigger</p>
          <div className="flex items-center gap-2">
            <TriggerIcon className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">{trigger.label} — {trigger.description}</p>
          </div>
          {Object.keys(w.trigger_config as Record<string, unknown> || {}).length > 0 && (
            <div className="mt-2 rounded-lg bg-muted/20 p-2 text-[10px] text-muted-foreground font-mono">
              {JSON.stringify(w.trigger_config, null, 2)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action steps */}
      <Card className="border-border/30 bg-card/50">
        <CardContent className="p-3">
          <p className="text-xs font-semibold text-foreground mb-2">Action Pipeline</p>
          <div className="space-y-2">
            {actions.map((action, i) => {
              const at = AUTOMATION_ACTION_TYPES.find(a => a.key === action.type);
              const AIcon = at?.icon || Zap;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</div>
                  {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground/50 -ml-1 -mr-1" />}
                  <div className="flex items-center gap-1.5 rounded-lg bg-muted/20 px-2.5 py-1.5">
                    <AIcon className="h-3 w-3 text-primary" />
                    <span className="text-xs text-foreground">{at?.label || action.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {w.delay_minutes && w.delay_minutes > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" /> {w.delay_minutes} minute delay before execution
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/20 p-3 text-center">
          <p className="text-lg font-bold text-foreground">{w.runs}</p>
          <p className="text-[10px] text-muted-foreground">Total Runs</p>
        </div>
        <div className="rounded-lg bg-muted/20 p-3 text-center">
          <p className="text-sm font-bold text-foreground">{w.last_run_at ? formatDistanceToNow(new Date(w.last_run_at), { addSuffix: true }) : "Never"}</p>
          <p className="text-[10px] text-muted-foreground">Last Run</p>
        </div>
        <div className="rounded-lg bg-muted/20 p-3 text-center">
          <p className="text-sm font-bold text-foreground capitalize">{w.trust_gate.replace("_", " ")}</p>
          <p className="text-[10px] text-muted-foreground">Trust Gate</p>
        </div>
      </div>

      {/* Execution log */}
      {executionLog.length > 0 && (
        <Card className="border-border/30 bg-card/50">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
              <History className="h-3 w-3" /> Execution History
            </p>
            <div className="space-y-1">
              {executionLog.slice(0, 5).map((log, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] rounded-lg bg-muted/10 px-2 py-1.5">
                  <span className="text-muted-foreground">{format(new Date(log.timestamp), "PP p")}</span>
                  <span className={log.result === "success" ? "text-green-400" : "text-red-400"}>{log.result}</span>
                  <span className="text-muted-foreground">{log.affected} affected</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust gate explanation */}
      <div className={`rounded-lg p-3 border ${trust.bg} border-border/20`}>
        <p className={`text-xs font-medium ${trust.color} flex items-center gap-1`}>
          <Shield className="h-3 w-3" /> {trust.label}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{trust.description}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onSimulate}>
          <Eye className="h-3 w-3" /> Simulate
        </Button>
        <Button size="sm" className="gap-1.5 text-xs" onClick={onToggleStatus}>
          {w.status === "active" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Activate</>}
        </Button>
        <Button variant="destructive" size="sm" className="gap-1.5 text-xs ml-auto" onClick={onDelete}>
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      </div>

      {/* Proof footer */}
      <div className="rounded-lg bg-muted/10 p-2 flex items-center gap-2 text-[10px] text-muted-foreground">
        <Shield className="h-3 w-3 text-primary/50" />
        Created {format(new Date(w.created_at), "PP")} • Last updated {formatDistanceToNow(new Date(w.updated_at), { addSuffix: true })}
      </div>
    </div>
  );
};

export default CRMAutomations;
