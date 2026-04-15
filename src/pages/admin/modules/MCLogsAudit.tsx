import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Search, Filter, Download, Eye, Clock, Users, Shield, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const AUDIT_EVENTS = [
  { id: "ae1", action: "policy.updated", actor: "System AI", target: "trust-prompt-threshold", severity: "medium", time: "12:04 PM", detail: "Changed from 0.60 to 0.65" },
  { id: "ae2", action: "release.canary_started", actor: "Admin", target: "v2.14.0-rc3", severity: "info", time: "11:30 AM", detail: "Canary deployed to Ring 1 (342 users)" },
  { id: "ae3", action: "agent.paused", actor: "Budget Gate", target: "Finance Advisor", severity: "low", time: "10:45 AM", detail: "Token budget exceeded 115%" },
  { id: "ae4", action: "device.revoked", actor: "Trust Service", target: "device-d6", severity: "medium", time: "9:20 AM", detail: "14 days inactive, trust score below threshold" },
  { id: "ae5", action: "incident.declared", actor: "Alert System", target: "inc-1", severity: "high", time: "Yesterday", detail: "Sync failure rate crossed 4% threshold" },
  { id: "ae6", action: "approval.granted", actor: "Admin", target: "rec-42", severity: "info", time: "Yesterday", detail: "Sync optimization recommendation approved" },
  { id: "ae7", action: "backup.completed", actor: "System", target: "snapshot-daily", severity: "info", time: "Yesterday", detail: "847 objects, 2.1GB, region: us-east-1" },
  { id: "ae8", action: "key.rotated", actor: "Security Service", target: "connector-slack", severity: "medium", time: "2d ago", detail: "API key rotated per 90-day policy" },
];

const severityColor: Record<string, string> = {
  high: "text-red-400 border-red-500/20",
  medium: "text-amber-400 border-amber-500/20",
  low: "text-blue-400 border-blue-500/20",
  info: "text-muted-foreground",
};

const MCLogsAudit = () => {
  const { isDemo } = useAuth();
  const [search, setSearch] = useState("");
  const filtered = AUDIT_EVENTS.filter(e => !search || e.action.includes(search) || e.actor.toLowerCase().includes(search.toLowerCase()) || e.detail.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Logs & Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">Structured audit trail with correlation and explanations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Download className="h-3 w-3" /> Export</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><RefreshCw className="h-3 w-3" /> Refresh</Button>
        </div>
      </div>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by action, actor, or detail…" className="pl-9 h-9" />
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-0">
              {filtered.map((event, i) => (
                <div key={event.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/10 transition-colors ${i < filtered.length - 1 ? "border-b border-border/10" : ""}`}>
                  <span className="text-[10px] text-muted-foreground font-mono w-20 shrink-0 pt-0.5">{event.time}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-[9px] h-4 ${severityColor[event.severity]}`}>{event.severity}</Badge>
                      <span className="text-xs font-medium text-foreground font-mono">{event.action}</span>
                      <span className="text-[10px] text-muted-foreground">by {event.actor}</span>
                      <span className="text-[10px] text-muted-foreground">→ {event.target}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{event.detail}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 shrink-0"><Eye className="h-2.5 w-2.5 mr-1" /> Why</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default MCLogsAudit;
