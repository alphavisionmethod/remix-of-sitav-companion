// ═══════════════════════════════════════════════════════════════
// Settings — AI & Intelligence Group (Advisors & AI, Plan & Usage)
// ═══════════════════════════════════════════════════════════════

import { Brain, DollarSign, Zap, BarChart3, Shield, Eye } from "lucide-react";
import { VStack, HStack, Divider } from "@/platform/nova-sdk/ui/layout";
import {
  NovaText, NovaCard, NovaSectionLabel, NovaToggle, NovaSlider, NovaBadge,
} from "@/platform/nova-sdk/ui/components";
import { cn } from "@/lib/utils";
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

export function AdvisorsAIContent() {
  const [autonomy, setAutonomy] = useSettingsValue("ai.autonomyLevel", "simulate-first");
  const [confidence, setConfidence] = useSettingsValue("ai.confidenceThreshold", 70);
  const [budgetMode, setBudgetMode] = useSettingsValue("ai.budgetMode", "standard");
  const [contradictions, setContradictions] = useSettingsValue("ai.contradictionDisplay", "always");
  const [promptHistory, setPromptHistory] = useSettingsValue("ai.promptHistory", true);

  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <ChoiceRow label="Autonomy Level" value={autonomy} onChange={(v) => setAutonomy(v as any)} options={[
            { key: "always-ask", label: "Always Ask", desc: "Every action needs approval" },
            { key: "simulate-first", label: "Simulate First", desc: "AI simulates, you approve" },
            { key: "trusted", label: "Trusted", desc: "Routine tasks auto-execute" },
          ]} />
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Confidence Threshold</NovaSectionLabel>
          <NovaSlider value={confidence} onChange={(v) => setConfidence(v as any)} label={`${confidence}% minimum confidence`} />
          <NovaText variant="label" muted className="!text-[9px]">
            Actions below this confidence require manual approval
          </NovaText>
        </VStack>
      </NovaCard>

      <NovaCard>
        <ChoiceRow label="Contradiction Display" value={contradictions} onChange={(v) => setContradictions(v as any)} options={[
          { key: "always", label: "Always Show", desc: "Surface all conflicts" },
          { key: "high-only", label: "High Impact", desc: "Only significant" },
          { key: "never", label: "Suppress", desc: "AI resolves silently" },
        ]} />
      </NovaCard>

      <NovaCard>
        <ChoiceRow label="Budget Mode" value={budgetMode} onChange={(v) => setBudgetMode(v as any)} options={[
          { key: "frugal", label: "Frugal", desc: "Minimize AI costs" },
          { key: "standard", label: "Standard", desc: "Balanced cost/quality" },
          { key: "premium", label: "Premium", desc: "Best models always" },
        ]} />
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Advanced</NovaSectionLabel>
          <SettingRow label="Prompt History" description="Log all AI interactions for review" icon={<Eye className="h-3.5 w-3.5" />}>
            <NovaToggle checked={promptHistory} onChange={setPromptHistory} />
          </SettingRow>
        </VStack>
      </NovaCard>
    </VStack>
  );
}

export function PlanUsageContent() {
  return (
    <VStack spacing="tight">
      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Current Plan</NovaSectionLabel>
          <HStack spacing="tight" align="center" justify="between">
            <VStack spacing="micro">
              <NovaText variant="body">SITA OS Pro</NovaText>
              <NovaText variant="label" muted className="!text-[10px]">Full access to all AI capabilities</NovaText>
            </VStack>
            <NovaBadge variant="info">Active</NovaBadge>
          </HStack>
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Usage This Month</NovaSectionLabel>
          {[
            { label: "AI Inferences", used: 1247, total: 5000, icon: <Brain className="h-3 w-3" /> },
            { label: "Token Budget", used: 342000, total: 1000000, icon: <Zap className="h-3 w-3" /> },
            { label: "Storage", used: 2.4, total: 10, icon: <BarChart3 className="h-3 w-3" />, unit: "GB" },
          ].map(item => (
            <VStack key={item.label} spacing="micro">
              <HStack spacing="tight" align="center" justify="between">
                <HStack spacing="micro" align="center">
                  <span className="text-[hsl(var(--primary))]">{item.icon}</span>
                  <NovaText variant="body" className="!text-[11px]">{item.label}</NovaText>
                </HStack>
                <NovaText variant="label" muted className="!text-[10px]">
                  {item.unit ? `${item.used} / ${item.total} ${item.unit}` : `${item.used.toLocaleString()} / ${item.total.toLocaleString()}`}
                </NovaText>
              </HStack>
              <div className="w-full h-1.5 rounded-full bg-[hsl(0_0%_100%/0.06)]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                  style={{ width: `${Math.min((item.used / item.total) * 100, 100)}%` }}
                />
              </div>
            </VStack>
          ))}
        </VStack>
      </NovaCard>

      <NovaCard>
        <VStack spacing="tight">
          <NovaSectionLabel className="!px-0">Cost Breakdown</NovaSectionLabel>
          {[
            { label: "AI Compute", amount: "$4.82" },
            { label: "Storage", amount: "$0.24" },
            { label: "Edge Functions", amount: "$0.12" },
          ].map(item => (
            <HStack key={item.label} spacing="tight" justify="between" align="center">
              <NovaText variant="body" className="!text-[11px]">{item.label}</NovaText>
              <NovaText variant="label" muted className="!text-[11px] font-mono">{item.amount}</NovaText>
            </HStack>
          ))}
          <Divider />
          <HStack spacing="tight" justify="between" align="center">
            <NovaText variant="body" className="!text-[11px] font-semibold">Total</NovaText>
            <NovaText variant="body" className="!text-[11px] font-mono font-semibold text-[hsl(var(--primary))]">$5.18</NovaText>
          </HStack>
        </VStack>
      </NovaCard>
    </VStack>
  );
}
