// ═══════════════════════════════════════════════════════════════
// Settings — Connectivity Group (Network, Bluetooth, Cloud & Sync, Integrations)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import {
  Wifi, Bluetooth, Lock, Cloud, RefreshCw, Globe, ChevronRight,
  WifiOff, Signal, Search, Headphones, Mouse, Speaker, Trash2,
  Shield, Key, FolderSync, Upload, Download,
} from "lucide-react";
import { VStack, HStack, Divider } from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaAvatar, NovaSlider,
} from "@/platform/nova-sdk/ui/components";
import { useSettingsValue } from "@/platform/settings/hooks/use-settings-value";
import { toast } from "sonner";
import { SettingRow, ResetSectionButton } from "./shared";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { cn } from "@/lib/utils";

const AVAILABLE_NETWORKS = [
  { ssid: "SITA-Network", signal: 92, secured: true, connected: true },
  { ssid: "SITA-Guest", signal: 78, secured: true, connected: false },
  { ssid: "Neighbor-5G", signal: 45, secured: true, connected: false },
  { ssid: "CoffeeShop-Free", signal: 32, secured: false, connected: false },
  { ssid: "IoT-Hub", signal: 65, secured: true, connected: false },
];

function SignalBars({ strength }: { strength: number }) {
  const bars = strength > 75 ? 4 : strength > 50 ? 3 : strength > 25 ? 2 : 1;
  return (
    <div className="flex items-end gap-[1px] h-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={cn(
          "w-[3px] rounded-full transition-colors",
          i <= bars ? "bg-[hsl(152_55%_48%)]" : "bg-[hsl(0_0%_25%)]"
        )} style={{ height: `${25 + i * 18}%` }} />
      ))}
    </div>
  );
}

export function NetworkContent() {
  const [wifiOn, setWifiOn] = useSettingsValue("network.wifi.autoJoin", true);
  const [dns, setDns] = useSettingsValue("network.dns", "auto");
  const [proxy, setProxy] = useSettingsValue("network.proxy", "none");
  const [scanning, setScanning] = useState(false);

  const handleScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => { setScanning(false); toast.success("Network scan complete"); }, 1500);
  }, []);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Wi-Fi" icon={<Wifi className="h-3.5 w-3.5" />}>
            <NovaToggle checked={wifiOn} onChange={setWifiOn} />
          </SettingRow>
        </VStack>
      </NovaCard>

      {wifiOn && (
        <>
          <NovaCard>
            <VStack spacing="tight">
              <HStack spacing="tight" align="center" justify="between">
                <NovaSectionLabel className="!px-0">Available Networks</NovaSectionLabel>
                <NovaButton
                  variant="ghost"
                  onClick={handleScan}
                  className={cn("!text-[9px] !py-0.5 !px-2", scanning && "animate-spin")}
                  icon={<Search className="h-3 w-3" />}
                >
                  {scanning ? "Scanning…" : "Scan"}
                </NovaButton>
              </HStack>
              {AVAILABLE_NETWORKS.map(net => (
                <HStack key={net.ssid} spacing="tight" align="center" className="py-1.5">
                  <SignalBars strength={net.signal} />
                  <VStack spacing="micro" className="flex-1 min-w-0">
                    <HStack spacing="micro" align="center">
                      <NovaText variant="body" className="truncate !text-[11px]">{net.ssid}</NovaText>
                      {net.secured && <Lock className="h-2.5 w-2.5 text-[hsl(0_0%_50%)] shrink-0" />}
                    </HStack>
                    <NovaText variant="label" muted className="!text-[9px]">{net.signal}% signal</NovaText>
                  </VStack>
                  {net.connected ? (
                    <NovaBadge variant="success" className="!text-[8px]">Connected</NovaBadge>
                  ) : (
                    <NovaButton variant="secondary" className="!text-[9px] !py-0.5 !px-2">Join</NovaButton>
                  )}
                </HStack>
              ))}
            </VStack>
          </NovaCard>

          <NovaCard>
            <VStack spacing="tight">
              <NovaSectionLabel className="!px-0">Network Settings</NovaSectionLabel>
              <SettingRow label="DNS" description="Domain name resolution" icon={<Globe className="h-3.5 w-3.5" />}>
                <select
                  value={dns}
                  onChange={(e) => setDns(e.target.value)}
                  className="text-[10px] bg-[hsl(0_0%_100%/0.06)] border border-border/30 rounded-md px-2 py-1 text-foreground"
                >
                  <option value="auto">Automatic</option>
                  <option value="1.1.1.1">Cloudflare (1.1.1.1)</option>
                  <option value="8.8.8.8">Google (8.8.8.8)</option>
                  <option value="9.9.9.9">Quad9 (9.9.9.9)</option>
                </select>
              </SettingRow>
              <Divider />
              <SettingRow label="Proxy" description="HTTP/HTTPS proxy" icon={<Shield className="h-3.5 w-3.5" />}>
                <select
                  value={proxy}
                  onChange={(e) => setProxy(e.target.value)}
                  className="text-[10px] bg-[hsl(0_0%_100%/0.06)] border border-border/30 rounded-md px-2 py-1 text-foreground"
                >
                  <option value="none">None</option>
                  <option value="auto">Auto-Detect</option>
                  <option value="manual">Manual</option>
                </select>
              </SettingRow>
            </VStack>
          </NovaCard>
        </>
      )}

      <NovaCard>
        <SettingRow label="VPN" icon={<Lock className="h-3.5 w-3.5" />}>
          <HStack spacing="tight" align="center">
            <NovaBadge variant="default">Not Connected</NovaBadge>
            <NovaButton variant="secondary" className="!text-[9px] !py-0.5 !px-2">Connect</NovaButton>
          </HStack>
        </SettingRow>
      </NovaCard>
      <ResetSectionButton sectionId="network" />
    </VStack>
  );
}

