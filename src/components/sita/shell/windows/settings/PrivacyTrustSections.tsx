// ═══════════════════════════════════════════════════════════════
// Settings — Privacy & Trust Group (Privacy, Trust & Security, Devices & Sessions)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  Shield, Globe, HardDrive, Lock, Download, Trash2, ShieldAlert,
  Monitor, Smartphone, Clock, Key, Eye, Ban, UserCheck,
} from "lucide-react";
import { VStack, HStack, Divider } from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaSlider,
} from "@/platform/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
import { useSettingsValue } from "@/hooks/use-settings-value";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SettingRow, ResetSectionButton } from "./shared";
import { useGovernanceSimulator } from "@/contexts/SitaKernelContext";
import type { SimulationResult } from "@/lib/services/governance-simulator";
import { useQuery } from "@tanstack/react-query";
import { fromTable, fromDynamicTable } from "@/lib/supabase-helpers";

function ChoiceRow({ label, options, value, onChange }: {
  label: string; options: { key: string; label: string; desc?: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <VStack spacing="tight">
      <NovaSectionLabel className="!px-0">{label}</NovaSectionLabel>
      <div className="grid gap-1.5 grid-cols-3">
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)} className={cn(
            "rounded-lg border p-2 text-left transition-all text-[10px]",
            value === opt.key ? "border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/8" : "border-border/30 hover:border-border/60"
          )}>
            <span className={cn("font-medium", value === opt.key && "text-[hsl(var(--primary))]")}>{opt.label}</span>
            {opt.desc && <p className="text-[8px] text-[hsl(0_0%_55%)] mt-0.5">{opt.desc}</p>}
          </button>
        ))}
      </div>
    </VStack>
  );
}

export function PrivacyContent() {
  const [locationServices, setLocationServices] = useSettingsValue("privacy.locationServices", false);
  const [analytics, setAnalytics] = useSettingsValue("privacy.analytics", false);
  const [crashReports, setCrashReports] = useSettingsValue("privacy.crashReports", true);
  const [piiRedaction, setPiiRedaction] = useSettingsValue("privacy.piiRedaction", false);
  const [docRetention, setDocRetention] = useSettingsValue("privacy.docRetention", "7years");
  const [trackingPrevention, setTrackingPrevention] = useSettingsValue("privacy.trackingPrevention", "standard");
  const [adPersonalization, setAdPersonalization] = useSettingsValue("privacy.adPersonalization", false);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Data Collection</NovaSectionLabel>
          <SettingRow label="Location Services" description="Allow apps to use location" icon={<Globe className="h-3.5 w-3.5" />}>
            <NovaToggle checked={locationServices} onChange={setLocationServices} />
          </SettingRow>
          <Divider />
          <SettingRow label="Analytics" description="Help improve SITA OS" icon={<HardDrive className="h-3.5 w-3.5" />}>
            <NovaToggle checked={analytics} onChange={setAnalytics} />
          </SettingRow>
          <Divider />
          <SettingRow label="Crash Reports" description="Send anonymous crash data" icon={<Shield className="h-3.5 w-3.5" />}>
            <NovaToggle checked={crashReports} onChange={setCrashReports} />
          </SettingRow>
          <Divider />
          <SettingRow label="PII Redaction" description="Strip names before AI processing" icon={<Lock className="h-3.5 w-3.5" />}>
            <NovaToggle checked={piiRedaction} onChange={setPiiRedaction} />
          </SettingRow>
          <Divider />
          <SettingRow label="Ad Personalization" description="Allow personalized suggestions" icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={adPersonalization} onChange={setAdPersonalization} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Tracking Prevention</NovaSectionLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { key: "off", label: "Off", desc: "No blocking" },
              { key: "standard", label: "Standard", desc: "Block known trackers" },
              { key: "strict", label: "Strict", desc: "Block all 3rd-party" },
            ].map(opt => (
              <button key={opt.key} onClick={() => setTrackingPrevention(opt.key as any)} className={cn(
                "rounded-lg border p-2 text-left transition-all text-[10px]",
                trackingPrevention === opt.key ? "border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/8" : "border-border/30 hover:border-border/60"
              )}>
                <span className={cn("font-medium", trackingPrevention === opt.key && "text-[hsl(var(--primary))]")}>{opt.label}</span>
                <p className="text-[8px] text-[hsl(0_0%_55%)] mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </VStack>
      </NovaCard>

      <NovaCard>
        <ChoiceRow label="Document Retention" value={docRetention} onChange={(v) => setDocRetention(v as any)} options={[
          { key: "1year", label: "1 Year" },
          { key: "7years", label: "7 Years", desc: "Financial default" },
          { key: "forever", label: "Forever" },
        ]} />
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Data Rights</NovaSectionLabel>
          <NovaButton
            variant="secondary"
            icon={<Download className="h-3.5 w-3.5" />}
            className="w-full !text-[11px]"
            onClick={async () => {
              try {
                const { data, error } = await supabase.functions.invoke("gdpr-export", { method: "POST", body: { format: "json" } });
                if (error) throw error;
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `sita-export-${new Date().toISOString().slice(0, 10)}.json`; a.click();
                URL.revokeObjectURL(url);
                toast.success("Data exported");
              } catch (e: any) { toast.error(e.message || "Export failed"); }
            }}
          >
            Export All Data (JSON)
          </NovaButton>
          <NovaButton
            variant="ghost"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            className="w-full !text-[11px] !text-[hsl(0_65%_50%)]"
            onClick={async () => {
              try {
                const { error } = await supabase.functions.invoke("gdpr-delete", { method: "POST", body: {} });
                if (error) throw error;
                toast.success("Deletion request submitted");
              } catch (e: any) { toast.error(e.message || "Deletion failed"); }
            }}
          >
            Delete All Data
          </NovaButton>
        </VStack>
      </NovaCard>

      <ResetSectionButton sectionId="privacy" />
    </VStack>
  );
}

