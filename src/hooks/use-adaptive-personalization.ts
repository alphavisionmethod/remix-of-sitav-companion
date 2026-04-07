// ═══════════════════════════════════════════════════════════════
// SITA OS — Adaptive Personalization Hook
// Connects the behavioral learning engine to the React UI
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import {
  createPersonalizationEngine,
  createBehavioralLearningEngine,
  createAutoRulesEngine,
  type UserPreferences,
  type BehavioralEvent,
  type InferredPattern,
  type AutoRule,
  type RuleEvaluation,
} from "@/lib/services/personalization-engine";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = "sita-personalization-cache";

// Singleton instances shared across hook consumers
const engine = createPersonalizationEngine();
const learner = createBehavioralLearningEngine();
const rules = createAutoRulesEngine();

export function useAdaptivePersonalization() {
  const { user, isDemo } = useAuth();
  const userId = user?.id ?? "demo";
  const [preferences, setPreferences] = useState<UserPreferences>(engine.getPreferences(userId));
  const [patterns, setPatterns] = useState<InferredPattern[]>([]);
  const [ruleEvaluations, setRuleEvaluations] = useState<RuleEvaluation[]>([]);
  const [autoPilot, setAutoPilotState] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setInterval>>();
  const dirty = useRef(false);

  // ─── Load from Supabase on mount ──────────────────────

  useEffect(() => {
    if (isDemo || !user) {
      setLoaded(true);
      return;
    }

    const load = async () => {
      try {
        const { data: memories } = await (supabase as any)
          .from("user_memory")
          .select("key, value")
          .eq("user_id", userId)
          .in("category", ["preference", "personalization", "behavioral"]);

        if (memories && memories.length > 0) {
          const prefData: Record<string, unknown> = {};
          for (const m of memories) {
            try {
              const parsed = typeof m.value === "string" ? JSON.parse(m.value) : m.value;
              prefData[m.key] = parsed;
            } catch {
              prefData[m.key] = m.value;
            }
          }
          engine.importExplicit(userId, prefData);

          // Check auto-pilot
          if (prefData["autoPilot"] === true) {
            rules.setAutoPilot(userId, true);
            setAutoPilotState(true);
          }
        }
      } catch (e) {
        console.warn("[Personalization] Failed to load from Supabase:", e);
        // Try local cache
        try {
          const cached = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
          if (cached) engine.importExplicit(userId, JSON.parse(cached));
        } catch { /* noop */ }
      }

      setPreferences(engine.getPreferences(userId));
      setPatterns(learner.getPatterns(userId));
      rules.initRules(userId);
      setLoaded(true);
    };

    load();
  }, [userId, isDemo, user]);

  // ─── Periodic sync ───────────────────────────────────────

  useEffect(() => {
    if (isDemo || !user) return;

    syncTimer.current = setInterval(() => {
      if (dirty.current) {
        syncToSupabase();
        dirty.current = false;
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      if (syncTimer.current) clearInterval(syncTimer.current);
      // Final flush on unmount
      if (dirty.current) syncToSupabase();
    };
  }, [userId, isDemo, user]);

  // ─── Sync to Supabase ────────────────────────────────────

  const syncToSupabase = useCallback(async () => {
    if (isDemo || !user) return;
    try {
      const explicit = engine.exportExplicit(userId);
      // Also save local cache
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(explicit));

      // Upsert each preference to user_memory
      const rows = Object.entries(explicit).map(([key, value]) => ({
        user_id: userId,
        key,
        value: JSON.stringify(value),
        category: "personalization",
      }));

      if (rows.length > 0) {
        await fromTable("user_memory").upsert(rows, {
          onConflict: "user_id,key",
          ignoreDuplicates: false,
        });
      }

      // Also save behavioral patterns
      const patternData = learner.getPatterns(userId);
      if (patternData.length > 0) {
        await fromTable("user_memory").upsert(
          [{
            user_id: userId,
            key: "_behavioral_patterns",
            value: JSON.stringify(patternData),
            category: "behavioral",
          }],
          { onConflict: "user_id,key", ignoreDuplicates: false }
        );
      }
    } catch (e) {
      console.warn("[Personalization] Sync failed:", e);
    }
  }, [userId, isDemo, user]);

  // ─── Track interaction ───────────────────────────────────

  const trackInteraction = useCallback((event: Omit<BehavioralEvent, "timestamp">) => {
    if (preferences.privacyMode) return;

    learner.trackEvent(userId, { ...event, timestamp: Date.now() });
    const updatedPatterns = learner.getPatterns(userId);
    setPatterns(updatedPatterns);

    // Apply inferred patterns to engine
    for (const p of updatedPatterns) {
      if (!p.dismissed && p.confidence >= 0.6) {
        engine.setInferred(userId, p.dimension, p.inferredValue);
      }
    }

    // Evaluate rules
    const evals = rules.evaluate(userId, updatedPatterns);
    setRuleEvaluations(evals);

    setPreferences(engine.getPreferences(userId));
    dirty.current = true;
  }, [userId, preferences.privacyMode]);

  // ─── Set explicit preference ─────────────────────────────

  const setPreference = useCallback((path: string, value: unknown) => {
    engine.setExplicit(userId, path, value);
    setPreferences(engine.getPreferences(userId));
    dirty.current = true;
  }, [userId]);

  // ─── Confirm/dismiss pattern ─────────────────────────────

  const confirmPattern = useCallback((patternId: string) => {
    learner.confirmPattern(userId, patternId);
    const p = patterns.find((x) => x.id === patternId);
    if (p) engine.setExplicit(userId, p.dimension, p.inferredValue);
    setPatterns([...learner.getPatterns(userId)]);
    setPreferences(engine.getPreferences(userId));
    dirty.current = true;
  }, [userId, patterns]);

  const dismissPattern = useCallback((patternId: string) => {
    learner.dismissPattern(userId, patternId);
    setPatterns([...learner.getPatterns(userId)]);
    dirty.current = true;
  }, [userId]);

  // ─── Auto-pilot ──────────────────────────────────────────

  const setAutoPilot = useCallback((enabled: boolean) => {
    rules.setAutoPilot(userId, enabled);
    engine.setExplicit(userId, "autoPilot", enabled);
    setAutoPilotState(enabled);
    setPreferences(engine.getPreferences(userId));
    dirty.current = true;
  }, [userId]);

  // ─── Rule management ────────────────────────────────────

  const autoRules = useMemo(() => rules.getRules(userId), [userId, loaded]);

  const setRuleLevel = useCallback((ruleId: string, level: "suggest" | "draft" | "auto") => {
    rules.setRuleLevel(userId, ruleId, level);
    dirty.current = true;
  }, [userId]);

  const setRuleEnabled = useCallback((ruleId: string, enabled: boolean) => {
    rules.setRuleEnabled(userId, ruleId, enabled);
    dirty.current = true;
  }, [userId]);

  // ─── Reset ──────────────────────────────────────────────

  const resetAll = useCallback(() => {
    engine.reset(userId);
    learner.clear(userId);
    rules.initRules(userId);
    setPreferences(engine.getPreferences(userId));
    setPatterns([]);
    setRuleEvaluations([]);
    setAutoPilotState(false);
    dirty.current = true;
  }, [userId]);

  // ─── Get layer info ─────────────────────────────────────

  const getLayer = useCallback((path: string) => engine.getLayer(userId, path), [userId]);

  return {
    preferences,
    patterns,
    ruleEvaluations,
    autoRules,
    autoPilot,
    loaded,
    trackInteraction,
    setPreference,
    confirmPattern,
    dismissPattern,
    setAutoPilot,
    setRuleLevel,
    setRuleEnabled,
    resetAll,
    getLayer,
    syncNow: syncToSupabase,
  };
}
