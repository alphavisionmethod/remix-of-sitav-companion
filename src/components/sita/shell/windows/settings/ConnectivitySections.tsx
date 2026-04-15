// ═══════════════════════════════════════════════════════════════
// Settings — Connectivity Group (Network, Bluetooth, Cloud & Sync, Integrations)
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { Wifi, Bluetooth, Lock, Cloud, RefreshCw, Globe, ChevronRight } from "lucide-react";
import { VStack, HStack, Divider } from "@/lib/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaAvatar,
} from "@/lib/nova-sdk/ui/components";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { toast } from "sonner";
import { SettingRow, ResetSectionButton } from "./shared";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { cn } from "@/lib/utils";

export function NetworkContent() {
  const [wifiOn, setWifiOn] = useSettingsValue("network.wifi.autoJoin", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Wi-Fi" icon={<Wifi className="h-3.5 w-3.5" />}>
            <NovaToggle checked={wifiOn} onChange={setWifiOn} />
          </SettingRow>
          {wifiOn && (
            <>
              <Divider />
              <HStack spacing="tight" align="center" className="py-1">
                <div className="w-2 h-2 rounded-full bg-[hsl(152_55%_48%)]" />
                <NovaText variant="body">SITA-Network</NovaText>
                <NovaBadge variant="success">Connected</NovaBadge>
              </HStack>
            </>
          )}
        </VStack>
      </NovaCard>
      <NovaCard>
        <SettingRow label="VPN" icon={<Lock className="h-3.5 w-3.5" />}>
          <NovaBadge variant="default">Not Connected</NovaBadge>
        </SettingRow>
      </NovaCard>
      <ResetSectionButton sectionId="network" />
    </VStack>
  );
}

export function BluetoothContent() {
  const [btOn, setBtOn] = useSettingsValue("bluetooth.enabled", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <SettingRow label="Bluetooth" icon={<Bluetooth className="h-3.5 w-3.5" />}>
          <NovaToggle checked={btOn} onChange={setBtOn} />
        </SettingRow>
      </NovaCard>
      {btOn && (
        <NovaCard>
          <VStack spacing="tight">
            <NovaSectionLabel className="!px-0">Nearby Devices</NovaSectionLabel>
            <HStack spacing="tight" align="center">
              <NovaAvatar icon="🎧" size={24} gradient="from-[hsl(210_80%_55%)] to-[hsl(265_55%_58%)]" />
              <VStack spacing="micro" className="flex-1">
                <NovaText variant="body">AirPods Pro</NovaText>
                <NovaText variant="label" muted className="!text-[10px]">Available</NovaText>
              </VStack>
              <NovaButton variant="secondary" className="!text-[10px] !py-0.5 !px-2">Connect</NovaButton>
            </HStack>
            <Divider />
            <HStack spacing="tight" align="center">
              <NovaAvatar icon="⌨️" size={24} gradient="from-[hsl(0_0%_40%)] to-[hsl(0_0%_25%)]" />
              <VStack spacing="micro" className="flex-1">
                <NovaText variant="body">Magic Keyboard</NovaText>
                <NovaText variant="label" muted className="!text-[10px]">Connected</NovaText>
              </VStack>
              <NovaBadge variant="success">Paired</NovaBadge>
            </HStack>
          </VStack>
        </NovaCard>
      )}
      <ResetSectionButton sectionId="bluetooth" />
    </VStack>
  );
}

export function CloudSyncContent() {
  const [syncEnabled, setSyncEnabled] = useSettingsValue("cloud.syncEnabled", false);
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
        <NovaCard>
          <VStack spacing="tight">
            <NovaSectionLabel className="!px-0">Sync Targets</NovaSectionLabel>
            <SettingRow label="Settings" description="Preferences and config">
              <NovaBadge variant="success">Active</NovaBadge>
            </SettingRow>
            <Divider />
            <SettingRow label="Files" description="Documents and media">
              <NovaBadge variant="success">Active</NovaBadge>
            </SettingRow>
            <Divider />
            <NovaButton variant="secondary" onClick={handleSyncNow} icon={<RefreshCw className="h-3.5 w-3.5" />} className="w-full !text-[11px]">
              Sync Now
            </NovaButton>
          </VStack>
        </NovaCard>
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
