// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core: Boardroom Request Builder
// Formats agenda items and briefings for boardroom sessions
// ═══════════════════════════════════════════════════════════════

import type { ParsedIntent } from "./orchestrate-intent";
import type { CouncilDecision } from "./councils";

export interface BoardroomRequest {
  id: string;
  sessionType: "morning" | "weekly" | "incident" | "opportunity" | "on-demand";
  title: string;
  agendaItems: AgendaItem[];
  councilDecisions: CouncilDecision[];
  briefingData: Record<string, unknown>;
  requestedAt: string;
}

export interface AgendaItem {
  id: string;
  topic: string;
  domain: string;
  priority: "p0" | "p1" | "p2" | "p3";
  estimatedMinutes: number;
  presenter: string;
  supportingData: string[];
  actionRequired: boolean;
}

export function buildBoardroomRequest(
  intent: ParsedIntent,
  councilDecisions: CouncilDecision[]
): BoardroomRequest {
  const sessionType = determineSessionType(intent);
  const agendaItems = buildAgenda(intent, councilDecisions);

  return {
    id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionType,
    title: sessionType === "morning" ? "Morning Briefing" :
           sessionType === "weekly" ? "Weekly Review" :
           sessionType === "incident" ? "Incident Review" :
           `${intent.domain} Boardroom`,
    agendaItems,
    councilDecisions,
    briefingData: {
      intent: intent.rawInput,
      domain: intent.domain,
      type: intent.type,
    },
    requestedAt: new Date().toISOString(),
  };
}

function determineSessionType(intent: ParsedIntent): BoardroomRequest["sessionType"] {
  if (intent.urgency === "critical") return "incident";
  if (intent.rawInput.toLowerCase().includes("morning")) return "morning";
  if (intent.rawInput.toLowerCase().includes("weekly")) return "weekly";
  if (intent.rawInput.toLowerCase().includes("opportunity")) return "opportunity";
  return "on-demand";
}

function buildAgenda(intent: ParsedIntent, decisions: CouncilDecision[]): AgendaItem[] {
  const items: AgendaItem[] = [];

  // Add council decision summaries
  decisions.forEach((d, i) => {
    items.push({
      id: `agenda-${i}`,
      topic: `${d.councilType} council recommendation`,
      domain: d.councilType,
      priority: d.confidence < 60 ? "p1" : "p2",
      estimatedMinutes: 5,
      presenter: `${d.councilType}-council`,
      supportingData: d.votes.flatMap(v => v.supportingData),
      actionRequired: !d.consensus,
    });
  });

  // Add the original intent as discussion topic
  items.push({
    id: `agenda-main`,
    topic: intent.rawInput,
    domain: intent.domain,
    priority: intent.urgency === "critical" ? "p0" : "p1",
    estimatedMinutes: 10,
    presenter: "brain-core",
    supportingData: [],
    actionRequired: true,
  });

  return items.sort((a, b) => a.priority.localeCompare(b.priority));
}

