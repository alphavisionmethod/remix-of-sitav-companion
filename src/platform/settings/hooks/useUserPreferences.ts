import { useState, useCallback, useMemo } from "react";

export type DensityMode = "calm" | "standard" | "analyst";
export type SupportStyle = "quiet" | "balanced" | "active";
export type UrgencyStyle = "gentle" | "standard" | "direct";
export type DomainPriority = "business-first" | "money-first" | "concierge-first";
export type RoleType = "founder" | "manager" | "staff" | "personal";

export interface UserPreferences {
  densityMode: DensityMode;
  supportStyle: SupportStyle;
  urgencyStyle: UrgencyStyle;
  domainPriority: DomainPriority;
  roleType: RoleType;
}

const STORAGE_KEY = "sita-user-preferences";

const DEFAULTS: UserPreferences = {
  densityMode: "standard",
  supportStyle: "balanced",
  urgencyStyle: "standard",
  domainPriority: "business-first",
  roleType: "founder",
};

function load(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(load);

  const update = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const densityClasses = useMemo(() => {
    switch (prefs.densityMode) {
      case "calm": return "gap-4 text-sm";
      case "analyst": return "gap-1.5 text-xs";
      default: return "gap-3 text-sm";
    }
  }, [prefs.densityMode]);

  const urgencyLabel = useCallback((severity: "high" | "medium" | "low") => {
    if (prefs.urgencyStyle === "gentle") {
      return severity === "high" ? "Needs attention" : severity === "medium" ? "When you can" : "For later";
    }
    if (prefs.urgencyStyle === "direct") {
      return severity === "high" ? "⚠ Act now" : severity === "medium" ? "Do today" : "Low priority";
    }
    return severity === "high" ? "Urgent" : severity === "medium" ? "Medium" : "Low";
  }, [prefs.urgencyStyle]);

  return { prefs, update, densityClasses, urgencyLabel };
}