const BT_DEVICES = [
  { name: "AirPods Pro", icon: "🎧", type: "headphones", connected: true, battery: 82 },
  { name: "Magic Keyboard", icon: "⌨️", type: "keyboard", connected: true, battery: 95 },
  { name: "Magic Mouse", icon: "🖱️", type: "mouse", connected: false, battery: null },
  { name: "HomePod Mini", icon: "🔊", type: "speaker", connected: false, battery: null },
  { name: "Game Controller", icon: "🎮", type: "gamepad", connected: false, battery: 60 },
];

export function BluetoothContent() {
  const [btOn, setBtOn] = useSettingsValue("bluetooth.enabled", true);
  const [scanning, setScanning] = useState(false);

  const handleScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => { setScanning(false); toast.success("Bluetooth scan complete"); }, 2000);
  }, []);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <SettingRow label="Bluetooth" icon={<Bluetooth className="h-3.5 w-3.5" />}>
          <NovaToggle checked={btOn} onChange={setBtOn} />
        </SettingRow>
      </NovaCard>
      {btOn && (
        <>
          <NovaCard>
            <VStack spacing="tight">
              <HStack spacing="tight" align="center" justify="between">
                <NovaSectionLabel className="!px-0">Devices</NovaSectionLabel>
                <NovaButton
                  variant="ghost"
                  onClick={handleScan}
                  className="!text-[9px] !py-0.5 !px-2"
                  icon={<Search className="h-3 w-3" />}
                >
                  {scanning ? "Scanning…" : "Discover"}
                </NovaButton>
              </HStack>
              {BT_DEVICES.map(d => (
                <HStack key={d.name} spacing="tight" align="center" className="py-1.5">
                  <NovaAvatar icon={d.icon} size={24} gradient={d.connected ? "from-[hsl(210_80%_55%)] to-[hsl(265_55%_58%)]" : "from-[hsl(0_0%_40%)] to-[hsl(0_0%_25%)]"} />
                  <VStack spacing="micro" className="flex-1 min-w-0">
                    <NovaText variant="body" className="truncate !text-[11px]">{d.name}</NovaText>
                    <HStack spacing="micro" align="center">
                      <NovaText variant="label" muted className="!text-[9px]">
                        {d.connected ? "Connected" : "Available"}
                      </NovaText>
                      {d.battery !== null && (
                        <NovaText variant="label" muted className="!text-[9px]">
                          · 🔋 {d.battery}%
                        </NovaText>
                      )}
                    </HStack>
                  </VStack>
                  {d.connected ? (
                    <HStack spacing="micro">
                      <NovaBadge variant="success" className="!text-[8px]">Paired</NovaBadge>
                      <NovaButton variant="ghost" className="!p-1" onClick={() => toast.info(`Disconnected ${d.name}`)}>
                        <Trash2 className="h-3 w-3 text-[hsl(0_65%_50%)]" />
                      </NovaButton>
                    </HStack>
                  ) : (
                    <NovaButton variant="secondary" className="!text-[9px] !py-0.5 !px-2">Connect</NovaButton>
                  )}
                </HStack>
              ))}
            </VStack>
          </NovaCard>

          <NovaCard>
            <SettingRow label="Audio Routing" description="Default output for connected audio" icon={<Headphones className="h-3.5 w-3.5" />}>
              <NovaBadge variant="info" className="!text-[8px]">AirPods Pro</NovaBadge>
            </SettingRow>
          </NovaCard>
        </>
      )}
      <ResetSectionButton sectionId="bluetooth" />
    </VStack>
  );
}

