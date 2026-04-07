// SITA OS — Decision Memory Service (boardroom-level)
import type { DecisionRecord } from "@/packages/contracts";

const store: DecisionRecord[] = [];

export function storeDecision(params: { sessionId: string; topic: string; decision: string; advisorInputs: string[] }): DecisionRecord {
  const record: DecisionRecord = { id: crypto.randomUUID(), ...params, timestamp: new Date().toISOString() };
  store.push(record);
  return record;
}

export function getDecisionById(id: string): DecisionRecord | undefined { return store.find((d) => d.id === id); }
export function listSessionDecisions(sessionId: string): DecisionRecord[] { return store.filter((d) => d.sessionId === sessionId); }
export function searchDecisions(query: string): DecisionRecord[] { return store.filter((d) => d.topic.toLowerCase().includes(query.toLowerCase()) || d.decision.toLowerCase().includes(query.toLowerCase())); }
export function getRecentDecisions(limit: number = 10): DecisionRecord[] { return [...store].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit); }

