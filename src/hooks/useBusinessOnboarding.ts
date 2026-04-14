import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultOnboardingState, type OnboardingState } from "@/pages/revenue-office/onboarding/types";

interface UseBusinessOnboardingReturn {
  isLoading: boolean;
  isCompleted: boolean;
  savedState: OnboardingState;
  saveProgress: (state: OnboardingState) => Promise<void>;
  markComplete: (state: OnboardingState) => Promise<void>;
  clearCompletion: () => Promise<void>;
  updateState: (partial: Partial<OnboardingState>) => Promise<void>;
}

export function useBusinessOnboarding(): UseBusinessOnboardingReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedState, setSavedState] = useState<OnboardingState>(defaultOnboardingState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setIsLoading(false); return; }

      const { data } = await (supabase as any)
        .from("business_onboarding")
        .select("onboarding_state, completed_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        if (data) {
          setSavedState({ ...defaultOnboardingState, ...(data.onboarding_state as any) });
          setIsCompleted(!!data.completed_at);
        }
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveProgress = useCallback(async (state: OnboardingState) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await (supabase as any)
      .from("business_onboarding")
      .upsert({ user_id: user.id, onboarding_state: state }, { onConflict: "user_id" });
    setSavedState(state);
  }, []);

  const markComplete = useCallback(async (state: OnboardingState) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await (supabase as any)
      .from("business_onboarding")
      .upsert(
        { user_id: user.id, onboarding_state: state, completed_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    setSavedState(state);
    setIsCompleted(true);
    // Also save to localStorage for offline/demo access
    try { localStorage.setItem("sita_onboarding_state", JSON.stringify(state)); } catch {}
  }, []);

  const clearCompletion = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await (supabase as any)
      .from("business_onboarding")
      .update({ completed_at: null })
      .eq("user_id", user.id);
    setIsCompleted(false);
  }, []);

  const updateState = useCallback(async (partial: Partial<OnboardingState>) => {
    const merged = { ...savedState, ...partial };
    setSavedState(merged);
    // Debounced save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveProgress(merged), 500);
  }, [savedState, saveProgress]);

  return { isLoading, isCompleted, savedState, saveProgress, markComplete, clearCompletion, updateState };
}
