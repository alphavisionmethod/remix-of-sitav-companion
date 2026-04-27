// ═══════════════════════════════════════════════════════════════
// Settings — Advanced Group
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import {
  Home, Users, TrendingUp, Workflow, Database, Shield, Download,
  RefreshCw, Clock, HelpCircle, Wrench, FileText, AlertTriangle,
  Wifi, Cpu, CheckCircle, Info, ChevronRight, Check,
} from "lucide-react";
import { VStack, HStack, Divider } from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaButton, NovaCard, NovaSectionLabel,
  NovaToggle, NovaBadge, NovaAvatar,
} from "@/platform/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
import { useUpdateDaemon } from "@/platform/runtime/hooks/useUpdateDaemon";
import { toast } from "sonner";
import { SettingRow } from "./shared";
import { useSettingsValue } from "@/platform/settings/hooks/use-settings-value";

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

export function HouseholdContent() {
  const [sharedCalendar, setSharedCalendar] = useSettingsValue("household.sharedCalendar", true);
  const [sharedGrocery, setSharedGrocery] = useSettingsValue("household.sharedGrocery", true);
  const [expenseSharing, setExpenseSharing] = useSettingsValue("household.expenseSharing", false);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Household Members</NovaSectionLabel>
          {[
            { name: "You (Owner)", role: "Admin", status: "Active" },
            { name: "Partner", role: "Co-Manager", status: "Invited" },
            { name: "Teen Account", role: "Limited", status: "Pending" },
          ].map(m => (
            <HStack key={m.name} spacing="tight" align="center" className="py-1.5">
              <div className="h-6 w-6 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center shrink-0">
                <Users className="h-3 w-3 text-[hsl(var(--primary))]" />
              </div>
              <VStack spacing="micro" className="flex-1 min-w-0">
                <NovaText variant="body" className="truncate">{m.name}</NovaText>
                <NovaText variant="label" muted className="!text-[9px]">{m.role}</NovaText>
              </VStack>
              <NovaBadge variant={m.status === "Active" ? "success" : "default"} className="!text-[8px]">{m.status}</NovaBadge>
            </HStack>
          ))}
          <NovaButton variant="secondary" icon={<Users className="h-3.5 w-3.5" />} className="w-full !text-[11px] mt-1">
            Invite Family Member
          </NovaButton>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Shared Calendar" description="Sync across household">
            <NovaToggle checked={sharedCalendar} onChange={setSharedCalendar} />
          </SettingRow>
          <Divider />
          <SettingRow label="Shared Grocery Lists" description="Family members add items">
            <NovaToggle checked={sharedGrocery} onChange={setSharedGrocery} />
          </SettingRow>
          <Divider />
          <SettingRow label="Expense Sharing" description="Split costs automatically">
            <NovaToggle checked={expenseSharing} onChange={setExpenseSharing} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function BusinessRulesContent() {
  const [followUp, setFollowUp] = useSettingsValue("business.followUpPolicy", "smart");
  const [leadScoring, setLeadScoring] = useSettingsValue("business.leadScoring", "engagement");
  const [autoArchive, setAutoArchive] = useSettingsValue("business.autoArchiveStale", true);
  const [forecast, setForecast] = useSettingsValue("business.revenueForecast", true);
  const [pipelineAlerts, setPipelineAlerts] = useSettingsValue("business.pipelineAlerts", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <ChoiceRow label="Follow-Up Policy" value={followUp} onChange={(v) => setFollowUp(v as any)} options={[
          { key: "aggressive", label: "Aggressive", desc: "24h, 3 attempts" },
          { key: "smart", label: "Smart", desc: "AI-timed" },
          { key: "gentle", label: "Gentle", desc: "Max 1/week" },
        ]} />
      </NovaCard>

      <NovaCard>
        <ChoiceRow label="Lead Scoring" value={leadScoring} onChange={(v) => setLeadScoring(v as any)} options={[
          { key: "recency", label: "Recency", desc: "Recent activity first" },
          { key: "engagement", label: "Engagement", desc: "Multi-signal" },
          { key: "value", label: "Value", desc: "Deal value first" },
        ]} />
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Pipeline Stages</NovaSectionLabel>
          {["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"].map((stage, i) => (
            <HStack key={stage} spacing="tight" align="center" className="py-0.5">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ background: `hsl(${200 + i * 25} 60% 55%)` }} />
              <NovaText variant="body" className="flex-1 !text-[11px]">{stage}</NovaText>
              <NovaText variant="label" muted className="!text-[9px]">Stage {i + 1}</NovaText>
            </HStack>
          ))}
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Auto-Archive Stale Leads" description="60+ days no activity">
            <NovaToggle checked={autoArchive} onChange={setAutoArchive} />
          </SettingRow>
          <Divider />
          <SettingRow label="Revenue Forecast" description="Weekly projections">
            <NovaToggle checked={forecast} onChange={setForecast} />
          </SettingRow>
          <Divider />
          <SettingRow label="Advisor Pipeline Alerts" description="Deal risk alerts">
            <NovaToggle checked={pipelineAlerts} onChange={setPipelineAlerts} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function WorkflowsContent() {
  const [trustGate, setTrustGate] = useSettingsValue("workflows.trustGate", "simulate");
  const [morningRoutine, setMorningRoutine] = useSettingsValue("workflows.morningRoutine", true);
  const [endOfDay, setEndOfDay] = useSettingsValue("workflows.endOfDay", false);
  const [smartBatching, setSmartBatching] = useSettingsValue("workflows.smartBatching", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Active Automations</NovaSectionLabel>
          {[
            { name: "Follow-up after no response (3 days)", trigger: "Lead silence", status: "active", runs: 42 },
            { name: "Weekly revenue digest", trigger: "Every Monday 8am", status: "active", runs: 12 },
            { name: "Invoice reminder (7 days overdue)", trigger: "Invoice aging", status: "active", runs: 8 },
            { name: "Birthday greeting auto-send", trigger: "Contact birthday", status: "paused", runs: 3 },
            { name: "Onboarding welcome sequence", trigger: "New contact", status: "active", runs: 27 },
          ].map(a => (
            <HStack key={a.name} spacing="tight" align="center" className="py-1.5">
              <div className={cn("h-2 w-2 rounded-full shrink-0", a.status === "active" ? "bg-[hsl(152_55%_48%)]" : "bg-[hsl(0_0%_40%)]")} />
              <VStack spacing="micro" className="flex-1 min-w-0">
                <NovaText variant="body" className="!text-[11px] truncate">{a.name}</NovaText>
                <NovaText variant="label" muted className="!text-[9px]">{a.trigger} · {a.runs} runs</NovaText>
              </VStack>
              <NovaBadge variant={a.status === "active" ? "success" : "default"} className="!text-[8px]">{a.status}</NovaBadge>
            </HStack>
          ))}
        </VStack>
      </NovaCard>

      <NovaCard>
        <ChoiceRow label="Automation Trust Gate" value={trustGate} onChange={(v) => setTrustGate(v as any)} options={[
          { key: "auto", label: "Auto", desc: "No approval" },
          { key: "simulate", label: "Simulate", desc: "Preview first" },
          { key: "approve", label: "Approve", desc: "Manual each time" },
        ]} />
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Morning Routine" description="Daily briefing at 7am">
            <NovaToggle checked={morningRoutine} onChange={setMorningRoutine} />
          </SettingRow>
          <Divider />
          <SettingRow label="End-of-Day Closure" description="Summary at 6pm">
            <NovaToggle checked={endOfDay} onChange={setEndOfDay} />
          </SettingRow>
          <Divider />
          <SettingRow label="Smart Batching" description="Combine similar tasks">
            <NovaToggle checked={smartBatching} onChange={setSmartBatching} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function BackupRecoveryContent() {
  const handleBackup = useCallback(() => { toast.success("Manual backup initiated"); }, []);
  const handleRestore = useCallback(() => { toast.success("Restore point created"); }, []);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Data Protection</NovaSectionLabel>
          <HStack spacing="tight" align="center">
            <Shield className="h-4 w-4 text-[hsl(152_55%_48%)]" />
            <VStack spacing="micro" className="flex-1">
              <NovaText variant="body">Continuously Backed Up</NovaText>
              <NovaText variant="label" muted className="!text-[10px]">Encrypted, redundant storage</NovaText>
            </VStack>
            <NovaBadge variant="success">Healthy</NovaBadge>
          </HStack>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2 text-center">
              <NovaText variant="body" className="!text-[11px] font-bold">Today</NovaText>
              <NovaText variant="label" muted className="!text-[8px]">Last backup</NovaText>
            </div>
            <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2 text-center">
              <NovaText variant="body" className="!text-[11px] font-bold">256-bit</NovaText>
              <NovaText variant="label" muted className="!text-[8px]">Encryption</NovaText>
            </div>
            <div className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2 text-center">
              <NovaText variant="body" className="!text-[11px] font-bold text-[hsl(152_55%_48%)]">Healthy</NovaText>
              <NovaText variant="label" muted className="!text-[8px]">Status</NovaText>
            </div>
          </div>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Restore Points</NovaSectionLabel>
          {[
            { date: "Today, 6:00 AM", size: "2.4 MB", type: "Auto" },
            { date: "Yesterday, 6:00 AM", size: "2.3 MB", type: "Auto" },
            { date: "3 days ago", size: "2.1 MB", type: "Auto" },
            { date: "1 week ago", size: "1.9 MB", type: "Manual" },
          ].map(r => (
            <HStack key={r.date} spacing="tight" align="center" className="py-1">
              <Clock className="h-3 w-3 text-[hsl(0_0%_50%)] shrink-0" />
              <NovaText variant="body" className="flex-1 !text-[11px]">{r.date}</NovaText>
              <NovaText variant="label" muted className="!text-[9px]">{r.size} · {r.type}</NovaText>
            </HStack>
          ))}
        </VStack>
      </NovaCard>

      <NovaCard>
        <HStack spacing="tight">
          <NovaButton variant="secondary" onClick={handleBackup} icon={<Download className="h-3.5 w-3.5" />} className="flex-1 !text-[10px]">Export Backup</NovaButton>
          <NovaButton variant="secondary" onClick={handleRestore} icon={<RefreshCw className="h-3.5 w-3.5" />} className="flex-1 !text-[10px]">Create Restore Point</NovaButton>
        </HStack>
      </NovaCard>
    </VStack>
  );
}

export function SystemUpdatesContent() {
  const ud = useUpdateDaemon();
  const [autoSecurity, setAutoSecurity] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Status</NovaSectionLabel>
          <HStack spacing="tight" align="center">
            {ud.catalog.length > 0 ? (
              <Download className="h-4 w-4 text-[hsl(var(--primary))]" />
            ) : (
              <CheckCircle className="h-4 w-4 text-[hsl(152_55%_48%)]" />
            )}
            <VStack spacing="micro" className="flex-1">
              <NovaText variant="body">
                {ud.catalog.length > 0 ? `${ud.catalog.length} update${ud.catalog.length > 1 ? "s" : ""} available` : "System Up to Date"}
              </NovaText>
              <NovaText variant="label" muted className="!text-[10px]">
                {ud.currentVersion} · Slot {ud.activeSlot.id} · {ud.channel}
              </NovaText>
            </VStack>
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <ChoiceRow label="Channel" value={ud.channel} onChange={(v) => ud.setChannel(v as any)} options={[
          { key: "stable", label: "Stable", desc: "Production-ready" },
          { key: "beta", label: "Beta", desc: "Preview features" },
          { key: "canary", label: "Canary", desc: "Bleeding edge" },
        ]} />
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <SettingRow label="Auto-Install Security Patches" description="Critical patches applied overnight">
            <NovaToggle checked={autoSecurity} onChange={setAutoSecurity} />
          </SettingRow>
          <Divider />
          <SettingRow label="Feature Update Approval" description="Manual approval for non-security updates">
            <NovaToggle checked={requireApproval} onChange={setRequireApproval} />
          </SettingRow>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Policy</NovaSectionLabel>
          {[
            "Minimum 40% battery required",
            "A/B slot atomic install with auto-rollback",
            "OTA agent runs daily at 03:00",
          ].map(p => (
            <HStack key={p} spacing="tight" align="center">
              <CheckCircle className="h-3 w-3 text-[hsl(152_55%_48%)] shrink-0" />
              <NovaText variant="label" muted className="!text-[10px]">{p}</NovaText>
            </HStack>
          ))}
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function SupportDiagnosticsContent() {
  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">System Health</NovaSectionLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "API", icon: <Wifi className="h-3 w-3" /> },
              { label: "Database", icon: <Database className="h-3 w-3" /> },
              { label: "AI", icon: <Cpu className="h-3 w-3" /> },
              { label: "Storage", icon: <Download className="h-3 w-3" /> },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-[hsl(0_0%_100%/0.04)] p-2 text-center">
                <div className="text-[hsl(152_55%_48%)] flex justify-center mb-1">{s.icon}</div>
                <NovaText variant="label" muted className="!text-[8px]">{s.label}</NovaText>
                <NovaText variant="label" className="!text-[8px] text-[hsl(152_55%_48%)]">Healthy</NovaText>
              </div>
            ))}
          </div>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Diagnostics</NovaSectionLabel>
          {[
            { label: "TypeScript Errors", value: "0" },
            { label: "Failed Functions", value: "0" },
            { label: "RLS Coverage", value: "100%" },
            { label: "Avg Response", value: "142ms" },
            { label: "Uptime (30d)", value: "99.97%" },
          ].map(d => (
            <HStack key={d.label} spacing="tight" justify="between" align="center">
              <NovaText variant="label" muted className="!text-[10px]">{d.label}</NovaText>
              <NovaText variant="body" className="!text-[10px] font-mono text-[hsl(152_55%_48%)]">{d.value}</NovaText>
            </HStack>
          ))}
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Quick Help</NovaSectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Getting Started", icon: <FileText className="h-3 w-3" /> },
              { label: "Shortcuts", icon: <Wrench className="h-3 w-3" /> },
              { label: "Report Issue", icon: <AlertTriangle className="h-3 w-3" /> },
              { label: "Support", icon: <HelpCircle className="h-3 w-3" /> },
            ].map(h => (
              <button key={h.label} className="flex items-center gap-2 rounded-lg border border-border/30 p-2 text-left hover:border-border/60 transition-all">
                <span className="text-[hsl(0_0%_50%)]">{h.icon}</span>
                <NovaText variant="body" className="!text-[10px]">{h.label}</NovaText>
              </button>
            ))}
          </div>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="micro" align="center" className="py-2">
          <NovaText variant="label" muted className="!text-[9px]">SITA OS v2.0.0 · Build 2026.04.15</NovaText>
          <NovaText variant="label" muted className="!text-[8px]">© 2026 SITA OS. All rights reserved.</NovaText>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function AboutContent() {
  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight" align="center" className="py-2">
          <NovaAvatar icon="▣" size={48} gradient="from-[hsl(265_55%_58%)] to-[hsl(210_80%_55%)]" />
          <NovaText variant="title">SITA OS</NovaText>
          <NovaText variant="label" muted>Version 2.0.0 (NovaKernel)</NovaText>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <HStack spacing="tight" justify="between">
            <NovaText variant="body">Processor</NovaText>
            <NovaText variant="label" muted>NovaKernel aarch64</NovaText>
          </HStack>
          <Divider />
          <HStack spacing="tight" justify="between">
            <NovaText variant="body">Memory</NovaText>
            <NovaText variant="label" muted>{Math.round(((performance as any).memory?.jsHeapSizeLimit || 536870912) / 1048576)} MB</NovaText>
          </HStack>
          <Divider />
          <HStack spacing="tight" justify="between">
            <NovaText variant="body">Display</NovaText>
            <NovaText variant="label" muted>{window.innerWidth}×{window.innerHeight} @{window.devicePixelRatio}x</NovaText>
          </HStack>
          <Divider />
          <HStack spacing="tight" justify="between">
            <NovaText variant="body">SDK</NovaText>
            <NovaBadge variant="info">Nova SDK 1.0</NovaBadge>
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <HStack spacing="tight" justify="between" align="center">
          <VStack spacing="micro">
            <NovaText variant="body">Software Update</NovaText>
            <NovaText variant="label" muted className="!text-[10px]">SITA OS is up to date</NovaText>
          </VStack>
          <NovaBadge variant="success">Up to Date</NovaBadge>
        </HStack>
      </NovaCard>
    </VStack>
  );
}
