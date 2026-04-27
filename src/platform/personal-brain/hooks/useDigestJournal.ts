// ═══════════════════════════════════════════════════════════════
// SITA OS — useDigestJournal Hook
// Daily digests, weekly journals, monthly reviews.
// Wires to Supabase for persistence when user is authenticated.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  digestJournalService,
  type DailyDigest,
  type WeeklyJournal,
  type MonthlyReview,
} from "@/lib/services/digest-journal";

export function useDigestJournal() {
  const [dailyDigest, setDailyDigest] = useState<DailyDigest | null>(null);
  const [weeklyJournal, setWeeklyJournal] = useState<WeeklyJournal | null>(null);
  const [monthlyReview, setMonthlyReview] = useState<MonthlyReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDailyDigest = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const targetDate = date ?? new Date().toISOString().split("T")[0];
      const digest = await digestJournalService.generateDailyDigest(user.id, targetDate);
      setDailyDigest(digest);
      return digest;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to generate digest";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateWeeklyJournal = useCallback(async (weekStart?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const start = weekStart ?? getMonday(new Date()).toISOString().split("T")[0];
      const journal = await digestJournalService.generateWeeklyJournal(user.id, start);
      setWeeklyJournal(journal);
      return journal;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to generate journal";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMonthlyReview = useCallback(async (month?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const targetMonth = month ?? new Date().toISOString().slice(0, 7);
      const review = await digestJournalService.generateMonthlyReview(user.id, targetMonth);
      setMonthlyReview(review);
      return review;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to generate review";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dailyDigest,
    weeklyJournal,
    monthlyReview,
    loading,
    error,
    generateDailyDigest,
    generateWeeklyJournal,
    generateMonthlyReview,
  };
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}
