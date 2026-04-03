// SITA OS — Advisor Track Composer
import type { AdvisorTrack } from "./packets/business-packet.service";
import { ADVISOR_CONFIGS } from "@/packages/advisor-config";

export interface ComposedAdvisorView { tracks: AdvisorTrack[]; hasDisagreement: boolean; disagreementTopics: string[]; consensusScore: number }

export function composeAdvisorTracks(tracks: AdvisorTrack[]): ComposedAdvisorView {
  const disagreements = tracks.filter((t) => t.dissent);
  const avgConfidence = tracks.length > 0 ? tracks.reduce((a, t) => a + t.confidence, 0) / tracks.length : 0;
  return {
    tracks: tracks.sort((a, b) => b.confidence - a.confidence),
    hasDisagreement: disagreements.length > 0,
    disagreementTopics: disagreements.map((d) => d.dissent!),
    consensusScore: disagreements.length === 0 ? avgConfidence : avgConfidence * (1 - disagreements.length * 0.15),
  };
}

export function getAdvisorName(advisorId: string): string {
  return ADVISOR_CONFIGS.find((a) => a.id === advisorId)?.name || advisorId;
}
