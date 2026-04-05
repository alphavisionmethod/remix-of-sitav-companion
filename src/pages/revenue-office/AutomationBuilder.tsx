import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Workflow, Plus, Zap, GitBranch, Clock, Users, Mail, MessageSquare, CheckCircle, AlertTriangle, ArrowRight, ArrowDown, Settings } from "lucide-react";

const sampleNodes = [
  { id: 1, type: "trigger", label: "Lead enters 'Stale' status", icon: Zap, color: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  { id: 2, type: "condition", label: "Lead value > $500?", icon: GitBranch, color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  { id: 3, type: "delay", label: "Wait 2 hours", icon: Clock, color: "bg-purple-500/10 border-purple-500/30 text-purple-400" },
  { id: 4, type: "action", label: "Send recovery email", icon: Mail, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 5, type: "action", label: "Assign callback task", icon: Users, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 6, type: "condition", label: "Email opened within 24hrs?", icon: GitBranch, color: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  { id: 7, type: "action", label: "Send SMS follow-up", icon: MessageSquare, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { id: 8, type: "stop", label: "Move to 'Active' pipeline", icon: CheckCircle, color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
];

const nodeTypes = [
  { type: "Triggers", items: ["Form submitted", "Lead stage changed", "Appointment booked", "Quote sent", "Payment received", "Tag added", "Inactivity detected"] },
  { type: "Conditions", items: ["Lead value threshold", "Segment membership", "Email engagement", "Time since last contact", "Appointment outcome", "Pipeline stage"] },
  { type: "Actions", items: ["Send email", "Send SMS", "Create task", "Update CRM", "Move pipeline stage", "Assign owner", "Generate quote", "Request review", "Add to campaign"] },
  { type: "Controls", items: ["Wait/Delay", "Branch (if/else)", "A/B split", "Stop condition", "Escalate to human", "Require approval", "Retry on failure"] },
];

export default function AutomationBuilder() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automation Builder</h1>
          <p className="text-muted-foreground">Visual workflow editor — triggers, conditions, actions, timing, approvals, and branching</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"><Plus className="h-4 w-4" />New Automation</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Node Palette */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" />Node Palette</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {nodeTypes.map((nt) => (
                <div key={nt.type}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{nt.type}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {nt.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/10 transition-colors">{item}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trust Level Selector */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader><CardTitle className="text-sm">Automation Trust Level</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["Human only", "AI suggests, user does", "Draft for review", "AI prepares, human approves", "Auto-run under rules", "Escalate before high-impact"].map((level) => (
                <label key={level} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input type="radio" name="trust" className="accent-primary" defaultChecked={level === "Draft for review"} />
                  {level}
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Visual Flow */}
        <div className="md:col-span-2">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><Workflow className="h-4 w-4 text-blue-400" />Stale Lead Recovery Flow</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                  <Badge className="bg-blue-500/10 text-blue-400 text-[10px]">8 nodes</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {sampleNodes.map((node, i) => (
                  <div key={node.id}>
                    <div className={`p-3 rounded-lg border ${node.color} flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity`}>
                      <node.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{node.label}</p>
                        <p className="text-[10px] opacity-70">{node.type}</p>
                      </div>
                    </div>
                    {i < sampleNodes.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowDown className="h-3 w-3 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-border/30">
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Simulate</button>
                <button className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Save Draft</button>
                <button className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium">Activate</button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
