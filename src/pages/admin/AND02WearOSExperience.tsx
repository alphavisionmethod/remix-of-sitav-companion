import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Watch, ArrowRight, Clock, Zap, Eye, Smartphone, AlertTriangle, Vibrate } from "lucide-react";
import ANDSubNav from "@/platform/admin/components/admin/ANDSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const AND02WearOSExperience = () => {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
<ANDSubNav />
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><Watch className="h-8 w-8 text-primary" /></div>
      <div>
        <h1 className="text-2xl font-bold">Wear OS Experience Board</h1>
        <p className="text-muted-foreground">Tiles, complications, glanceable states, micro-actions, escalation</p>
      </div>
    </div>

    <Tabs defaultValue="tiles" className="space-y-4">
      <TabsList>
        <TabsTrigger value="tiles">Tiles</TabsTrigger>
        <TabsTrigger value="actions">Micro-Actions</TabsTrigger>
        <TabsTrigger value="complications">Complications</TabsTrigger>
        <TabsTrigger value="escalation">Escalation</TabsTrigger>
      </TabsList>

      <TabsContent value="tiles">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([] as any[]).map((tile) => (
            <Card key={tile.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4" />{tile.name}</CardTitle>
                  <Badge variant={tile.priority === 0 ? "destructive" : "outline"}>P{tile.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded border"><Clock className="h-3 w-3 inline mr-1" />{tile.refresh}</div>
                  <div className="p-2 rounded border"><Zap className="h-3 w-3 inline mr-1" />{tile.items} items</div>
                </div>
                <div className="p-2 rounded border">Layout: <span className="font-mono">{tile.layout}</span></div>
                <div className="flex flex-wrap gap-1">{tile.sources.map((s) => <Badge key={s} variant="secondary" className="text-[10px] font-mono">{s}</Badge>)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="actions">
        <Card>
          <CardHeader><CardTitle className="text-sm">Micro-Action Registry</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b">
                <th className="text-left p-2">Action</th>
                <th className="p-2">Risk Ceiling</th>
                <th className="p-2">Biometric</th>
                <th className="p-2">Gesture</th>
                <th className="p-2">Feedback</th>
              </tr></thead>
              <tbody>
                {([] as any[]).map((a) => (
                  <tr key={a.action} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{a.action}</td>
                    <td className="p-2 text-center"><Badge variant={a.riskCeiling === "medium" ? "default" : "secondary"}>{a.riskCeiling}</Badge></td>
                    <td className="p-2 text-center font-mono">{a.biometric}</td>
                    <td className="p-2 text-center">{a.gesture}</td>
                    <td className="p-2 text-center"><Badge variant="outline">{a.feedback}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="complications">
        <Card>
          <CardHeader><CardTitle className="text-sm">Complication Registry</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([] as any[]).map((c) => (
                <div key={c.name} className="p-4 rounded-lg border space-y-2">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">Family: {c.family}</Badge>
                    <Badge variant="outline">Update: {c.update}</Badge>
                    <Badge variant="secondary">Data: {c.data}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="escalation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4" />Escalation Rules</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              {[
                { trigger: "Auto-escalate after 90s", target: "Phone via deep link", haptic: "long_pulse" },
                { trigger: "Risk > medium", target: "Phone with biometric", haptic: "direction_up" },
                { trigger: "Batch approval (>3)", target: "Phone inbox", haptic: "notification" },
                { trigger: "No connectivity", target: "Queue for sync", haptic: "retry" },
              ].map((e, i) => (
                <div key={i} className="p-3 rounded border space-y-1">
                  <div className="font-medium flex items-center gap-2"><AlertTriangle className="h-3 w-3" />{e.trigger}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline"><Smartphone className="h-3 w-3 mr-1" />{e.target}</Badge>
                    <Badge variant="secondary"><Vibrate className="h-3 w-3 mr-1" />{e.haptic}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Wear OS Constraints</CardTitle></CardHeader>
            <CardContent className="text-xs space-y-2">
              {[
                { label: "Max active tiles", value: "5" },
                { label: "Risk ceiling", value: "medium" },
                { label: "Biometric", value: "wrist detection only" },
                { label: "Batch actions", value: "not supported" },
                { label: "Offline mode", value: "queue + sync" },
                { label: "Text input", value: "voice dictation only" },
              ].map((c) => (
                <div key={c.label} className="flex justify-between p-2 rounded border">
                  <span>{c.label}</span><span className="font-mono">{c.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
  );
};

export default AND02WearOSExperience;
