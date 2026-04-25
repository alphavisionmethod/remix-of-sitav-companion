import { lazy } from "react";
import { Route } from "react-router-dom";

const HealthHome = lazy(() => import("@/pages/health/HealthHome"));
const HealthStub = lazy(() => import("@/pages/health/HealthStub"));

/**
 * Health OS route group — greenfield pillar.
 * Stubs make the pillar discoverable in launchers/nav before real surfaces ship.
 */
export const getHealthRoutes = () => (
  <>
    <Route path="/health" element={<HealthHome />} />
    <Route path="/health/nutrition" element={<HealthStub title="Nutrition" blurb="Track meals, macros, and nutrition goals." />} />
    <Route path="/health/wearables" element={<HealthStub title="Wearables" blurb="Sync supported devices and view trends." />} />
    <Route path="/health/medical" element={<HealthStub title="Medical" blurb="Records, appointments, and clinician notes." />} />
    <Route path="/health/fitness" element={<HealthStub title="Fitness" blurb="Routines, sessions, and progress." />} />
    <Route path="/health/recovery" element={<HealthStub title="Recovery" blurb="Sleep, readiness, and recovery scores." />} />
    <Route path="/health/reminders" element={<HealthStub title="Health Reminders" blurb="Medications, check-ins, and routines." />} />
  </>
);