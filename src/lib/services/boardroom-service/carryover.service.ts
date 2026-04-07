// SITA OS — Carryover Service
import type { CarryoverItem } from "@/packages/contracts";

const items: CarryoverItem[] = [];

export function createCarryover(topic: string, fromSessionId: string): CarryoverItem {
  const item: CarryoverItem = { id: crypto.randomUUID(), topic, fromSessionId, ageCount: 0, status: "open" };
  items.push(item);
  return item;
}

export function ageAllCarryovers(): { aged: number; escalated: number } {
  let aged = 0, escalated = 0;
  items.forEach((i) => { if (i.status === "open") { i.ageCount++; aged++; if (i.ageCount >= 3) { i.status = "escalated"; escalated++; } } });
  return { aged, escalated };
}

export function resolveCarryoverItem(id: string): boolean {
  const item = items.find((i) => i.id === id);
  if (!item) return false;
  item.status = "resolved";
  return true;
}

export function getOpenCarryovers(): CarryoverItem[] { return items.filter((i) => i.status === "open" || i.status === "escalated"); }
export function getAllCarryovers(): CarryoverItem[] { return [...items]; }

