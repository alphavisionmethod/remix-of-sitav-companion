// ═══════════════════════════════════════════════════════════════
// SITA OS — Automation Daemon (automationd)
// Condition-action rules engine with policy-aware safeguards,
// event bus, execution audit trail, conflict resolution
// ═══════════════════════════════════════════════════════════════

export type AutomationDomain = "network" | "power" | "security" | "bluetooth" | "notification" | "system";
export type RuleStatus = "active" | "paused" | "disabled" | "conflict";

export interface AutomationCondition {
  field: string;
  operator: "==" | "!=" | "<" | ">" | "<=" | ">=";
  value: string | number | boolean;
}

export interface AutomationAction {
  service: string;
  method: string;
  args: Record<string, unknown>;
  displayLabel: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  domain: AutomationDomain;
  enabled: boolean;
  status: RuleStatus;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  triggerCount: number;
  lastTriggered: number | null;
  createdAt: number;
  conflictsWith?: string[];
  policyOverride: boolean;
  description: string;
}

export interface RuleExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  domain: AutomationDomain;
  triggeredAt: number;
  conditionSnapshot: Record<string, unknown>;
  actionsExecuted: string[];
  success: boolean;
  error?: string;
}

export interface AutomationState {
  rules: AutomationRule[];
  executionHistory: RuleExecution[];
  eventBusActive: boolean;
  conflictsDetected: number;
}

const now = Date.now();
const hour = 3600000;

const BUILT_IN_RULES: AutomationRule[] = [
  {
    id: "rule-1", name: "Auto-VPN on Public WiFi", domain: "network", enabled: true, status: "active",
    conditions: [{ field: "network.security", operator: "==", value: "open" }],
    actions: [{ service: "shieldd", method: "enableVpn", args: {}, displayLabel: "Enable VPN" }, { service: "notifyd", method: "show", args: { message: "Secure connection enabled" }, displayLabel: "Notify user" }],
    triggerCount: 12, lastTriggered: now - hour * 3, createdAt: now - hour * 720, policyOverride: false,
    description: "Automatically enables VPN when connecting to an open WiFi network"
  },
  {
    id: "rule-2", name: "Battery Saver at 15%", domain: "power", enabled: true, status: "active",
    conditions: [{ field: "battery.level", operator: "<", value: 15 }],
    actions: [{ service: "powerd", method: "setProfile", args: { profile: "saver" }, displayLabel: "Switch to Power Saver" }],
    triggerCount: 8, lastTriggered: now - hour * 48, createdAt: now - hour * 720, policyOverride: false,
    description: "Switches to Power Saver profile when battery drops below 15%"
  },
  {
    id: "rule-3", name: "Mute Notifications in Meetings", domain: "notification", enabled: true, status: "active",
    conditions: [{ field: "calendar.event_active", operator: "==", value: true }],
    actions: [{ service: "calmd", method: "enableFocus", args: {}, displayLabel: "Enable Focus Mode" }],
    triggerCount: 45, lastTriggered: now - hour * 2, createdAt: now - hour * 360, policyOverride: false,
    description: "Mutes non-critical notifications during calendar events"
  },
  {
    id: "rule-4", name: "Audio Panel on Headphones", domain: "bluetooth", enabled: true, status: "active",
    conditions: [{ field: "bluetooth.headphones_connected", operator: "==", value: true }],
    actions: [{ service: "controlcenterd", method: "openAudioPanel", args: {}, displayLabel: "Open Audio Controls" }],
    triggerCount: 22, lastTriggered: now - hour * 6, createdAt: now - hour * 500, policyOverride: false,
    description: "Opens audio route panel when headphones connect"
  },
  {
    id: "rule-5", name: "Isolate on Threat Detection", domain: "security", enabled: true, status: "active",
    conditions: [{ field: "shield.threat_detected", operator: "==", value: true }],
    actions: [
      { service: "shieldd", method: "isolateApp", args: {}, displayLabel: "Isolate suspicious app" },
      { service: "wifid", method: "disconnect", args: {}, displayLabel: "Disconnect risky network" },
    ],
    triggerCount: 1, lastTriggered: now - hour * 168, createdAt: now - hour * 720, policyOverride: true,
    description: "Isolates the app and disconnects network on threat detection"
  },
  {
    id: "rule-6", name: "Disable BT After 7 Days Idle", domain: "bluetooth", enabled: false, status: "paused",
    conditions: [{ field: "bluetooth.days_unused", operator: ">", value: 7 }],
    actions: [{ service: "btd", method: "disable", args: {}, displayLabel: "Turn off Bluetooth" }],
    triggerCount: 0, lastTriggered: null, createdAt: now - hour * 200, policyOverride: false,
    description: "Suggests turning off Bluetooth if unused for 7+ days"
  },
];

