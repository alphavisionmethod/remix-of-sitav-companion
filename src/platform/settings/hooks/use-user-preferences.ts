import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPreferences {
  role: string;
  trustLevel: "standard" | "careful" | "strict";
  explanationDensity: "minimal" | "balanced" | "detailed";
  communicationStyle: "direct" | "supportive" | "analytical";
  businessGoals: string[];
  conciergeGoals: string[];
  householdSize: string;
  industry: string;
  businessName: string;
  firstWin: string;
  onboardingCompleted: boolean;
}

const DEFAULTS: UserPreferences = {
  role: "founder",
  trustLevel: "careful",
  explanationDensity: "balanced",
  communicationStyle: "supportive",
  businessGoals: [],
  conciergeGoals: [],
  householdSize: "",
  industry: "",
  businessName: "",
  firstWin: "",
  onboardingCompleted: false,
};

function parseJsonValue<T>(raw: any, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function useUserPreferences() {
  const { user, isDemo } = useAuth();

  const { data: preferences, isLoading, refetch } = useQuery({
    queryKey: ["user-preferences", user?.id],
    enabled: !!user && !isDemo,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<UserPreferences> => {
      if (!user) return DEFAULTS;

      // Fetch profile for onboarding_completed
      const { data: profile } = await fromTable("profiles")
        .select("onboarding_completed, role")
        .eq("user_id", user.id)
        .single();

      // Fetch all user_memory preference records
      const { data: memories } = await fromTable("user_memory")
        .select("key, value")
        .eq("user_id", user.id)
        .in("category", ["preference", "profile"]);

      const memMap = new Map<string, any>();
      (memories || []).forEach((m: any) => memMap.set(m.key, m.value));

      return {
        role: parseJsonValue(memMap.get("role"), profile?.role || DEFAULTS.role),
        trustLevel: parseJsonValue(memMap.get("trust_level"), DEFAULTS.trustLevel),
        explanationDensity: parseJsonValue(memMap.get("explanation_density"), DEFAULTS.explanationDensity),
        communicationStyle: parseJsonValue(memMap.get("communication_style"), DEFAULTS.communicationStyle),
        businessGoals: parseJsonValue(memMap.get("business_goals"), DEFAULTS.businessGoals),
        conciergeGoals: parseJsonValue(memMap.get("concierge_goals"), DEFAULTS.conciergeGoals),
        householdSize: parseJsonValue(memMap.get("household_size"), DEFAULTS.householdSize),
        industry: parseJsonValue(memMap.get("industry"), DEFAULTS.industry),
        businessName: parseJsonValue(memMap.get("business_name"), DEFAULTS.businessName),
        firstWin: parseJsonValue(memMap.get("first_win"), DEFAULTS.firstWin),
        onboardingCompleted: profile?.onboarding_completed ?? false,
      };
    },
  });

  // Demo users get full defaults with onboarding completed
  if (isDemo) {
    return {
      preferences: { ...DEFAULTS, onboardingCompleted: true, role: "founder" },
      isLoading: false,
      refetch,
    };
  }

  return {
    preferences: preferences ?? DEFAULTS,
    isLoading,
    refetch,
  };
}

/** Check if the user's role includes business features */
export function showBusinessNav(role: string): boolean {
  return ["founder", "executive", "family-office"].includes(role);
}

/** Check if the user's role includes concierge features */
export function showConciergeNav(role: string): boolean {
  return ["family-office", "personal"].includes(role);
}

/** Check if the user's role includes money/finance features */
export function showMoneyNav(role: string): boolean {
  return true; // All roles see money
}
