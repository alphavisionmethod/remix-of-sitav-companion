// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal Command Surface v2
// The single most important interaction primitive in the system
// Modes: search, navigate, capture, simulate, approval, intent
// Live Supabase entity search + static command index
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowRight, X, Sparkles, ChevronRight, Plus,
  FileText, UserPlus, CalendarPlus, Phone, FileUp,
  Home, Briefcase, DollarSign, Headphones, BarChart3,
  FolderOpen, CheckCircle, Settings, Shield, Users,
  Brain, Target, Activity, Receipt, Inbox, Eye,
  Zap, Bell, Workflow, Clock, AlertTriangle,
  MessageSquare, Hash, BookOpen, Layout, Globe,
  ShieldCheck, Lock, Send, Play, Pause, ExternalLink,
  Loader2, Info, ArrowUpRight, Server, Route, Layers, Cpu, Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useGlobalSearch, type SearchResult } from "@/hooks/use-global-search";
import { useShellIndicators } from "@/hooks/use-shell-indicators";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IntentRibbon } from "./IntentRibbon";
import { WhyThisResult, type ResultReason } from "./WhyThisResult";
import { detectIntent as detectExtendedIntent } from "@/lib/command-registry/action-registry";
import { SIMULATION_ACTIONS, EXPLAINABILITY_ACTIONS } from "@/lib/command-registry/action-registry";

// ── Command Index ────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  path?: string;
  category: "action" | "navigate" | "advisor" | "capture" | "system";
  domain?: string;
  keywords: string[];
  riskLevel?: "low" | "medium" | "high";
}

