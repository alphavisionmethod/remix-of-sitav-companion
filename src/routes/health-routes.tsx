import { lazy } from "react";
import { Route } from "react-router-dom";

const HealthHome = lazy(() => import("@/pages/health/HealthHome"));
const HealthNutrition = lazy(() => import("@/pages/health/HealthNutrition"));
const HealthWearables = lazy(() => import("@/pages/health/HealthWearables"));
const HealthMedical = lazy(() => import("@/pages/health/HealthMedical"));
const HealthFitness = lazy(() => import("@/pages/health/HealthFitness"));
const HealthRecovery = lazy(() => import("@/pages/health/HealthRecovery"));
const HealthRemindersPage = lazy(() => import("@/pages/health/HealthRemindersPage"));

/**
 * Health OS route group — Phase 3: real backend-wired surfaces.
 * All sub-apps read/write through owner-only RLS tables and emit Trust receipts.
 */
export const getHealthRoutes = () => (
  <>
    <Route path="/health" element={<HealthHome />} />
    <Route path="/health/nutrition" element={<HealthNutrition />} />
    <Route path="/health/wearables" element={<HealthWearables />} />
    <Route path="/health/medical" element={<HealthMedical />} />
    <Route path="/health/fitness" element={<HealthFitness />} />
    <Route path="/health/recovery" element={<HealthRecovery />} />
    <Route path="/health/reminders" element={<HealthRemindersPage />} />
  </>
);