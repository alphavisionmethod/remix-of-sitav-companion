import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layers, CheckCircle, AlertTriangle, Eye, Download, RefreshCw, FileText, GitBranch, Shield, Undo2 } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_PROOF_ENTRIES } from "@/lib/demo-data/admin-platform";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface ProofEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  proofChain: { step: string; status: "verified" | "pending" | "missing" }[];
  rollbackEvidence: boolean;
  approvalContext: boolean;
  exportable: boolean;
}

const stepColor = { verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", pending: "bg-amber-500/10 text-amber-500 border-amber-500/20", missing: "bg-red-500/10 text-red-500 border-red-500/20" };

const InvestorProofLedger = () => {
  const { isDemoMode } = useDataMode();
  const [tab, setTab] = useState("ledger");
  const fullProof = DEMO_PROOF_ENTRIES.filter(p => p.proofChain.every(s => s.status === "verified")).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> Investor-Grade Proof Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Open-book platform governance — every material action receipted and exportable</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" /> Export Bundle</Button>
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Full Proof</p><p className="text-2xl font-bold text-emerald-500">{fullProof}/{DEMO_PROOF_ENTRIES.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">With Rollback Evidence</p><p className="text-2xl font-bold text-foreground">{DEMO_PROOF_ENTRIES.filter(p => p.rollbackEvidence).length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Exportable</p><p className="text-2xl font-bold text-foreground">{DEMO_PROOF_ENTRIES.filter(p => p.exportable).length}</p></CardContent></Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Proof Ledger</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {DEMO_PROOF_ENTRIES.map(p => (
                <div key={p.id} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.action}</p>
                      <p className="text-[10px] text-muted-foreground">By {p.actor} · {new Date(p.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.rollbackEvidence && <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-500 border-blue-500/20"><Undo2 className="h-2.5 w-2.5 mr-0.5" /> Rollback</Badge>}
                      {p.approvalContext && <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><Shield className="h-2.5 w-2.5 mr-0.5" /> Approved</Badge>}
                      {p.exportable && <Button variant="ghost" size="sm" className="h-6 text-[10px]"><Download className="h-3 w-3 mr-1" /> Export</Button>}
                    </div>
                  </div>
                  {/* Proof chain */}
                  <div className="flex items-center gap-1 mt-2">
                    {p.proofChain.map((step, i) => (
                      <div key={step.step} className="flex items-center gap-1">
                        {i > 0 && <GitBranch className="h-3 w-3 text-muted-foreground rotate-90" />}
                        <Badge variant="outline" className={`text-[9px] ${stepColor[step.status]}`}>
                          {step.status === "verified" && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                          {step.status === "missing" && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                          {step.step}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InvestorProofLedger;