const COMMAND_INDEX: CommandItem[] = [
  // Captures
  { id: "cap-note", label: "Quick note", sublabel: "Capture a thought", icon: FileText, category: "capture", keywords: ["note", "capture", "write", "remember"] },
  { id: "cap-task", label: "Add task", sublabel: "Create a new task", icon: Target, category: "capture", keywords: ["task", "todo", "add", "create"] },
  { id: "cap-lead", label: "New lead", sublabel: "Add a business lead", icon: UserPlus, path: "/business?action=new-lead", category: "capture", domain: "business", keywords: ["lead", "new", "prospect"] },
  { id: "cap-reminder", label: "Set reminder", sublabel: "Don't forget", icon: Bell, category: "capture", keywords: ["remind", "reminder", "alert", "later"] },
  { id: "cap-upload", label: "Upload file", sublabel: "Import a document", icon: FileUp, path: "/files?action=upload", category: "capture", keywords: ["upload", "file", "document", "import"] },
  // Actions
  { id: "act-boardroom", label: "Enter Boardroom", sublabel: "Full operating briefing", icon: BarChart3, path: "/boardroom", category: "action", keywords: ["boardroom", "review", "briefing"] },
  { id: "act-approvals", label: "Review approvals", sublabel: "Pending decisions", icon: CheckCircle, path: "/approvals", category: "action", keywords: ["approvals", "pending", "review", "decisions"] },
  { id: "act-day-review", label: "Start day review", sublabel: "Morning pulse", icon: Sparkles, path: "/", category: "action", keywords: ["day", "review", "morning", "pulse"] },
  { id: "act-invoice", label: "Create invoice", sublabel: "Business billing", icon: FileText, path: "/business?action=new-invoice", category: "action", domain: "business", keywords: ["invoice", "create", "bill"], riskLevel: "medium" },
  { id: "act-callback", label: "Schedule callback", sublabel: "Business follow-up", icon: Phone, path: "/business?action=callback", category: "action", domain: "business", keywords: ["callback", "call", "schedule"] },
  { id: "act-appointment", label: "Schedule appointment", sublabel: "Calendar", icon: CalendarPlus, path: "/concierge?action=schedule", category: "action", keywords: ["appointment", "schedule", "meeting"] },
  { id: "act-recover", label: "Recover missed leads", sublabel: "Re-engage stale leads", icon: Zap, path: "/recovered-value", category: "action", domain: "business", keywords: ["recover", "leads", "stale", "missed"] },
  { id: "act-workflow", label: "Start workflow", sublabel: "Launch an automation", icon: Play, path: "/workflows", category: "action", keywords: ["workflow", "start", "automation", "launch"], riskLevel: "medium" },
  { id: "act-export", label: "Export data", sublabel: "Sovereign data export", icon: ExternalLink, path: "/settings", category: "action", keywords: ["export", "data", "download", "sovereign"] },
  // Navigation
  { id: "nav-desktop", label: "Desktop", sublabel: "OS home screen", icon: Layout, path: "/desktop", category: "navigate", keywords: ["desktop", "home", "shell", "surface"] },
  { id: "nav-home", label: "Daily Pulse", sublabel: "Morning review", icon: Home, path: "/home", category: "navigate", keywords: ["home", "pulse", "daily"] },
  { id: "nav-business", label: "Business Center", sublabel: "Leads, customers, pipeline", icon: Briefcase, path: "/business", category: "navigate", domain: "business", keywords: ["business", "crm", "leads", "sales"] },
  { id: "nav-money", label: "Finance Center", sublabel: "Bills, accounts, reserves", icon: DollarSign, path: "/money", category: "navigate", domain: "finance", keywords: ["money", "finance", "bills", "budget"] },
  { id: "nav-concierge", label: "Concierge", sublabel: "Household, calendar, tasks", icon: Headphones, path: "/concierge", category: "navigate", domain: "concierge", keywords: ["concierge", "household", "calendar"] },
  { id: "nav-files", label: "Files", sublabel: "Documents & knowledge", icon: FolderOpen, path: "/files", category: "navigate", keywords: ["files", "documents"] },
  { id: "nav-workflows", label: "Workflows", sublabel: "Automations", icon: Workflow, path: "/workflows", category: "navigate", keywords: ["workflows", "automation"] },
  { id: "nav-proof", label: "Proof Center", sublabel: "Receipts & audit trail", icon: Receipt, path: "/proof", category: "navigate", keywords: ["proof", "receipts", "audit"] },
  { id: "nav-boardroom", label: "Boardroom", sublabel: "Reviews & planning", icon: BarChart3, path: "/boardroom", category: "navigate", keywords: ["boardroom", "review", "planning"] },
  { id: "nav-settings", label: "Settings", sublabel: "Trust & preferences", icon: Settings, path: "/settings", category: "navigate", keywords: ["settings", "preferences"] },
  { id: "nav-mission", label: "Mission Control", sublabel: "System health & agents", icon: Shield, path: "/mission-control", category: "navigate", keywords: ["mission", "control", "system"] },
  { id: "nav-inbox", label: "Inbox", sublabel: "Incoming items", icon: Inbox, path: "/inbox", category: "navigate", keywords: ["inbox", "capture"] },
  { id: "nav-search", label: "Global Search", sublabel: "Deep cross-domain search", icon: Search, path: "/search", category: "navigate", keywords: ["search", "find"] },
  { id: "nav-comms", label: "Communications", sublabel: "Messages & channels", icon: MessageSquare, path: "/communications", category: "navigate", keywords: ["communications", "messages"] },
  { id: "nav-approvals", label: "Approvals", sublabel: "Decision queue", icon: CheckCircle, path: "/approvals", category: "navigate", keywords: ["approvals", "queue"] },
  { id: "nav-life", label: "Life Dashboard", sublabel: "Personal overview", icon: Activity, path: "/life", category: "navigate", keywords: ["life", "personal", "dashboard"] },
  { id: "nav-profile", label: "My Profile", sublabel: "View and edit your profile", icon: Users, path: "/profile", category: "navigate", keywords: ["profile", "account", "avatar", "settings", "user"] },
  { id: "nav-twins", label: "Digital Twins", sublabel: "Predictive models", icon: Users, path: "/digital-twins", category: "navigate", keywords: ["twins", "predictive"] },
  // Advisors
  { id: "adv-business", label: "Business Advisor", sublabel: "Pipeline & revenue", icon: Briefcase, path: "/advisors/business-advisor", category: "advisor", domain: "business", keywords: ["business", "advisor"] },
  { id: "adv-money", label: "Finance Advisor", sublabel: "Cashflow guidance", icon: DollarSign, path: "/advisors/money-advisor", category: "advisor", domain: "finance", keywords: ["money", "finance", "advisor"] },
  { id: "adv-concierge", label: "Concierge Advisor", sublabel: "Task help", icon: Headphones, path: "/advisors/concierge-advisor", category: "advisor", domain: "concierge", keywords: ["concierge", "advisor"] },
  { id: "adv-strategy", label: "Strategy Advisor", sublabel: "Cross-domain synthesis", icon: Brain, path: "/advisors/strategy-advisor", category: "advisor", keywords: ["strategy", "advisor"] },
  // System
  { id: "sys-focus", label: "Focus Mode", sublabel: "Start 25-min deep work session", icon: Target, category: "system", keywords: ["focus", "mode", "deep", "work", "pomodoro", "timer", "concentrate"] },
  { id: "sys-agents", label: "Agent Control", sublabel: "Fleet management", icon: Shield, path: "/mission-control?tab=control-panel", category: "system", keywords: ["agents", "control"] },
  { id: "sys-audit", label: "Audit Log", sublabel: "Compliance trail", icon: FileText, path: "/mission-control?tab=audit-log", category: "system", keywords: ["audit", "log"] },
  { id: "sys-integrations", label: "Integrations", sublabel: "Connected services", icon: Globe, path: "/integrations", category: "system", keywords: ["integrations", "connected"] },
  // Automation Reality
  { id: "ar-overview", label: "Automation Overview", sublabel: "AR01 — Scheduled automation truth", icon: Activity, path: "/admin/automation/overview", category: "navigate", domain: "system", keywords: ["ar", "automation", "overview", "cron", "scheduler", "ar01"] },
  { id: "ar-jobs", label: "Job Registry", sublabel: "AR02 — All recurring jobs", icon: Clock, path: "/admin/automation/jobs", category: "navigate", domain: "system", keywords: ["ar", "automation", "jobs", "registry", "scheduled", "cron", "ar02"] },
  { id: "ar-healing", label: "Self-Healing Board", sublabel: "AR03 — Self-healing execution", icon: Zap, path: "/admin/automation/self-healing", category: "navigate", domain: "system", keywords: ["ar", "automation", "self-healing", "heal", "repair", "ar03"] },
  { id: "ar-agent", label: "Agent Scheduler", sublabel: "AR04 — Agent recurring execution", icon: Shield, path: "/admin/automation/agent-scheduler", category: "navigate", domain: "system", keywords: ["ar", "automation", "agent", "scheduler", "heartbeat", "ar04"] },
  { id: "ar-maintenance", label: "System Maintenance", sublabel: "AR05 — Maintenance & cleanup jobs", icon: Settings, path: "/admin/automation/maintenance", category: "navigate", domain: "system", keywords: ["ar", "automation", "maintenance", "cleanup", "system", "updates", "ar05"] },
  { id: "ar-traces", label: "Execution Traces", sublabel: "AR06 — Recurring execution traces", icon: Search, path: "/admin/automation/traces", category: "navigate", domain: "system", keywords: ["ar", "automation", "traces", "execution", "history", "ar06"] },
  { id: "ar-failures", label: "Failure Center", sublabel: "AR07 — Retry & escalation", icon: AlertTriangle, path: "/admin/automation/failures", category: "navigate", domain: "system", keywords: ["ar", "automation", "failure", "retry", "escalation", "ar07"] },
  { id: "ar-killswitch", label: "Kill Switches", sublabel: "AR08 — Automation safety controls", icon: Shield, path: "/admin/automation/kill-switches", category: "navigate", domain: "system", keywords: ["ar", "automation", "kill", "switch", "safety", "disable", "ar08"] },
  { id: "ar-gate", label: "Automation Launch Gate", sublabel: "AR09 — Launch readiness gate", icon: ShieldCheck, path: "/admin/automation/launch-gate", category: "navigate", domain: "system", keywords: ["ar", "automation", "launch", "gate", "readiness", "ar09"] },
  // Launch Truth
  { id: "lt-behavioral", label: "Behavioral Truth", sublabel: "LT01 — Behavioral truth overview", icon: ShieldCheck, path: "/admin/truth/behavioral", category: "navigate", domain: "system", keywords: ["lt", "launch", "truth", "behavioral", "overview", "lt01"] },
  { id: "lt-ci", label: "CI Pipeline", sublabel: "LT02 — CI pipeline center", icon: Activity, path: "/admin/truth/ci-pipeline", category: "navigate", domain: "system", keywords: ["lt", "launch", "truth", "ci", "pipeline", "build", "lt02"] },
  { id: "lt-e2e", label: "E2E Journeys", sublabel: "LT03 — End-to-end journey board", icon: Target, path: "/admin/truth/e2e-journeys", category: "navigate", domain: "system", keywords: ["lt", "launch", "truth", "e2e", "journeys", "playwright", "tests", "lt03"] },
  { id: "lt-probes", label: "Runtime Probes", sublabel: "LT04 — Runtime probe center", icon: Activity, path: "/admin/truth/runtime-probes", category: "navigate", domain: "system", keywords: ["lt", "launch", "truth", "runtime", "probes", "health", "lt04"] },
  { id: "lt-gate", label: "Launch Gate", sublabel: "LT05 — Launch gate board", icon: ShieldCheck, path: "/admin/truth/launch-gate", category: "navigate", domain: "system", keywords: ["lt", "launch", "truth", "gate", "readiness", "lt05"] },
  { id: "lt-route", label: "Route Truth", sublabel: "LT06 — P0 route & interaction truth", icon: Globe, path: "/admin/truth/route-interaction", category: "navigate", domain: "system", keywords: ["lt", "launch", "truth", "route", "interaction", "p0", "lt06"] },
  { id: "lt-regressions", label: "Regression Radar", sublabel: "LT07 — Truth regression radar", icon: AlertTriangle, path: "/admin/truth/regression-radar", category: "navigate", domain: "system", keywords: ["lt", "launch", "truth", "regression", "radar", "flake", "lt07"] },
  // Connector Reality
  { id: "cn-overview", label: "Connector Overview", sublabel: "CN01 — Connector reality overview", icon: Globe, path: "/admin/connectors/overview", category: "navigate", domain: "system", keywords: ["cn", "connector", "overview", "integration", "cn01"] },
  { id: "cn-registry", label: "Connector Registry", sublabel: "CN02 — Connector registry console", icon: Layout, path: "/admin/connectors/registry", category: "navigate", domain: "system", keywords: ["cn", "connector", "registry", "catalog", "cn02"] },
  { id: "cn-accounts", label: "Account Linkage", sublabel: "CN03 — Account linkage board", icon: Users, path: "/admin/connectors/accounts", category: "navigate", domain: "system", keywords: ["cn", "connector", "account", "linkage", "oauth", "cn03"] },
  { id: "cn-sync", label: "Sync Truth", sublabel: "CN04 — Sync truth center", icon: Activity, path: "/admin/connectors/sync", category: "navigate", domain: "system", keywords: ["cn", "connector", "sync", "truth", "cn04"] },
  { id: "cn-health", label: "Connector Health", sublabel: "CN05 — Connector health board", icon: Activity, path: "/admin/connectors/health", category: "navigate", domain: "system", keywords: ["cn", "connector", "health", "status", "cn05"] },
  { id: "cn-demo", label: "Connector Demo Review", sublabel: "CN06 — Connector demo review", icon: Eye, path: "/admin/connectors/demo", category: "navigate", domain: "system", keywords: ["cn", "connector", "demo", "review", "cn06"] },
  { id: "cn-gate", label: "Connector Launch Gate", sublabel: "CN07 — Connector launch gate", icon: ShieldCheck, path: "/admin/connectors/launch-gate", category: "navigate", domain: "system", keywords: ["cn", "connector", "launch", "gate", "cn07"] },


  // Device & Wearable Expansion (DWE)
  { id: "dwe-devices", label: "Connected Devices", sublabel: "DWE01 — Connected devices center", icon: Layout, path: "/admin/dwe/devices", category: "system", keywords: ["device", "connected", "dwe01"] },
  { id: "dwe-presence", label: "Device Presence", sublabel: "DWE02 — Presence continuity center", icon: Activity, path: "/admin/dwe/presence", category: "system", keywords: ["presence", "continuity", "device", "dwe02"] },
  { id: "dwe-wearables", label: "Wearable Signals", sublabel: "DWE03 — Wearable signals center", icon: Activity, path: "/admin/dwe/wearables", category: "system", keywords: ["wearable", "signals", "watch", "ring", "dwe03"] },
  { id: "dwe-notifications", label: "Notification Routing", sublabel: "DWE04 — Notification routing studio", icon: Globe, path: "/admin/dwe/notifications", category: "system", keywords: ["notification", "routing", "ambient", "dwe04"] },
  { id: "dwe-trust", label: "Device Trust", sublabel: "DWE05 — Device trust & approvals", icon: Shield, path: "/admin/dwe/trust", category: "system", keywords: ["device", "trust", "approval", "dwe05"] },
  { id: "dwe-assistant", label: "Ambient Assistant", sublabel: "DWE06 — Ambient assistant center", icon: Zap, path: "/admin/dwe/assistant", category: "system", keywords: ["ambient", "assistant", "proactive", "dwe06"] },
  { id: "dwe-launch", label: "Device Launch Honesty", sublabel: "DWE07 — Device launch honesty board", icon: ShieldCheck, path: "/admin/dwe/launch-honesty", category: "system", keywords: ["device", "launch", "honesty", "dwe07"] },
  // Unified Ambient OS (UAO)
  { id: "uao-presence", label: "UAO Presence", sublabel: "UAO01 — Presence continuity", icon: Activity, path: "/admin/uao/presence", category: "system", keywords: ["uao", "presence", "continuity", "uao01"] },
  { id: "uao-devices", label: "UAO Devices", sublabel: "UAO02 — Connected devices", icon: Layout, path: "/admin/uao/devices", category: "system", keywords: ["uao", "devices", "connected", "uao02"] },
  { id: "uao-team", label: "Ambient Team", sublabel: "UAO03 — Ambient team control", icon: Users, path: "/admin/uao/team", category: "system", keywords: ["uao", "team", "ambient", "uao03"] },
  { id: "uao-notifications", label: "UAO Notifications", sublabel: "UAO04 — Notification router", icon: Globe, path: "/admin/uao/notifications", category: "system", keywords: ["uao", "notification", "router", "uao04"] },
  { id: "uao-health", label: "Health Readiness", sublabel: "UAO05 — Health & readiness signals", icon: Activity, path: "/admin/uao/health", category: "system", keywords: ["uao", "health", "readiness", "uao05"] },
  { id: "uao-trust", label: "UAO Trust", sublabel: "UAO06 — Device trust governance", icon: Shield, path: "/admin/uao/trust", category: "system", keywords: ["uao", "trust", "device", "uao06"] },
  { id: "uao-journeys", label: "Cross-Surface Journeys", sublabel: "UAO07 — Cross-surface journey tracker", icon: Target, path: "/admin/uao/journeys", category: "system", keywords: ["uao", "journey", "cross", "surface", "uao07"] },
  { id: "uao-launch", label: "Ambient Launch", sublabel: "UAO08 — Ambient launch readiness", icon: ShieldCheck, path: "/admin/uao/launch", category: "system", keywords: ["uao", "ambient", "launch", "readiness", "uao08"] },
  // APL — Apple Ecosystem
  { id: "apl-ecosystem", label: "Apple Ecosystem", sublabel: "APL01 — Apple surfaces, identity, trust", icon: Globe, path: "/admin/apl/ecosystem", category: "navigate", domain: "system", keywords: ["apple", "ecosystem", "iphone", "ipad", "apl01"] },
  { id: "apl-devices-trust", label: "Apple Devices & Trust", sublabel: "APL02 — Device trust, biometric, escalation", icon: Shield, path: "/admin/apl/devices-trust", category: "navigate", domain: "system", keywords: ["apple", "trust", "device", "biometric", "apl02"] },
  { id: "apl-watch", label: "Apple Watch", sublabel: "APL03 — Glance cards, micro-approvals, haptics", icon: Activity, path: "/admin/apl/watch", category: "navigate", domain: "system", keywords: ["apple", "watch", "glance", "haptic", "micro", "apl03"] },
  { id: "apl-identity", label: "Apple Identity", sublabel: "APL04 — Sign in with Apple, identity graph", icon: UserPlus, path: "/admin/apl/identity", category: "navigate", domain: "system", keywords: ["apple", "identity", "sign", "login", "apl04"] },
  { id: "apl-health", label: "Apple Health Consent", sublabel: "APL05 — HealthKit consent, privacy controls", icon: Activity, path: "/admin/apl/health-consent", category: "navigate", domain: "system", keywords: ["apple", "health", "healthkit", "consent", "apl05"] },
  { id: "apl-launch", label: "Apple Launch Readiness", sublabel: "APL06 — Apple ecosystem launch truth", icon: ShieldCheck, path: "/admin/apl/launch-readiness", category: "navigate", domain: "system", keywords: ["apple", "launch", "readiness", "apl06"] },
  // AND — Android Ecosystem
  { id: "and-ecosystem", label: "Android Ecosystem", sublabel: "AND01 — Android surfaces, FCM, trust", icon: Globe, path: "/admin/and/ecosystem", category: "navigate", domain: "system", keywords: ["android", "ecosystem", "fcm", "and01"] },
  { id: "and-wearos", label: "Wear OS Experience", sublabel: "AND02 — Tiles, complications, micro-actions", icon: Activity, path: "/admin/and/wearos", category: "navigate", domain: "system", keywords: ["wearos", "wear", "tile", "complication", "and02"] },
  { id: "and-trust", label: "Android Trust", sublabel: "AND03 — Android device trust, keystore", icon: Shield, path: "/admin/and/trust", category: "navigate", domain: "system", keywords: ["android", "trust", "keystore", "biometric", "and03"] },
  { id: "and-health", label: "Android Health Consent", sublabel: "AND04 — Health Connect consent", icon: Activity, path: "/admin/and/health-consent", category: "navigate", domain: "system", keywords: ["android", "health", "connect", "consent", "and04"] },
  { id: "and-launch", label: "Android Launch Readiness", sublabel: "AND05 — Android launch truth", icon: ShieldCheck, path: "/admin/and/launch-readiness", category: "navigate", domain: "system", keywords: ["android", "launch", "readiness", "and05"] },
  // HRS — Health / Readiness / Signal Intelligence
  { id: "hrs-consent", label: "Health Consent Center", sublabel: "HRS01 — Signal consent governance", icon: ShieldCheck, path: "/admin/hrs/consent", category: "navigate", domain: "system", keywords: ["health", "consent", "signal", "privacy", "hrs01"] },
  { id: "hrs-sources", label: "Signal Sources", sublabel: "HRS02 — Connected signal providers", icon: Activity, path: "/admin/hrs/sources", category: "navigate", domain: "system", keywords: ["signal", "source", "provider", "wearable", "hrs02"] },
  { id: "hrs-readiness", label: "Readiness Explanation", sublabel: "HRS03 — Readiness derivation view", icon: Activity, path: "/admin/hrs/readiness", category: "navigate", domain: "system", keywords: ["readiness", "derivation", "state", "hrs03"] },
  { id: "hrs-notification", label: "Notification Influence", sublabel: "HRS04 — Signal-to-routing influence", icon: Bell, path: "/admin/hrs/notification-influence", category: "navigate", domain: "system", keywords: ["notification", "influence", "routing", "signal", "hrs04"] },
  { id: "hrs-timing", label: "Assistant Timing", sublabel: "HRS05 — Readiness-aware assistant timing", icon: Brain, path: "/admin/hrs/assistant-timing", category: "navigate", domain: "system", keywords: ["assistant", "timing", "readiness", "hrs05"] },
  { id: "hrs-launch", label: "Signal Launch Honesty", sublabel: "HRS06 — Signal system launch truth", icon: ShieldCheck, path: "/admin/hrs/launch-honesty", category: "navigate", domain: "system", keywords: ["signal", "launch", "honesty", "hrs06"] },
  // NRC — Notification Routing + Calm Assistant
  { id: "nrc-routing", label: "Notification Routing Studio", sublabel: "NRC01 — Attention routing engine", icon: Bell, path: "/admin/nrc/routing", category: "navigate", domain: "system", keywords: ["notification", "routing", "attention", "nrc01"] },
  { id: "nrc-calmness", label: "Calmness Center", sublabel: "NRC02 — Calm AI assistant behavior", icon: Brain, path: "/admin/nrc/calmness", category: "navigate", domain: "system", keywords: ["calm", "assistant", "proactive", "nrc02"] },
  { id: "nrc-fatigue", label: "Fatigue Board", sublabel: "NRC03 — Interruption fatigue tracking", icon: Activity, path: "/admin/nrc/fatigue", category: "navigate", domain: "system", keywords: ["fatigue", "interruption", "overload", "nrc03"] },
  { id: "nrc-queue", label: "Queue/Interrupt Matrix", sublabel: "NRC04 — Queue vs interrupt strategy", icon: Inbox, path: "/admin/nrc/queue-interrupt", category: "navigate", domain: "system", keywords: ["queue", "interrupt", "strategy", "nrc04"] },
  { id: "nrc-cross", label: "Cross-Device Delivery", sublabel: "NRC05 — Multi-device delivery review", icon: Globe, path: "/admin/nrc/cross-device", category: "navigate", domain: "system", keywords: ["cross", "device", "delivery", "nrc05"] },
  { id: "nrc-launch", label: "Notification Launch Honesty", sublabel: "NRC06 — Notification launch truth", icon: ShieldCheck, path: "/admin/nrc/launch-honesty", category: "navigate", domain: "system", keywords: ["notification", "launch", "honesty", "nrc06"] },
  // NSS — Native Shell Strategy
  { id: "nss-strategy", label: "Native Shell Strategy", sublabel: "NSS01 — iPhone/Android shell strategy", icon: Globe, path: "/admin/nss/strategy", category: "navigate", domain: "system", keywords: ["native", "shell", "strategy", "mobile", "nss01"] },
  { id: "nss-capability", label: "Capability Matrix", sublabel: "NSS02 — Mobile capability surface mapping", icon: Target, path: "/admin/nss/capability-matrix", category: "navigate", domain: "system", keywords: ["capability", "matrix", "surface", "mobile", "nss02"] },
  { id: "nss-trust", label: "Trust & Continuity", sublabel: "NSS03 — Device trust + handoff model", icon: Shield, path: "/admin/nss/trust-continuity", category: "navigate", domain: "system", keywords: ["trust", "continuity", "handoff", "nss03"] },
  { id: "nss-launch", label: "Mobile Launch Honesty", sublabel: "NSS04 — Mobile launch readiness truth", icon: ShieldCheck, path: "/admin/nss/mobile-launch", category: "navigate", domain: "system", keywords: ["mobile", "launch", "honesty", "nss04"] },
  // SAG — Sovereign AI Gateway
  { id: "sag-overview", label: "SAG Overview", sublabel: "SAG01 — Sovereign AI Gateway executive overview", icon: Brain, path: "/admin/sag/overview", category: "navigate", domain: "system", keywords: ["sag", "sovereign", "ai", "gateway", "overview", "sag01"] },
  { id: "sag-models", label: "SAG Model Registry", sublabel: "SAG02 — Approved models catalog", icon: Server, path: "/admin/sag/models", category: "navigate", domain: "system", keywords: ["sag", "model", "registry", "catalog", "sag02"] },
  { id: "sag-routing", label: "SAG Routing Policy", sublabel: "SAG03 — Capability routing policy board", icon: Route, path: "/admin/sag/routing", category: "navigate", domain: "system", keywords: ["sag", "routing", "policy", "capability", "sag03"] },
  { id: "sag-health", label: "SAG Provider Health", sublabel: "SAG04 — Provider adapter health center", icon: Activity, path: "/admin/sag/health", category: "navigate", domain: "system", keywords: ["sag", "provider", "health", "adapter", "sag04"] },
  { id: "sag-prompts", label: "SAG Prompt Registry", sublabel: "SAG05 — Prompt family registry", icon: FileText, path: "/admin/sag/prompts", category: "navigate", domain: "system", keywords: ["sag", "prompt", "registry", "family", "sag05"] },
  { id: "sag-economics", label: "SAG Economics Board", sublabel: "SAG06 — AI cost economics dashboard", icon: DollarSign, path: "/admin/sag/economics", category: "navigate", domain: "system", keywords: ["sag", "economics", "cost", "budget", "sag06"] },
  { id: "sag-cost-confidence", label: "SAG Cost-Confidence Lab", sublabel: "SAG07 — Cost vs confidence analysis", icon: Target, path: "/admin/sag/cost-confidence", category: "navigate", domain: "system", keywords: ["sag", "cost", "confidence", "lab", "sag07"] },
  { id: "sag-multi-stage", label: "SAG Multi-Stage Explorer", sublabel: "SAG08 — Multi-stage pipeline explorer", icon: Layers, path: "/admin/sag/multi-stage", category: "navigate", domain: "system", keywords: ["sag", "multi", "stage", "pipeline", "sag08"] },
  { id: "sag-receipts", label: "SAG Receipt Explorer", sublabel: "SAG09 — Inference receipt explorer", icon: FileText, path: "/admin/sag/receipts", category: "navigate", domain: "system", keywords: ["sag", "receipt", "inference", "explorer", "sag09"] },
  { id: "sag-fallback", label: "SAG Fallback Center", sublabel: "SAG10 — Fallback chain center", icon: Shield, path: "/admin/sag/fallback", category: "navigate", domain: "system", keywords: ["sag", "fallback", "chain", "center", "sag10"] },
  { id: "sag-builder", label: "SAG Builder Console", sublabel: "SAG11 — Capability builder console", icon: Cpu, path: "/admin/sag/builder", category: "navigate", domain: "system", keywords: ["sag", "builder", "console", "capability", "sag11"] },
  { id: "sag-compliance", label: "SAG Compliance Gate", sublabel: "SAG12 — AI compliance gate", icon: ShieldCheck, path: "/admin/sag/compliance", category: "navigate", domain: "system", keywords: ["sag", "compliance", "gate", "audit", "sag12"] },
  // AIG — AI Gateway (Legacy/Alternate)
  { id: "aig-providers", label: "AIG Provider Registry", sublabel: "AIG01 — AI provider registry", icon: Server, path: "/admin/aig/providers", category: "navigate", domain: "system", keywords: ["aig", "provider", "registry", "aig01"] },
  { id: "aig-models", label: "AIG Model Registry", sublabel: "AIG02 — AI model registry", icon: Cpu, path: "/admin/aig/models", category: "navigate", domain: "system", keywords: ["aig", "model", "registry", "aig02"] },
  { id: "aig-routing", label: "AIG Routing Matrix", sublabel: "AIG03 — AI routing matrix", icon: Route, path: "/admin/aig/routing", category: "navigate", domain: "system", keywords: ["aig", "routing", "matrix", "aig03"] },
  { id: "aig-budget", label: "AIG Budget Center", sublabel: "AIG04 — AI budget center", icon: DollarSign, path: "/admin/aig/budget", category: "navigate", domain: "system", keywords: ["aig", "budget", "cost", "aig04"] },
  { id: "aig-receipts", label: "AIG Receipts Explorer", sublabel: "AIG05 — AI receipts explorer", icon: FileText, path: "/admin/aig/receipts", category: "navigate", domain: "system", keywords: ["aig", "receipt", "explorer", "aig05"] },
  { id: "aig-launch", label: "AIG Launch Truth", sublabel: "AIG06 — AI launch truth board", icon: ShieldCheck, path: "/admin/aig/launch-truth", category: "navigate", domain: "system", keywords: ["aig", "launch", "truth", "aig06"] },
  { id: "aig-launch-detail", label: "AIG Launch Detail", sublabel: "AIG07 — AI launch truth detail", icon: ShieldCheck, path: "/admin/aig/launch-truth-detail", category: "navigate", domain: "system", keywords: ["aig", "launch", "detail", "aig07"] },
  { id: "aig-degraded", label: "AIG Degraded Diagnostics", sublabel: "AIG08 — Degraded mode diagnostics", icon: AlertTriangle, path: "/admin/aig/degraded", category: "navigate", domain: "system", keywords: ["aig", "degraded", "diagnostics", "aig08"] },
  { id: "aig-runtime", label: "AIG Runtime Verification", sublabel: "AIG09 — Runtime verification dashboard", icon: Activity, path: "/admin/aig/runtime-verification", category: "navigate", domain: "system", keywords: ["aig", "runtime", "verification", "aig09"] },
  // DRS — Dual Reality System
  { id: "drs-overview", label: "DRS Overview", sublabel: "DRS01 — Reality mode overview", icon: Eye, path: "/admin/drs/overview", category: "navigate", domain: "system", keywords: ["drs", "dual", "reality", "mode", "overview", "drs01"] },
  { id: "drs-registry", label: "DRS Mode Registry", sublabel: "DRS02 — Mode registry console", icon: Server, path: "/admin/drs/registry", category: "navigate", domain: "system", keywords: ["drs", "mode", "registry", "console", "drs02"] },
  { id: "drs-scenarios", label: "DRS Scenarios", sublabel: "DRS03 — Scenario library", icon: BookOpen, path: "/admin/drs/scenarios", category: "navigate", domain: "system", keywords: ["drs", "scenario", "library", "demo", "drs03"] },
  { id: "drs-entities", label: "DRS Entity Graph", sublabel: "DRS04 — Scenario entity graph", icon: Globe, path: "/admin/drs/entities", category: "navigate", domain: "system", keywords: ["drs", "entity", "graph", "scenario", "drs04"] },
  { id: "drs-providers", label: "DRS Providers", sublabel: "DRS05 — Provider console", icon: Server, path: "/admin/drs/providers", category: "navigate", domain: "system", keywords: ["drs", "provider", "console", "drs05"] },
  { id: "drs-safety", label: "DRS Safety", sublabel: "DRS06 — Demo policy safety", icon: Shield, path: "/admin/drs/safety", category: "navigate", domain: "system", keywords: ["drs", "safety", "demo", "policy", "drs06"] },
  { id: "drs-ai", label: "DRS AI Control", sublabel: "DRS07 — Demo AI control", icon: Brain, path: "/admin/drs/ai-control", category: "navigate", domain: "system", keywords: ["drs", "ai", "control", "demo", "drs07"] },
  { id: "drs-analytics", label: "DRS Analytics", sublabel: "DRS08 — Analytics segregation", icon: Activity, path: "/admin/drs/analytics", category: "navigate", domain: "system", keywords: ["drs", "analytics", "segregation", "drs08"] },
  { id: "drs-truth", label: "DRS Truth Labels", sublabel: "DRS09 — Truth labeling", icon: ShieldCheck, path: "/admin/drs/truth", category: "navigate", domain: "system", keywords: ["drs", "truth", "labeling", "drs09"] },
  { id: "drs-launch", label: "DRS Launch Gate", sublabel: "DRS10 — Dual reality launch gate", icon: Rocket, path: "/admin/drs/launch-gate", category: "navigate", domain: "system", keywords: ["drs", "launch", "gate", "dual", "reality", "drs10"] },
  // PFA — Provider Family Architecture
  { id: "pfa-families", label: "Provider Families", sublabel: "PFA01 — Provider family registry", icon: FolderOpen, path: "/admin/pfa/families", category: "navigate", domain: "system", keywords: ["pfa", "provider", "family", "registry", "pfa01"] },
  { id: "pfa-capabilities", label: "Provider Capabilities", sublabel: "PFA02 — Capability matrix", icon: Target, path: "/admin/pfa/capabilities", category: "navigate", domain: "system", keywords: ["pfa", "capability", "matrix", "provider", "pfa02"] },
  { id: "pfa-oauth", label: "OAuth Clients", sublabel: "PFA03 — OAuth client registry", icon: Lock, path: "/admin/pfa/oauth-clients", category: "navigate", domain: "system", keywords: ["pfa", "oauth", "client", "registry", "pfa03"] },
  { id: "pfa-consent", label: "Consent Ledger", sublabel: "PFA04 — Consent ledger explorer", icon: ShieldCheck, path: "/admin/pfa/consent", category: "navigate", domain: "system", keywords: ["pfa", "consent", "ledger", "explorer", "pfa04"] },
  { id: "pfa-scope", label: "Scope Policy", sublabel: "PFA05 — Scope policy matrix", icon: Shield, path: "/admin/pfa/scope-policy", category: "navigate", domain: "system", keywords: ["pfa", "scope", "policy", "matrix", "pfa05"] },
  { id: "pfa-upgrades", label: "Permission Upgrades", sublabel: "PFA06 — Permission upgrade center", icon: Activity, path: "/admin/pfa/upgrades", category: "navigate", domain: "system", keywords: ["pfa", "permission", "upgrade", "center", "pfa06"] },
  { id: "pfa-health", label: "Health Drift", sublabel: "PFA07 — Connector health drift", icon: Activity, path: "/admin/pfa/health-drift", category: "navigate", domain: "system", keywords: ["pfa", "health", "drift", "connector", "pfa07"] },
  { id: "pfa-graph", label: "Account Graph", sublabel: "PFA08 — Account graph explorer", icon: Globe, path: "/admin/pfa/account-graph", category: "navigate", domain: "system", keywords: ["pfa", "account", "graph", "explorer", "pfa08"] },
  { id: "pfa-launch", label: "Integration Launch Honesty", sublabel: "PFA10 — Integration launch honesty", icon: Rocket, path: "/admin/pfa/launch-honesty", category: "navigate", domain: "system", keywords: ["pfa", "launch", "honesty", "integration", "pfa10"] },
  { id: "pfa-google", label: "Google Provider Family", sublabel: "Google provider family dashboard", icon: Globe, path: "/admin/pfa/google", category: "navigate", domain: "system", keywords: ["pfa", "google", "provider", "family"] },
  // RCP — Reality Compliance Program
  { id: "rcp-overview", label: "RCP Overview", sublabel: "RCP01 — Reality compliance overview", icon: Eye, path: "/admin/reality-audit/overview", category: "navigate", domain: "system", keywords: ["rcp", "reality", "compliance", "overview", "rcp01"] },
  { id: "rcp-classification", label: "RCP Classification", sublabel: "RCP02 — Reality classification matrix", icon: Target, path: "/admin/reality-audit", category: "navigate", domain: "system", keywords: ["rcp", "classification", "matrix", "reality", "rcp02"] },
  { id: "rcp-mock-replace", label: "Mock Replacement", sublabel: "RCP04 — Mock replacement program", icon: Activity, path: "/admin/reality-audit/mock-replacement", category: "navigate", domain: "system", keywords: ["rcp", "mock", "replacement", "program", "rcp04"] },
  { id: "rcp-mock-sources", label: "Mock Sources", sublabel: "RCP05 — Mock source inventory", icon: FileText, path: "/admin/reality-audit/mock-sources", category: "navigate", domain: "system", keywords: ["rcp", "mock", "source", "inventory", "rcp05"] },
  { id: "rcp-persistence", label: "Core Persistence", sublabel: "RCP06 — Core service persistence", icon: Server, path: "/admin/reality-audit/core-persistence", category: "navigate", domain: "system", keywords: ["rcp", "core", "persistence", "service", "rcp06"] },
  { id: "rcp-heatmap", label: "Route Heatmap", sublabel: "RCP07 — Route heatmap", icon: Globe, path: "/admin/reality-audit/route-heatmap", category: "navigate", domain: "system", keywords: ["rcp", "route", "heatmap", "rcp07"] },
  { id: "rcp-contracts", label: "Contract Readiness", sublabel: "RCP08 — Contract readiness", icon: ShieldCheck, path: "/admin/reality-audit/contract-readiness", category: "navigate", domain: "system", keywords: ["rcp", "contract", "readiness", "rcp08"] },
  { id: "rcp-launch", label: "RCP Launch Honesty", sublabel: "RCP09 — Launch honesty board", icon: Rocket, path: "/admin/reality-audit/launch-honesty", category: "navigate", domain: "system", keywords: ["rcp", "launch", "honesty", "rcp09"] },
  { id: "rcp-wave", label: "Wave Planner", sublabel: "RCP10 — Wave planner", icon: Layers, path: "/admin/reality-audit/wave-planner", category: "navigate", domain: "system", keywords: ["rcp", "wave", "planner", "rcp10"] },
  { id: "rcp-progress", label: "Progress Timeline", sublabel: "RCP11 — Progress timeline", icon: Activity, path: "/admin/reality-audit/progress", category: "navigate", domain: "system", keywords: ["rcp", "progress", "timeline", "rcp11"] },
  { id: "rcp-runtime", label: "Runtime Truth Gate", sublabel: "RCP12 — Runtime truth gate", icon: ShieldCheck, path: "/admin/reality-audit/runtime-truth", category: "navigate", domain: "system", keywords: ["rcp", "runtime", "truth", "gate", "rcp12"] },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: string; order: number }> = {
  capture: { label: "Capture", color: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]", order: 0 },
  action: { label: "Actions", color: "bg-primary/10 text-primary", order: 1 },
  navigate: { label: "Navigate", color: "bg-secondary text-muted-foreground", order: 2 },
  advisor: { label: "Advisors", color: "bg-primary/10 text-primary", order: 3 },
  system: { label: "System", color: "bg-secondary text-muted-foreground", order: 4 },
  entity: { label: "Results", color: "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]", order: 5 },
  simulate: { label: "Simulate", color: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]", order: 1.5 },
  explain: { label: "Explain", color: "bg-primary/10 text-primary", order: 1.6 },
};

