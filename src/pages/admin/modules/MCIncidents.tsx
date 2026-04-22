import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, CheckCircle, Clock, XCircle, Shield, RefreshCw,
  Pause, RotateCcw, BookOpen, Users, Bell, Zap, GitBranch
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const INCIDENTS = [
  {
    id: "inc-1", severity: "medium", title: "Elevated sync failure rate on Android",
    status: "investigating", startedAt: "11:42 AM", duration: "2h 18m",
    affectedServices: ["sync-service", "mobile-client"],
    affectedUsers: 342, relatedDeploy: "v2.14.0-rc3",
    mitigations: ["Auto-retry logic activated", "Affected cohort excluded from rollout"],
    timeline: [
      { time: "11:42", event: "Sync failure rate crossed 4% threshold" },
      { time: "11:45", event: "Alert triggered, investigating initiated" },
      { time: "11:52", event: "Correlated with v2.14.0-rc3 canary deployment" },
      { time: "12:10", event: "Root cause: upload finalization timeout on slow networks" },
      { time: "12:30", event: "Mitigation: auto-retry with exponential backoff enabled" },
    ],
  },
  {
    id: "inc-2", severity: "low", title: "Preview generation latency spike",
    status: "resolved", startedAt: "Yesterday 3:12 PM", duration: "45m",
    affectedServices: ["storage-service"],
    affectedUsers: 89, relatedDeploy: null,
    mitigations: ["Queue backpressure applied", "Preview cache warmed"],
    timeline: [
      { time: "15:12", event: "Preview generation p99 exceeded 3s" },
      { time: "15:20", event: "Root cause: spike in large file uploads" },
      { time: "15:35", event: "Queue backpressure applied" },
      { time: "15:57", event: "Latency returned to normal" },
    ],
  },
];

const severityColor: Record<string, string> = {
  critical: "text-red-500 bg-red-500/10 border-red-500/20",
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const MCIncidents = () => {
  ;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Incidents</h1>
          <p className="text-sm text-muted-foreground mt-1">Incident response, mitigation, and postmortem management</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs h-6 px-3">
            {INCIDENTS.filter(i => i.status !== "resolved").length} active
          </Badge>
          <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5"><AlertTriangle className="h-3 w-3" /> Declare Incident</Button>
        </div>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* Incident Cards */}
        {INCIDENTS.map(incident => (
          <motion.div key={incident.id} variants={fadeUp}>
            <Card className={incident.status !== "resolved" ? "border-amber-500/20" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] h-5 ${severityColor[incident.severity]}`}>{incident.severity}</Badge>
                  <CardTitle className="text-sm flex-1">{incident.title}</CardTitle>
                  <Badge variant="outline" className={`text-[9px] h-5 ${incident.status === "resolved" ? "text-emerald-400 border-emerald-500/20" : "text-amber-400 border-amber-500/20"}`}>
                    {incident.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meta */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Started: {incident.startedAt}</span>
                  <span>Duration: {incident.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {incident.affectedUsers} users affected</span>
                  {incident.relatedDeploy && <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> Related: {incident.relatedDeploy}</span>}
                </div>

                {/* Affected Services */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Services:</span>
                  {incident.affectedServices.map(s => <Badge key={s} variant="outline" className="text-[9px] h-4">{s}</Badge>)}
                </div>

                {/* Mitigations */}
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Mitigations</span>
                  <div className="mt-1 space-y-1">
                    {incident.mitigations.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span className="text-foreground">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Timeline</span>
                  <div className="mt-1 space-y-1 border-l border-border/20 ml-1.5 pl-3">
                    {incident.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="text-muted-foreground font-mono shrink-0 w-10">{t.time}</span>
                        <span className="text-foreground">{t.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Freeze Releases", icon: Pause },
                { label: "Rollback Latest Deploy", icon: RotateCcw },
                { label: "Open Runbook", icon: BookOpen },
                { label: "Escalate to Security", icon: Shield },
                { label: "Notify Internal Team", icon: Bell },
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

export default MCIncidents;
