import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Play, Pause, Plus, Clock, Users, Mail, AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const WORKFLOW_TEMPLATES = [
  { id: "w1", title: "New Lead → Assign Owner + Follow-Up", description: "Auto-assign and create a follow-up task when a new lead is imported", trigger: "New contact with stage 'lead'", icon: Users, status: "active", runs: 24 },
  { id: "w2", title: "No Contact in 14 Days → Reminder", description: "Create a reminder when a contact hasn't been reached in 14 days", trigger: "Contact inactivity > 14 days", icon: Clock, status: "active", runs: 18 },
  { id: "w3", title: "Quote Sent, No Response → Follow-Up", description: "Suggest follow-up when a quote goes unanswered for 5 days", trigger: "Quote unanswered > 5 days", icon: Mail, status: "paused", runs: 7 },
  { id: "w4", title: "Invoice Overdue → Collections Action", description: "Surface collections action when invoice passes due date", trigger: "Invoice past due", icon: AlertTriangle, status: "active", runs: 3 },
  { id: "w5", title: "Health Below 30 → Escalate to Advisor", description: "Alert advisor board when contact health drops critically", trigger: "Health score < 30", icon: Shield, status: "active", runs: 1 },
  { id: "w6", title: "Large Deal Stalled → Boardroom Candidate", description: "Escalate to Business Boardroom when high-value deal stalls 14+ days", trigger: "Opportunity > $50K stalled > 14 days", icon: TrendingUp, status: "paused", runs: 0 },
];

const CRMAutomations = () => {
  return (
    <div className="space-y-6">
      <PageTruthBanner truthState="demo" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Automations & Workflows</h2>
          <p className="text-xs text-muted-foreground">Trust-aware automation for your CRM</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New Workflow</Button>
      </div>

      <div className="grid gap-3">
        {WORKFLOW_TEMPLATES.map(w => (
          <Card key={w.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${w.status === "active" ? "bg-green-500/10" : "bg-muted/50"}`}>
                  <w.icon className={`h-5 w-5 ${w.status === "active" ? "text-green-400" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{w.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${w.status === "active" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {w.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{w.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {w.trigger}</span>
                    <span>{w.runs} runs</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  {w.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CRMAutomations;
