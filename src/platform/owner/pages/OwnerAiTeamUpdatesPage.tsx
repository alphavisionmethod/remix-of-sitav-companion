// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Team Updates Stream
// What shipped, what's blocked, what needs owner decision
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/platform/sita/components/sita/SitaCard";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Activity, CheckCircle, AlertTriangle, Clock, Eye, Cpu,
  ChevronLeft, Zap, Shield, DollarSign, Package,
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface UpdateEntry {
  id: string;
  type: "shipped" | "in-review" | "blocked" | "needs-decision" | "trust-sensitive" | "cost-sensitive";
  agent: string;
  title: string;
  description: string;
  timestamp: string;
}

const updates: UpdateEntry[] = [
  { id: "u1", type: "shipped", agent: "Schema Validator", title: "Schema migration v42 validated", description: "All 12 table schemas validated, zero breaking changes detected", timestamp: new Date(Date.now() - 1200000).toISOString() },
  { id: "u2", type: "needs-decision", agent: "Cost Sentinel", title: "Model routing optimization available", description: "Switching GPT-4 fallback to Claude 3.5 Sonnet could save $340/mo with 2% quality trade-off", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "u3", type: "blocked", agent: "Onboarding Guide", title: "Onboarding flow v3 blocked", description: "Waiting for brand asset approval from owner — carousel images need sign-off", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "u4", type: "trust-sensitive", agent: "Trust Auditor", title: "New RLS policy detected", description: "Auto-generated RLS for customer_data table — needs trust review before activation", timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: "u5", type: "in-review", agent: "Incident Responder", title: "Auto-remediation script prepared", description: "Connector timeout retry logic — simulation passed, awaiting canary deployment", timestamp: new Date(Date.now() - 28800000).toISOString() },
  { id: "u6", type: "cost-sensitive", agent: "Cost Sentinel", title: "Token budget at 78%", description: "Knowledge Curator consumed 54% of its weekly budget — throttling recommended in 2 days", timestamp: new Date(Date.now() - 43200000).toISOString() },
  { id: "u7", type: "shipped", agent: "Incident Responder", title: "Connector health check improved", description: "Added 3 new health probes for Plaid, Stripe, and QuickBooks connectors", timestamp: new Date(Date.now() - 86400000).toISOString() },
];

const typeStyles: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  "shipped": { icon: CheckCircle, bg: "bg-trust-verified/10", text: "text-trust-safe", label: "Shipped" },
  "in-review": { icon: Eye, bg: "bg-primary/10", text: "text-primary", label: "In Review" },
  "blocked": { icon: AlertTriangle, bg: "bg-destructive/10", text: "text-destructive", label: "Blocked" },
  "needs-decision": { icon: Zap, bg: "bg-accent/10", text: "text-accent", label: "Needs Decision" },
  "trust-sensitive": { icon: Shield, bg: "bg-primary/10", text: "text-primary", label: "Trust Sensitive" },
  "cost-sensitive": { icon: DollarSign, bg: "bg-accent/10", text: "text-accent", label: "Cost Sensitive" },
};

export default function OwnerAiTeamUpdatesPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-6">
<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card p-6"
      >
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/owner/ai-team")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sita-gold/10 shadow-lg shadow-sita-gold/10">
            <Activity className="h-7 w-7 text-sita-gold" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">AI Team Updates</h1>
            <p className="text-sm text-muted-foreground">What shipped, what's blocked, what needs your input</p>
          </div>
        </div>
      </motion.div>

      {/* Quick filter counts */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(typeStyles).map(([type, style]) => {
          const count = updates.filter(u => u.type === type).length;
          if (count === 0) return null;
          return (
            <Badge key={type} variant="outline" className={cn("text-[10px] cursor-pointer", style.bg, style.text)}>
              {style.label} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {updates.map((update, i) => {
          const style = typeStyles[update.type];
          const Icon = style.icon;
          return (
            <motion.div key={update.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <SitaCard hover>
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", style.bg)}>
                    <Icon className={cn("h-5 w-5", style.text)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-foreground">{update.title}</p>
                      <Badge variant="outline" className={cn("text-[9px]", style.bg, style.text)}>{style.label}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-1.5">{update.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />{update.agent}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(update.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  {(update.type === "needs-decision" || update.type === "blocked") && (
                    <button className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors">
                      Review
                    </button>
                  )}
                </div>
              </SitaCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