// ── Capture Detection ─────────────────────────────────────────

function detectCapture(query: string): { type: string; value: string } | null {
  const lower = query.toLowerCase().trim();
  if (lower.startsWith("note:") || lower.startsWith("note ")) return { type: "note", value: query.slice(5).trim() };
  if (lower.startsWith("remind me") || lower.startsWith("reminder:")) return { type: "reminder", value: query.replace(/^remind(er)?:?\s*(me\s+)?/i, "").trim() };
  if (lower.startsWith("task:") || lower.startsWith("todo:")) return { type: "task", value: query.slice(5).trim() };
  if (lower.startsWith("new lead") || lower.startsWith("lead:")) return { type: "lead", value: query.replace(/^(new\s+)?lead:?\s*/i, "").trim() };
  return null;
}

// ── Natural Language Intent ─────────────────────────────────

type IntentType = "ask" | "search" | "navigate" | "action" | "capture" | "simulate" | "explain" | null;

function detectIntent(query: string): IntentType {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  // Check simulate/explain intents first
  const extIntent = detectExtendedIntent(q);
  if (extIntent) return extIntent;
  if (/^(what|how|why|when|who|show me|tell me|find|is there|are there|do i)/.test(q)) return "ask";
  if (/^(go to|open|navigate|jump|switch)/.test(q)) return "navigate";
  if (/^(create|add|new|start|launch|schedule|send|draft|upload|set)/.test(q)) return "action";
  if (/^(note:|task:|remind|lead:|todo:)/.test(q)) return "capture";
  return "search";
}