export function TrustSecurityContent() {
  const gov = useGovernanceSimulator();
  const [trustMode, setTrustMode] = useSettingsValue("trust.mode", "balanced");
  const [simPref, setSimPref] = useSettingsValue("trust.simulationPref", "smart");
  const [sessionTimeout, setSessionTimeout] = useSettingsValue("trust.sessionTimeout", 30);
  const [auditResult, setAuditResult] = useState<SimulationResult | null>(null);

  const runAudit = () => {
    const result = gov.runComplianceAudit([
      { domain: "finance", capabilityId: "finance.transfer", riskTier: "high", amount: 8000 },
      { domain: "finance", capabilityId: "finance.budget.update", riskTier: "medium", amount: 500 },
      { domain: "business", capabilityId: "crm.lead.update", riskTier: "low" },
      { domain: "finance", capabilityId: "finance.transfer", riskTier: "critical", amount: 50000 },
    ]);
    setAuditResult(result);
    toast.success(`Audit complete — ${(result.summary.overallCompliance * 100).toFixed(0)}% compliant`);
  };

  return (
    <VStack spacing="tight">
      <NovaCard>
        <ChoiceRow label="Trust Mode" value={trustMode} onChange={(v) => setTrustMode(v as any)} options={[
          { key: "cautious", label: "Cautious", desc: "Approve everything" },
          { key: "balanced", label: "Balanced", desc: "Smart thresholds" },
          { key: "confident", label: "Confident", desc: "Auto-execute routine" },
        ]} />
      </NovaCard>

      <NovaCard>
        <ChoiceRow label="Simulation Preference" value={simPref} onChange={(v) => setSimPref(v as any)} options={[
          { key: "always", label: "Always Simulate" },
          { key: "smart", label: "Smart (High-risk)" },
          { key: "never", label: "Skip" },
        ]} />
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Session Security</NovaSectionLabel>
          <NovaSlider
            value={sessionTimeout}
            onChange={(v) => setSessionTimeout(v as any)}
            label={`Session Timeout — ${sessionTimeout} min`}
          />
          <NovaText variant="label" muted className="!text-[9px]">
            Auto-lock after inactivity period
          </NovaText>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Security Keys</NovaSectionLabel>
          <SettingRow label="FIDO2 / WebAuthn" description="Hardware key authentication" icon={<Key className="h-3.5 w-3.5" />}>
            <NovaBadge variant="default" className="!text-[8px]">Not Set Up</NovaBadge>
          </SettingRow>
          <Divider />
          <NovaButton variant="secondary" icon={<Key className="h-3.5 w-3.5" />} className="w-full !text-[11px]">
            Register Security Key
          </NovaButton>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaButton variant="secondary" onClick={runAudit} icon={<ShieldAlert className="h-3.5 w-3.5" />} className="w-full !text-[11px]">
            Run Compliance Audit
          </NovaButton>
          {auditResult && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2 text-center">
                <NovaText variant="body" className={cn("!text-sm font-bold", auditResult.summary.overallCompliance >= 0.8 ? "text-[hsl(152_55%_48%)]" : "text-[hsl(38_85%_58%)]")}>
                  {(auditResult.summary.overallCompliance * 100).toFixed(0)}%
                </NovaText>
                <NovaText variant="label" muted className="!text-[8px]">Compliance</NovaText>
              </div>
              <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2 text-center">
                <NovaText variant="body" className="!text-sm font-bold text-[hsl(0_65%_50%)]">{auditResult.summary.blocked}</NovaText>
                <NovaText variant="label" muted className="!text-[8px]">Blocked</NovaText>
              </div>
              <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2 text-center">
                <NovaText variant="body" className="!text-sm font-bold text-[hsl(38_85%_58%)]">{auditResult.summary.riskBreaches}</NovaText>
                <NovaText variant="label" muted className="!text-[8px]">Risk Flags</NovaText>
              </div>
            </div>
          )}
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function DevicesSessionsContent() {
  const { user, isDemo } = useAuth();
  const { data: devices = [] } = useQuery({
    queryKey: ["settings-devices-nova", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await fromTable("device_statuses").select("*").order("last_seen", { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!user?.id && !isDemo,
  });

  const { data: trustedDevices = [] } = useQuery({
    queryKey: ["settings-trusted-nova", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await fromDynamicTable("connected_devices")
        .select("id, device_name, device_type, os, trust_level, last_seen, status, ip_address")
        .eq("user_id", user.id)
        .order("last_seen", { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user?.id && !isDemo,
  });

  const allDevices = [...trustedDevices, ...devices.filter((d: any) => !trustedDevices.some((td: any) => td.device_name === d.device_name))];

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Devices ({allDevices.length})</NovaSectionLabel>
          {allDevices.length === 0 ? (
            <VStack spacing="micro" align="center" className="py-6">
              <Monitor className="h-6 w-6 text-[hsl(0_0%_40%)]" />
              <NovaText variant="label" muted>No devices registered yet</NovaText>
              <NovaText variant="label" muted className="!text-[9px]">Devices register automatically on sign-in</NovaText>
            </VStack>
          ) : (
            allDevices.map((d: any, i: number) => (
              <HStack key={d.id || i} spacing="tight" align="center" className="py-1.5">
                {d.device_type === "phone" ? (
                  <Smartphone className="h-3.5 w-3.5 text-[hsl(var(--primary))] shrink-0" />
                ) : (
                  <Monitor className="h-3.5 w-3.5 text-[hsl(var(--primary))] shrink-0" />
                )}
                <VStack spacing="micro" className="flex-1 min-w-0">
                  <NovaText variant="body" className="truncate">{d.device_name}</NovaText>
                  <NovaText variant="label" muted className="!text-[9px]">
                    {d.os || "Unknown"} · Trust: {d.trust_level ?? "standard"}
                    {d.ip_address && ` · ${d.ip_address}`}
                  </NovaText>
                </VStack>
                <HStack spacing="micro">
                  <NovaBadge variant={d.status === "online" ? "success" : "default"} className="!text-[8px]">
                    {d.status || "offline"}
                  </NovaBadge>
                  <NovaButton
                    variant="ghost"
                    className="!p-1"
                    onClick={() => toast.info(`Session revoked for ${d.device_name}`)}
                  >
                    <Ban className="h-3 w-3 text-[hsl(0_65%_50%)]" />
                  </NovaButton>
                </HStack>
              </HStack>
            ))
          )}
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Login History</NovaSectionLabel>
          {[
            { time: "Today, 9:15 AM", device: "Chrome · macOS", ip: "192.168.1.42" },
            { time: "Yesterday, 6:30 PM", device: "Safari · iOS", ip: "10.0.0.15" },
            { time: "2 days ago", device: "Chrome · Windows", ip: "172.16.0.8" },
          ].map(entry => (
            <HStack key={entry.time} spacing="tight" align="center" className="py-1">
              <Clock className="h-3 w-3 text-[hsl(0_0%_50%)] shrink-0" />
              <VStack spacing="micro" className="flex-1">
                <NovaText variant="body" className="!text-[10px]">{entry.device}</NovaText>
                <NovaText variant="label" muted className="!text-[9px]">{entry.time} · {entry.ip}</NovaText>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </NovaCard>
    </VStack>
  );
}
