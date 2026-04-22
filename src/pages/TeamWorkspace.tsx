import { useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { KPITile, EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion } from "framer-motion";
import { Users, UserPlus, ArrowRightLeft, CheckCircle2, Clock, AlertTriangle, BarChart3, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

interface TeamMember { id: string; name: string; role: string; activeTasks: number; completedThisWeek: number; overdue: number; load: "light" | "normal" | "heavy" | "overloaded"; avatar: string; }
interface Delegation { id: string; task: string; from: string; to: string; status: "pending" | "accepted" | "in-progress" | "completed"; dueDate: string; priority: string; }

const MEMBERS: TeamMember[] = [
  { id: "1", name: "You", role: "Owner", activeTasks: 8, completedThisWeek: 12, overdue: 1, load: "heavy", avatar: "Y" },
  { id: "2", name: "Sarah Park", role: "Operations", activeTasks: 5, completedThisWeek: 9, overdue: 0, load: "normal", avatar: "S" },
  { id: "3", name: "James Wright", role: "Finance", activeTasks: 3, completedThisWeek: 7, overdue: 0, load: "light", avatar: "J" },
  { id: "4", name: "Elena Torres", role: "Support", activeTasks: 6, completedThisWeek: 4, overdue: 2, load: "overloaded", avatar: "E" },
];

const DELEGATIONS: Delegation[] = [
  { id: "1", task: "Review Q2 invoices", from: "You", to: "James Wright", status: "in-progress", dueDate: "Tomorrow", priority: "high" },
  { id: "2", task: "Update client onboarding docs", from: "You", to: "Sarah Park", status: "pending", dueDate: "Friday", priority: "normal" },
  { id: "3", task: "Follow up with vendor", from: "Sarah Park", to: "Elena Torres", status: "completed", dueDate: "Today", priority: "normal" },
];

const LOAD_COLORS = { light: "text-emerald-400 bg-emerald-500/10", normal: "text-sky-400 bg-sky-500/10", heavy: "text-amber-400 bg-amber-500/10", overloaded: "text-red-400 bg-red-500/10" };
const STATUS_COLORS = { pending: "bg-amber-500/15 text-amber-300", accepted: "bg-sky-500/15 text-sky-300", "in-progress": "bg-primary/15 text-primary", completed: "bg-emerald-500/15 text-emerald-300" };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const TeamWorkspace = () => {
  const [tab, setTab] = useState("workload");

  return (
    <PageShell>
    <div className="min-h-screen pb-12">
<SitaPageHeader title="Team & Delegation" subtitle="Assign, track, and balance workload" actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 border-border/50"><ArrowRightLeft className="w-3.5 h-3.5" /> Delegate Task</Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-border/50"><UserPlus className="w-3.5 h-3.5" /> Invite</Button>
        </div>
      } />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KPITile label="Team Members" value={MEMBERS.length.toString()} icon={Users} />
        <KPITile label="Active Tasks" value={MEMBERS.reduce((s, m) => s + m.activeTasks, 0).toString()} icon={Clock} />
        <KPITile label="Overdue" value={MEMBERS.reduce((s, m) => s + m.overdue, 0).toString()} icon={AlertTriangle} />
        <KPITile label="Completed This Week" value={MEMBERS.reduce((s, m) => s + m.completedThisWeek, 0).toString()} icon={CheckCircle2} />
      </div>

      <SitaTabs tabs={[
        { key: "workload", label: "Workload" },
        { key: "delegations", label: "Delegations" },
        { key: "activity", label: "Activity" },
      ]} active={tab} onChange={setTab} className="mb-4" />

      {tab === "workload" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MEMBERS.map(m => (
            <motion.div key={m.id} variants={fadeUp} initial="hidden" animate="show">
              <SitaCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-bold">{m.avatar}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role}</div>
                  </div>
                  <Badge className={cn("text-[10px] px-1.5 py-0.5", LOAD_COLORS[m.load])}>{m.load}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-card/50">
                    <div className="text-base font-semibold">{m.activeTasks}</div>
                    <div className="text-[10px] text-muted-foreground">Active</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card/50">
                    <div className="text-base font-semibold text-emerald-400">{m.completedThisWeek}</div>
                    <div className="text-[10px] text-muted-foreground">Done</div>
                  </div>
                  <div className="p-2 rounded-lg bg-card/50">
                    <div className={cn("text-base font-semibold", m.overdue > 0 ? "text-red-400" : "text-muted-foreground")}>{m.overdue}</div>
                    <div className="text-[10px] text-muted-foreground">Overdue</div>
                  </div>
                </div>
                {/* Load bar */}
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-border/30 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", m.load === "overloaded" ? "bg-red-400" : m.load === "heavy" ? "bg-amber-400" : m.load === "normal" ? "bg-sky-400" : "bg-emerald-400")}
                      style={{ width: `${Math.min((m.activeTasks / 10) * 100, 100)}%` }} />
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {tab === "delegations" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {DELEGATIONS.map(d => (
            <SitaCard key={d.id} className="p-4" hover>
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{d.task}</div>
                  <div className="text-xs text-muted-foreground">{d.from} → {d.to} · Due {d.dueDate}</div>
                </div>
                <Badge className={cn("text-[10px] px-1.5", STATUS_COLORS[d.status])}>{d.status}</Badge>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
              </div>
            </SitaCard>
          ))}
        </motion.div>
      )}

      {tab === "activity" && (
        <EmptyState icon={BarChart3} title="Team Activity" description="Recent team actions and handoffs will appear here as your team gets active" />
      )}
    </div>
    </PageShell>
  );
};

export default TeamWorkspace;