// ── Context Suggestions ─────────────────────────────────────

function getContextSuggestions(pathname: string, indicators: { pendingApprovals: number; activeIncidents: number }): CommandItem[] {
  const hour = new Date().getHours();
  const segment = pathname.split("/").filter(Boolean)[0] || "home";

  // Priority: approvals/incidents waiting
  const urgent: CommandItem[] = [];
  if (indicators.pendingApprovals > 0) {
    urgent.push(COMMAND_INDEX.find(i => i.id === "act-approvals")!);
  }
  if (indicators.activeIncidents > 0) {
    urgent.push(COMMAND_INDEX.find(i => i.id === "nav-mission")!);
  }

  // Context-based
  const contextual: string[] = [];
  if (segment === "business" || segment === "home") {
    contextual.push("act-callback", "act-recover", "nav-business");
  } else if (segment === "money") {
    contextual.push("nav-money", "act-invoice", "act-approvals");
  } else if (segment === "concierge") {
    contextual.push("act-appointment", "cap-task", "nav-concierge");
  }

  // Time-based fallbacks
  if (hour < 12) contextual.push("act-day-review", "act-boardroom");
  else if (hour < 17) contextual.push("act-callback", "nav-boardroom");
  else contextual.push("cap-note", "nav-boardroom");

  const ids = [...new Set([...urgent.map(u => u.id), ...contextual])].slice(0, 5);
  return ids.map(id => COMMAND_INDEX.find(i => i.id === id)).filter(Boolean) as CommandItem[];
}

