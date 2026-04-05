import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe, Sparkles, CheckCircle, ArrowRight, Search, Zap, Shield, Play } from "lucide-react";
import { Input } from "@/components/ui/input";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

interface UseCase {
  id: string;
  title: string;
  description: string;
  connectors: { name: string; status: "connected" | "available" | "required" }[];
  workflows: string[];
  riskLevel: "low" | "medium" | "high";
  readiness: number;
}

const USE_CASES: UseCase[] = [
  {
    id: "uc-1", title: "Lead Recovery & Nurture", description: "Automatically capture, score, and nurture leads across channels",
    connectors: [{ name: "Email (Resend)", status: "connected" }, { name: "CRM", status: "available" }, { name: "Analytics", status: "required" }],
    workflows: ["Lead scoring pipeline", "Nurture email sequence", "CRM sync"],
    riskLevel: "low", readiness: 65,
  },
  {
    id: "uc-2", title: "Incident Alerting to Slack", description: "Route critical incidents to Slack channels in real-time",
    connectors: [{ name: "Slack", status: "available" }, { name: "Incident Monitor", status: "connected" }],
    workflows: ["Incident → Slack notification", "Escalation routing"],
    riskLevel: "low", readiness: 40,
  },
  {
    id: "uc-3", title: "Investor Evidence Bundles", description: "Auto-generate compliance and proof bundles for investors",
    connectors: [{ name: "Storage", status: "connected" }, { name: "Audit Service", status: "connected" }],
    workflows: ["Evidence collection", "Bundle generation", "Export pipeline"],
    riskLevel: "medium", readiness: 80,
  },
  {
    id: "uc-4", title: "Booking + CRM + Reminders", description: "Unified booking flow with CRM sync and automated reminders",
    connectors: [{ name: "Calendar", status: "required" }, { name: "CRM", status: "available" }, { name: "Email (Resend)", status: "connected" }],
    workflows: ["Booking creation", "CRM contact sync", "Reminder sequence"],
    riskLevel: "low", readiness: 30,
  },
];

const connectorStatusColor = { connected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", available: "bg-blue-500/10 text-blue-500 border-blue-500/20", required: "bg-amber-500/10 text-amber-500 border-amber-500/20" };

const IntegrationConciergePage = () => {
  const [search, setSearch] = useState("");
  const filtered = USE_CASES.filter(uc => uc.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" /> Integration Concierge
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Use-case-first connector setup — tell us what you want to achieve</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="What do you want to achieve? e.g., lead recovery, alerting..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
        {filtered.map(uc => (
          <motion.div key={uc.id} variants={fadeUp}>
            <Card className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{uc.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{uc.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[9px] ${uc.riskLevel === "low" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                      Risk: {uc.riskLevel}
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">{uc.readiness}% ready</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Required Connectors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {uc.connectors.map(c => (
                        <Badge key={c.name} variant="outline" className={`text-[9px] ${connectorStatusColor[c.status]}`}>
                          {c.status === "connected" && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Workflows</p>
                    <div className="space-y-1">
                      {uc.workflows.map(w => (
                        <div key={w} className="flex items-center gap-1.5 text-[10px] text-foreground">
                          <Zap className="h-2.5 w-2.5 text-muted-foreground" /> {w}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" className="h-7 text-xs"><Play className="h-3 w-3 mr-1" /> Simulate</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs"><Globe className="h-3 w-3 mr-1" /> Connect Missing</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default IntegrationConciergePage;
