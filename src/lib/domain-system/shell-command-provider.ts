// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Command Provider
// Aggregates domain commands for command palette + search
// ═══════════════════════════════════════════════════════════════

import type { CommandPaletteEntry, SearchProvider } from "./domain-manifest";
import { getShellCommands, getSearchProviders } from "./domain-registry";

export interface ShellCommandResult {
  id: string;
  label: string;
  keywords: string[];
  action: string;
  icon: string;
  shortcut?: string;
  domain?: string;
  score: number;
}

/**
 * Search all domain commands by query string.
 * Returns ranked results with fuzzy keyword matching.
 */
export function searchShellCommands(query: string): ShellCommandResult[] {
  if (!query || query.trim().length === 0) return [];
  
  const q = query.toLowerCase().trim();
  const allCommands = getShellCommands();

  return allCommands
    .map((cmd) => ({
      ...cmd,
      score: scoreCommand(cmd, q),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((cmd) => ({
      id: cmd.id,
      label: cmd.label,
      keywords: cmd.keywords,
      action: cmd.action,
      icon: cmd.icon,
      shortcut: cmd.shortcut,
      score: cmd.score,
    }));
}

function scoreCommand(cmd: CommandPaletteEntry, query: string): number {
  let score = 0;
  const label = cmd.label.toLowerCase();

  // Exact label match
  if (label === query) return 100;

  // Label starts with query
  if (label.startsWith(query)) score += 80;
  // Label contains query
  else if (label.includes(query)) score += 50;

  // Keyword matches
  for (const kw of cmd.keywords) {
    if (kw.toLowerCase() === query) score += 70;
    else if (kw.toLowerCase().startsWith(query)) score += 40;
    else if (kw.toLowerCase().includes(query)) score += 20;
  }

  return score;
}

/**
 * Get all search providers from all domains, optionally filtered.
 */
export function getAllSearchProviders(): SearchProvider[] {
  return getSearchProviders();
}

/**
 * Find search providers that can handle a given entity type.
 */
export function getSearchProviderForEntity(entityType: string): SearchProvider | undefined {
  return getSearchProviders().find((sp) => sp.entityType === entityType);
}
