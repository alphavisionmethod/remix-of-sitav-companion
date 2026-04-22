import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, CheckCircle, Clock, AlertTriangle, Users, ArrowRight, Plus, FileText, Mail, Calendar, Package, Settings, Star, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DEMO_ACTIVE_CLIENTS, DEMO_JOURNEYS } from "@/data/seed/revenue-office";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const stepTypeIcons: Record<string, typeof Mail> = { email: Mail, form: FileText, booking: Calendar, meeting: Calendar, payment: Package, access: Settings, delivery: Package, document: FileText };

export default function ClientOnboarding() {
  const [tab, setTab] = useState("journeys");

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Onboarding Journeys</h1>
            <p className="text-sm text-muted-foreground">Structured onboarding flows, progress tracking, and drop-off prevention</p>
          </div>
          <Button size="sm" className="gap-1.5"><Plus className="w-3.5 h-3.5" />New Journey</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Journeys", value: ([] as typeof DEMO_JOURNEYS).filter(j => j.status === "active").length },
          { label: "Clients Onboarding", value: ([] as typeof DEMO_ACTIVE_CLIENTS).filter(c => c.status !== "completed").length },
          { label: "Avg. Completion", value: "82%" },
          { label: "Delayed", value: ([] as typeof DEMO_ACTIVE_CLIENTS).filter(c => c.status === "delayed").length, color: "text-amber-400" },
        ].map((k, i) => (
          <Card key={i} className="bg-card/50 border-border/50">
            <CardContent className="p-3 text-center">
              <p className={cn("text-xl font-bold", k.color || "text-foreground")}>{k.value}</p>
              <p className="text-[9px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5">
          {[
            { value: "journeys", label: "Journey Templates", icon: Rocket },
            { value: "active", label: "Active Clients", icon: Users },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 gap-1"><t.icon className="h-3 w-3" />{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="journeys">
            <div className="space-y-4">
              {([] as typeof DEMO_JOURNEYS).map(journey => (
                <Card key={journey.id} className="bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Rocket className="w-5 h-5 text-primary" />
                        <div>
                          <CardTitle className="text-base">{journey.name}</CardTitle>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant={journey.status === "active" ? "default" : "secondary"} className="text-[9px]">{journey.status}</Badge>
                            <span className="text-[10px] text-muted-foreground">{journey.steps.length} steps</span>
                            <span className="text-[10px] text-muted-foreground">{journey.activeClients} active</span>
                            {journey.completionRate !== "—" && <span className="text-[10px] text-emerald-400">{journey.completionRate} completion</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-[10px]"><Eye className="w-3 h-3 mr-1" />Edit</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {journey.steps.map((step, si) => {
                        const StepIcon = stepTypeIcons[step.type] || FileText;
                        return (
                          <div key={step.name} className="flex items-center gap-2">
                            <div className={cn("min-w-[140px] p-3 rounded-lg border text-center", step.completionRate >= 80 ? "bg-emerald-500/5 border-emerald-500/20" : step.completionRate >= 50 ? "bg-amber-500/5 border-amber-500/20" : "bg-muted/10 border-border/30")}>
                              <StepIcon className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-[10px] font-medium text-foreground">{step.name}</p>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                {step.auto ? (
                                  <Badge variant="outline" className="text-[7px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">L3 Auto</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[7px] bg-muted text-muted-foreground">Manual</Badge>
                                )}
                                <span className="text-[9px] text-muted-foreground">{step.completionRate}%</span>
                              </div>
                              {step.completionRate < 50 && (
                                <button className="mt-1 text-[7px] text-primary font-medium">⚡ Automate</button>
                              )}
                            </div>
                            {si < journey.steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-3">
              {([] as typeof DEMO_ACTIVE_CLIENTS).map((client, i) => (
                <Card key={i} className={cn("bg-card/50 border-border/50", client.status === "delayed" && "border-amber-500/30")}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{client.name.split(" ").map(n => n[0]).join("")}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{client.name}</p>
                          <p className="text-[10px] text-muted-foreground">{client.journey} • Started {client.startedAt}</p>
                        </div>
                      </div>
                      <Badge variant={client.status === "completed" ? "default" : client.status === "delayed" ? "destructive" : "secondary"} className="text-[9px] capitalize">{client.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={(client.step / client.totalSteps) * 100} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground">{client.step}/{client.totalSteps} steps</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
