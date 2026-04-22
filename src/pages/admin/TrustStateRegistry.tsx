import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, XCircle, Eye, RefreshCw, Link2, Globe, Layers, Search } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type TrustStatus = "verified" | "degraded" | "unknown" | "failed";

interface DomainTrust {
  domain: string;
  status: TrustStatus;
  proofCoverage: number;
  approvalChainComplete: boolean;
  receiptLinked: boolean;
  lastVerified: string;
  degradedReason?: string;
}

interface ProofNode {
  id: string;
  type: string;
  from: string;
  to: string;
  status: TrustStatus;
  evidenceCount: number;
}

const DEMO_DOMAINS: DomainTrust[] = [
  { domain: "Business OS", status: "verified", proofCoverage: 94, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:30:00Z" },
  { domain: "Finance OS", status: "verified", proofCoverage: 91, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:28:00Z" },
  { domain: "Concierge OS", status: "degraded", proofCoverage: 72, approvalChainComplete: true, receiptLinked: false, lastVerified: "2026-04-10T08:15:00Z", degradedReason: "Receipt linkage incomplete for booking flows" },
  { domain: "Admin Control Plane", status: "verified", proofCoverage: 97, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:32:00Z" },
  { domain: "Boardroom", status: "verified", proofCoverage: 88, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:25:00Z" },
  { domain: "Device Layer", status: "degraded", proofCoverage: 65, approvalChainComplete: false, receiptLinked: false, lastVerified: "2026-04-10T07:00:00Z", degradedReason: "Apple Watch trust chain not fully verified" },
  { domain: "AI Gateway", status: "verified", proofCoverage: 96, approvalChainComplete: true, receiptLinked: true, lastVerified: "2026-04-10T09:31:00Z" },
  { domain: "Connector Control", status: "degraded", proofCoverage: 78, approvalChainComplete: true, receiptLinked: false, lastVerified: "2026-04-10T08:45:00Z", degradedReason: "3 connectors missing sync receipts" },
];

const DEMO_PROOF_NODES: ProofNode[] = [
  { id: "p1", type: "Approval → Receipt", from: "Invoice #4821", to: "Receipt R-4821", status: "verified", evidenceCount: 4 },
  { id: "p2", type: "Policy → Execution", from: "Budget Policy BP-3", to: "Spend Action SA-112", status: "verified", evidenceCount: 3 },
  { id: "p3", type: "Trigger → Approval", from: "Lead Recovery Signal", to: "Autopilot Approval AA-7", status: "degraded", evidenceCount: 1 },
  { id: "p4", type: "Execution → Receipt", from: "Connector Sync CS-19", to: "Receipt R-CS-19", status: "failed", evidenceCount: 0 },
  { id: "p5", type: "Approval → Execution", from: "Release Gate RG-5", to: "Deployment D-2.14", status: "verified", evidenceCount: 5 },
  { id: "p6", type: "Event → Projection", from: "OrderCreated E-901", to: "Revenue Projection RP-42", status: "verified", evidenceCount: 2 },
];

const DEMO_DEGRADED = [
  { surface: "Booking Continuity", state: "fallback", source: "Concierge OS", reason: "External calendar sync stale >10m", since: "2026-04-10T08:00:00Z" },
  { surface: "Device Trust Chain", state: "partial", source: "Device Layer", reason: "Apple Watch handoff not verified", since: "2026-04-10T06:30:00Z" },
  { surface: "Connector Receipts", state: "missing", source: "Connector Control", reason: "3 connectors have no sync receipts", since: "2026-04-10T07:45:00Z" },
];

const statusIcon = (s: TrustStatus) => {
  const { isDemoMode } = useDataMode();
  switch (s) {
    case "verified": return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
    case "degraded": return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    case "failed": return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    default: return <Eye className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

const statusBadge = (s: TrustStatus) => {
  const styles: Record<TrustStatus, string> = {
    verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    degraded: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
    unknown: "bg-muted text-muted-foreground border-border",
  };
  return styles[s];
};

const TrustStateRegistry = () => {
  const [tab, setTab] = useState("domains");
  const overallScore = Math.round((isDemoMode ? DEMO_DOMAINS : [] as typeof DEMO_DOMAINS).reduce((sum, d) => sum + d.proofCoverage, 0) / (isDemoMode ? DEMO_DOMAINS : [] as typeof DEMO_DOMAINS).length);
  const verifiedCount = DEMO_DOMAINS.filter(d => d.status === "verified").length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Trust State Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Cross-domain trust observatory — unified proof, approvals, receipts, and degraded-state visibility</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Trust</Button>
      </div>

      {/* KPI Band */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Overall Trust Score", value: `${overallScore}%`, color: overallScore > 85 ? "text-emerald-500" : "text-amber-500" },
          { label: "Domains Verified", value: `${verifiedCount}/${(isDemoMode ? DEMO_DOMAINS : [] as typeof DEMO_DOMAINS).length}`, color: "text-foreground" },
          { label: "Proof Links Active", value: String((isDemoMode ? DEMO_PROOF_NODES : [] as typeof DEMO_PROOF_NODES).filter(n => n.status === "verified").length), color: "text-emerald-500" },
          { label: "Degraded Surfaces", value: String((isDemoMode ? DEMO_DEGRADED : [] as typeof DEMO_DEGRADED).length), color: (isDemoMode ? DEMO_DEGRADED : [] as typeof DEMO_DEGRADED).length > 0 ? "text-amber-500" : "text-emerald-500" },
        ].map(m => (
          <motion.div key={m.label} variants={fadeUp}>
            <Card className="hover:-translate-y-0.5 transition-transform">
              <CardContent className="p-3.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="domains" className="text-xs">Cross-Domain Trust</TabsTrigger>
          <TabsTrigger value="proofs" className="text-xs">Proof Link Graph</TabsTrigger>
          <TabsTrigger value="degraded" className="text-xs">Degraded State Map</TabsTrigger>
          <TabsTrigger value="ribbons" className="text-xs">Global Trust Ribbon</TabsTrigger>
        </TabsList>

        {/* Domains */}
        <TabsContent value="domains" className="mt-4 space-y-3">
          {(isDemoMode ? DEMO_DOMAINS : [] as typeof DEMO_DOMAINS).map(d => (
            <Card key={d.domain} className="hover:bg-muted/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {statusIcon(d.status)}
                    <span className="text-sm font-semibold text-foreground">{d.domain}</span>
                    <Badge variant="outline" className={`text-[9px] ${statusBadge(d.status)}`}>{d.status}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Verified: {new Date(d.lastVerified).toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Proof Coverage</p>
                    <Progress value={d.proofCoverage} className="h-1.5" />
                    <p className="text-[10px] text-foreground mt-0.5">{d.proofCoverage}%</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-[9px] ${d.approvalChainComplete ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                      {d.approvalChainComplete ? "Approval Chain ✓" : "Approval Chain ✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-[9px] ${d.receiptLinked ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                      {d.receiptLinked ? "Receipts Linked ✓" : "Receipts Missing ✗"}
                    </Badge>
                  </div>
                </div>
                {d.degradedReason && (
                  <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-2.5 w-2.5" /> {d.degradedReason}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Proof Link Graph */}
        <TabsContent value="proofs" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /> Approval/Receipt Link Graph</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(isDemoMode ? DEMO_PROOF_NODES : [] as typeof DEMO_PROOF_NODES).map(node => (
                <div key={node.id} className="p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {statusIcon(node.status)}
                      <span className="text-xs font-medium text-foreground">{node.type}</span>
                      <Badge variant="outline" className={`text-[9px] ${statusBadge(node.status)}`}>{node.status}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{node.evidenceCount} evidence artifacts</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                    <span className="text-foreground">{node.from}</span>
                    <span>→</span>
                    <span className="text-foreground">{node.to}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Degraded State Map */}
        <TabsContent value="degraded" className="mt-4 space-y-3">
          {(isDemoMode ? DEMO_DEGRADED : [] as typeof DEMO_DEGRADED).length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No degraded surfaces detected. All systems operating at full truth fidelity.</CardContent></Card>
          ) : (
            (isDemoMode ? DEMO_DEGRADED : [] as typeof DEMO_DEGRADED).map((d, i) => (
              <Card key={i} className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold text-foreground">{d.surface}</span>
                      <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20">{d.state}</Badge>
                    </div>
                    <Badge variant="outline" className="text-[9px]">{d.source}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.reason}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Since: {new Date(d.since).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Global Trust Ribbon */}
        <TabsContent value="ribbons" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Cross-Domain Trust Ribbon State</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(isDemoMode ? DEMO_DOMAINS : [] as typeof DEMO_DOMAINS).map(d => (
                <div key={d.domain} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    {statusIcon(d.status)}
                    <span className="text-xs font-medium text-foreground">{d.domain}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>Proof: {d.proofCoverage}%</span>
                    <span>Approval: {d.approvalChainComplete ? "✓" : "✗"}</span>
                    <span>Receipt: {d.receiptLinked ? "✓" : "✗"}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrustStateRegistry;
