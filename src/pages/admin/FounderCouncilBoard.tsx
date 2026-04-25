import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import {
  Crown, Users, AlertTriangle, CheckCircle, Clock, Vote, FileText, Shield,
  ArrowUpRight, ArrowDownRight, Activity, ChevronRight, TrendingUp, RefreshCw
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type ProposalStatus = "open" | "approved" | "rejected" | "deferred";
const statusConfig: Record<ProposalStatus, { color: string; icon: typeof CheckCircle }> = {
  open: { color: "text-blue-500 bg-blue-500/10 border-blue-500/20", icon: Clock },
  approved: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  rejected: { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  deferred: { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock },
};

const PROPOSALS = [
  { id: "prop-1", title: "Enterprise connector certification program", status: "open" as ProposalStatus, proposedBy: "CEO", domain: "connectors", confidence: 0.85, implementationRisk: "medium", timeToValue: "6–8 weeks", stakeholderImpact: "All enterprise customers", councilVotes: { for: 3, against: 0, abstain: 1 }, precedent: "Similar certification in Q3 2025 increased enterprise close rate by 15%", createdAt: "2026-04-08" },
  { id: "prop-2", title: "AI spend governance — mandatory budget caps per domain", status: "approved" as ProposalStatus, proposedBy: "CFO", domain: "ai-gateway", confidence: 0.92, implementationRisk: "low", timeToValue: "1–2 weeks", stakeholderImpact: "All AI-consuming services", councilVotes: { for: 4, against: 0, abstain: 0 }, precedent: "Budget enforcement reduced monthly AI cost by 34% at previous org", createdAt: "2026-04-06", approvalRef: "apr-882" },
  { id: "prop-3", title: "Concierge autonomy expansion — L4 for travel booking", status: "open" as ProposalStatus, proposedBy: "CTO", domain: "concierge", confidence: 0.71, implementationRisk: "high", timeToValue: "4–6 weeks", stakeholderImpact: "Travel concierge users, trust center", councilVotes: { for: 2, against: 1, abstain: 1 }, precedent: "L3→L4 expansion for household tasks resulted in 8% error rate increase initially", createdAt: "2026-04-07" },
  { id: "prop-4", title: "VMware-first deployment lane for regulated customers", status: "deferred" as ProposalStatus, proposedBy: "VP Eng", domain: "deployment", confidence: 0.65, implementationRisk: "high", timeToValue: "10–14 weeks", stakeholderImpact: "Regulated enterprise segment", councilVotes: { for: 1, against: 2, abstain: 1 }, precedent: "No direct precedent — new market segment", createdAt: "2026-04-03" },
  { id: "prop-5", title: "Platform-wide safe mode improvements", status: "rejected" as ProposalStatus, proposedBy: "CISO", domain: "mission-control", confidence: 0.78, implementationRisk: "medium", timeToValue: "3–4 weeks", stakeholderImpact: "Operators, reliability engineers", councilVotes: { for: 1, against: 3, abstain: 0 }, precedent: "Safe mode already covers 85% of critical paths — marginal improvement insufficient", createdAt: "2026-04-02" },
];

const PRECEDENTS = [
  { id: "prec-1", decision: "L3 autonomy expansion for household concierge", date: "2025-11-15", outcome: "Approved — error rate stabilized after 2 weeks", relevantTo: ["prop-3"] },
  { id: "prec-2", decision: "Mandatory approval chains for financial mutations", date: "2025-09-20", outcome: "Approved — zero unauthorized mutations since", relevantTo: ["prop-2"] },
  { id: "prec-3", decision: "Enterprise connector SLA framework", date: "2025-08-05", outcome: "Approved — 12 enterprise connectors certified", relevantTo: ["prop-1"] },
];

const FounderCouncilBoard = () => {
  const [tab, setTab] = useState("proposals");
  const openCount = PROPOSALS.filter(p => p.status === "open").length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" /> Founder Council
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Strategic decision room — proposals, precedents, impact, and approval linkage</p>
        </div>
        <div className="flex items-center gap-2">
          {openCount > 0 && <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20">{openCount} Open</Badge>}
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Proposals", value: PROPOSALS.length, icon: FileText, color: "text-primary" },
          { label: "Open", value: openCount, icon: Clock, color: "text-blue-500" },
          { label: "Approved", value: PROPOSALS.filter(p => p.status === "approved").length, icon: CheckCircle, color: "text-emerald-500" },
          { label: "Avg Confidence", value: `${(PROPOSALS.reduce((s, p) => s + p.confidence, 0) / PROPOSALS.length * 100).toFixed(0)}%`, icon: TrendingUp, color: "text-amber-500" },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2 mb-1"><m.icon className={`h-4 w-4 ${m.color}`} /><span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span></div>
                <p className="text-xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="proposals"><FileText className="h-3.5 w-3.5 mr-1" /> Proposals</TabsTrigger>
          <TabsTrigger value="precedents"><Clock className="h-3.5 w-3.5 mr-1" /> Precedents</TabsTrigger>
          <TabsTrigger value="risk"><Shield className="h-3.5 w-3.5 mr-1" /> Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-2 mt-4">
          {PROPOSALS.map(p => {
            const sc = statusConfig[p.status];
            const StatusIcon = sc.icon;
            return (
              <motion.div key={p.id} variants={fadeUp} initial="hidden" animate="show">
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <StatusIcon className={`h-4 w-4 ${sc.color.split(" ")[0]} shrink-0`} />
                        <span className="text-sm font-medium text-foreground">{p.title}</span>
                      </div>
                      <Badge variant="outline" className={`text-[9px] ${sc.color}`}>{p.status}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground mb-2">
                      <span>By: <span className="text-foreground">{p.proposedBy}</span></span>
                      <span>Domain: <span className="text-foreground">{p.domain}</span></span>
                      <span>Confidence: <span className="text-foreground font-medium">{(p.confidence * 100).toFixed(0)}%</span></span>
                      <span>Risk: <span className="text-foreground">{p.implementationRisk}</span></span>
                      <span>Time to Value: <span className="text-foreground">{p.timeToValue}</span></span>
                    </div>
                    <div className="flex items-center gap-4 mb-2 text-[10px]">
                      <span className="text-emerald-500 font-medium">✓ {p.councilVotes.for} for</span>
                      <span className="text-red-500 font-medium">✗ {p.councilVotes.against} against</span>
                      <span className="text-muted-foreground">○ {p.councilVotes.abstain} abstain</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                      <span><strong className="text-foreground">Impact:</strong> {p.stakeholderImpact}</span>
                    </div>
                    {p.approvalRef && (
                      <div className="mt-2 text-[10px] text-muted-foreground">Approval ref: <span className="text-primary font-mono">{p.approvalRef}</span></div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="precedents" className="space-y-2 mt-4">
          {PRECEDENTS.map(pr => (
            <motion.div key={pr.id} variants={fadeUp} initial="hidden" animate="show">
              <Card className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{pr.decision}</span>
                    <span className="text-[10px] text-muted-foreground">{pr.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Outcome: <span className="text-foreground">{pr.outcome}</span></p>
                  <div className="flex gap-1.5">
                    {pr.relevantTo.map(ref => <Badge key={ref} variant="outline" className="text-[9px]">{ref}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <div className="space-y-3">
            {PROPOSALS.filter(p => p.status === "open").map(p => (
              <motion.div key={p.id} variants={fadeUp} initial="hidden" animate="show">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">{p.title}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Implementation Risk</span>
                        <p className={`text-sm font-bold mt-1 ${p.implementationRisk === "high" ? "text-red-500" : p.implementationRisk === "medium" ? "text-amber-500" : "text-emerald-500"}`}>{p.implementationRisk}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</span>
                        <p className="text-sm font-bold mt-1 text-foreground">{(p.confidence * 100).toFixed(0)}%</p>
                        <Progress value={p.confidence * 100} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Time to Value</span>
                        <p className="text-sm font-bold mt-1 text-foreground">{p.timeToValue}</p>
                      </div>
                    </div>
                    <div className="mt-3 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                      <strong className="text-foreground">Precedent:</strong> {p.precedent}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FounderCouncilBoard;
