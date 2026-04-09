import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, AlertTriangle, Clock, Users, Plane, Home, RefreshCw, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { DEMO_TASKS } from "@/lib/demo-data/admin-platform";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

type TaskState = "active" | "completed" | "broken" | "stale";

const stateColor: Record<TaskState, string> = {
  active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  broken: "bg-red-500/10 text-red-500 border-red-500/20",
  stale: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

interface ConciergeTask {
  id: string;
  title: string;
  domain: "task" | "travel" | "household" | "promise";
  state: TaskState;
  assignee: string;
  lastUpdated: string;
  continuityBroken: boolean;
  receiptRef?: string;
}

const domainIcon: Record<string, typeof Activity> = { task: Activity, travel: Plane, household: Home, promise: CheckCircle };

const ConciergeRuntimeBoard = () => {
  const { isDemoMode } = useDataMode();
  const { data: householdTasks } = useQuery({
    queryKey: ["concierge-household-tasks"],
    queryFn: async () => {
      const { data } = await fromTable("household_tasks").select("*").limit(5);
      return data || [];
    },
  });

  const activeCount = DEMO_TASKS.filter(t => t.state === "active").length;
  const brokenCount = DEMO_TASKS.filter(t => t.continuityBroken).length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Concierge Runtime Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Task continuity, promises, and concierge execution truth</p>
        </div>
        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active Tasks", value: String(activeCount), color: "text-blue-500" },
            { label: "Broken Continuity", value: String(brokenCount), color: brokenCount > 0 ? "text-red-500" : "text-emerald-500" },
            { label: "Promises Tracked", value: String(DEMO_TASKS.filter(t => t.domain === "promise").length), color: "text-primary" },
            { label: "Household Tasks", value: String(householdTasks?.length ?? 0), color: "text-muted-foreground" },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="p-3.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Concierge Task Registry</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {DEMO_TASKS.map(t => {
                const DomainIcon = domainIcon[t.domain] || Activity;
                return (
                  <div key={t.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DomainIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{t.title}</span>
                        <Badge variant="outline" className={`text-[9px] ${stateColor[t.state]}`}>{t.state}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(t.lastUpdated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>Domain: <span className="text-foreground capitalize">{t.domain}</span></span>
                      <span>Agent: <span className="text-foreground">{t.assignee}</span></span>
                      {t.continuityBroken && <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-500 border-red-500/20"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Continuity broken</Badge>}
                      {t.receiptRef && <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">{t.receiptRef}</Badge>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ConciergeRuntimeBoard;
