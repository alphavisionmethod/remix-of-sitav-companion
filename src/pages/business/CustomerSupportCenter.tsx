import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HeadphonesIcon, AlertTriangle, Clock, CheckCircle2, ArrowUpRight,
  MessageSquare, User, ShieldAlert, RotateCcw, Sparkles, FileText,
  Phone, Mail, ChevronRight, Timer, TrendingDown
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low";
type IssueStatus = "open" | "waiting-on-us" | "waiting-on-customer" | "escalated" | "resolved";

interface SupportIssue {
  id: string;
  customer: string;
  subject: string;
  preview: string;
  severity: Severity;
  status: IssueStatus;
  owner: string;
  linkedEntity?: string;
  linkedType?: "order" | "invoice" | "appointment";
  createdAt: string;
  lastAction: string;
  responseCount: number;
  slaHours: number;
  hoursOpen: number;
}

const DEMO_ISSUES: SupportIssue[] = [
  { id: "SUP-001", customer: "Marcus Chen", subject: "Order arrived damaged — requesting replacement", preview: "The packaging was torn and the product inside has visible damage. I'd like a replacement shipped ASAP.", severity: "critical", status: "waiting-on-us", owner: "You", linkedEntity: "ORD-4521", linkedType: "order", createdAt: "2h ago", lastAction: "Customer sent photos", responseCount: 3, slaHours: 4, hoursOpen: 2 },
  { id: "SUP-002", customer: "Sarah Park", subject: "Billing discrepancy on last invoice", preview: "I was charged $450 but the agreed amount was $380. Can you look into this?", severity: "high", status: "open", owner: "Unassigned", linkedEntity: "INV-1892", linkedType: "invoice", createdAt: "5h ago", lastAction: "New ticket", responseCount: 0, slaHours: 8, hoursOpen: 5 },
  { id: "SUP-003", customer: "David Liu", subject: "Can't access my account portal", preview: "I've tried resetting my password three times and still can't log in.", severity: "medium", status: "waiting-on-us", owner: "Alex M.", createdAt: "1d ago", lastAction: "Escalated to tech", responseCount: 2, slaHours: 24, hoursOpen: 26 },
  { id: "SUP-004", customer: "Elena Torres", subject: "Requesting refund for cancelled service", preview: "I cancelled last week but was still charged. Please process refund.", severity: "high", status: "escalated", owner: "You", linkedEntity: "INV-2001", linkedType: "invoice", createdAt: "3d ago", lastAction: "Manager review pending", responseCount: 5, slaHours: 24, hoursOpen: 72 },
  { id: "SUP-005", customer: "James Wright", subject: "Feature request — bulk export", preview: "Would love to be able to export all my data in CSV format for reporting.", severity: "low", status: "open", owner: "Unassigned", createdAt: "2d ago", lastAction: "New ticket", responseCount: 0, slaHours: 72, hoursOpen: 48 },
  { id: "SUP-006", customer: "Amy Nguyen", subject: "Appointment was rescheduled without notice", preview: "My appointment was moved from Tuesday to Thursday without anyone telling me.", severity: "high", status: "waiting-on-customer", owner: "Alex M.", linkedEntity: "APT-337", linkedType: "appointment", createdAt: "6h ago", lastAction: "Apology sent, awaiting reply", responseCount: 2, slaHours: 8, hoursOpen: 6 },
  { id: "SUP-007", customer: "Robert Kim", subject: "Delivery tracking shows wrong address", preview: "The tracking info shows a completely different delivery address than what I provided.", severity: "critical", status: "open", owner: "Unassigned", linkedEntity: "ORD-4580", linkedType: "order", createdAt: "45m ago", lastAction: "New ticket", responseCount: 0, slaHours: 2, hoursOpen: 0.75 },
  { id: "SUP-008", customer: "Lisa Chang", subject: "Thank you — issue resolved perfectly", preview: "Just wanted to say thanks for the quick resolution on my last issue!", severity: "low", status: "resolved", owner: "You", createdAt: "1d ago", lastAction: "Closed", responseCount: 4, slaHours: 24, hoursOpen: 6 },
  { id: "SUP-009", customer: "Tom Bradley", subject: "Subscription renewal question", preview: "My annual plan renews next month — can I switch to monthly instead?", severity: "medium", status: "waiting-on-customer", owner: "You", createdAt: "12h ago", lastAction: "Options sent to customer", responseCount: 1, slaHours: 24, hoursOpen: 12 },
];