// ── Entity Icon Map ─────────────────────────────────────────

const ENTITY_ICONS: Record<string, React.ElementType> = {
  lead: UserPlus, customer: Users, task: Target, invoice: FileText,
  bill: DollarSign, workflow: Workflow, approval: CheckCircle,
  incident: AlertTriangle, file: FolderOpen, receipt: Receipt,
  note: FileText, booking: CalendarPlus, setting: Settings,
};

const DOMAIN_COLORS: Record<string, string> = {
  business: "text-primary", finance: "text-[hsl(var(--trust-safe))]",
  concierge: "text-[hsl(var(--sita-gold))]", system: "text-muted-foreground",
  files: "text-muted-foreground", workflows: "text-primary", proof: "text-[hsl(var(--trust-safe))]",
};

// ── Command State ───────────────────────────────────────────

type CommandState = "ready" | "searching" | "interpreting" | "previewing" | "approval_required" | "capture" | "no_results" | "ai_thinking" | "ai_answer";

// ── Component ───────────────────────────────────────────────

interface UniversalCommandSurfaceProps {
  open: boolean;
  onClose: () => void;
  onSystemCommand?: (cmd: string) => void;
}

export function UniversalCommandSurface({ open, onClose, onSystemCommand }: UniversalCommandSurfaceProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [commandState, setCommandState] = useState<CommandState>("ready");
  const [captureData, setCaptureData] = useState<{ type: string; value: string } | null>(null);
  const [previewItem, setPreviewItem] = useState<SearchResult | null>(null);
  const [aiAnswer, setAiAnswer] = useState("");
  const [recentCommands, setRecentCommands] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sita-recent-cmds") || "[]").slice(0, 6); } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const { results: entityResults, loading: entityLoading, search: entitySearch, clearResults } = useGlobalSearch();
  const indicators = useShellIndicators();

  // Debounced entity search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setCommandState("ready");
      setCaptureData(null);
      setPreviewItem(null);
      clearResults();
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, clearResults]);

  // Escape handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (previewItem) { setPreviewItem(null); return; }
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, previewItem]);

  // Query change → detect mode + trigger entity search
  useEffect(() => {
    const cap = detectCapture(query);
    if (cap && cap.value.length > 0) {
      setCommandState("capture");
      setCaptureData(cap);
      return;
    }
    setCaptureData(null);

    if (!query.trim()) {
      setCommandState("ready");
      clearResults();
      return;
    }

    setCommandState("searching");

    // Debounced entity search
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      entitySearch(query);
    }, 250);

    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [query, entitySearch, clearResults]);

  // Update command state when entity results arrive
  useEffect(() => {
    if (entityLoading) return;
    if (query.trim() && commandState === "searching") {
      const hasCommands = filteredCommands.length > 0;
      const hasEntities = entityResults.length > 0;
      setCommandState(hasCommands || hasEntities ? "ready" : "no_results");
    }
  }, [entityLoading, entityResults]);

  // Filter command index
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().split(/\s+/);
    // Merge extended actions as CommandItems
    const extendedItems: CommandItem[] = [...SIMULATION_ACTIONS, ...EXPLAINABILITY_ACTIONS].map(a => ({
      id: a.id,
      label: a.label,
      sublabel: a.sublabel,
      icon: Sparkles, // fallback icon for extended actions
      path: a.path,
      category: a.category as CommandItem["category"],
      domain: a.domain,
      keywords: a.keywords,
      riskLevel: a.riskLevel,
    }));
    const allCommands = [...COMMAND_INDEX, ...extendedItems];
    return allCommands.filter(item => {
      const searchable = [item.label, item.sublabel || "", ...item.keywords].join(" ").toLowerCase();
      return q.every(word => searchable.includes(word));
    });
  }, [query]);

  // Group commands
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => (CATEGORY_CONFIG[a]?.order ?? 99) - (CATEGORY_CONFIG[b]?.order ?? 99))
      .map(([cat, items]) => ({ category: cat, ...CATEGORY_CONFIG[cat], items }));
  }, [filteredCommands]);

  // Build unified flat list: commands + entities
  const allItems = useMemo(() => {
    const commands = groupedCommands.flatMap(g => g.items.map(item => ({ kind: "command" as const, item })));
    const entities = entityResults.map(r => ({ kind: "entity" as const, item: r }));
    return [...commands, ...entities];
  }, [groupedCommands, entityResults]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (commandState === "capture" && captureData) {
        handleCapture(captureData);
      } else if (intent === "ask" && query.trim()) {
        // AI mode — ask personal-brain
        handleAIAsk(query);
      } else if (allItems[selectedIdx]) {
        const item = allItems[selectedIdx];
        if (item.kind === "command") handleSelectCommand(item.item as CommandItem);
        else handleSelectEntity(item.item as SearchResult);
      }
    } else if (e.key === "Tab" && !e.shiftKey) {
      // Tab to preview
      e.preventDefault();
      const item = allItems[selectedIdx];
      if (item?.kind === "entity") {
        setPreviewItem(item.item as SearchResult);
      }
    }
  }, [allItems, selectedIdx, commandState, captureData]);

  const saveRecent = (label: string) => {
    const recent = [label, ...recentCommands.filter(r => r !== label)].slice(0, 6);
    setRecentCommands(recent);
    localStorage.setItem("sita-recent-cmds", JSON.stringify(recent));
  };

  const handleSelectCommand = (item: CommandItem) => {
    saveRecent(item.label);
    if (item.riskLevel === "high") {
      setCommandState("approval_required");
      toast.info("This action requires approval", { description: "Opening approval flow..." });
    }
    // System commands without paths
    if (item.id === "sys-focus") {
      onSystemCommand?.("focus");
      onClose();
      return;
    }
    if (item.path) { navigate(item.path); onClose(); }
  };

  const handleSelectEntity = (result: SearchResult) => {
    saveRecent(result.title);
    if (result.actionUrl) { navigate(result.actionUrl); onClose(); }
  };

  const handleCapture = (data: { type: string; value: string }) => {
    saveRecent(`${data.type}: ${data.value}`);
    toast.success(`${data.type} captured`, { description: data.value });
    const paths: Record<string, string> = { note: "/inbox", task: "/concierge", reminder: "/concierge", lead: "/business?action=new-lead" };
    navigate(paths[data.type] || "/inbox");
    onClose();
  };

  const handleAIAsk = async (q: string) => {
    setCommandState("ai_thinking");
    setAiAnswer("");
    try {
      const { data } = await supabase.functions.invoke("personal-brain", {
        body: { intent: q, context: { source: "command-surface" } },
      });
      setAiAnswer(data?.recommendation || data?.response || "I couldn't find an answer.");
      setCommandState("ai_answer");
    } catch {
      setAiAnswer("Connection issue — try again.");
      setCommandState("ai_answer");
    }
  };

  const suggestions = useMemo(() => getContextSuggestions(location.pathname, indicators), [location.pathname, indicators]);
  const intent = useMemo(() => detectIntent(query), [query]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 z-[300] flex items-start justify-center pt-[10vh] sm:pt-[14vh]"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

        {/* Command Panel */}
        <motion.div
          initial={reduced ? {} : { opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "relative w-full mx-4 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden",
            previewItem ? "max-w-4xl" : "max-w-2xl"
          )}
          role="dialog"
          aria-label="Universal Command Surface"
        >
          <div className="flex">
            {/* Main column */}
            <div className={cn("flex-1 min-w-0", previewItem && "border-r border-border/30")}>
              {/* Input */}
              <div className="flex items-center gap-3 border-b border-border/20 px-4 py-3.5">
                {entityLoading ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); setPreviewItem(null); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask, search, navigate, or capture — type anything…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  autoComplete="off" autoCorrect="off" spellCheck={false}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setPreviewItem(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
                {/* Intent ribbon */}
                {intent && query.trim() && (
                  <span className="hidden sm:flex items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider shrink-0">
                    {intent === "ask" && <Brain className="h-2.5 w-2.5" />}
                    {intent === "search" && <Search className="h-2.5 w-2.5" />}
                    {intent === "navigate" && <ArrowUpRight className="h-2.5 w-2.5" />}
                    {intent === "action" && <Zap className="h-2.5 w-2.5" />}
                    {intent === "capture" && <Plus className="h-2.5 w-2.5" />}
                    {intent}
                  </span>
                )}
                <kbd className="hidden sm:flex items-center rounded-md border border-border/30 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">ESC</kbd>
              </div>

              {/* Intent Interpretation Ribbon */}
              {query.trim() && commandState === "searching" && (
                <IntentRibbon mode="idle" query={query} className="border-b border-border/10" />
              )}

              {/* Content */}
              <ScrollArea className="max-h-[440px]">
                {/* Capture Mode */}
                {commandState === "capture" && captureData && (
                  <div className="p-4">
                    <div className="rounded-xl border border-[hsl(var(--sita-gold))]/20 bg-[hsl(var(--sita-gold))]/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Plus className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
                        <span className="text-xs font-semibold text-[hsl(var(--sita-gold))] uppercase tracking-wider">
                          Quick {captureData.type}
                        </span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{captureData.value}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleCapture(captureData)}
                          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <CheckCircle className="h-3 w-3" /> Save {captureData.type}
                        </button>
                        <span className="text-[10px] text-muted-foreground">Press Enter</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Command Results */}
                {commandState !== "capture" && query.trim() && groupedCommands.length > 0 && (
                  <div className="py-1">
                    {groupedCommands.map((group, gi) => (
                      <div key={group.category}>
                        {gi > 0 && <div className="mx-4 my-1 border-t border-border/10" />}
                        <div className="px-4 py-1.5">
                          <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider", group.color)}>
                            {group.label}
                          </span>
                        </div>
                        {group.items.map((item) => {
                          const globalIdx = allItems.findIndex(a => a.kind === "command" && (a.item as CommandItem).id === item.id);
                          const isSelected = globalIdx === selectedIdx;
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectCommand(item)}
                              onMouseEnter={() => setSelectedIdx(globalIdx)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                                isSelected ? "bg-primary/8" : "hover:bg-secondary/30"
                              )}
                            >
                              <div className={cn(
                                "rounded-lg p-1.5 shrink-0",
                                item.category === "advisor" ? "bg-primary/10" :
                                item.category === "capture" ? "bg-[hsl(var(--sita-gold))]/10" :
                                "bg-secondary/60"
                              )}>
                                <Icon className={cn("h-3.5 w-3.5", DOMAIN_COLORS[item.domain || ""] || "text-muted-foreground")} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-foreground">{item.label}</p>
                                {item.sublabel && <p className="text-[11px] text-muted-foreground">{item.sublabel}</p>}
                              </div>
                              {item.riskLevel && item.riskLevel !== "low" && (
                                <span className={cn(
                                  "rounded-full px-1.5 py-0.5 text-[9px] font-medium shrink-0",
                                  item.riskLevel === "high"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]"
                                )}>
                                  {item.riskLevel === "high" ? "Approval" : "Preview"}
                                </span>
                              )}
                              {isSelected && <ArrowRight className="h-3 w-3 text-primary shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* Entity Results from Supabase */}
                {commandState !== "capture" && query.trim() && entityResults.length > 0 && (
                  <div className="py-1">
                    <div className="mx-4 my-1 border-t border-border/10" />
                    <div className="px-4 py-1.5 flex items-center justify-between">
                      <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider", CATEGORY_CONFIG.entity.color)}>
                        Live Results
                      </span>
                      <button
                        onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}
                        className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                      >
                        View all in Search <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                    {entityResults.slice(0, 8).map((result, i) => {
                      const globalIdx = allItems.findIndex(a => a.kind === "entity" && (a.item as SearchResult).id === result.id);
                      const isSelected = globalIdx === selectedIdx;
                      const Icon = ENTITY_ICONS[result.type] || FileText;
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectEntity(result)}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
                            isSelected ? "bg-primary/8" : "hover:bg-secondary/30"
                          )}
                        >
                          <div className="rounded-lg bg-secondary/50 p-1.5 shrink-0">
                            <Icon className={cn("h-3.5 w-3.5", DOMAIN_COLORS[result.domain] || "text-muted-foreground")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[13px] text-foreground truncate">{result.title}</p>
                              <span className="text-[8px] px-1 py-0.5 rounded-full border border-border/30 text-muted-foreground capitalize shrink-0">{result.type}</span>
                            </div>
                            {result.subtitle && <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>}
                            <WhyThisResult
                              reasons={[
                                ...(result.sensitivity === "restricted" ? ["trust-related" as ResultReason] : []),
                                ...(i === 0 ? ["high-relevance" as ResultReason] : ["recent" as ResultReason]),
                              ]}
                            />
                          </div>
                          {result.sensitivity && result.sensitivity !== "public" && (
                            <Lock className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          )}
                          {isSelected && (
                            <div className="flex items-center gap-1 shrink-0">
                              <kbd className="rounded border border-border/30 bg-muted px-1 text-[8px] font-mono text-muted-foreground">TAB</kbd>
                              <ArrowRight className="h-3 w-3 text-primary" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* AI Thinking / Answer */}
                {commandState === "ai_thinking" && (
                  <div className="py-10 text-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Thinking…</p>
                    <div className="mt-3 mx-auto w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary/40 rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                )}
                {commandState === "ai_answer" && aiAnswer && (
                  <div className="p-4">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Answer</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{aiAnswer}</p>
                      <button
                        onClick={() => { navigate("/brain"); onClose(); }}
                        className="mt-3 text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        Continue in Brain <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                )}


                {commandState === "no_results" && (
                  <div className="py-10 text-center">
                    <Search className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No results for "{query}"</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-1">
                      Try: "note: call plumber" · "show bills" · "open finance"
                    </p>
                    <button
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); onClose(); }}
                      className="mt-3 text-[11px] text-primary hover:underline"
                    >
                      Try deep search →
                    </button>
                  </div>
                )}

                {/* Empty: suggestions + recent + status */}
                {commandState === "ready" && !query.trim() && (
                  <div className="py-1">
                    {/* Urgent indicators */}
                    {(indicators.pendingApprovals > 0 || indicators.activeIncidents > 0) && (
                      <>
                        <div className="px-4 py-1.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-destructive/70">Needs attention</span>
                        </div>
                        {indicators.pendingApprovals > 0 && (
                          <button
                            onClick={() => { navigate("/approvals"); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                          >
                            <div className="rounded-lg bg-[hsl(var(--sita-gold))]/10 p-1.5">
                              <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--sita-gold))]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[13px] text-foreground">{indicators.pendingApprovals} approval{indicators.pendingApprovals > 1 ? "s" : ""} waiting</p>
                              <p className="text-[11px] text-muted-foreground">Decisions need your attention</p>
                            </div>
                            <span className="rounded-full bg-[hsl(var(--sita-gold))]/15 px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--sita-gold))]">{indicators.pendingApprovals}</span>
                          </button>
                        )}
                        {indicators.activeIncidents > 0 && (
                          <button
                            onClick={() => { navigate("/mission-control"); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                          >
                            <div className="rounded-lg bg-destructive/10 p-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[13px] text-foreground">{indicators.activeIncidents} active incident{indicators.activeIncidents > 1 ? "s" : ""}</p>
                              <p className="text-[11px] text-muted-foreground">System issues detected</p>
                            </div>
                            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">{indicators.activeIncidents}</span>
                          </button>
                        )}
                        <div className="mx-4 my-1.5 border-t border-border/10" />
                      </>
                    )}

                    {/* Context suggestions */}
                    <div className="px-4 py-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">Suggested now</span>
                    </div>
                    {suggestions.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectCommand(item)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                        >
                          <div className="rounded-lg bg-primary/8 p-1.5">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] text-foreground">{item.label}</p>
                            {item.sublabel && <p className="text-[11px] text-muted-foreground">{item.sublabel}</p>}
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
                        </button>
                      );
                    })}

                    {/* Recent commands */}
                    {recentCommands.length > 0 && (
                      <>
                        <div className="mx-4 my-1.5 border-t border-border/10" />
                        <div className="px-4 py-1.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">Recent</span>
                        </div>
                        {recentCommands.map((cmd, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(cmd)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary/30 transition-colors"
                          >
                            <Clock className="h-3.5 w-3.5 text-muted-foreground/30" />
                            <span className="text-[13px] text-muted-foreground">{cmd}</span>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Quick capture chips */}
                    <div className="mx-4 my-2 border-t border-border/10" />
                    <div className="px-4 py-2.5 flex flex-wrap gap-1.5">
                      {["note:", "task:", "remind me", "new lead", "upload"].map(hint => (
                        <button
                          key={hint}
                          onClick={() => { setQuery(hint + " "); inputRef.current?.focus(); }}
                          className="rounded-lg border border-border/30 bg-secondary/20 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-border/50 transition-colors"
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border/15 px-4 py-2">
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground/40">
                  <span className="flex items-center gap-1"><kbd className="rounded border border-border/20 px-1 font-mono">↑↓</kbd> navigate</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-border/20 px-1 font-mono">↵</kbd> open</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-border/20 px-1 font-mono">tab</kbd> preview</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-border/20 px-1 font-mono">esc</kbd> close</span>
                </div>
                {/* Trust posture */}
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    indicators.trustPosture === "secure" ? "bg-[hsl(var(--trust-safe))]" :
                    indicators.trustPosture === "attention" ? "bg-[hsl(var(--sita-gold))]" :
                    indicators.trustPosture === "warning" ? "bg-amber-500" : "bg-destructive"
                  )} />
                  <span className="text-[9px] text-muted-foreground/30 capitalize">{indicators.trustPosture}</span>
                </div>
              </div>
            </div>

            {/* Preview Pane */}
            <AnimatePresence>
              {previewItem && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="p-4 space-y-3 w-[320px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
                      <button onClick={() => setPreviewItem(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {(() => { const Icon = ENTITY_ICONS[previewItem.type] || FileText; return <Icon className={cn("h-5 w-5", DOMAIN_COLORS[previewItem.domain])} />; })()}
                        <div>
                          <p className="text-sm font-semibold text-foreground">{previewItem.title}</p>
                          <p className="text-[11px] text-muted-foreground">{previewItem.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{previewItem.type}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">{previewItem.domain}</span>
                        {previewItem.sensitivity && previewItem.sensitivity !== "public" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive capitalize">{previewItem.sensitivity}</span>
                        )}
                      </div>
                      {previewItem.metadata && (
                        <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1">
                          {Object.entries(previewItem.metadata).filter(([, v]) => v != null).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                              <span className="text-foreground font-medium">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {previewItem.updatedAt && (
                        <p className="text-[10px] text-muted-foreground/50">
                          Updated {new Date(previewItem.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => { handleSelectEntity(previewItem); }}
                          className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => setPreviewItem(null)}
                          className="rounded-lg border border-border/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
