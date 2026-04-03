import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { SitaTabs, KPITile } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Brain, Sliders, Shield, MessageSquare, Clock, Eye, Zap, Heart,
  Bell, Calendar, Briefcase, DollarSign, Home, Sparkles, Check, Edit, Save, ChevronRight
} from "lucide-react";

type SubPage = "profile" | "preferences" | "memory" | "automation" | "boardroom";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/preferences")) return "preferences";
  if (path.includes("/memory")) return "memory";
  if (path.includes("/automation")) return "automation";
  if (path.includes("/boardroom")) return "boardroom";
  return "profile";
};

const learnings = [
  { label: "Prefers concise morning summaries", confidence: 92, source: "Behavior Pattern", category: "communication" },
  { label: "Reviews money before business on Mondays", confidence: 87, source: "Session History", category: "routine" },
  { label: "Approves under $500 without detailed review", confidence: 78, source: "Approval History", category: "trust" },
  { label: "Responds faster to SMS than email", confidence: 85, source: "Response Analysis", category: "communication" },
  { label: "Prefers visual charts over tabular data", confidence: 71, source: "Interaction Pattern", category: "style" },
  { label: "Household scheduling peaks Wednesday-Thursday", confidence: 90, source: "Calendar Analysis", category: "routine" },
];

const ProfileSection = () => {
  const [editing, setEditing] = useState(false);
  const traits = [
    { icon: MessageSquare, label: "Communication Style", value: "Supportive & Clear", options: ["Direct", "Supportive & Clear", "Analytical", "Casual"] },
    { icon: Eye, label: "Explanation Depth", value: "Balanced", options: ["Minimal", "Balanced", "Detailed"] },
    { icon: Shield, label: "Risk Tolerance", value: "Moderate", options: ["Conservative", "Moderate", "Aggressive"] },
    { icon: Clock, label: "Reminder Cadence", value: "Gentle", options: ["Minimal", "Gentle", "Persistent"] },
    { icon: Zap, label: "Automation Comfort", value: "Growing", options: ["Manual Only", "Growing", "Fully Automated"] },
    { icon: Bell, label: "Notification Sensitivity", value: "Important Only", options: ["All", "Important Only", "Critical Only", "Silent"] },
    { icon: Calendar, label: "Calendar Intensity", value: "Moderate", options: ["Light", "Moderate", "Packed"] },
    { icon: Heart, label: "Life Priority", value: "Family → Business → Self", options: ["Business First", "Family → Business → Self", "Balanced", "Self → Others"] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SitaSectionHeader title="Your Operating Profile" subtitle="How SITA understands and communicates with you" />
        <SitaButton variant={editing ? "primary" : "secondary"} size="sm" onClick={() => setEditing(!editing)}>
          {editing ? <><Save className="h-3.5 w-3.5" /> Save</> : <><Edit className="h-3.5 w-3.5" /> Edit</>}
        </SitaButton>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {traits.map((t, i) => (
          <SitaCard key={i} hover={false} className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/8 p-2"><t.icon className="h-4 w-4 text-primary" /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{t.label}</p>
                {editing ? (
                  <select className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-2 py-1.5 text-sm text-foreground">
                    {t.options.map(o => <option key={o} selected={o === t.value}>{o}</option>)}
                  </select>
                ) : (
                  <p className="mt-0.5 text-sm font-medium text-foreground">{t.value}</p>
                )}
              </div>
            </div>
          </SitaCard>
        ))}
      </div>

      <SitaSectionHeader title="What SITA Has Learned" subtitle="Inferred patterns from your behavior" />
      <div className="space-y-2">
        {learnings.map((l, i) => (
          <SitaCard key={i} hover={false} className="p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{l.label}</p>
                  <p className="text-[11px] text-muted-foreground">{l.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${l.confidence}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8">{l.confidence}%</span>
                </div>
                <TrustBadge level={l.confidence >= 85 ? "verified" : l.confidence >= 70 ? "review" : "low-confidence"} size="sm" />
              </div>
            </div>
          </SitaCard>
        ))}
      </div>

      <SitaCard hover={false} glow className="p-5 gradient-sita-subtle">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="h-5 w-5 text-primary" />
          <SitaCardTitle>SITA is Still Learning</SitaCardTitle>
        </div>
        <div className="space-y-2">
          {["Your preferred time for weekly reviews", "Shopping brand preferences", "How you handle urgent vs routine tasks"].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              {item}
            </div>
          ))}
        </div>
      </SitaCard>
    </div>
  );
};

