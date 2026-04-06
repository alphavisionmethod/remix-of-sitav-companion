// ═══════════════════════════════════════════════════════════════
// SITA OS — Push Notifications Hook
// Manages push permission, registration, and device tokens
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  registerPushToken,
  unregisterAllTokens,
  getRegisteredTokens,
  isPushSupported,
  getPermissionState,
  type PushTokenRecord,
} from "@/lib/services/push-notification/push-registration-service";

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  isRegistered: boolean;
  permissionState: NotificationPermission | "unsupported";
  devices: PushTokenRecord[];
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  unregister: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">(getPermissionState());
  const [devices, setDevices] = useState<PushTokenRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isSupported = isPushSupported();

  // Load existing tokens
  useEffect(() => {
    if (!user?.id || !isSupported) return;

    let cancelled = false;
    const load = async () => {
      const tokens = await getRegisteredTokens();
      if (!cancelled) {
        setDevices(tokens);
        setIsRegistered(tokens.length > 0);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id, isSupported]);

  // Auto-register if permission already granted
  useEffect(() => {
    if (!user?.id || !isSupported || permissionState !== "granted" || isRegistered) return;

    registerPushToken().then((token) => {
      if (token) {
        setIsRegistered(true);
        setDevices((prev) => [token, ...prev.filter((d) => d.id !== token.id)]);
      }
    });
  }, [user?.id, isSupported, permissionState, isRegistered]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setIsLoading(true);
    try {
      const token = await registerPushToken();
      if (token) {
        setIsRegistered(true);
        setDevices((prev) => [token, ...prev.filter((d) => d.id !== token.id)]);
        setPermissionState("granted");
        return true;
      }
      setPermissionState(getPermissionState());
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unregister = useCallback(async () => {
    setIsLoading(true);
    try {
      await unregisterAllTokens();
      setIsRegistered(false);
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const tokens = await getRegisteredTokens();
      setDevices(tokens);
      setIsRegistered(tokens.length > 0);
      setPermissionState(getPermissionState());
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported,
    isRegistered,
    permissionState,
    devices,
    isLoading,
    requestPermission,
    unregister,
    refresh,
  };
}