export function CloudSyncContent() {
  const [syncEnabled, setSyncEnabled] = useSettingsValue("cloud.syncEnabled", false);
  const [syncSettings, setSyncSettings] = useSettingsValue("cloud.syncSettings", true);
  const [syncFiles, setSyncFiles] = useSettingsValue("cloud.syncFiles", true);
  const [syncContacts, setSyncContacts] = useSettingsValue("cloud.syncContacts", true);
  const [encryption, setEncryption] = useSettingsValue("cloud.encryption", "standard");
  const [lastSync] = useState(() => new Date().toLocaleTimeString());
  const handleSyncNow = useCallback(() => { toast.success("Sync started"); }, []);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Cloud Sync" description="Sync data across devices" icon={<Cloud className="h-3.5 w-3.5" />}>
            <NovaToggle checked={!!syncEnabled} onChange={setSyncEnabled} />
          </SettingRow>
          <Divider />
          <SettingRow label="Last Sync" icon={<RefreshCw className="h-3.5 w-3.5" />}>
            <NovaText variant="label" muted>{syncEnabled ? lastSync : "Disabled"}</NovaText>
          </SettingRow>
        </VStack>
      </NovaCard>

      {syncEnabled && (
        <>
          <NovaCard>
            <VStack spacing="tight">
              <NovaSectionLabel className="!px-0">Selective Sync</NovaSectionLabel>
              <SettingRow label="Settings & Preferences" description="Appearance, accessibility, controls">
                <NovaToggle checked={syncSettings} onChange={setSyncSettings} />
              </SettingRow>
              <Divider />
              <SettingRow label="Files & Documents" description="Documents, media, exports">
                <NovaToggle checked={syncFiles} onChange={setSyncFiles} />
              </SettingRow>
              <Divider />
              <SettingRow label="Contacts & CRM" description="Leads, contacts, relationships">
                <NovaToggle checked={syncContacts} onChange={setSyncContacts} />
              </SettingRow>
            </VStack>
          </NovaCard>

          <NovaCard>
            <VStack spacing="tight">
              <NovaSectionLabel className="!px-0">Encryption</NovaSectionLabel>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: "standard", label: "Standard", desc: "TLS in transit" },
                  { key: "enhanced", label: "Enhanced", desc: "At-rest encryption" },
                  { key: "zero-knowledge", label: "Zero-Knowledge", desc: "Client-side keys" },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setEncryption(opt.key as any)} className={cn(
                    "rounded-lg border p-2 text-left transition-all text-[10px]",
                    encryption === opt.key ? "border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/8" : "border-border/30 hover:border-border/60"
                  )}>
                    <span className={cn("font-medium", encryption === opt.key && "text-[hsl(var(--primary))]")}>{opt.label}</span>
                    <p className="text-[8px] text-[hsl(0_0%_55%)] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </VStack>
          </NovaCard>

          <NovaCard>
            <HStack spacing="tight">
              <NovaButton variant="secondary" onClick={handleSyncNow} icon={<RefreshCw className="h-3.5 w-3.5" />} className="flex-1 !text-[10px]">
                Sync Now
              </NovaButton>
              <NovaButton variant="secondary" icon={<Download className="h-3.5 w-3.5" />} className="flex-1 !text-[10px]">
                Export Data
              </NovaButton>
            </HStack>
          </NovaCard>
        </>
      )}
      <ResetSectionButton sectionId="cloudsync" />
    </VStack>
  );
}

export function IntegrationsContent() {
  const { user, isDemo } = useAuth();
  const { data: connectors = [] } = useQuery({
    queryKey: ["settings-connectors-nova", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: accounts } = await fromTable("connector_accounts").select("*").eq("user_id", user.id);
      const { data: registry } = await fromTable("connector_registry").select("*").eq("user_id", user.id);
      const { data: configs } = await fromTable("connector_configs").select("*").order("updated_at", { ascending: false });
      const merged = (accounts || []).map((acc: Record<string, any>) => {
        const reg = (registry || []).find((r: Record<string, any>) => r.connector_type === acc.connector_type);
        return { service: reg?.display_name || acc.connector_type, status: acc.status || "inactive", last_sync_at: acc.last_sync_at };
      });
      if (merged.length === 0 && configs && configs.length > 0) {
        return configs.map((c: Record<string, any>) => ({ service: c.service || c.connector_type, status: c.status || "inactive", last_sync_at: c.last_sync_at }));
      }
      return merged.length > 0 ? merged : [];
    },
    enabled: !!user?.id && !isDemo,
  });

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Connected Services</NovaSectionLabel>
          {connectors.length === 0 ? (
            <VStack spacing="micro" align="center" className="py-6">
              <Globe className="h-6 w-6 text-[hsl(0_0%_40%)]" />
              <NovaText variant="label" muted>No connectors configured yet</NovaText>
              <NovaText variant="label" muted className="!text-[9px]">Connect services in Connected Accounts</NovaText>
            </VStack>
          ) : (
            connectors.map((conn: Record<string, any>, i: number) => (
              <HStack key={conn.service || i} spacing="tight" align="center" className="py-1.5">
                <Wifi className={cn("h-3.5 w-3.5 shrink-0", conn.status === "active" ? "text-[hsl(152_55%_48%)]" : "text-[hsl(0_0%_45%)]")} />
                <VStack spacing="micro" className="flex-1 min-w-0">
                  <NovaText variant="body" className="truncate">{conn.service}</NovaText>
                  <NovaText variant="label" muted className="!text-[9px]">
                    {conn.last_sync_at ? `Synced ${new Date(conn.last_sync_at).toLocaleTimeString()}` : "Never synced"}
                  </NovaText>
                </VStack>
                <NovaBadge variant={conn.status === "active" ? "success" : "default"} className="!text-[8px]">
                  {conn.status === "active" ? "Connected" : "Offline"}
                </NovaBadge>
              </HStack>
            ))
          )}
        </VStack>
      </NovaCard>
    </VStack>
  );
}
