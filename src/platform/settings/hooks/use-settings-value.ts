// ═══════════════════════════════════════════════════════════════
// SITA OS — useSettingsValue Hook
// Reactive hook that reads/writes through SettingsService
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { SettingsService, type SettingsSchema } from "@/platform/nova-sdk/services/settings-service";

type SettingsKey = keyof SettingsSchema | `apps.${string}`;

export function useSettingsValue<K extends SettingsKey>(
  key: K,
  fallback?: SettingsSchema[K]
): [SettingsSchema[K], (value: SettingsSchema[K]) => void] {
  const [value, setValue] = useState<SettingsSchema[K]>(
    () => SettingsService.get(key) ?? fallback as SettingsSchema[K]
  );

  useEffect(() => {
    const unsub = SettingsService.subscribe(key, (_k, newValue) => {
      setValue(newValue as SettingsSchema[K]);
    });
    // Sync on mount in case service booted after initial render
    const current = SettingsService.get(key);
    if (current !== undefined) setValue(current);
    return unsub;
  }, [key]);

  const update = useCallback((newValue: SettingsSchema[K]) => {
    SettingsService.set(key, newValue);
  }, [key]);

  return [value, update];
}
