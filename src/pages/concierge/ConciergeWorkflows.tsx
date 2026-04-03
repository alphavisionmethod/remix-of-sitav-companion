import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useState } from "react";
import { Workflow, ShoppingCart, Calendar, Wrench, GraduationCap, Plane, Gift, Bell, CheckCircle, Clock, AlertTriangle, Play, Pause } from "lucide-react";

interface HouseholdWorkflow {
  id: string;
  title: string;
  category: "grocery" | "appointment" | "schedule" | "task" | "school" | "travel" | "provider" | "event" | "routine";
  status: "proposed" | "approved" | "queued" | "executing" | "completed" | "failed" | "needs-approval";
  trigger: string;
  impact: string;
  affectedPeople: string[];
  approvalRequired: boolean;
  approver?: string;
  proofState: "pending" | "recorded" | "verified";
  nextStep: string;
  linkedItems?: string[];
}

const workflows: HouseholdWorkflow[] = [
  { id: "1", title: "Weekly grocery order — prep for school lunches", category: "grocery", status: "needs-approval", trigger: "Sunday routine cycle", impact: "Ensures lunch supplies for Mon–Fri", affectedPeople: ["Emma", "Liam"], approvalRequired: true, approver: "You", proofState: "pending", nextStep: "Review list and approve order", linkedItems: ["14 items", "$87 estimated"] },
  { id: "2", title: "Reschedule dentist — conflict with soccer match", category: "appointment", status: "proposed", trigger: "Calendar conflict detected", impact: "Avoids missing Emma's soccer match", affectedPeople: ["Emma", "Liam"], approvalRequired: true, approver: "You", proofState: "pending", nextStep: "Confirm new time with Dr. Patel" },
  { id: "3", title: "HVAC filter auto-reorder", category: "provider", status: "queued", trigger: "90-day replacement cycle", impact: "Maintains air quality and system efficiency", affectedPeople: ["Household"], approvalRequired: false, proofState: "pending", nextStep: "Order ships Apr 5" },
  { id: "4", title: "School permission slip reminder — Emma", category: "school", status: "executing", trigger: "Deadline tomorrow", impact: "Required for field trip participation", affectedPeople: ["Emma"], approvalRequired: false, proofState: "pending", nextStep: "Sign and return by morning drop-off" },
  { id: "5", title: "Travel prep checklist — Spring break trip", category: "travel", status: "approved", trigger: "Trip in 18 days", impact: "Ensures readiness for family vacation", affectedPeople: ["Everyone"], approvalRequired: false, proofState: "pending", nextStep: "Start packing list, confirm pet sitter", linkedItems: ["8 prep items", "3 bookings to confirm"] },
  { id: "6", title: "Birthday gift order — Mom", category: "event", status: "completed", trigger: "Birthday in 12 days", impact: "Gift arrives on time", affectedPeople: ["Mom"], approvalRequired: false, proofState: "verified", nextStep: "Wrap when delivered" },
  { id: "7", title: "Assign garage cleanup — recurring", category: "task", status: "failed", trigger: "Monthly recurrence", impact: "Garage staying cluttered affects storage", affectedPeople: ["You", "Partner"], approvalRequired: false, proofState: "pending", nextStep: "Re-assign or defer to next weekend" },
];

const catIcon = (c: HouseholdWorkflow["category"]) => {
  const m = { grocery: ShoppingCart, appointment: Calendar, schedule: Calendar, task: CheckCircle, school: GraduationCap, travel: Plane, provider: Wrench, event: Gift, routine: Bell };
  return m[c] || Workflow;
};

const ConciergeWorkflows = () => {
  const [view, setView] = useState("all");
  const needsApproval = workflows.filter(w => w.status === "needs-approval").length;
  const active = workflows.filter(w => ["queued", "executing", "approved"].includes(w.status)).length;
  const completed = workflows.filter(w => w.status === "completed").length;

  const filtered = view === "approval" ? workflows.filter(w => w.status === "needs-approval" || w.approvalRequired)
    : view === "active" ? workflows.filter(w => ["queued", "executing", "approved"].includes(w.status))
    : view === "completed" ? workflows.filter(w => w.status === "completed")
    : workflows;

  return (
    <div className="space-y-6">
      <SitaPageHeader title="Household Workflows" subtitle="Automated routines, action queues, approvals, and execution tracking" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Active Workflows" value={String(active)} icon={Workflow} />
        <KPITile label="Needs Approval" value={String(needsApproval)} icon={AlertTriangle} sub={needsApproval > 0 ? "Review required" : "None pending"} />
        <KPITile label="Completed" value={String(completed)} icon={CheckCircle} sub="This week" />
        <KPITile label="Total Queue" value={String(workflows.length)} icon={Clock} />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All" },
          { key: "approval", label: "Approvals" },
          { key: "active", label: "In Progress" },
          { key: "completed", label: "Completed" },
        ]}
        active={view}
        onChange={setView}
      />

      <div className="space-y-4">
        {filtered.map(wf => {
          const Icon = catIcon(wf.category);
          return (
            <SitaCard key={wf.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{wf.title}</p>
                    <StateBadge state={wf.status as any} />
                  </div>
                  <p className="text-xs text-muted-foreground">{wf.trigger} · Affects: {wf.affectedPeople.join(", ")}</p>
                  <p className="text-xs text-foreground/80">{wf.impact}</p>

                  {wf.linkedItems && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {wf.linkedItems.map((item, i) => (
                        <span key={i} className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{item}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-border/30 mt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Next: {wf.nextStep}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrustBadge level={wf.proofState === "verified" ? "verified" : "review"} label={`proof: ${wf.proofState}`} size="sm" />
                    </div>
                  </div>

                  {wf.status === "needs-approval" && (
                    <div className="flex items-center gap-2 mt-2">
                      <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Approve</button>
                      <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors">Revise</button>
                      <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary/60 transition-colors">Defer</button>
                    </div>
                  )}
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>
    </div>
  );
};

export default ConciergeWorkflows;
