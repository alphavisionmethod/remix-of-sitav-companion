// ═══════════════════════════════════════════════════════════════
// SITA OS — useFileSystemBridge Hook
// Exposes Electron file system operations to React
// ═══════════════════════════════════════════════════════════════

import { useCallback } from 'react';

interface FSResult {
  success: boolean;
  reason?: string;
  path?: string;
  size?: number;
}

interface FSReadResult extends FSResult {
  content?: string;
  data?: unknown;
  name?: string;
}

interface BackupEntry {
  name: string;
  size: number;
  created: string;
}

function isElectron(): boolean {
  return typeof window !== 'undefined' && !!(window as any).electron;
}

export function useFileSystemBridge() {
  const electron = isElectron();
  const bridge = electron ? (window as any).electron : null;

  const exportBackup = useCallback(
    async (data: unknown): Promise<FSResult> => {
      if (!bridge?.exportBackup) return { success: false, reason: 'Not in Electron' };
      return bridge.exportBackup(data);
    },
    [bridge]
  );

  const importBackup = useCallback(async (): Promise<FSReadResult> => {
    if (!bridge?.importBackup) return { success: false, reason: 'Not in Electron' };
    return bridge.importBackup();
  }, [bridge]);

  const saveFile = useCallback(
    async (content: string, defaultName: string, filters?: Array<{ name: string; extensions: string[] }>): Promise<FSResult> => {
      if (!bridge?.saveFile) return { success: false, reason: 'Not in Electron' };
      return bridge.saveFile({ content, defaultName, filters });
    },
    [bridge]
  );

  const readFile = useCallback(
    async (filters?: Array<{ name: string; extensions: string[] }>): Promise<FSReadResult> => {
      if (!bridge?.readFile) return { success: false, reason: 'Not in Electron' };
      return bridge.readFile({ filters });
    },
    [bridge]
  );

  const autoBackup = useCallback(
    async (data: unknown): Promise<FSResult> => {
      if (!bridge?.autoBackup) return { success: false, reason: 'Not in Electron' };
      return bridge.autoBackup(data);
    },
    [bridge]
  );

  const listBackups = useCallback(async (): Promise<{ success: boolean; backups: BackupEntry[] }> => {
    if (!bridge?.listBackups) return { success: false, backups: [] };
    return bridge.listBackups();
  }, [bridge]);

  return {
    isElectron: electron,
    exportBackup,
    importBackup,
    saveFile,
    readFile,
    autoBackup,
    listBackups,
  };
}
