// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: Workspace Runtime
// Session restoration, layout persistence, command palette context
// ═══════════════════════════════════════════════════════════════

export interface WorkspacePane {
  paneId: string;
  type: string;
  position: { x: number; y: number; width: number; height: number };
  state: Record<string, unknown>;
  isActive: boolean;
}

export interface WorkspaceRuntime {
  workspaceId: string;
  userId: string;
  layout: WorkspacePane[];
  activePane: string;
  commandPaletteHistory: string[];
  recentEntities: Array<{ type: string; id: string; label: string; accessedAt: string }>;
  preferences: Record<string, unknown>;
  savedAt: string;
  restoredFrom?: string;
}
