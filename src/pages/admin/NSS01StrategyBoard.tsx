import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Layers, Smartphone, Monitor, Watch, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const PLATFORMS = [
  { platform: "iOS (iPhone)", tech: ["Swift/SwiftUI", "WebView hybrid"], stage: "alpha", readiness: 25, approach: "Hybrid shell — native chrome, WebView content", blockers: ["Core navigation shell", "Push integration"], strengths: ["Fastest to market", "Shared web logic"] },
  { platform: "Android", tech: ["Kotlin/Compose", "WebView hybrid"], stage: "planned", readiness: 10, approach: "Hybrid shell — Material Design chrome, WebView content", blockers: ["Architecture design", "Material Design shell"], strengths: ["Native feel", "Play Store distribution"] },
  { platform: "iOS Tablet (iPad)", tech: ["SwiftUI", "Sidebar layout"], stage: "planned", readiness: 5, approach: "Extended phone shell with sidebar navigation", blockers: ["Awaiting iPhone shell", "Tablet layouts"], strengths: ["Multitasking", "Pencil support"] },
  { platform: "Android Tablet", tech: ["Compose", "Rail navigation"], stage: "planned", readiness: 5, approach: "Extended phone shell with rail navigation", blockers: ["Awaiting Android shell"], strengths: ["Foldable support", "Multi-window"] },
];

const STRATEGY_PRINCIPLES = [
  { principle: "One sovereign runtime", desc: "Core business logic lives in the web layer — native shells wrap it", priority: "P0" },
  { principle: "Native where it matters", desc: "Push, biometric, camera, haptics — these MUST be native", priority: "P0" },
  { principle: "WebView for content", desc: "Domain pages rendered in WebView — single source of truth", priority: "P0" },
  { principle: "Platform-native chrome", desc: "Navigation, tabs, status bar — all platform-native", priority: "P1" },
  { principle: "Progressive capability", desc: "Features degrade gracefully on less-capable surfaces", priority: "P1" },
  { principle: "Shared design tokens", desc: "Colors, spacing, typography sync across web and native", priority: "P1" },
];

const NSS01StrategyBoard = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
    <DemoModeBadge />
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-8 w-8 text-primary" /></div>
      <div>
        <h1 className="text-2xl font-bold">Native Shell Strategy Board</h1>
        <p className="text-muted-foreground">iPhone and Android native shells — one sovereign runtime, native-feeling apps</p>
      </div>
    </div>

    <Tabs defaultValue="platforms" className="space-y-4">
      <TabsList>
        <TabsTrigger value="platforms">Platform Shells</TabsTrigger>
        <TabsTrigger value="strategy">Strategy Principles</TabsTrigger>
        <TabsTrigger value="architecture">Architecture</TabsTrigger>
      </TabsList>

      <TabsContent value="platforms">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORMS.map((s) => (
            <Card key={s.platform} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" />{s.platform}</CardTitle>
                  <Badge variant={s.stage === "alpha" ? "default" : "secondary"}>{s.stage}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span>Readiness</span><span className="font-mono">{s.readiness}%</span></div>
                  <Progress value={s.readiness} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground">{s.approach}</p>
                <div className="flex flex-wrap gap-1">{s.tech.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
                <div className="space-y-1 pt-2 border-t">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />Strengths</span>
                  {s.strengths.map((st) => <p key={st} className="text-[10px] text-muted-foreground pl-4">• {st}</p>)}
                </div>
                {s.blockers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Blockers</span>
                    {s.blockers.map((b) => <p key={b} className="text-[10px] text-muted-foreground pl-4">• {b}</p>)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="strategy">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STRATEGY_PRINCIPLES.map((p) => (
            <Card key={p.principle} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{p.principle}</CardTitle>
                  <Badge variant={p.priority === "P0" ? "destructive" : "default"}>{p.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">{p.desc}</p></CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="architecture">
        <Card>
          <CardHeader><CardTitle className="text-sm">Hybrid Shell Architecture</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { layer: "Native Shell", items: ["Navigation chrome", "Push handling", "Biometric bridge", "Camera/NFC", "Haptic engine"], color: "bg-blue-500/10" },
                { layer: "Bridge Layer", items: ["JS ↔ Native messaging", "Auth token sync", "Deep link handler", "Capability detection"], color: "bg-amber-500/10" },
                { layer: "WebView Content", items: ["Domain pages (React)", "Business logic", "Design system", "State management"], color: "bg-green-500/10" },
              ].map((l) => (
                <div key={l.layer} className={`p-4 rounded-lg border ${l.color}`}>
                  <div className="font-medium text-sm mb-2">{l.layer}</div>
                  {l.items.map((i) => <div key={i} className="text-xs p-1.5 rounded border bg-background/50 mb-1">{i}</div>)}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">The native shell provides platform-native UX while the WebView layer delivers the full SITA experience. The bridge layer handles bidirectional communication between the two.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default NSS01StrategyBoard;
