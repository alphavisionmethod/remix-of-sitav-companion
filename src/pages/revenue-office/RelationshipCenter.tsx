import { motion } from "framer-motion";
import { Users, Search, Filter, Star, Clock, ArrowRight, Heart, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";
import { useCustomers } from "@/hooks/use-revenue-office";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/sita/EmptyState";


interface RelationshipCenterRow {
  company?: unknown;
  health_score?: unknown;
  last_contact_at?: unknown;
  lifecycle_stage?: unknown;
  ltv?: unknown;
  name?: string;
  tags?: string[];
}

const DEMO_LIFECYCLE_STAGES = [
  { label: "Subscriber", count: 234, color: "bg-blue-400" },
  { label: "Lead", count: 89, color: "bg-cyan-400" },
  { label: "Qualified", count: 34, color: "bg-green-400" },
  { label: "Opportunity", count: 18, color: "bg-yellow-400" },
  { label: "Customer", count: 67, color: "bg-purple-400" },
  { label: "Advocate", count: 12, color: "bg-pink-400" },
];

const DEMO_CONTACTS = [
  { name: "Sarah Mitchell", company: "Apex Digital", stage: "Customer", health: 92, ltv: "$12,400", lastContact: "2 days ago", tags: ["enterprise", "upsell-ready"] },
  { name: "James Chen", company: "Nova Labs", stage: "Opportunity", health: 75, ltv: "$0", lastContact: "5 days ago", tags: ["mid-market", "demo-scheduled"] },
  { name: "Emily Rodriguez", company: "Bright Path Co", stage: "Qualified", health: 68, ltv: "$0", lastContact: "1 week ago", tags: ["coaching", "warm"] },
  { name: "Michael Park", company: "Summit Group", stage: "Customer", health: 45, ltv: "$8,200", lastContact: "3 weeks ago", tags: ["at-risk", "enterprise"] },
  { name: "Lisa Wang", company: "Craft Studios", stage: "Advocate", health: 98, ltv: "$18,600", lastContact: "1 day ago", tags: ["referral-source", "vip"] },
];

export default function RelationshipCenter() {
  const { isDemoMode } = useDataMode();
  const { data: liveContacts, isLoading } = useCustomers();

  const LIFECYCLE_STAGES = isDemoMode ? DEMO_LIFECYCLE_STAGES : DEMO_LIFECYCLE_STAGES;
  const CONTACTS = isDemoMode ? DEMO_CONTACTS : (liveContacts?.map((c: RelationshipCenterRow) => ({
    name: c.name || "Unknown", company: c.company || "", stage: c.lifecycle_stage || "Lead",
    health: c.health_score || 50, ltv: `$${c.ltv || 0}`, lastContact: c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString() : "Never",
    tags: c.tags || [],
  })) ?? DEMO_CONTACTS);

  if (!isDemoMode && isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <DemoModeBadge />
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-36 rounded-xl" />)}</div>
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!isDemoMode && CONTACTS.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <DemoModeBadge />
        <h1 className="text-2xl font-bold text-foreground">Relationship Center</h1>
        <EmptyState icon={Users} title="No contacts yet" description="Add your first contact to start managing relationships." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Relationship Center</h1>
        <p className="text-sm text-muted-foreground">Lifecycle-aware CRM with relationship intelligence</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {LIFECYCLE_STAGES.map(s => (
          <Card key={s.label} className="bg-card/50 border-border/50 min-w-[140px] flex-shrink-0">
            <CardContent className="p-3 text-center">
              <div className={`w-3 h-3 rounded-full ${s.color} mx-auto mb-2`} />
              <p className="text-lg font-bold text-foreground">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contacts, companies, tags..." className="pl-9 bg-card/50 border-border/50" />
        </div>
        <Button variant="outline" size="icon" aria-label="Filter contacts"><Filter className="w-4 h-4" /></Button>
      </div>

      <div className="space-y-3">
        {CONTACTS.map((c: any, i: number) => (
          <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {c.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{c.name}</p>
                        <Badge variant="outline" className="text-xs">{c.stage}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Heart className={`w-3 h-3 ${c.health > 80 ? "text-green-400" : c.health > 50 ? "text-yellow-400" : "text-red-400"}`} />
                        <span className="text-sm font-medium text-foreground">{c.health}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Health</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{c.ltv}</p>
                      <p className="text-xs text-muted-foreground">LTV</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{c.lastContact}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap max-w-[160px]">
                      {c.tags.map((t: string) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
