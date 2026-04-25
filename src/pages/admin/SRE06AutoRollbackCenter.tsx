// ═══════════════════════════════════════════════════════════════
// SITA OS — SRE06: Auto-Rollback Command Center
// Trigger conditions, multi-layer rollbacks, history
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  RotateCcw, ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
  Activity, Target, Gauge, Users, Clock, Flag, Server, Settings, Cpu
} from "lucide-react";
import { getRollbackTriggers, getRollbackHistory, type RollbackTrigger, type RollbackEvent } from "@/lib/services/engineering-governance";

const LAYER_ICON: Record<string, React.ElementType> = {
  feature_flag: Flag, service_deploy: Server, config: Settings, canary_halt: Target, os_update: Cpu,
};

const LAYER_COLOR: Record<string, string> = {
  feature_flag: "text-blue-400", service_deploy: "text-purple-400", config: "text-cyan-400",
  canary_halt: "text-amber-400", os_update: "text-red-400",
};

export default function SRE06AutoRollbackCenter() {
  const [triggers] = useState<RollbackTrigger[]>(getRollbackTriggers);
  const [history] = useState<RollbackEvent[]>(getRollbackHistory);

  const armedCount = triggers.filter(t => t.armed).length;
  const safeCount = triggers.filter(t => t.current_value < t.threshold * 0.8 || (t.metric === "sync_success_rate" && t.current_value > t.threshold * 1.05)).length;

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={RotateCcw}
        title="Auto-Rollback Command Center"
        subtitle="Any harmful deployment must be revertible — multi-layer rollback triggers stand ready"
        accent="destructive"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Triggers Armed", value: armedCount, icon: Target, color: "text-trust-safe" },
          { label: "All Safe", value: `${safeCount}/${triggers.length}`, icon: ShieldCheck, color: "text-trust-safe" },
          { label: "Total Rollbacks", value: history.length, icon: RotateCcw, color: "text-primary" },
          { label: "Users Protected", value: history.reduce((s, h) => s + h.affected_users, 0).toLocaleString(), icon: Users, color: "text-sita-gold" },
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

      <Tabs defaultValue="triggers">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="triggers" className="text-xs gap-1.5"><Target className="h-3 w-3" />Trigger Conditions ({triggers.length})</TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1.5"><Clock className="h-3 w-3" />Rollback History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="triggers" className="mt-4 space-y-3">
          {triggers.map((trigger, i) => {
            const LIcon = LAYER_ICON[trigger.layer] || Server;
            const ratio = trigger.metric === "sync_success_rate" || trigger.metric === "canary_health_score" || trigger.metric === "security_gate_pass"
              ? (trigger.current_value / trigger.threshold) * 100
              : (trigger.current_value / trigger.threshold) * 100;
            const isInverse = trigger.metric === "sync_success_rate" || trigger.metric === "canary_health_score" || trigger.metric === "security_gate_pass";
            const isSafe = isInverse ? trigger.current_value > trigger.threshold : trigger.current_value < trigger.threshold;
            const dangerPct = isInverse ? Math.max(0, (1 - trigger.current_value / trigger.threshold) * 100) : Math.min(100, ratio);

            return (
              <motion.div key={trigger.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`border-border/50 bg-card/80 ${!isSafe ? "border-destructive/30" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/40 shrink-0">
                        <LIcon className={`h-5 w-5 ${LAYER_COLOR[trigger.layer]}`} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm font-semibold text-foreground">{trigger.condition}</p>
                          <div className="flex items-center gap-2">
                            {trigger.armed ? (
                              <Badge variant="outline" className="text-[10px] h-5 text-trust-safe border-trust-verified/30 gap-0.5"><ShieldCheck className="h-3 w-3" />Armed</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">Disarmed</Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] h-5">{trigger.layer.replace(/_/g, " ")}</Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-muted-foreground">Metric: <span className="font-mono text-foreground">{trigger.metric}</span></span>
                          <span className="text-muted-foreground">Current: <span className={`font-mono ${isSafe ? "text-trust-safe" : "text-destructive"}`}>{trigger.current_value}</span></span>
                          <span className="text-muted-foreground">Threshold: <span className="font-mono text-foreground">{trigger.threshold}</span></span>
                        </div>

                        <div>
                          <Progress value={Math.min(dangerPct, 100)} className={`h-1.5 ${!isSafe ? "[&>div]:bg-destructive" : dangerPct > 70 ? "[&>div]:bg-amber-500" : ""}`} />
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span>Triggered {trigger.trigger_count}x</span>
                          {trigger.last_triggered_at && <span>Last: {new Date(trigger.last_triggered_at).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {history.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10 shrink-0">
                      <RotateCcw className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-sm font-semibold text-foreground">{event.reason}</p>
                        <Badge variant={event.status === "completed" ? "default" : event.status === "failed" ? "destructive" : "secondary"} className="text-[10px] h-5">
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        <span>Layer: <span className="text-foreground">{event.layer.replace(/_/g, " ")}</span></span>
                        <span>Reverted: <span className="font-mono text-foreground">{event.reverted_change}</span></span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.affected_users.toLocaleString()} users</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>Started: {new Date(event.initiated_at).toLocaleString()}</span>
                        {event.completed_at && (
                          <span>Duration: {((new Date(event.completed_at).getTime() - new Date(event.initiated_at).getTime()) / 1000).toFixed(0)}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
