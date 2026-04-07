// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Memory Service
// Past boardroom decisions and carryover items
// ═══════════════════════════════════════════════════════════════

import type { DecisionRecord, CarryoverItem } from "@/packages/contracts";

const decisions: DecisionRecord[] = [];
const carryovers: CarryoverItem[] = [];

export function recordDecision(params: {
  sessionId: string;
  topic: string;
  decision: string;
  advisorInputs: string[];
}): DecisionRecord {
  const record: DecisionRecord = {
    id: crypto.randomUUID(),
    sessionId: params.sessionId,
    topic: params.topic,
    decision: params.decision,
    advisorInputs: params.advisorInputs,
    timestamp: new Date().toISOString(),
  };
  decisions.push(record);
  return record;
}

export function getDecision(id: string): DecisionRecord | undefined {
  return decisions.find((d) => d.id === id);
}

export function listDecisions(sessionId?: string): DecisionRecord[] {
  return sessionId ? decisions.filter((d) => d.sessionId === sessionId) : [...decisions];
}

export function addCarryover(params: {
  topic: string;
  fromSessionId: string;
}): CarryoverItem {
  const item: CarryoverItem = {
    id: crypto.randomUUID(),
    topic: params.topic,
    fromSessionId: params.fromSessionId,
    ageCount: 0,
    status: "open",
  };
  carryovers.push(item);
  return item;
}

export function ageCarryovers(): number {
  let escalated = 0;
  carryovers.forEach((c) => {
    if (c.status === "open") {
      c.ageCount++;
      if (c.ageCount >= 3) { c.status = "escalated"; escalated++; }
    }
  });
  return escalated;
}

export function resolveCarryover(id: string): boolean {
  const item = carryovers.find((c) => c.id === id);
  if (!item) return false;
  item.status = "resolved";
  return true;
}

export function listCarryovers(status?: CarryoverItem["status"]): CarryoverItem[] {
  return status ? carryovers.filter((c) => c.status === status) : [...carryovers];
}

