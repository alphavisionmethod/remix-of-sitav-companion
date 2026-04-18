// ═══════════════════════════════════════════════════════════════
// SITA OS — Push Notifications Hook
// Mobile-runtime aware. Resolves transport (APNs / FCM / web) via
// the mobile capability matrix and surfaces honest unavailable
// reasons so UI never claims a transport it cannot use.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  registerPushToken,
  unregisterAllTokens,
  getRegisteredTokens,
  isPushSupported,
  getPermissionState,
  type PushTokenRecord,
} from "@/lib/services/push-notification/push-registration-service";
// Mobile-platform archived. Ubuntu-native is canonical native platform.
// Web push only on web; Electron/desktop uses realtime channels.
const useMobileRuntime = () => ({ os: "web" as const, isFirstClassMobile: false });
const useMobileCapability = (_key: string): "supported" | "unsupported" => "unsupported";

export type PushTransport = "apns" | "fcm" | "web" | "none";

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  isRegistered: boolean;
  permissionState: NotificationPermission | "unsupported";
  devices: PushTokenRecord[];
  isLoading: boolean;
  /** Selected transport for the current runtime, after capability + kill-switch resolution. */
  transport: PushTransport;
  /** Honest reason when no transport is usable. */
  unavailableReason: string;
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

  const { os, isFirstClassMobile } = useMobileRuntime();
  const apnsStatus = useMobileCapability("push.apns");
  const fcmStatus = useMobileCapability("push.fcm");
  const webStatus = useMobileCapability("push.web");

  const { transport, unavailableReason, isSupported } = useMemo(() => {
    const webOk = isPushSupported() && webStatus !== "unsupported" && webStatus !== "roadmap";
    if (isFirstClassMobile && os === "ios") {
      if (apnsStatus === "supported") return { transport: "apns" as const, unavailableReason: "", isSupported: true };
      if (webOk) return { transport: "web" as const, unavailableReason: "APNs deferred — using web push fallback.", isSupported: true };
      return { transport: "none" as const, unavailableReason: "Push is not yet enabled on iOS for this build.", isSupported: false };
    }
    if (isFirstClassMobile && os === "android") {
      if (fcmStatus === "supported") return { transport: "fcm" as const, unavailableReason: "", isSupported: true };
      if (webOk) return { transport: "web" as const, unavailableReason: "FCM not yet provisioned — using web push fallback.", isSupported: true };
      return { transport: "none" as const, unavailableReason: "Push is not yet enabled on Android for this build.", isSupported: false };
    }
    if (webOk) return { transport: "web" as const, unavailableReason: "", isSupported: true };
    return { transport: "none" as const, unavailableReason: "Push is unsupported in this runtime.", isSupported: false };
  }, [isFirstClassMobile, os, apnsStatus, fcmStatus, webStatus]);

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
    transport,
    unavailableReason,
    requestPermission,
    unregister,
    refresh,
  };
}
