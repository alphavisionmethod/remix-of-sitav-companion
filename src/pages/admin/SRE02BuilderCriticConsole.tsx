// ═══════════════════════════════════════════════════════════════
// SITA OS — SRE02: Dual-AI Builder/Critic Console
// Builder proposals, Critic attacks, Arbiter decisions
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Swords, Brain, Shield, CheckCircle2, XCircle, AlertTriangle, Scale,
  MessageSquare, Lightbulb, Bug, Zap, Lock, RotateCcw
} from "lucide-react";
import { getBuilderCriticExchanges, type BuilderCriticExchange, type CriticAttack } from "@/lib/services/engineering-governance";

const ATTACK_ICON: Record<CriticAttack["category"], React.ElementType> = {
  assumption: Lightbulb, edge_case: Bug, regression: RotateCcw,
  security: Lock, performance: Zap, rollback: RotateCcw,
};

const ATTACK_COLOR: Record<CriticAttack["category"], string> = {
  assumption: "text-amber-400", edge_case: "text-purple-400", regression: "text-orange-400",
  security: "text-red-400", performance: "text-cyan-400", rollback: "text-teal-400",
};

const SEV_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline", medium: "secondary", high: "destructive", critical: "destructive",
};

export default function SRE02BuilderCriticConsole() {
  const [exchanges] = useState<BuilderCriticExchange[]>(getBuilderCriticExchanges);
  const [activeTab, setActiveTab] = useState(exchanges[0]?.id || "");

  const openCount = exchanges.filter(e => e.status === "open").length;
  const totalAttacks = exchanges.reduce((s, e) => s + e.critic_attacks.length, 0);
  const unresolvedAttacks = exchanges.reduce((s, e) => s + e.critic_attacks.filter(a => !a.resolved).length, 0);

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Swords}
        title="Dual-AI Builder/Critic Console"
        subtitle="Every non-trivial change is challenged — unresolved concerns block auto-deploy"
        accent="accent"
      />

      {/* Enforcement Banner */}
      {unresolvedAttacks > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {unresolvedAttacks} Unresolved Critic Concern{unresolvedAttacks > 1 ? "s" : ""} — Auto-Deploy <span className="text-destructive">BLOCKED</span>
            </p>
            <p className="text-xs text-muted-foreground">All critic concerns must be resolved or arbiter must approve before deployment proceeds.</p>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Reviews", value: exchanges.length, icon: MessageSquare, color: "text-primary" },
          { label: "Open Disputes", value: openCount, icon: Swords, color: "text-amber-400" },
          { label: "Total Attacks", value: totalAttacks, icon: Shield, color: "text-purple-400" },
          { label: "Unresolved", value: unresolvedAttacks, icon: AlertTriangle, color: unresolvedAttacks > 0 ? "text-destructive" : "text-trust-safe" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30 flex-wrap h-auto gap-1">
          {exchanges.map(e => (
            <TabsTrigger key={e.id} value={e.id} className="text-xs gap-1.5">
              {e.status === "resolved" && <CheckCircle2 className="h-3 w-3 text-trust-safe" />}
              {e.status === "open" && <AlertTriangle className="h-3 w-3 text-amber-400" />}
              {e.status === "escalated" && <Scale className="h-3 w-3 text-destructive" />}
              {e.change_id}
            </TabsTrigger>
          ))}
        </TabsList>

        {exchanges.map(exchange => (
          <TabsContent key={exchange.id} value={exchange.id} className="mt-4 space-y-4">
            {/* Builder Proposal */}
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-400" />
                  Builder Proposal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-foreground font-medium">{exchange.builder_proposal}</p>
                <p className="text-xs text-muted-foreground">{exchange.builder_rationale}</p>
              </CardContent>
            </Card>

            {/* Critic Attacks */}
            <Card className="border-border/50 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Swords className="h-4 w-4 text-purple-400" />
                  Critic Attacks ({exchange.critic_attacks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exchange.critic_attacks.map((attack, i) => {
                  const AIcon = ATTACK_ICON[attack.category];
                  return (
                    <motion.div key={attack.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className={`p-3 rounded-lg border ${attack.resolved ? "border-border/30 bg-muted/10" : "border-destructive/20 bg-destructive/5"}`}
                    >
                      <div className="flex items-start gap-3">
                        <AIcon className={`h-4 w-4 mt-0.5 ${ATTACK_COLOR[attack.category]} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] h-5">{attack.category.replace("_", " ")}</Badge>
                            <Badge variant={SEV_VARIANT[attack.severity]} className="text-[10px] h-5">{attack.severity}</Badge>
                            {attack.resolved ? (
                              <Badge variant="outline" className="text-[10px] h-5 gap-1 border-trust-verified/30 text-trust-safe"><CheckCircle2 className="h-3 w-3" />Resolved</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px] h-5 gap-1"><XCircle className="h-3 w-3" />Unresolved</Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground mt-1">{attack.concern}</p>
                          {attack.builder_response && (
                            <div className="mt-2 pl-3 border-l-2 border-blue-500/30">
                              <p className="text-xs text-blue-300">Builder Response: {attack.builder_response}</p>
                              {attack.evidence && <p className="text-[10px] text-muted-foreground mt-0.5">Evidence: {attack.evidence}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Arbiter Decision */}
            {exchange.arbiter_decision && (
              <Card className={`border-${exchange.arbiter_decision.outcome === "approve" ? "trust-verified" : "destructive"}/20 bg-${exchange.arbiter_decision.outcome === "approve" ? "trust-verified" : "destructive"}/5`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="h-4 w-4 text-sita-gold" />
                    Arbiter Decision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={exchange.arbiter_decision.outcome === "approve" ? "default" : "destructive"}>
                      {exchange.arbiter_decision.outcome === "approve" ? "APPROVED" : exchange.arbiter_decision.outcome === "reject" ? "REJECTED" : "ESCALATE TO HUMAN"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(exchange.arbiter_decision.decided_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-foreground">{exchange.arbiter_decision.rationale}</p>
                  {exchange.arbiter_decision.conditions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Conditions:</p>
                      {exchange.arbiter_decision.conditions.map((c, i) => (
                        <p key={i} className="text-xs text-foreground pl-3">• {c}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
