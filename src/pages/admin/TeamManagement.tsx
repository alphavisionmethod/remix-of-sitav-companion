import { useAction } from "@/hooks/use-action";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Cpu, Pause, RotateCcw, Search, Plus, Pencil, Trash2,
  Clock, Shield, Brain, Users,
  MoreVertical, CheckCircle, AlertTriangle, XCircle, Sparkles, Play
} from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dbAny as db } from "@/lib/supabase-helpers";
import { fromTable } from "@/lib/supabase-helpers";
import { useConfirmation } from "@/hooks/use-confirmation";
import { ConfirmationDialog } from "@/components/sita/ConfirmationDialog";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

type AgentStatus = "active" | "idle" | "paused" | "degraded";

const statusConfig: Record<AgentStatus, { color: string; icon: React.ElementType; label: string }> = {
  active: { color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle, label: "Active" },
  idle: { color: "text-blue-500 bg-blue-500/10", icon: Clock, label: "Idle" },
  paused: { color: "text-amber-500 bg-amber-500/10", icon: Pause, label: "Paused" },
  degraded: { color: "text-red-500 bg-red-500/10", icon: AlertTriangle, label: "Degraded" },
};

interface AdvisorFormData {
  display_name: string;
  domain: string;
  advisor_type: string;
  trust_threshold: number;
  active: boolean;
  explanation_style: string;
  memory_scope: string;
}

const EMPTY_FORM: AdvisorFormData = {
  display_name: "",
  domain: "general",
  advisor_type: "reactive",
  trust_threshold: 0.7,
  active: true,
  explanation_style: "concise",
  memory_scope: "session",
};

