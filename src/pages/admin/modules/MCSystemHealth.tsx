import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, AlertTriangle, RefreshCw, Server, Shield, Cloud, Brain, Database, Zap, Lock, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

type HealthStatus = "healthy" | "warning" | "degraded" | "critical";
const statusColor: Record<HealthStatus, string> = {
  healthy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  degraded: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
};

const SUBSYSTEMS: { name: string; status: HealthStatus; score: number; trend: string; lastIncident: string; icon: React.ElementType }[] = [
  { name: "Authentication", status: "healthy", score: 99, trend: "stable", lastIncident: "14d ago", icon: Lock },
  { name: "Sync Service", status: "warning", score: 96, trend: "-1.2", lastIncident: "2h ago", icon: Cloud },
  { name: "Storage Service", status: "healthy", score: 99, trend: "+0.3", lastIncident: "5d ago", icon: Database },
  { name: "Device Registry", status: "healthy", score: 98, trend: "stable", lastIncident: "8d ago", icon: Server },
  { name: "Trust Service", status: "healthy", score: 97, trend: "+0.8", lastIncident: "3d ago", icon: Shield },
  { name: "AI Router", status: "healthy", score: 99, trend: "stable", lastIncident: "12d ago", icon: Brain },
  { name: "Release Service", status: "healthy", score: 100, trend: "stable", lastIncident: "21d ago", icon: Zap },
  { name: "Notifications", status: "healthy", score: 98, trend: "+0.1", lastIncident: "7d ago", icon: Bell },
  { name: "Admin Platform", status: "healthy", score: 100, trend: "stable", lastIncident: "30d+ ago", icon: Activity },
];

const MCSystemHealth = () => {
  const { isDemo } = useAuth();
  const overallScore = Math.round(SUBSYSTEMS.reduce((a, s) => a + s.score, 0) / SUBSYSTEMS.length);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">System Health</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform health overview with subsystem scores and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="text-2xl font-bold text-emerald-400">{overallScore}</span>
              <span className="text-xs text-emerald-400/70 ml-1">/ 100</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
        </div>
      </div>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUBSYSTEMS.map(sys => {
              const SysIcon = sys.icon;
              return (
                <Card key={sys.name} className="hover:-translate-y-0.5 transition-transform">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusColor[sys.status].split(" ").slice(1).join(" ")}`}>
                        <SysIcon className={`h-4 w-4 ${statusColor[sys.status].split(" ")[0]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{sys.name}</span>
                          <span className={`text-lg font-bold ${sys.score >= 98 ? "text-emerald-400" : sys.score >= 95 ? "text-amber-400" : "text-red-400"}`}>{sys.score}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <Badge variant="outline" className={`text-[9px] h-3.5 px-1.5 ${statusColor[sys.status]}`}>{sys.status}</Badge>
                          <span>Trend: {sys.trend}</span>
                          <span>Last incident: {sys.lastIncident}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Run Diagnostics", icon: Activity },
                { label: "Refresh All Health", icon: RefreshCw },
                { label: "View SLO Dashboard", icon: CheckCircle },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="h-8 text-xs gap-1.5"><a.icon className="h-3 w-3" /> {a.label}</Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default MCSystemHealth;
