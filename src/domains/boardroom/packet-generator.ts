// ============================================================
// SITA OS — Boardroom Packet Generator
// Assembles packets from domain assessments with enrichment
// Now async — fetches live data from Supabase via data-service
// ============================================================

import type { BoardroomType, BoardroomPacket, DomainAssessment, BoardroomContentSection, AlertData, ActionItemData, OpportunitySummary, DataSource } from "./types";
import { generateFinanceAssessment, generateBusinessAssessment, generateConciergeAssessment, generateIncidentAssessment } from "./assessments";
import { scoreConfidence, detectStaleData, generatePacketHash } from "./confidence";
import { evaluateCrossDomainIntelligence } from "@/lib/cross-domain";
import { fetchBoardroomData, type BoardroomDataBundle } from "./data-service";
import { createConfidenceEnvelope, classifyRisk } from "@/lib/no-hallucination/confidence";
import { evaluateStaleness } from "@/lib/no-hallucination/staleness";
import { buildGroundingReport } from "@/lib/no-hallucination/grounding";
import { detectContradictions, buildCrossDomainDataPoints } from "@/lib/no-hallucination/contradiction";

let packetCounter = 0;

function generatePacketId(): string {
  packetCounter++;
  return `PKT-${Date.now().toString(36).toUpperCase()}-${packetCounter.toString().padStart(4, "0")}`;
}

function getTimeHorizon(type: BoardroomType): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (type) {
    case "morning-briefing":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "weekly-review":
      start.setDate(now.getDate() - now.getDay());
      end.setDate(start.getDate() + 6);
      break;
    default:
      start.setDate(now.getDate() - 7);
      break;
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

function getDomainAssessments(type: BoardroomType, bundle: BoardroomDataBundle): DomainAssessment[] {
  switch (type) {
    case "morning-briefing":
    case "weekly-review":
    case "opportunity-board":
      return [generateFinanceAssessment(bundle), generateBusinessAssessment(bundle), generateConciergeAssessment(bundle)];
    case "financial-health":
      return [generateFinanceAssessment(bundle)];
    case "pipeline-review":
      return [generateBusinessAssessment(bundle)];
    case "household-ops":
      return [generateConciergeAssessment(bundle)];
    case "incident-review":
      return [generateIncidentAssessment(bundle)];
  }
}

function enrichWithCrossDomain(type: BoardroomType, bundle: BoardroomDataBundle): { sections: BoardroomContentSection[]; opportunities: OpportunitySummary[] } {
  if (type === "incident-review") return { sections: [], opportunities: [] };

  const insights = evaluateCrossDomainIntelligence({
    invoices: bundle.invoices, leads: bundle.leads, cashFlow: bundle.cashFlow,
    householdTasks: bundle.householdTasks, bills: bundle.bills, subscriptions: bundle.subscriptions,
  });

  const alertSection: BoardroomContentSection = {
    id: "xd-alerts", type: "alert", title: "Cross-Domain Intelligence",
    data: insights.slice(0, 4).map(i => ({
      severity: i.severity === "critical" ? "critical" as const : i.severity === "warning" ? "warning" as const : "info" as const,
      title: i.title, description: i.description, suggestedAction: i.suggestedAction,
      source: `${i.sourceDomain} → ${i.impactDomain}`,
    })),
  };

  const opportunities: OpportunitySummary[] = bundle.opportunityInsights.map((o, i) => ({
    id: `opp-${i}`, title: o.title, description: o.description,
    domain: o.domain, projectedValue: o.savings, confidence: o.impact === "high" ? 0.85 : 0.6,
  }));

  return { sections: [alertSection], opportunities };
}

export async function generateBoardroomPacket(type: BoardroomType): Promise<BoardroomPacket> {
  const startTime = performance.now();
  const packetId = generatePacketId();
  const generatedAt = new Date().toISOString();
  const timeHorizon = getTimeHorizon(type);

  // Fetch live data from Supabase (falls back to mocks if unauthenticated)
  const bundle = await fetchBoardroomData();

  // Fan out to domain assessments
  const assessments = getDomainAssessments(type, bundle);

  // Merge all domain results
  const allSections: BoardroomContentSection[] = [];
  const allAlerts: AlertData[] = [];
  const allActionItems: ActionItemData[] = [];
  const allOpportunities: OpportunitySummary[] = [];
  const allDataSources: DataSource[] = [];

  for (const assessment of assessments) {
    allSections.push(...assessment.sections);
    allAlerts.push(...assessment.alerts);
    allActionItems.push(...assessment.actionItems);
    allOpportunities.push(...assessment.opportunities);
    allDataSources.push(...assessment.dataSources);
  }

  // Cross-domain enrichment
  const crossDomain = enrichWithCrossDomain(type, bundle);
  allSections.push(...crossDomain.sections);
  for (const opp of crossDomain.opportunities) {
    if (!allOpportunities.find(o => o.title === opp.title)) {
      allOpportunities.push(opp);
    }
  }

  // Sort action items by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allActionItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Detect stale data
  const staleDataWarnings = detectStaleData(allDataSources, type);

  // Score confidence
  const confidence = scoreConfidence({
    domainConfidences: assessments.map(a => a.confidence),
    sourceCount: allDataSources.length,
    staleWarningCount: staleDataWarnings.length,
    completenessRatio: allSections.length > 0 ? Math.min(allSections.length / 6, 1) : 0,
  });

  const generationTimeMs = Math.round(performance.now() - startTime);
  const hash = generatePacketHash(packetId, generatedAt, allSections.length);

  // Build no-hallucination contracts
  const riskClass = classifyRisk(
    type === "financial-health" ? "finance" : type === "pipeline-review" ? "business" : "concierge",
    type === "financial-health" ? "projection" : "summary"
  );

  const stalenessState = evaluateStaleness(
    allDataSources.map(ds => ({ id: ds.id, name: ds.name, domain: ds.domain, lastUpdated: ds.lastUpdated }))
  );

  const crossDomainPoints = buildCrossDomainDataPoints({
    invoices: bundle.invoices, cashFlow: bundle.cashFlow, leads: bundle.leads,
  });
  const contradictionReport = detectContradictions(crossDomainPoints);

  const groundingReport = buildGroundingReport(
    allDataSources.map(ds => ({
      fieldName: ds.name, value: ds.recordCount, sourceId: ds.id,
      sourceName: ds.name, sourceDomain: ds.domain, sourceType: "canonical-record" as const,
      lastUpdated: ds.lastUpdated, isVerbatim: true,
    }))
  );

  const confidenceEnvelope = createConfidenceEnvelope({
    baseScore: confidence,
    riskClass,
    missingInputs: [],
    staleness: stalenessState,
    contradictions: contradictionReport,
    totalExpectedFields: 6,
    totalPresentFields: allSections.length,
  });

  return {
    packetId,
    type,
    generatedAt,
    timeHorizon,
    sections: allSections,
    alerts: allAlerts,
    opportunities: allOpportunities,
    actionItems: allActionItems,
    confidence,
    dataSources: allDataSources,
    staleDataWarnings,
    receipt: {
      receiptId: `RCP-${packetId}`,
      packetId,
      generatedAt,
      hash,
      generationTimeMs,
      sectionsGenerated: allSections.length,
      dataSourcesQueried: allDataSources.length,
    },
    confidenceEnvelope,
    groundingReport,
    contradictions: contradictionReport,
  };
}
