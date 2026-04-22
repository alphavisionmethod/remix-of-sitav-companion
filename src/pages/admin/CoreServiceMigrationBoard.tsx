import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, CheckCircle, ArrowRight, Database, Shield, Zap } from "lucide-react";
import { DEMO_ADMIN_SERVICES as DEMO_SERVICES } from "@/data/seed/admin-platform";
import CPSSubNav from "@/components/admin/CPSSubNav";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { useDataMode } from "@/contexts/DataModeContext";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const PHASE_COLORS: Record<string, string> = {
  "not-started": "bg-red-500/20 text-red-400",
  "adapter-built": "bg-amber-500/20 text-amber-400",
  "wired": "bg-blue-500/20 text-blue-400",
  "validated": "bg-emerald-500/20 text-emerald-400",
  "complete": "bg-teal-500/20 text-teal-400",
};

const REAL_ADAPTERS = [
  { name: "EventBus", adapter: "event-bus-persistence.ts", table: "os_event_log", status: "wired" as const },
  { name: "MemoryService", adapter: "memory-service-persistence.ts", table: "os_memory_scoped", status: "wired" as const },
  { name: "PolicyEngine", adapter: "policy-engine-persistence.ts", table: "os_policy_evaluations", status: "wired" as const },
  { name: "ActionLineage", adapter: "action-lineage-persistence.ts", table: "os_action_lineage", status: "wired" as const },
  { name: "IntelligenceAssets", adapter: "intelligence-asset-persistence.ts", table: "intelligence_assets_library", status: "wired" as const },
];

const ADAPTER_STATUS_COLORS: Record<string, string> = {
  wired: "bg-emerald-500/20 text-emerald-400",
  partial: "bg-amber-500/20 text-amber-400",
  missing: "bg-red-500/20 text-red-400",
};

export default function CoreServiceMigrationBoard() {
  const { isDemoMode } = useDataMode();
  const completed = DEMO_SERVICES.filter(s => s.phase === "complete").length;
  const pct = (completed / (isDemoMode ? DEMO_SERVICES : [] as typeof DEMO_SERVICES).length) * 100;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <CPSSubNav />
<motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }} className="space-y-4">
        <motion.div variants={fade} className="flex items-center gap-3">
          <Server className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Core Service Migration Board</h1>
          <Badge>{completed}/{(isDemoMode ? DEMO_SERVICES : [] as typeof DEMO_SERVICES).length} complete</Badge>
        </motion.div>

        {/* Real Adapter Wiring Status */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Real Persistence Adapter Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="p-3 text-left">Adapter</th>
                    <th className="p-3 text-left">File</th>
                    <th className="p-3 text-left">DB Table</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {REAL_ADAPTERS.map(a => (
                    <tr key={a.name} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{a.name}</td>
                      <td className="p-3 font-mono text-muted-foreground text-[10px]">{a.adapter}</td>
                      <td className="p-3 font-mono text-muted-foreground text-[10px]">{a.table}</td>
                      <td className="p-3">
                        <Badge className={`text-[10px] ${ADAPTER_STATUS_COLORS[a.status]}`}>
                          <Database className="h-2.5 w-2.5 mr-1" />
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Migration Progress */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Planning Board Migration Progress</span>
                <span>{pct.toFixed(0)}%</span>
              </div>
              <Progress value={pct} className="h-3" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Planning Board Table */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="p-3 text-left">Service</th>
                    <th className="p-3 text-left">Current</th>
                    <th className="p-3 text-left"></th>
                    <th className="p-3 text-left">Target</th>
                    <th className="p-3 text-left">Phase</th>
                    <th className="p-3 text-left">Blockers</th>
                    <th className="p-3 text-left">Continuity Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {(isDemoMode ? DEMO_SERVICES : [] as typeof DEMO_SERVICES).map(svc => (
                    <tr key={svc.name} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{svc.name}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{svc.currentBacking}</Badge></td>
                      <td className="p-3"><ArrowRight className="h-3 w-3 text-muted-foreground" /></td>
                      <td className="p-3 font-mono text-muted-foreground">{svc.targetBacking}</td>
                      <td className="p-3"><Badge className={`text-[10px] ${PHASE_COLORS[svc.phase]}`}>{svc.phase}</Badge></td>
                      <td className="p-3 text-muted-foreground">{svc.blockers.length > 0 ? svc.blockers.join(", ") : <CheckCircle className="h-3 w-3 text-emerald-400" />}</td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate">{svc.continuityGain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>

        {/* State Loss Risk */}
        <motion.div variants={fade}>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />State Loss Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "Critical State Loss", count: (isDemoMode ? DEMO_SERVICES : [] as typeof DEMO_SERVICES).filter(s => s.phase === "not-started").length, color: "text-red-400" },
                { label: "Partial Coverage", count: (isDemoMode ? DEMO_SERVICES : [] as typeof DEMO_SERVICES).filter(s => ["adapter-built", "wired"].includes(s.phase)).length, color: "text-amber-400" },
                { label: "Fully Durable", count: (isDemoMode ? DEMO_SERVICES : [] as typeof DEMO_SERVICES).filter(s => ["validated", "complete"].includes(s.phase)).length, color: "text-emerald-400" },
              ].map(item => (
                <div key={item.label} className="text-center p-3 bg-muted/20 rounded">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