export default function TeamManagement() {
  const [search, setSearch] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [formDialog, setFormDialog] = useState<{ open: boolean; mode: "create" | "edit"; data: AdvisorFormData; editId?: string }>({
    open: false, mode: "create", data: EMPTY_FORM,
  });
  const { confirmation, confirm } = useConfirmation();
  const qc = useQueryClient();

  // Real advisor registry data
  const { data: advisors = [] } = useQuery({
    queryKey: ["admin-advisor-registry"],
    queryFn: async () => {
      const { data, error } = await fromTable("advisor_registry").select("*").order("display_name");
      if (error) throw error;
      return data || [];
    },
  });

  // Real performance data
  const { data: perfData = [] } = useQuery({
    queryKey: ["admin-advisor-performance"],
    queryFn: async () => {
      const { data, error } = await fromTable("advisor_performance").select("*").order("total_calls", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Real token usage
  const { data: tokenUsage = [] } = useQuery({
    queryKey: ["admin-advisor-tokens-today"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await db.from("ai_token_usage")
        .select("advisor_id, input_tokens, output_tokens, cost_cents")
        .gte("created_at", today);
      if (error) throw error;
      return data || [];
    },
  });

  // ── Mutations ────────────────────────────────────
  const createAdvisor = useAction("admin", "advisor.create");

  const updateAdvisor = useAction("admin", "advisor.update", {
    invalidateKeys: [["admin-advisor-registry"]],
  });

  const toggleActive = useAction("admin", "advisor.toggle", {
    invalidateKeys: [["admin-advisor-registry"]],
  });

  const deleteAdvisor = useAction("admin", "advisor.delete", {
    invalidateKeys: [["admin-advisor-registry"]],
  });

  // Build merged agent list from registry + performance + token usage
  const perfMap = new Map(perfData.map(p => [p.advisor_id, p]));
  const tokenMap = new Map<string, { tokens: number; cost: number }>();
  tokenUsage.forEach(t => {
    const existing = tokenMap.get(t.advisor_id) || { tokens: 0, cost: 0 };
    existing.tokens += (t.input_tokens || 0) + (t.output_tokens || 0);
    existing.cost += Number(t.cost_cents) || 0;
    tokenMap.set(t.advisor_id, existing);
  });

  const agents = advisors.map(a => {
    const perf = perfMap.get(a.advisor_type) || perfMap.get(a.id);
    const tokens = tokenMap.get(a.advisor_type) || tokenMap.get(a.id) || { tokens: 0, cost: 0 };
    const perfRec = perf as Record<string, unknown> | undefined;
    const status: AgentStatus = !a.active ? "paused" : (perfRec && Number(perfRec.avg_satisfaction) < 70) ? "degraded" : (tokens.tokens > 0 ? "active" : "idle");
    return {
      id: a.id,
      name: a.display_name,
      domain: a.domain,
      advisorType: a.advisor_type,
      status,
      satisfaction: Number(perfRec?.avg_satisfaction) || 0,
      totalCalls: Number(perfRec?.total_calls) || 0,
      tokensToday: tokens.tokens,
      costToday: tokens.cost,
      trustThreshold: Number(a.trust_threshold),
      active: a.active,
      explanationStyle: a.explanation_style,
      memoryScope: a.memory_scope,
    };
  });

  // If no advisors in registry, show built-in advisor types from performance data
  const builtInAdvisors = perfData.filter(p => !advisors.some(a => a.advisor_type === p.advisor_id)).map(p => {
    const tokens = tokenMap.get(p.advisor_id) || { tokens: 0, cost: 0 };
    return {
      id: p.id,
      name: p.advisor_id.charAt(0).toUpperCase() + p.advisor_id.slice(1) + " Advisor",
      domain: p.advisor_id,
      advisorType: p.advisor_id,
      status: (tokens.tokens > 0 ? "active" : "idle") as AgentStatus,
      satisfaction: Number(p.avg_satisfaction) || 0,
      totalCalls: p.total_calls || 0,
      tokensToday: tokens.tokens,
      costToday: tokens.cost,
      trustThreshold: 0.7,
      active: true,
      explanationStyle: "concise",
      memoryScope: "session",
    };
  });

  const allAgents = [...agents, ...builtInAdvisors];

  const filtered = allAgents.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.domain.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalActive = allAgents.filter(a => a.status === "active").length;
  const totalDegraded = allAgents.filter(a => a.status === "degraded").length;
  const avgSatisfaction = allAgents.length ? Math.round(allAgents.reduce((s, a) => s + a.satisfaction, 0) / allAgents.length) : 0;

  const selected = selectedAdvisor ? allAgents.find(a => a.id === selectedAdvisor) : null;

  const openEditDialog = (agent: typeof allAgents[0]) => {
    setFormDialog({
      open: true,
      mode: "edit",
      editId: agent.id,
      data: {
        display_name: agent.name,
        domain: agent.domain,
        advisor_type: agent.advisorType,
        trust_threshold: agent.trustThreshold,
        active: agent.active,
        explanation_style: agent.explanationStyle || "concise",
        memory_scope: agent.memoryScope || "session",
      },
    });
  };

  const handleDelete = async (agent: typeof allAgents[0]) => {
    const ok = await confirm({
      title: `Delete "${agent.name}"?`,
      description: "This advisor will be permanently removed from the registry. This cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
      requireTypedConfirmation: agent.name,
    });
    if (ok) deleteAdvisor.mutate({ id: agent.id });
  };

  const handleFormSubmit = () => {
    if (!formDialog.data.display_name.trim()) {
      toast.error("Display name is required");
      return;
    }
    if (formDialog.mode === "create") {
      createAdvisor.mutate(formDialog.data as unknown as Record<string, unknown>);
    } else if (formDialog.editId) {
      updateAdvisor.mutate({ id: formDialog.editId, ...formDialog.data } as Record<string, unknown>);
    }
  };

  const updateForm = (patch: Partial<AdvisorFormData>) => {
    setFormDialog(prev => ({ ...prev, data: { ...prev.data, ...patch } }));
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
<ConfirmationDialog state={confirmation} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" /> AI Team Management
          </h1>
          <p className="text-sm text-muted-foreground">Monitor and manage your AI advisor team — live data</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {allAgents.length} advisors · {totalActive} active
          </Badge>
          <Button size="sm" onClick={() => setFormDialog({ open: true, mode: "create", data: EMPTY_FORM })}>
            <Plus className="h-4 w-4 mr-1" /> Add Advisor
          </Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div variants={fadeUp}>
          <Card><CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{allAgents.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Advisors</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card><CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-500">{totalActive}</p>
            <p className="text-xs text-muted-foreground mt-1">Active Now</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card><CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{avgSatisfaction || "—"}%</p>
            <p className="text-xs text-muted-foreground mt-1">Avg Satisfaction</p>
          </CardContent></Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card className={totalDegraded > 0 ? "border-red-500/20" : ""}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${totalDegraded > 0 ? "text-red-500" : "text-foreground"}`}>{totalDegraded}</p>
              <p className="text-xs text-muted-foreground mt-1">Degraded</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search advisors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Tabs defaultValue="grid">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">
              No advisors found. Click "Add Advisor" to create one, or advisors will appear once they handle requests.
            </CardContent></Card>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(agent => {
                const sc = statusConfig[agent.status];
                return (
                  <motion.div key={agent.id} variants={fadeUp}>
                    <Card className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedAdvisor(agent.id)}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${sc.color}`}>
                              <sc.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                              <p className="text-[10px] text-muted-foreground capitalize">{agent.domain}</p>
                            </div>
                          </div>
                          <Badge className={sc.color} variant="secondary">{sc.label}</Badge>
                        </div>

                        {agent.satisfaction > 0 && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Satisfaction</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Progress value={agent.satisfaction} className="h-1.5 flex-1" />
                                <span className="font-medium text-foreground">{agent.satisfaction}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Calls</p>
                              <span className="font-medium text-foreground">{agent.totalCalls}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-2">
                          <span>{agent.tokensToday.toLocaleString()} tokens today</span>
                          <span>${(agent.costToday / 100).toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-6 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                  <span className="col-span-2">Advisor</span>
                  <span>Status</span>
                  <span>Satisfaction</span>
                  <span>Calls</span>
                  <span>Tokens</span>
                </div>
                {filtered.map(agent => {
                  const sc = statusConfig[agent.status];
                  return (
                    <div key={agent.id} className="grid grid-cols-6 items-center text-xs py-2 hover:bg-muted/30 rounded px-1">
                      <div className="col-span-2 flex items-center gap-2">
                        <div className={`p-1 rounded ${sc.color}`}><sc.icon className="h-3 w-3" /></div>
                        <div>
                          <p className="font-medium text-foreground">{agent.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{agent.domain}</p>
                        </div>
                      </div>
                      <Badge className={sc.color} variant="secondary">{sc.label}</Badge>
                      <span className={agent.satisfaction >= 90 ? "text-emerald-500 font-medium" : "text-foreground"}>{agent.satisfaction || "—"}%</span>
                      <span className="text-foreground">{agent.totalCalls}</span>
                      <span className="text-muted-foreground">{agent.tokensToday.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Panel */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg p-4">
          <Card className="shadow-2xl border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{selected.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAdvisor(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="capitalize">{selected.domain} · Trust: {(selected.trustThreshold * 100).toFixed(0)}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-lg font-bold text-foreground">{selected.satisfaction || "—"}%</p><p className="text-[10px] text-muted-foreground">Satisfaction</p></div>
                <div><p className="text-lg font-bold text-foreground">{selected.totalCalls}</p><p className="text-[10px] text-muted-foreground">Total Calls</p></div>
                <div><p className="text-lg font-bold text-foreground">{selected.tokensToday.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Tokens Today</p></div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm" className="flex-1"
                  onClick={(e) => { e.stopPropagation(); toggleActive.mutate({ id: selected.id, active: !selected.active }); }}
                >
                  {selected.active ? <><Pause className="h-3.5 w-3.5 mr-1.5" /> Pause</> : <><Play className="h-3.5 w-3.5 mr-1.5" /> Activate</>}
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); openEditDialog(selected); }}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(selected); }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formDialog.open} onOpenChange={(open) => !open && setFormDialog(prev => ({ ...prev, open: false }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{formDialog.mode === "create" ? "Add New Advisor" : "Edit Advisor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Display Name</Label>
              <Input value={formDialog.data.display_name} onChange={e => updateForm({ display_name: e.target.value })} placeholder="e.g. Finance Advisor" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Domain</Label>
                <Select value={formDialog.data.domain} onValueChange={v => updateForm({ domain: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{([] as never[]).map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Advisor Type</Label>
                <Select value={formDialog.data.advisor_type} onValueChange={v => updateForm({ advisor_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{([] as never[]).map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Trust Threshold ({Math.round(formDialog.data.trust_threshold * 100)}%)</Label>
                <Input type="range" min="0" max="1" step="0.05" value={formDialog.data.trust_threshold} onChange={e => updateForm({ trust_threshold: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Explanation Style</Label>
                <Select value={formDialog.data.explanation_style} onValueChange={v => updateForm({ explanation_style: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="step-by-step">Step by Step</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formDialog.data.active} onCheckedChange={v => updateForm({ active: v })} />
              <Label className="text-xs">Active on creation</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button onClick={handleFormSubmit} disabled={createAdvisor.isPending || updateAdvisor.isPending}>
              {formDialog.mode === "create" ? "Create Advisor" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