const HISTORY: RuleExecution[] = [
  { id: "exec-1", ruleId: "rule-1", ruleName: "Auto-VPN on Public WiFi", domain: "network", triggeredAt: now - hour * 3, conditionSnapshot: { "network.security": "open", ssid: "CoffeeShop-Free" }, actionsExecuted: ["Enable VPN", "Notify user"], success: true },
  { id: "exec-2", ruleId: "rule-3", ruleName: "Mute Notifications in Meetings", domain: "notification", triggeredAt: now - hour * 2, conditionSnapshot: { "calendar.event_active": true, event: "Sprint Planning" }, actionsExecuted: ["Enable Focus Mode"], success: true },
  { id: "exec-3", ruleId: "rule-4", ruleName: "Audio Panel on Headphones", domain: "bluetooth", triggeredAt: now - hour * 6, conditionSnapshot: { "bluetooth.headphones_connected": true, device: "AirPods Pro" }, actionsExecuted: ["Open Audio Controls"], success: true },
  { id: "exec-4", ruleId: "rule-2", ruleName: "Battery Saver at 15%", domain: "power", triggeredAt: now - hour * 48, conditionSnapshot: { "battery.level": 14 }, actionsExecuted: ["Switch to Power Saver"], success: true },
  { id: "exec-5", ruleId: "rule-5", ruleName: "Isolate on Threat Detection", domain: "security", triggeredAt: now - hour * 168, conditionSnapshot: { "shield.threat_detected": true, app: "unknown_binary.exe" }, actionsExecuted: ["Isolate suspicious app", "Disconnect risky network"], success: true },
];

export class AutomationDaemon {
  private state: AutomationState;
  private listeners: Array<(s: AutomationState) => void> = [];

  constructor() {
    this.state = {
      rules: [...BUILT_IN_RULES],
      executionHistory: [...HISTORY],
      eventBusActive: true,
      conflictsDetected: 0,
    };
  }

  getState(): AutomationState { return { ...this.state }; }

  subscribe(fn: (s: AutomationState) => void) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private emit() { this.listeners.forEach(fn => fn(this.getState())); }

  toggleRule(id: string) {
    const rule = this.state.rules.find(r => r.id === id);
    if (rule) {
      rule.enabled = !rule.enabled;
      rule.status = rule.enabled ? "active" : "paused";
    }
    this.emit();
  }

  getDomainColor(domain: AutomationDomain): string {
    const map: Record<AutomationDomain, string> = {
      network: "hsl(210, 80%, 60%)",
      power: "hsl(38, 85%, 58%)",
      security: "hsl(0, 70%, 55%)",
      bluetooth: "hsl(240, 60%, 60%)",
      notification: "hsl(152, 55%, 48%)",
      system: "hsl(265, 55%, 58%)",
    };
    return map[domain];
  }
}

let instance: AutomationDaemon | null = null;
export function getAutomationDaemon(): AutomationDaemon {
  if (!instance) instance = new AutomationDaemon();
  return instance;
}
