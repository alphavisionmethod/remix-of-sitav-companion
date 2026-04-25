// ═══════════════════════════════════════════════════════════════
// Nova SDK — Extension Manager Window
// Tabbed UI for managing plugins, widgets, and integrations
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PluginRegistry, type InstalledPlugin } from "@/platform/nova-sdk/extensions/plugin-registry";
import { WidgetRegistry, type WidgetManifest } from "@/platform/nova-sdk/extensions/widget-registry";
import { IntegrationRegistry, type IntegrationInstance } from "@/platform/nova-sdk/extensions/integration-registry";
import { getPolishScore } from "@/platform/nova-sdk/extensions/polish-audit";
import { Puzzle, LayoutGrid, Link2, Sparkles, Shield, ShieldCheck, ShieldAlert, CircleHelp } from "lucide-react";

const trustIcons: Record<string, typeof Shield> = {
  system: ShieldCheck,
  verified: Shield,
  community: ShieldAlert,
  unknown: CircleHelp,
};

const trustColors: Record<string, string> = {
  system: "text-green-500",
  verified: "text-blue-500",
  community: "text-yellow-500",
  unknown: "text-muted-foreground",
};

function PluginsTab() {
  const [, setTick] = useState(0);
  const plugins = PluginRegistry.getInstalledPlugins();

  const togglePlugin = async (p: InstalledPlugin) => {
    if (p.enabled) await PluginRegistry.disablePlugin(p.manifest.id);
    else await PluginRegistry.enablePlugin(p.manifest.id);
    setTick(t => t + 1);
  };

  return (
    <div className="space-y-3">
      {plugins.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No plugins installed. Plugins extend the OS with new capabilities.
        </div>
      )}
      {plugins.map(p => {
        const TrustIcon = trustIcons[p.manifest.trustLevel] || CircleHelp;
        return (
          <div key={p.manifest.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3 min-w-0">
              <Puzzle className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{p.manifest.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5">{p.manifest.version}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <TrustIcon className={`h-3 w-3 ${trustColors[p.manifest.trustLevel]}`} />
                  <span className="text-[11px] text-muted-foreground">{p.manifest.trustLevel}</span>
                  {p.manifest.permissions.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      · {p.manifest.permissions.length} permissions
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Switch checked={p.enabled} onCheckedChange={() => togglePlugin(p)} />
          </div>
        );
      })}
    </div>
  );
}

function WidgetsTab() {
  const widgets = WidgetRegistry.getWidgets();

  return (
    <div className="space-y-3">
      {widgets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No widgets registered. Widgets provide dashboard components.
        </div>
      )}
      {widgets.map(w => (
        <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium text-sm">{w.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] px-1.5">{w.size}</Badge>
                <span className="text-[11px] text-muted-foreground">{w.category}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IntegrationsTab() {
  const [, setTick] = useState(0);
  const integrations = IntegrationRegistry.getIntegrations();

  const toggleConnection = async (i: IntegrationInstance) => {
    if (i.status === "connected") {
      IntegrationRegistry.disconnect(i.manifest.id);
    } else {
      await IntegrationRegistry.connect(i.manifest.id);
    }
    setTick(t => t + 1);
  };

  const statusColor: Record<string, string> = {
    connected: "bg-green-500/20 text-green-400",
    disconnected: "bg-muted text-muted-foreground",
    connecting: "bg-yellow-500/20 text-yellow-400",
    error: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-3">
      {integrations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No integrations available. Integrations connect to external services.
        </div>
      )}
      {integrations.map(i => (
        <div key={i.manifest.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3">
            <Link2 className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium text-sm">{i.manifest.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={`text-[10px] px-1.5 ${statusColor[i.status] || ""}`}>{i.status}</Badge>
                <span className="text-[11px] text-muted-foreground">{i.manifest.provider}</span>
              </div>
            </div>
          </div>
          <Switch
            checked={i.status === "connected"}
            onCheckedChange={() => toggleConnection(i)}
          />
        </div>
      ))}
    </div>
  );
}

function PolishScoreTab() {
  const score = getPolishScore();

  const scoreColor = (s: number) =>
    s >= 90 ? "text-green-400" : s >= 70 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Overall", value: score.overall },
          { label: "Animation", value: score.animation },
          { label: "Sound", value: score.sound },
          { label: "Interaction", value: score.interaction },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-lg bg-card border border-border text-center">
            <div className={`text-2xl font-bold ${scoreColor(s.value)}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {score.breakdown.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px] py-1 px-2 rounded hover:bg-muted/50">
            <span className={r.passed ? "text-green-400" : "text-red-400"}>
              {r.passed ? "✓" : "✗"}
            </span>
            <span className="text-muted-foreground">[{r.category}]</span>
            <span className="truncate">{r.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExtensionManagerWindow() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground p-4">
      <Tabs defaultValue="plugins" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="plugins" className="text-xs gap-1">
            <Puzzle className="h-3.5 w-3.5" /> Plugins
          </TabsTrigger>
          <TabsTrigger value="widgets" className="text-xs gap-1">
            <LayoutGrid className="h-3.5 w-3.5" /> Widgets
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs gap-1">
            <Link2 className="h-3.5 w-3.5" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="polish" className="text-xs gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Polish
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plugins" className="flex-1 overflow-y-auto"><PluginsTab /></TabsContent>
        <TabsContent value="widgets" className="flex-1 overflow-y-auto"><WidgetsTab /></TabsContent>
        <TabsContent value="integrations" className="flex-1 overflow-y-auto"><IntegrationsTab /></TabsContent>
        <TabsContent value="polish" className="flex-1 overflow-y-auto"><PolishScoreTab /></TabsContent>
      </Tabs>
    </div>
  );
}
