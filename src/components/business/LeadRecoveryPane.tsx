// ═══════════════════════════════════════════════════════════════
// Lead Recovery Detail Pane — Right panel for ModuleWorkspace
// ═══════════════════════════════════════════════════════════════

import { Bot, Phone, Mail, Linkedin, Send, Zap, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ColdLead {
  name: string;
  company: string;
  lastTouch: string;
  value: string;
  reason: string;
  recoveryScore: number;
  suggestedChannel: string;
  aiMessage: string;
}

interface LeadRecoveryPaneProps {
  lead: ColdLead | null;
}

const channelIcon: Record<string, typeof Mail> = {
  "Phone call": Phone,
  "Email": Mail,
  "LinkedIn": Linkedin,
};

export function LeadRecoveryPane({ lead }: LeadRecoveryPaneProps) {
  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Select a lead</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Click on a cold lead to see recovery options</p>
      </div>
    );
  }

  const ChannelIcon = channelIcon[lead.suggestedChannel] || Mail;
  const scoreColor = lead.recoveryScore >= 80 ? "text-chart-2 border-chart-2" : lead.recoveryScore >= 60 ? "text-amber-500 border-amber-500" : "text-destructive border-destructive";

  return (
    <div className="space-y-4">
      {/* Lead Identity */}
      <div className="rounded-xl border border-border/30 bg-[hsl(0_0%_100%/0.03)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {lead.name.split(" ").map(w => w[0]).join("")}
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">{lead.name}</h3>
            <p className="text-xs text-muted-foreground">{lead.company}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deal Value</p>
            <p className="text-lg font-bold text-foreground">{lead.value}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recovery Score</p>
            <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-full border-2 text-sm font-bold", scoreColor)}>
              {lead.recoveryScore}%
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Last contact:</span>
            <span className="text-foreground">{lead.lastTouch}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="text-amber-500">{lead.reason}</span>
          </div>
        </div>
      </div>

      {/* AI-Generated Recovery Message */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-[11px] font-semibold mb-2 flex items-center gap-1.5">
          <Bot className="h-3 w-3 text-primary" /> AI Recovery Message
          <span className="ml-auto text-[9px] text-muted-foreground flex items-center gap-1">
            <ChannelIcon className="h-2.5 w-2.5" /> {lead.suggestedChannel}
          </span>
        </p>
        <div className="rounded-lg bg-card p-3 border border-border/30 text-xs text-muted-foreground italic leading-relaxed">
          "{lead.aiMessage}"
        </div>
        <div className="flex gap-2 mt-3">
          <button className="text-[10px] bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Send className="h-3 w-3 inline mr-1" />Send This
          </button>
          <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">
            Edit & Send
          </button>
          <button className="text-[10px] bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-primary/20 transition-colors">
            Add to Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
