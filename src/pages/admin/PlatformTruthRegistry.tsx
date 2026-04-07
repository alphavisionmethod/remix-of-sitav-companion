import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, AlertTriangle, XCircle, RefreshCw, FileText, GitBranch, Layers } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

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

const CLAIMS: TruthClaim[] = [
  { id: "tc-1", capability: "User Authentication", claimedStatus: "Fully operational with RLS", runtimeEvidence: "Auth endpoints responding, RLS policies active", status: "verified", severity: "low", lastChecked: "2026-04-05T10:20:00Z" },
  { id: "tc-2", capability: "Real-time Subscriptions", claimedStatus: "Active on all tables", runtimeEvidence: "Only 12/45 tables have realtime enabled", status: "drift", severity: "high", lastChecked: "2026-04-05T10:15:00Z", remediation: "Enable realtime on remaining tables or update documentation" },
  { id: "tc-3", capability: "Edge Function Auto-deploy", claimedStatus: "All functions auto-deploy on push", runtimeEvidence: "Deployment pipeline active", status: "verified", severity: "low", lastChecked: "2026-04-05T10:18:00Z" },
  { id: "tc-4", capability: "Backup & Recovery", claimedStatus: "Daily automated backups with PITR", runtimeEvidence: "Last backup timestamp found, PITR status unconfirmed", status: "unverified", severity: "medium", lastChecked: "2026-04-04T23:00:00Z", remediation: "Verify PITR configuration in Supabase dashboard" },
  { id: "tc-5", capability: "AI Advisory System", claimedStatus: "Multi-advisor with memory", runtimeEvidence: "Advisor configs exist, memory tables populated", status: "verified", severity: "low", lastChecked: "2026-04-05T10:10:00Z" },
  { id: "tc-6", capability: "Connector Health Monitoring", claimedStatus: "Real-time health checks every 5m", runtimeEvidence: "Last health check was 45m ago", status: "stale", severity: "medium", lastChecked: "2026-04-05T09:35:00Z", remediation: "Investigate health-check scheduler" },
];

const PlatformTruthRegistry = () => {
  const verified = CLAIMS.filter(c => c.status === "verified").length;
  const drifts = CLAIMS.filter(c => c.status === "drift").length;

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
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Verified Claims</p><p className="text-2xl font-bold text-emerald-500">{verified}/{CLAIMS.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Drift Detected</p><p className="text-2xl font-bold text-red-500">{drifts}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Unverified</p><p className="text-2xl font-bold text-amber-500">{CLAIMS.filter(c => c.status === "unverified").length}</p></CardContent></Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Capability Claims</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {CLAIMS.map(c => (
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
