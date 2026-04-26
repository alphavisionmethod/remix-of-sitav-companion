// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Settings demo fixtures
// Demo-mode-only. Members / automation rules / connector health
// are presentation samples until household_settings is wired.
// ═══════════════════════════════════════════════════════════════
import type { LucideIcon } from "lucide-react";
import { Bell, Calendar, ShoppingCart, Plane, Wrench, Gift, Settings, Link, AlertCircle } from "lucide-react";

export interface DemoHouseholdMember {
  name: string;
  role: string;
  avatar: string;
  permissions: ReadonlyArray<string>;
}

export interface DemoHouseholdRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  icon: LucideIcon;
}

export interface DemoConnector {
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  icon: LucideIcon;
}

export const SETTINGS_MEMBERS_DEMO: ReadonlyArray<DemoHouseholdMember> = [
  { name: "You",     role: "Household Admin", avatar: "👤", permissions: ["Full access", "Approval authority", "Settings management"] },
  { name: "Partner", role: "Co-Admin",        avatar: "👤", permissions: ["Full access", "Approval authority"] },
  { name: "Emma",    role: "Dependent",       avatar: "👧", permissions: ["View calendar", "Task completion"] },
  { name: "Liam",    role: "Dependent",       avatar: "👦", permissions: ["View calendar", "Task completion"] },
];

export const SETTINGS_RULES_DEMO: ReadonlyArray<DemoHouseholdRule> = [
  { id: "1", name: "Grocery auto-reminder",           description: "Remind to restock when weekly cycle starts",            enabled: true,  category: "Shopping",    icon: ShoppingCart },
  { id: "2", name: "School deadline alerts",          description: "Notify 3 days before any school form or fee deadline",  enabled: true,  category: "School",      icon: Calendar     },
  { id: "3", name: "Appointment prep reminders",      description: "Trigger prep checklist 48 hours before appointments",   enabled: true,  category: "Appointments", icon: Bell        },
  { id: "4", name: "Travel booking approval",         description: "Require approval for travel bookings over $500",        enabled: true,  category: "Travel",      icon: Plane        },
  { id: "5", name: "Service provider follow-up",      description: "Auto-remind to follow up 7 days after service visit",   enabled: false, category: "Home Admin",  icon: Wrench       },
  { id: "6", name: "Gift budget alerts",              description: "Notify when gift spending exceeds $150/month",          enabled: true,  category: "Events",      icon: Gift         },
  { id: "7", name: "Task escalation",                 description: "Escalate unresolved tasks after 3 days overdue",        enabled: false, category: "Tasks",       icon: AlertCircle  },
  { id: "8", name: "Weekly boardroom auto-generate",  description: "Generate family boardroom summary every Sunday at 8 AM", enabled: true,  category: "Boardroom",   icon: Settings     },
];

export const SETTINGS_CONNECTORS_DEMO: ReadonlyArray<DemoConnector> = [
  { name: "Google Calendar", type: "Calendar", status: "connected",    lastSync: "2 min ago",  icon: Calendar     },
  { name: "Apple Reminders", type: "Tasks",    status: "connected",    lastSync: "5 min ago",  icon: Bell         },
  { name: "Instacart",       type: "Grocery",  status: "disconnected",                          icon: ShoppingCart },
  { name: "TripIt",          type: "Travel",   status: "disconnected",                          icon: Plane        },
  { name: "Google Drive",    type: "Files",    status: "connected",    lastSync: "1 hour ago", icon: Link         },
];
