import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { StateBadge } from "@/platform/sita/components/sita/StateBadge";
import { GlassCard } from "@/platform/sita/components/sita/PremiumPageComponents";
import { ConciergeAdvisorInsightCard, ConciergeAutomationRuleCard, ConciergePageWrapper } from "@/components/concierge";
import type { AutomationRule } from "@/components/concierge";
import { useState } from "react";
import { Workflow, ShoppingCart, Calendar, Wrench, GraduationCap, Plane, Gift, Bell, CheckCircle, Clock, AlertTriangle, Play, Pause, Sparkles, Shield, Eye, Zap } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";

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

const suggestedAutomations = [
  { id: "s1", title: "Auto-order grocery staples weekly", trigger: "Every Sunday", benefit: "Saves ~30 min/week", safety: "Review before submit" },
  { id: "s2", title: "School lunch balance auto-refill", trigger: "Balance below $20", benefit: "Never runs out", safety: "Amount capped at $50" },
  { id: "s3", title: "Appointment reminder + prep checklist", trigger: "24h before any appointment", benefit: "Always prepared", safety: "Notification only" },
];

const ConciergeWorkflows = () => {
  const [view, setView] = useState("all");
  const [simulating, setSimulating] = useState<string | null>(null);
  const needsApproval = workflows.filter(w => w.status === "needs-approval").length;
  const active = workflows.filter(w => ["queued", "executing", "approved"].includes(w.status)).length;
  const completed = workflows.filter(w => w.status === "completed").length;
  const failed = workflows.filter(w => w.status === "failed").length;

  const filtered = view === "approval" ? workflows.filter(w => w.status === "needs-approval" || w.approvalRequired)
    : view === "active" ? workflows.filter(w => ["queued", "executing", "approved"].includes(w.status))
    : view === "completed" ? workflows.filter(w => w.status === "completed")
    : view === "failed" ? workflows.filter(w => w.status === "failed")
    : view === "suggested" ? []
    : workflows;

  return (
    <ConciergePageWrapper className="space-y-6">
      <PageTruthBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Active" value={String(active)} icon={Workflow} />
        <KPITile label="Approvals" value={String(needsApproval)} icon={AlertTriangle} sub={needsApproval > 0 ? "Review required" : "None"} />
        <KPITile label="Completed" value={String(completed)} icon={CheckCircle} sub="This week" />
        <KPITile label="Failed" value={String(failed)} icon={AlertTriangle} sub={failed > 0 ? "Needs attention" : "None"} />
        <KPITile label="Suggested" value={String(suggestedAutomations.length)} icon={Sparkles} sub="AI recommendations" />
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All" },
          { key: "approval", label: "Approvals" },
          { key: "active", label: "In Progress" },
          { key: "completed", label: "Completed" },
          { key: "failed", label: "Failed" },
          { key: "suggested", label: "Suggested" },
        ]}
        active={view}
        onChange={setView}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {view === "suggested" ? (
            <div className="space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(0_0%_50%)]">Suggested Automations</h3>
              {suggestedAutomations.map((sa) => (
                <GlassCard key={sa.id} glow="accent" intensity="subtle" className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-sm font-medium text-foreground">{sa.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Trigger: {sa.trigger}</span>
                        <span>Benefit: {sa.benefit}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Shield className="h-3 w-3 text-chart-2" />
                        <span className="text-chart-2">Safety: {sa.safety}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => setSimulating(sa.id)}
                          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Eye className="h-3 w-3 inline mr-1" />Simulate
                        </button>
                        <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Enable</button>
                      </div>
                      {simulating === sa.id && (
                        <div className="mt-2 rounded-lg bg-secondary/30 border border-border/20 p-3">
                          <p className="text-[10px] font-semibold text-foreground mb-1">Simulation Preview</p>
                          <p className="text-[10px] text-muted-foreground">If this ran last week: Would have triggered 1 time. Estimated time saved: ~30 min. No conflicts detected with existing automations.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(wf => {
                const Icon = catIcon(wf.category);
                return (
                  <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5 micro-hover-lift" key={wf.id} >
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-primary/8 p-2.5 shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{wf.title}</p>
                          <StateBadge state={wf.status as never} />
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Safety Boundaries */}
          <GlassCard glow="none" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-chart-2" />
              <p className="text-xs font-semibold text-foreground">Safety Boundaries</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                <p className="text-foreground">Spending actions over $200 require approval</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                <p className="text-foreground">Outbound messages reviewed before sending</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                <p className="text-foreground">Schedule changes notify affected family members</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                <p className="text-foreground">Max 3 automated actions per day without review</p>
              </div>
            </div>
          </GlassCard>

          {/* Paused Automations */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
            <div className="flex items-center gap-2 mb-2">
              <Pause className="h-4 w-4 text-amber-500" />
              <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Paused</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Pause className="h-3 w-3 text-amber-500" />
                <span className="text-foreground">Lawn service auto-schedule — paused until spring</span>
              </div>
              <div className="flex items-center gap-2">
                <Pause className="h-3 w-3 text-amber-500" />
                <span className="text-foreground">Pool maintenance reminders — seasonal pause</span>
              </div>
            </div>
          </div>

          {/* Advisor */}
          <ConciergeAdvisorInsightCard insight={{
            role: "Automation Advisor",
            message: "The grocery auto-order has been reliable for 8 weeks — consider upgrading to full auto-approve. The dentist reschedule conflict is blocking — resolve to unblock 2 downstream workflows.",
            linkedItems: ["Grocery auto-order", "Dentist conflict", "Workflow queue"],
            confidence: "high",
          }} />
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default ConciergeWorkflows;
