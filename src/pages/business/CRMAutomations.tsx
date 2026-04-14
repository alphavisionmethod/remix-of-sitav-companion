import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Zap, Play, Pause, Plus, Clock, Users, Mail, AlertTriangle, TrendingUp, Shield, Settings, BarChart3, CheckCircle, History, Eye, ChevronRight } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Workflow {
  id: string;
  title: string;
  description: string;
  trigger: string;
  icon: any;
  status: "active" | "paused" | "draft";
  runs: number;
  lastRun: string | null;
  category: "engagement" | "pipeline" | "health" | "escalation";
  trustGate: "auto" | "review" | "approval";
  steps: string[];
}

const WORKFLOW_TEMPLATES: Workflow[] = [
  {
    id: "w1", title: "New Lead → Assign + Follow-Up", description: "Auto-assign owner and create follow-up task when a new lead is imported or created",
    trigger: "New contact with stage 'lead'", icon: Users, status: "active", runs: 24, lastRun: "2h ago", category: "engagement", trustGate: "auto",
    steps: ["Detect new lead", "Assign to round-robin owner", "Create follow-up task (3 days)", "Log activity"],
  },
  {
    id: "w2", title: "14-Day Silence → Follow-Up Reminder", description: "Create a reminder when any contact hasn't been reached in 14 days",
    trigger: "Contact inactivity > 14 days", icon: Clock, status: "active", runs: 18, lastRun: "5h ago", category: "engagement", trustGate: "auto",
    steps: ["Scan contacts daily", "Check last_contacted_at", "Create urgent task", "Notify advisor"],
  },
  {
    id: "w3", title: "Quote No Response → Auto Follow-Up", description: "Suggest follow-up when a sent quote goes unanswered for 5 days",
    trigger: "Quote unanswered > 5 days", icon: Mail, status: "paused", runs: 7, lastRun: "2d ago", category: "pipeline", trustGate: "review",
    steps: ["Monitor quote status", "Wait 5 days", "Draft follow-up email", "Queue for review"],
  },
  {
    id: "w4", title: "Invoice Overdue → Collections", description: "Surface collections action when invoice passes due date",
    trigger: "Invoice past due", icon: AlertTriangle, status: "active", runs: 3, lastRun: "1d ago", category: "pipeline", trustGate: "approval",
    steps: ["Monitor invoice due dates", "Create collections task", "Notify account owner", "Escalate if 30+ days"],
  },
  {
    id: "w5", title: "Health < 30 → Advisor Alert", description: "Alert advisor board when contact health drops to critical level",
    trigger: "Health score < 30", icon: Shield, status: "active", runs: 1, lastRun: "3d ago", category: "health", trustGate: "auto",
    steps: ["Monitor health scores", "Detect threshold breach", "Create advisor insight", "Suggest recovery actions"],
  },
  {
    id: "w6", title: "Big Deal Stalled → Boardroom", description: "Escalate to Business Boardroom when high-value deal stalls 14+ days",
    trigger: "Opportunity > $50K stalled > 14 days", icon: TrendingUp, status: "draft", runs: 0, lastRun: null, category: "escalation", trustGate: "approval",
    steps: ["Monitor pipeline velocity", "Detect stall pattern", "Compile evidence", "Create boardroom item"],
  },
  {
    id: "w7", title: "Welcome Sequence → New Customer", description: "Trigger onboarding sequence when lead converts to customer",
    trigger: "Stage change to 'customer'", icon: CheckCircle, status: "active", runs: 12, lastRun: "12h ago", category: "engagement", trustGate: "auto",
    steps: ["Detect stage change", "Send welcome notification", "Create onboarding tasks", "Schedule check-in"],
  },
  {
    id: "w8", title: "Churn Risk → Recovery Campaign", description: "Initiate recovery workflow when customer shows churn signals",
    trigger: "Health declining + engagement drop", icon: AlertTriangle, status: "paused", runs: 5, lastRun: "1w ago", category: "health", trustGate: "review",
    steps: ["Detect engagement decline", "Calculate churn probability", "Draft recovery plan", "Assign relationship owner"],
  },
];

const CATEGORIES = [
  { key: "all", label: "All Workflows" },
  { key: "engagement", label: "Engagement" },
  { key: "pipeline", label: "Pipeline" },
  { key: "health", label: "Health" },
  { key: "escalation", label: "Escalation" },
];

const TRUST_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  auto: { bg: "bg-[hsl(var(--trust-safe))]/10", text: "text-[hsl(var(--trust-safe))]", label: "Auto-Execute" },
  review: { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Review First" },
  approval: { bg: "bg-destructive/10", text: "text-destructive", label: "Requires Approval" },
};

