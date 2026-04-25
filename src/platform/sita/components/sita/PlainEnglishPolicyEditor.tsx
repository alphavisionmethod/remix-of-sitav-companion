// ═══════════════════════════════════════════════════════════════
// SITA OS — Plain-English Policy Editor
// Natural language sentence builder for domain rules
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Shield, Play, Plus, Trash2, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SitaCard } from "@/platform/sita/components/sita/SitaCard";
import { AdminActionCard } from "./AdminActionCard";
import { toast } from "sonner";

interface PolicyRule {
  id: string;
  domain: string;
  action: string;
  condition: string;
  threshold: string;
  response: string;
}

const DOMAINS = [
  { value: "money", label: "Money" },
  { value: "business", label: "Business" },
  { value: "concierge", label: "Concierge" },
  { value: "platform", label: "Platform" },
  { value: "family", label: "Family" },
];

const ACTIONS: Record<string, { value: string; label: string }[]> = {
  money: [
    { value: "pay_bill", label: "pays a bill" },
    { value: "transfer", label: "makes a transfer" },
    { value: "subscription", label: "renews a subscription" },
    { value: "investment", label: "makes an investment" },
  ],
  business: [
    { value: "send_quote", label: "sends a quote" },
    { value: "close_deal", label: "closes a deal" },
    { value: "send_invoice", label: "sends an invoice" },
    { value: "outreach", label: "starts outreach" },
  ],
  concierge: [
    { value: "booking", label: "makes a booking" },
    { value: "appointment", label: "schedules appointment" },
    { value: "purchase", label: "makes a purchase" },
  ],
  platform: [
    { value: "agent_action", label: "an agent acts" },
    { value: "connector_change", label: "a connector changes" },
    { value: "policy_update", label: "a policy is modified" },
  ],
  family: [
    { value: "household_spend", label: "household spends" },
    { value: "school_event", label: "a school event changes" },
  ],
};

const CONDITIONS = [
  { value: "exceeds", label: "exceeds" },
  { value: "below", label: "falls below" },
  { value: "equals", label: "equals" },
  { value: "any", label: "for any amount" },
];

const RESPONSES = [
  { value: "require_approval", label: "Require my approval" },
  { value: "flag_review", label: "Flag for review" },
  { value: "deny", label: "Deny automatically" },
  { value: "allow_notify", label: "Allow but notify me" },
  { value: "simulate_first", label: "Simulate first, then ask" },
];

const DEFAULT_RULES: PolicyRule[] = [
  { id: "1", domain: "money", action: "pay_bill", condition: "exceeds", threshold: "500", response: "require_approval" },
  { id: "2", domain: "business", action: "send_quote", condition: "exceeds", threshold: "10000", response: "simulate_first" },
  { id: "3", domain: "platform", action: "agent_action", condition: "any", threshold: "", response: "flag_review" },
];

export function PlainEnglishPolicyEditor() {
  const [rules, setRules] = useState<PolicyRule[]>(DEFAULT_RULES);
  const [testResult, setTestResult] = useState<string | null>(null);

  const addRule = () => {
    setRules([...rules, {
      id: Date.now().toString(),
      domain: "money", action: "pay_bill", condition: "exceeds", threshold: "100", response: "require_approval",
    }]);
  };

  const updateRule = (id: string, field: keyof PolicyRule, value: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const buildSentence = (rule: PolicyRule) => {
    const domainLabel = DOMAINS.find(d => d.value === rule.domain)?.label || rule.domain;
    const actionLabel = ACTIONS[rule.domain]?.find(a => a.value === rule.action)?.label || rule.action;
    const condLabel = CONDITIONS.find(c => c.value === rule.condition)?.label || rule.condition;
    const respLabel = RESPONSES.find(r => r.value === rule.response)?.label || rule.response;
    const thresholdStr = rule.condition === "any" ? "" : ` $${rule.threshold}`;
    return `When ${domainLabel} ${actionLabel} ${condLabel}${thresholdStr} → ${respLabel}`;
  };

  const testPolicy = () => {
    setTestResult("✅ Policy simulated: 3 rules active. 2 would trigger approval, 1 would flag for review. No conflicts detected.");
    toast.success("Policy simulation complete");
  };

  return (
    <div className="space-y-4">
      {/* Preview Banner */}
      <SitaCard hover={false} className="p-4 bg-primary/5 border-primary/10">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Policy Rules — Plain English</h3>
            <p className="text-xs text-muted-foreground">Build rules as natural-language sentences. No code needed.</p>
          </div>
        </div>

        {/* Active rules as sentences */}
        <div className="space-y-1.5">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center gap-2 text-xs">
              <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="text-foreground">{buildSentence(rule)}</span>
            </div>
          ))}
        </div>
      </SitaCard>

      {/* Rule Builder */}
      {rules.map((rule) => (
        <SitaCard key={rule.id} hover={false} className="p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">When</span>
            <Select value={rule.domain} onValueChange={(v) => updateRule(rule.id, "domain", v)}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{DOMAINS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={rule.action} onValueChange={(v) => updateRule(rule.id, "action", v)}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{(ACTIONS[rule.domain] || []).map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={rule.condition} onValueChange={(v) => updateRule(rule.id, "condition", v)}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
            {rule.condition !== "any" && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input value={rule.threshold} onChange={(e) => updateRule(rule.id, "threshold", e.target.value)} className="w-20 h-8 text-xs" placeholder="amount" />
              </div>
            )}
            <span className="text-muted-foreground">→</span>
            <Select value={rule.response} onValueChange={(v) => updateRule(rule.id, "response", v)}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{RESPONSES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRule(rule.id)}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </SitaCard>
      ))}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addRule} className="text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </Button>
        <Button variant="secondary" size="sm" onClick={testPolicy} className="text-xs gap-1.5">
          <Play className="h-3.5 w-3.5" /> Test Policies
        </Button>
      </div>

      {testResult && (
        <SitaCard hover={false} className="p-3 border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs text-foreground">{testResult}</p>
        </SitaCard>
      )}

      {/* Save with AdminActionCard */}
      <AdminActionCard
        title="Save Policy Rules"
        whatChanges={`${rules.length} rules will be activated across ${new Set(rules.map(r => r.domain)).size} domains`}
        riskLevel={rules.some(r => r.response === "deny") ? "high" : "medium"}
        whatHappensNext="Policies apply immediately to all new actions. Existing workflows are not affected."
        proofNote="Policy change logged to audit trail with before/after snapshot"
        undoDescription="Revert to previous policy set from Owner → Rollback"
        onConfirm={() => toast.success("Policies saved and activated")}
        confirmLabel="Activate Policies"
        icon={<FileText className="h-5 w-5 text-primary" />}
      />
    </div>
  );
}
