import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, AlertTriangle, XCircle, RefreshCw, FileText, GitBranch, Layers } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_CLAIMS } from "@/lib/demo-data/admin-platform";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type ClaimStatus = "verified" | "drift" | "unverified" | "stale";

const claimColor: Record<ClaimStatus, string> = {
  verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  drift: "bg-red-500/10 text-red-500 border-red-500/20",
  unverified: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  stale: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

interface TruthClaim {
  id: string;
  capability: string;
  claimedStatus: string;
  runtimeEvidence: string;
  status: ClaimStatus;
  severity: "low" | "medium" | "high";
  lastChecked: string;
  remediation?: string;
}

const PlatformTruthRegistry = () => {
  const { isDemoMode } = useDataMode();
  const verified = DEMO_CLAIMS.filter(c => c.status === "verified").length;
  const drifts = DEMO_CLAIMS.filter(c => c.status === "drift").length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" /> Platform Truth Registry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Claims vs runtime evidence — status claims stay honest</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Verify All</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Verified Claims</p><p className="text-2xl font-bold text-emerald-500">{verified}/{DEMO_CLAIMS.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Drift Detected</p><p className="text-2xl font-bold text-red-500">{drifts}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Unverified</p><p className="text-2xl font-bold text-amber-500">{DEMO_CLAIMS.filter(c => c.status === "unverified").length}</p></CardContent></Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Capability Claims</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {DEMO_CLAIMS.map(c => (
                <div key={c.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{c.capability}</span>
                      <Badge variant="outline" className={`text-[9px] ${claimColor[c.status]}`}>{c.status}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.lastChecked).toLocaleTimeString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] mb-2">
                    <div><span className="text-muted-foreground">Claimed: </span><span className="text-foreground">{c.claimedStatus}</span></div>
                    <div><span className="text-muted-foreground">Evidence: </span><span className="text-foreground">{c.runtimeEvidence}</span></div>
                  </div>
                  {c.remediation && (
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-500 mt-1">
                      <AlertTriangle className="h-3 w-3" /> {c.remediation}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PlatformTruthRegistry;
