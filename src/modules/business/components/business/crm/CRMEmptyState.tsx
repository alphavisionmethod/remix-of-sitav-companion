// SITA OS — Premium CRM Empty States
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Users, Building2, TrendingUp, Heart, MessageSquare, CheckSquare,
  FileText, Upload, Link2, Layers, Zap, Settings, Shield, Search,
  type LucideIcon
} from "lucide-react";

interface CRMEmptyStateProps {
  section: string;
  onAction?: (action: string) => void;
}

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  tip?: string;
  actions: { label: string; action: string; primary?: boolean }[];
}

const EMPTY_STATES: Record<string, EmptyStateConfig> = {
  contacts: {
    icon: Users,
    title: "Your relationship hub starts here",
    description: "Add your first contact to begin building a living, intelligent record of every relationship that matters to your business.",
    tip: "You can add contacts manually, import from CSV/Excel, or connect an existing CRM.",
    actions: [
      { label: "Add Contact", action: "add-contact", primary: true },
      { label: "Import Contacts", action: "import" },
    ],
  },
  companies: {
    icon: Building2,
    title: "No companies yet",
    description: "Create company records to group contacts, track account health, and see your full B2B relationship picture.",
    actions: [
      { label: "Add Company", action: "add-company", primary: true },
    ],
  },
  pipeline: {
    icon: TrendingUp,
    title: "Your pipeline is empty",
    description: "Create your first deal to start tracking opportunities through your sales stages with full visibility and advisor insights.",
    actions: [
      { label: "Create Deal", action: "add-deal", primary: true },
    ],
  },
  health: {
    icon: Heart,
    title: "No relationship data yet",
    description: "Relationship health scores appear once you have contacts with activity history. Add contacts and log interactions to see health intelligence.",
    actions: [
      { label: "Go to Contacts", action: "nav-contacts", primary: true },
    ],
  },
  timeline: {
    icon: MessageSquare,
    title: "No activity recorded",
    description: "Your communication timeline will show every email, call, meeting, and note across all contacts. Log your first activity to start building relationship memory.",
    actions: [
      { label: "Log Activity", action: "log-activity", primary: true },
    ],
  },
  tasks: {
    icon: CheckSquare,
    title: "No follow-through items",
    description: "Tasks and follow-ups appear here when you create them from contacts, deals, or workflows. Stay on top of every commitment.",
    actions: [
      { label: "Create Task", action: "add-task", primary: true },
    ],
  },
  notes: {
    icon: FileText,
    title: "No notes yet",
    description: "Notes are your relationship memory layer. Capture meeting summaries, call outcomes, and strategic observations.",
    actions: [
      { label: "Write a Note", action: "add-note", primary: true },
    ],
  },
  import: {
    icon: Upload,
    title: "Ready to import",
    description: "Bring your existing contacts into SITA CRM from CSV, Excel, or connect an external CRM for automated sync.",
    tip: "We support CSV, Excel (.xlsx), and direct connections to HubSpot, Salesforce, and 20+ other platforms.",
    actions: [
      { label: "Import from File", action: "import-file", primary: true },
      { label: "Connect CRM", action: "connect-crm" },
    ],
  },
  integrations: {
    icon: Link2,
    title: "No connections yet",
    description: "Connect your existing CRM, email, or data sources to sync contacts and keep everything up to date automatically.",
    actions: [
      { label: "Browse Connectors", action: "browse-connectors", primary: true },
    ],
  },
  segments: {
    icon: Layers,
    title: "No segments created",
    description: "Build smart views and filtered lists to organize your contacts by lifecycle, engagement, value, or any custom criteria.",
    actions: [
      { label: "Create Segment", action: "create-segment", primary: true },
    ],
  },
  automations: {
    icon: Zap,
    title: "No automations active",
    description: "Set up trust-aware workflows to automate follow-ups, assignments, health alerts, and boardroom escalations.",
    actions: [
      { label: "Create Workflow", action: "create-workflow", primary: true },
    ],
  },
  "custom-fields": {
    icon: Settings,
    title: "Default fields only",
    description: "Extend your CRM with custom fields for contacts, companies, and deals. Add lead scores, contract dates, or any data you need.",
    actions: [
      { label: "Add Custom Field", action: "add-field", primary: true },
    ],
  },
  duplicates: {
    icon: Search,
    title: "No duplicates detected",
    description: "Duplicate detection runs automatically during imports and periodically across your database. Clean CRM, clean relationships.",
    actions: [],
  },
  advisor: {
    icon: Shield,
    title: "Advisor insights will appear here",
    description: "As your CRM grows with contacts, deals, and activity, the advisor board will surface actionable insights and recommendations.",
    tip: "Add at least 5 contacts with activity history for meaningful advisor intelligence.",
    actions: [
      { label: "Go to Contacts", action: "nav-contacts", primary: true },
    ],
  },
};

export function CRMEmptyState({ section, onAction }: CRMEmptyStateProps) {
  const config = EMPTY_STATES[section] || EMPTY_STATES.contacts;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 max-w-md mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <Icon className="h-8 w-8 text-primary" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{config.description}</p>

      {config.tip && (
        <p className="text-xs text-muted-foreground/70 mt-3 italic">💡 {config.tip}</p>
      )}

      {config.actions.length > 0 && (
        <div className="flex items-center gap-2 mt-6">
          {config.actions.map(a => (
            <Button
              key={a.action}
              variant={a.primary ? "default" : "outline"}
              size="sm"
              onClick={() => onAction?.(a.action)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