const CRMAutomations = () => {
  const [category, setCategory] = useState("all");
  const [workflows, setWorkflows] = useState(WORKFLOW_TEMPLATES);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);

  const filtered = category === "all" ? workflows : workflows.filter(w => w.category === category);
  const activeCount = workflows.filter(w => w.status === "active").length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.runs, 0);

  const toggleStatus = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w));
    const w = workflows.find(w => w.id === id);
    toast.success(`${w?.title} ${w?.status === "active" ? "paused" : "activated"}`);
  };

  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Automations & Workflows</h2>
          <p className="text-xs text-muted-foreground">Trust-aware automation for your CRM pipeline</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New Workflow</Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active", value: activeCount, icon: Play, color: "text-[hsl(var(--trust-safe))]" },
          { label: "Total Runs", value: totalRuns, icon: BarChart3, color: "text-primary" },
          { label: "Paused", value: workflows.filter(w => w.status === "paused").length, icon: Pause, color: "text-yellow-500" },
          { label: "Drafts", value: workflows.filter(w => w.status === "draft").length, icon: Settings, color: "text-muted-foreground" },
        ].map(s => (
          <Card key={s.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map(c => (
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

      {/* Workflow list */}
      <div className="grid gap-3">
        <AnimatePresence>
          {filtered.map(w => {
            const trust = TRUST_COLORS[w.trustGate];
            return (
              <motion.div key={w.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        w.status === "active" ? "bg-[hsl(var(--trust-safe))]/10" : w.status === "paused" ? "bg-yellow-500/10" : "bg-muted/50"
                      }`}>
                        <w.icon className={`h-5 w-5 ${
                          w.status === "active" ? "text-[hsl(var(--trust-safe))]" : w.status === "paused" ? "text-yellow-500" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{w.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            w.status === "active" ? "bg-[hsl(var(--trust-safe))]/20 text-[hsl(var(--trust-safe))]" :
                            w.status === "paused" ? "bg-yellow-500/20 text-yellow-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {w.status}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${trust.bg} ${trust.text}`}>
                            <Shield className="h-2.5 w-2.5 inline mr-0.5" />{trust.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{w.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {w.trigger}</span>
                          <span className="flex items-center gap-1"><History className="h-3 w-3" /> {w.runs} runs</span>
                          {w.lastRun && <span>{w.lastRun}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedWorkflow(w)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(w.id)}>
                          {w.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Workflow Detail Dialog */}
      <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWorkflow && <selectedWorkflow.icon className="h-5 w-5 text-primary" />}
              {selectedWorkflow?.title}
            </DialogTitle>
            <DialogDescription>{selectedWorkflow?.description}</DialogDescription>
          </DialogHeader>

          {selectedWorkflow && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TRUST_COLORS[selectedWorkflow.trustGate].bg} ${TRUST_COLORS[selectedWorkflow.trustGate].text}`}>
                  <Shield className="h-2.5 w-2.5 inline mr-0.5" />{TRUST_COLORS[selectedWorkflow.trustGate].label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  selectedWorkflow.status === "active" ? "bg-[hsl(var(--trust-safe))]/20 text-[hsl(var(--trust-safe))]" : "bg-muted text-muted-foreground"
                }`}>{selectedWorkflow.status}</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Workflow Steps</p>
                <div className="space-y-2">
                  {selectedWorkflow.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</div>
                      <div className="flex-1 h-px bg-border" />
                      <p className="text-xs text-foreground flex-[3]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/20 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{selectedWorkflow.runs}</p>
                  <p className="text-[10px] text-muted-foreground">Total Runs</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-3 text-center">
                  <p className="text-sm font-bold text-foreground">{selectedWorkflow.lastRun || "Never"}</p>
                  <p className="text-[10px] text-muted-foreground">Last Run</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => {
                  setShowSimulation(true);
                  setTimeout(() => setShowSimulation(false), 3000);
                }}>
                  <Eye className="h-3 w-3" /> Simulate
                </Button>
                <Button size="sm" className="gap-1.5 text-xs" onClick={() => {
                  toggleStatus(selectedWorkflow.id);
                  setSelectedWorkflow(null);
                }}>
                  {selectedWorkflow.status === "active" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Activate</>}
                </Button>
              </div>

              {showSimulation && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary mb-1">🔮 Simulation Preview</p>
                  <p className="text-[11px] text-muted-foreground">
                    Based on current data, this workflow would affect approximately <span className="text-foreground font-medium">3 contacts</span> if activated now.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMAutomations;