const PreferencesSection = () => {
  const groups = [
    { title: "Business", icon: Briefcase, prefs: [
      { key: "Lead follow-up cadence", val: "24h first, 48h second" },
      { key: "Quote approval threshold", val: "$1,000" },
      { key: "Invoice reminder timing", val: "3 days before due" },
      { key: "Preferred CRM view", val: "Pipeline" },
    ]},
    { title: "Money", icon: DollarSign, prefs: [
      { key: "Safe-to-spend buffer", val: "$500" },
      { key: "Bill payment preference", val: "3 days early" },
      { key: "Savings auto-transfer", val: "Weekly $200" },
      { key: "Spending alert threshold", val: "$150" },
    ]},
    { title: "Household", icon: Home, prefs: [
      { key: "Grocery restock day", val: "Sunday" },
      { key: "School pickup coordinator", val: "Alternating" },
      { key: "Household task assignment", val: "Shared" },
      { key: "Family meeting day", val: "Sunday evening" },
    ]},
  ];

  return (
    <div className="space-y-6">
      {groups.map((g, gi) => (
        <div key={gi} className="space-y-3">
          <SitaSectionHeader title={g.title} />
          <div className="grid gap-2 sm:grid-cols-2">
            {g.prefs.map((p, pi) => (
              <SitaCard key={pi} hover={false} className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{p.key}</span>
                  <span className="text-sm font-medium text-foreground">{p.val}</span>
                </div>
              </SitaCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const MemorySection = () => (
  <div className="space-y-6">
    <SitaSectionHeader title="Memory by Category" subtitle="What SITA remembers about you" />
    {[
      { cat: "People & Relationships", count: 24, items: ["Sarah Chen prefers email", "Marcus Johnson pays within 3 days", "James Rodriguez expanding scope Q2"] },
      { cat: "Workflow Patterns", count: 18, items: ["Invoice reminders work best at 9 AM", "Follow-ups convert 34% better with personal touch", "Approvals fastest on Tuesday mornings"] },
      { cat: "Financial Behavior", count: 15, items: ["Spending peaks mid-month", "Subscriptions reviewed quarterly", "Emergency fund target: $10,000"] },
      { cat: "Household Routines", count: 12, items: ["Grocery shopping Sunday PM", "Kids' activities peak Tue/Thu", "Service providers prefer morning appointments"] },
    ].map((c, i) => (
      <SitaCard key={i} hover={false} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <SitaCardTitle>{c.cat}</SitaCardTitle>
          <span className="text-xs text-muted-foreground">{c.count} memories</span>
        </div>
        <div className="space-y-1.5">
          {c.items.map((item, j) => (
            <div key={j} className="flex items-center gap-2 text-xs text-foreground">
              <Brain className="h-3 w-3 text-primary shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </SitaCard>
    ))}
  </div>
);

const AutomationSection = () => (
  <div className="space-y-6">
    <SitaSectionHeader title="Automation Level" subtitle="What SITA handles automatically vs. with approval" />
    {[
      { action: "Send invoice reminders", level: "Fully Automated", trust: "verified" as const },
      { action: "Follow-up lead emails", level: "Draft for Review", trust: "review" as const },
      { action: "Pay recurring bills", level: "Approval Required", trust: "approval" as const },
      { action: "Schedule appointments", level: "Suggest Only", trust: "low-confidence" as const },
      { action: "Grocery restock orders", level: "Fully Automated", trust: "verified" as const },
      { action: "Quote generation", level: "Draft for Review", trust: "review" as const },
    ].map((a, i) => (
      <SitaCard key={i} hover={false} className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{a.action}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{a.level}</span>
            <TrustBadge level={a.trust} size="sm" />
          </div>
        </div>
      </SitaCard>
    ))}
  </div>
);

const BoardroomSection = () => (
  <div className="space-y-6">
    <SitaSectionHeader title="Boardroom Style" subtitle="How SITA presents reviews and decisions" />
    {[
      { key: "Review frequency", val: "Weekly (Sunday evening)" },
      { key: "Presentation style", val: "Visual with key numbers" },
      { key: "Decision format", val: "Recommended action + alternatives" },
      { key: "Risk visibility", val: "Always shown" },
      { key: "Historical comparison", val: "4-week rolling" },
    ].map((p, i) => (
      <SitaCard key={i} hover={false} className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{p.key}</span>
          <span className="text-sm font-medium text-foreground">{p.val}</span>
        </div>
      </SitaCard>
    ))}
  </div>
);

const PersonalizationStudio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);

  const goTo = (key: string) => {
    if (key === "profile") navigate("/personalization");
    else navigate(`/personalization/${key}`);
  };

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader title="Personalization Studio" subtitle="How SITA understands you — your profile, preferences, and learning model" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Learned Facts" value="69" trend="up" sub="+8 this week" icon={Brain} />
        <KPITile label="Confidence Score" value="84%" trend="up" sub="Strong alignment" icon={Sparkles} />
        <KPITile label="Automations Active" value="12" sub="6 fully auto" icon={Zap} />
        <KPITile label="Profile Completeness" value="78%" trend="up" sub="3 areas to improve" icon={User} />
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <SitaTabs
          tabs={[
            { key: "profile", label: "Profile" },
            { key: "preferences", label: "Preferences" },
            { key: "memory", label: "Memory" },
            { key: "automation", label: "Automation" },
            { key: "boardroom", label: "Boardroom Style" },
          ]}
          active={activePage}
          onChange={goTo}
        />
      </div>

      {activePage === "profile" && <ProfileSection />}
      {activePage === "preferences" && <PreferencesSection />}
      {activePage === "memory" && <MemorySection />}
      {activePage === "automation" && <AutomationSection />}
      {activePage === "boardroom" && <BoardroomSection />}
    </motion.div>
  );
};

export default PersonalizationStudio;
