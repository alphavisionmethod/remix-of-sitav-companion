import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Brain, Eye, Trash2, Download, Settings, Lock, ToggleLeft } from "lucide-react";
import { useSitaOS } from "@/contexts/SitaOSContext";

interface DomainControl {
  domain: string;
  label: string;
  learnPatterns: boolean;
  trackContext: boolean;
  showRecommendations: boolean;
}

export default function PrivacyControlCenter() {
  const kernel = useSitaOS();
  const [tab, setTab] = useState("domains");

  const [domainControls, setDomainControls] = useState<DomainControl[]>([
    { domain: "business", label: "Business", learnPatterns: true, trackContext: true, showRecommendations: true },
    { domain: "finance", label: "Finance", learnPatterns: true, trackContext: true, showRecommendations: true },
    { domain: "concierge", label: "Personal", learnPatterns: true, trackContext: true, showRecommendations: true },
    { domain: "platform", label: "Platform", learnPatterns: true, trackContext: true, showRecommendations: true },
  ]);

  const [globalMemory, setGlobalMemory] = useState(true);
  const [contextTracking, setContextTracking] = useState(true);
  const [crossWorkspaceSharing, setCrossWorkspaceSharing] = useState(false);
  const [meshEnabled, setMeshEnabled] = useState(true);

  const toggleDomain = (domain: string, field: keyof DomainControl) => {
    setDomainControls(prev => prev.map(d =>
      d.domain === domain ? { ...d, [field]: !d[field as keyof DomainControl] } : d
    ));
  };

  const clearAllMemory = () => {
    kernel.explainability.clearHistory();
  };

  const explanationCount = kernel.explainability.getExplanationHistory().length;
  const workspaces = kernel.workspaceIntelligence.getAvailableWorkspaces();
  const usageStats = kernel.workspaceIntelligence.getWorkspaceUsageStats();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-sita-purple/20">
          <Shield className="h-6 w-6 text-sita-purple" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Privacy Controls</h1>
          <p className="text-sm text-muted-foreground">Manage what the OS learns and remembers</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/[0.03] border border-white/[0.06]">
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="mt-4 space-y-3">
          {domainControls.map((dc) => (
            <Card key={dc.domain} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-sita-purple" />
                    <span className="font-medium text-foreground">{dc.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {[dc.learnPatterns, dc.trackContext, dc.showRecommendations].filter(Boolean).length}/3 active
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Learn patterns</span>
                    <Switch checked={dc.learnPatterns} onCheckedChange={() => toggleDomain(dc.domain, "learnPatterns")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Track context</span>
                    <Switch checked={dc.trackContext} onCheckedChange={() => toggleDomain(dc.domain, "trackContext")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Show recommendations</span>
                    <Switch checked={dc.showRecommendations} onCheckedChange={() => toggleDomain(dc.domain, "showRecommendations")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="memory" className="mt-4 space-y-4">
          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Eye className="h-4 w-4 text-sita-gold" />
                Memory & History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <p className="text-xl font-bold text-foreground">{explanationCount}</p>
                  <p className="text-xs text-muted-foreground">Explanations</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] text-center">
                  <p className="text-xl font-bold text-foreground">{kernel.contextGraph.getContextSignals().length}</p>
                  <p className="text-xs text-muted-foreground">Active Signals</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-white/[0.06]"
                  onClick={clearAllMemory}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                  Clear Explanation History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 border-white/[0.06]"
                >
                  <Download className="h-4 w-4 text-sita-purple" />
                  Export Automation History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces" className="mt-4 space-y-3">
          {workspaces.map((ws) => {
            const stats = usageStats[ws];
            const policy = kernel.workspaceIntelligence.getWorkspacePolicy(ws);
            return (
              <Card key={ws} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground capitalize">{ws}</span>
                    <Badge variant="outline" className="text-xs">
                      {stats?.entries ?? 0} entries
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Learn patterns</span>
                      <Switch
                        checked={policy.memoryRules.learnPatterns}
                        onCheckedChange={(v) => kernel.workspaceIntelligence.setWorkspacePolicy(ws, {
                          memoryRules: { ...policy.memoryRules, learnPatterns: v },
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cross-workspace sharing</span>
                      <Switch
                        checked={policy.memoryRules.crossWorkspaceSharing}
                        onCheckedChange={(v) => kernel.workspaceIntelligence.setWorkspacePolicy(ws, {
                          memoryRules: { ...policy.memoryRules, crossWorkspaceSharing: v },
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="global" className="mt-4 space-y-3">
          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Global Intelligence Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">System Memory</p>
                  <p className="text-xs text-muted-foreground">Learn from your patterns and habits</p>
                </div>
                <Switch checked={globalMemory} onCheckedChange={setGlobalMemory} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Context Tracking</p>
                  <p className="text-xs text-muted-foreground">Track activity signals for suggestions</p>
                </div>
                <Switch checked={contextTracking} onCheckedChange={setContextTracking} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Cross-Workspace Sharing</p>
                  <p className="text-xs text-muted-foreground">Share learned data between workspaces</p>
                </div>
                <Switch checked={crossWorkspaceSharing} onCheckedChange={setCrossWorkspaceSharing} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Device Mesh</p>
                  <p className="text-xs text-muted-foreground">Enable nearby device cooperation</p>
                </div>
                <Switch checked={meshEnabled} onCheckedChange={setMeshEnabled} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