const severityConfig: Record<Severity, { color: string; icon: React.ReactNode }> = {
  critical: { color: "bg-destructive/15 text-destructive border-destructive/30", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  high: { color: "bg-orange-500/15 text-orange-600 border-orange-500/30", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  medium: { color: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: <Clock className="h-3.5 w-3.5" /> },
  low: { color: "bg-muted text-muted-foreground border-border", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

const statusLabels: Record<IssueStatus, string> = {
  open: "Open",
  "waiting-on-us": "Waiting on Us",
  "waiting-on-customer": "Waiting on Customer",
  escalated: "Escalated",
  resolved: "Resolved",
};

const KPIStrip = () => {
  const open = DEMO_ISSUES.filter(i => i.status !== "resolved").length;
  const critical = DEMO_ISSUES.filter(i => i.severity === "critical" && i.status !== "resolved").length;
  const escalated = DEMO_ISSUES.filter(i => i.status === "escalated").length;
  const breached = DEMO_ISSUES.filter(i => i.hoursOpen > i.slaHours && i.status !== "resolved").length;

  const kpis = [
    { label: "Open Issues", value: open, icon: <HeadphonesIcon className="h-4 w-4" />, accent: "text-primary" },
    { label: "Critical", value: critical, icon: <ShieldAlert className="h-4 w-4" />, accent: "text-destructive" },
    { label: "Escalated", value: escalated, icon: <ArrowUpRight className="h-4 w-4" />, accent: "text-orange-500" },
    { label: "SLA Breached", value: breached, icon: <Timer className="h-4 w-4" />, accent: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((k) => (
        <Card key={k.label} className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`rounded-lg bg-muted p-2 ${k.accent}`}>{k.icon}</div>
            <div>
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const IssueCard = ({ issue }: { issue: SupportIssue }) => {
  const sev = severityConfig[issue.severity];
  const breached = issue.hoursOpen > issue.slaHours && issue.status !== "resolved";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className={`border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer ${breached ? "ring-1 ring-destructive/30" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">{issue.id}</span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sev.color}`}>
                  {sev.icon}
                  <span className="ml-1">{issue.severity}</span>
                </Badge>
                {breached && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30">
                    <Timer className="h-3 w-3 mr-0.5" /> SLA Breached
                  </Badge>
                )}
                {issue.linkedEntity && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5 text-primary/70 border-primary/20">
                    <FileText className="h-3 w-3 mr-0.5" /> {issue.linkedEntity}
                  </Badge>
                )}
              </div>
              <h4 className="text-sm font-semibold text-foreground leading-tight">{issue.subject}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{issue.preview}</p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{issue.customer}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{issue.createdAt}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{issue.responseCount} replies</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge variant="secondary" className="text-[10px]">{statusLabels[issue.status]}</Badge>
              <span className="text-[10px] text-muted-foreground">{issue.owner}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AIAdvisorCard = () => (
  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" /> Support Advisor
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
        <p className="text-xs font-medium text-foreground">2 issues need immediate response</p>
        <p className="text-[11px] text-muted-foreground">SUP-001 (damaged order) and SUP-007 (wrong address) are both critical with no resolution path yet. Draft responses are ready.</p>
      </div>
      <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
        <p className="text-xs font-medium text-foreground">Escalation at risk</p>
        <p className="text-[11px] text-muted-foreground">SUP-004 has been escalated for 3 days without manager action. Consider direct follow-up.</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-xs h-7 flex-1">
          <MessageSquare className="h-3 w-3 mr-1" /> View Drafts
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7 flex-1">
          <Phone className="h-3 w-3 mr-1" /> Call Queue
        </Button>
      </div>
    </CardContent>
  </Card>
);

const CustomerSupportCenter = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filterIssues = (tab: string) => {
    if (tab === "all") return DEMO_ISSUES.filter(i => i.status !== "resolved");
    if (tab === "urgent") return DEMO_ISSUES.filter(i => (i.severity === "critical" || i.severity === "high") && i.status !== "resolved");
    if (tab === "waiting-on-us") return DEMO_ISSUES.filter(i => i.status === "waiting-on-us");
    if (tab === "waiting-on-customer") return DEMO_ISSUES.filter(i => i.status === "waiting-on-customer");
    if (tab === "escalated") return DEMO_ISSUES.filter(i => i.status === "escalated");
    if (tab === "resolved") return DEMO_ISSUES.filter(i => i.status === "resolved");
    return DEMO_ISSUES;
  };

  const filtered = filterIssues(activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HeadphonesIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Customer Support</h2>
          <p className="text-xs text-muted-foreground">Resolve issues, protect relationships, maintain trust</p>
        </div>
      </div>

      <KPIStrip />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 h-9">
              <TabsTrigger value="all" className="text-xs">All Open</TabsTrigger>
              <TabsTrigger value="urgent" className="text-xs">Urgent</TabsTrigger>
              <TabsTrigger value="waiting-on-us" className="text-xs">Waiting on Us</TabsTrigger>
              <TabsTrigger value="waiting-on-customer" className="text-xs">Waiting on Customer</TabsTrigger>
              <TabsTrigger value="escalated" className="text-xs">Escalated</TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card className="border-border/30 bg-card/60">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No issues in this category</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            )}
          </div>
        </div>

        <div className="space-y-4">
          <AIAdvisorCard />

          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" /> Impact Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avg. Resolution</span>
                <span className="font-medium text-foreground">4.2 hours</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Customer Satisfaction</span>
                <span className="font-medium text-foreground">94%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">First Response</span>
                <span className="font-medium text-foreground">18 min avg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Repeat Issues</span>
                <span className="font-medium text-foreground">2 this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <Mail className="h-3 w-3 mr-2" /> Send Batch Updates
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <RotateCcw className="h-3 w-3 mr-2" /> Review SLA Breaches
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <FileText className="h-3 w-3 mr-2" /> Export Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportCenter;
