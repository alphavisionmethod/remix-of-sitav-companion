// ═══════════════════════════════════════════════════════════════
// SITA OS — Connection Recommendation Engine
// Recommends service connections based on user context
// ═══════════════════════════════════════════════════════════════

import type { UseModeProfile, WorldModel, TrustProfile } from "@/packages/contracts/specialized/setup-data-models";

export interface ConnectionRecommendation {
  serviceType: string;
  displayName: string;
  domain: string;
  priority: number;
  reason: string;
  immediateValue: string;
  trustNote?: string;
}

export class ConnectionRecommendationEngine {
  recommendConnections(
    useMode: UseModeProfile,
    worldModel: WorldModel,
    trustProfile: TrustProfile,
    onlineStatus: "online" | "offline" | "limited",
  ): ConnectionRecommendation[] {
    if (onlineStatus === "offline") return [];

    const recommendations: ConnectionRecommendation[] = [];
    const mode = useMode.selectedMode;

    // Calendar — always recommended
    recommendations.push({
      serviceType: "calendar",
      displayName: "Calendar",
      domain: "platform",
      priority: 10,
      reason: "Helps SITA understand your schedule and protect your time",
      immediateValue: "Today's schedule summary and conflict detection",
    });

    // Email — always recommended
    recommendations.push({
      serviceType: "email",
      displayName: "Email",
      domain: "platform",
      priority: 9,
      reason: "Enables follow-up detection and communication summaries",
      immediateValue: "Unread priority summary and follow-up queue",
    });

    if (mode === "business" || mode === "full") {
      recommendations.push({
        serviceType: "crm",
        displayName: "CRM / Leads",
        domain: "business",
        priority: 8,
        reason: "Powers your revenue pipeline and opportunity tracking",
        immediateValue: "Pipeline snapshot and at-risk opportunities",
      });
    }

    if (mode === "money" || mode === "full" || mode === "personal") {
      recommendations.push({
        serviceType: "bank",
        displayName: "Bank / Finance",
        domain: "finance",
        priority: 7,
        reason: "Enables bill tracking, spending analysis, and cash flow",
        immediateValue: "Upcoming bills and safe-to-spend calculation",
        trustNote: "Read-only access. SITA never initiates transactions.",
      });
    }

    if (mode === "family" || mode === "full") {
      recommendations.push({
        serviceType: "household-tools",
        displayName: "Household Tools",
        domain: "concierge",
        priority: 6,
        reason: "Coordinates family logistics and shared responsibilities",
        immediateValue: "Shared calendar and task coordination",
      });
    }

    // Files — always useful
    recommendations.push({
      serviceType: "cloud-storage",
      displayName: "Cloud Storage",
      domain: "platform",
      priority: 5,
      reason: "Enables document search, file organization, and sharing",
      immediateValue: "Recent files and smart folder suggestions",
    });

    // Contacts
    recommendations.push({
      serviceType: "contacts",
      displayName: "Contacts",
      domain: "platform",
      priority: 4,
      reason: "Enriches communication and relationship context",
      immediateValue: "Contact directory and relationship insights",
    });

    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  getImmediateValuePreview(connectionType: string, _context: Record<string, unknown>): string {
    const previews: Record<string, string> = {
      calendar: "Today you have 4 meetings. One starts in 25 minutes.",
      email: "3 messages need follow-up. 1 is from a key contact.",
      crm: "Pipeline: $42K active. 2 opportunities need attention.",
      bank: "Your next bill is due in 3 days. Safe-to-spend: $1,240.",
      "cloud-storage": "Recent: 12 files modified this week.",
      contacts: "247 contacts imported. 5 duplicates detected.",
      "household-tools": "Family calendar synced. 3 events this week.",
    };
    return previews[connectionType] || "Connection ready for use.";
  }
}

export const connectionRecommendationEngine = new ConnectionRecommendationEngine();
