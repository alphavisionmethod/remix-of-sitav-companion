import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Lightbulb, Shield, Zap, Clock, Eye, TrendingUp, ChevronRight, Info, Sparkles } from "lucide-react";
import { useOSOrchestration } from "@/platform/orchestration/hooks/useOSOrchestration";

export default function IntelligenceDashboard() {
  const os = useOSOrchestration();
  const [tab, setTab] = useState("overview");

  const context = os.getCurrentContext();
  const suggestion = os.suggestWorkspace();
  const safetyStats = os.getActionSafetyStats();
  const explanations = os.getRecentExplanations(5);
  const cognitiveLoad = os.getCognitiveLoad();
  const mode = os.getCurrentMode();
  const interventions = os.getActiveInterventions();

  const contextSignals = [
    { label: "Time", value: `${context.timeOfDay}:00`, icon: Clock, fresh: true },
    { label: "Mode", value: mode, icon: Zap, fresh: true },
    { label: "Cognitive Load", value: `${cognitiveLoad}%`, icon: Brain, fresh: true },
    { label: "Device", value: context.deviceId.slice(0, 15), icon: Eye, fresh: context.isOnline },
    { label: "Network", value: context.isOnline ? "Online" : "Offline", icon: TrendingUp, fresh: context.isOnline },
    { label: "Focus", value: context.currentFocus || "None", icon: Sparkles, fresh: !!context.currentFocus },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-sita-purple/20">
          <Brain className="h-6 w-6 text-sita-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your OS intelligence at a glance</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/[0.03] border border-white/[0.06]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="context">Context</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="explanations">Why?</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Active Context Signals */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {contextSignals.map((signal) => (
              <Card key={signal.label} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <signal.icon className={`h-4 w-4 ${signal.fresh ? "text-sita-purple" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{signal.label}</p>
                    <p className="text-sm font-medium text-foreground">{signal.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workspace Suggestion */}
          {suggestion.confidence > 0.4 && (
            <Card className="bg-gradient-to-r from-sita-purple/10 to-transparent border-sita-purple/20 backdrop-blur-xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-5 w-5 text-sita-gold" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Suggested: <span className="text-sita-purple capitalize">{suggestion.suggestedWorkspace}</span> workspace
                    </p>
                    <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-sita-purple/30 text-sita-purple">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-sita-purple hover:text-sita-purple/80"
                    onClick={() => os.applyWorkspace(suggestion.suggestedWorkspace)}
                  >
                    Apply <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Interventions */}
          {interventions.length > 0 && (
            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sita-gold" />
                  Chief of Staff Interventions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {interventions.slice(0, 3).map((i) => (
                  <div key={i.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <div>
                      <p className="text-sm text-foreground">{i.title}</p>
                      <p className="text-xs text-muted-foreground">{i.message}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => os.acknowledgeIntervention(i.id)}
                    >
                      Ack
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="context" className="mt-4">
          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Live Context Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {context.signals.map((signal) => (
                    <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${signal.freshness > 0.7 ? "bg-emerald-400" : signal.freshness > 0.3 ? "bg-amber-400" : "bg-red-400"}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{signal.source}:{signal.key}</p>
                          <p className="text-xs text-muted-foreground">
                            {typeof signal.value === "object" ? JSON.stringify(signal.value) : String(signal.value)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(signal.freshness * 100)}% fresh
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          conf: {Math.round(signal.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  {context.signals.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No active signals yet</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {(["passive", "assisted", "active_reversible", "high_risk"] as const).map((cls) => {
              const colors = {
                passive: "text-emerald-400 border-emerald-400/30",
                assisted: "text-blue-400 border-blue-400/30",
                active_reversible: "text-amber-400 border-amber-400/30",
                high_risk: "text-red-400 border-red-400/30",
              };
              return (
                <Card key={cls} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-bold ${colors[cls].split(" ")[0]}`}>{safetyStats[cls]}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{cls.replace("_", " ")}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-sita-purple mx-auto mb-2" />
              <p className="text-lg font-semibold text-foreground">{safetyStats.total} Actions Classified</p>
              <p className="text-sm text-muted-foreground">All actions evaluated against safety thresholds</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explanations" className="mt-4">
          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-sita-gold" />
                Recent Explanations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {explanations.map((exp) => (
                    <div key={exp.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {exp.type.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(exp.confidence * 100)}% confident
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{exp.title}</p>
                      <p className="text-xs text-muted-foreground">{exp.summary}</p>
                      {exp.reasoningChain.length > 0 && (
                        <div className="mt-2 pl-3 border-l-2 border-sita-purple/20 space-y-1">
                          {exp.reasoningChain.slice(0, 3).map((step, i) => (
                            <p key={i} className="text-xs text-muted-foreground">{step}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {explanations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No explanations yet. They appear when the OS makes decisions.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
