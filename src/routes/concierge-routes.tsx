import { Route } from "react-router-dom";
import { lazy } from "react";

const ConciergeCenter = lazy(() => import("@/pages/ConciergeCenter"));

export function getConciergeRoutes() {
  return (
    <>
      <Route path="/concierge" element={<ConciergeCenter />} />
      <Route path="/concierge/overview" element={<ConciergeCenter />} />
      <Route path="/concierge/calendar" element={<ConciergeCenter />} />
      <Route path="/concierge/tasks" element={<ConciergeCenter />} />
      <Route path="/concierge/school" element={<ConciergeCenter />} />
      <Route path="/concierge/grocery" element={<ConciergeCenter />} />
      <Route path="/concierge/appointments" element={<ConciergeCenter />} />
      <Route path="/concierge/travel" element={<ConciergeCenter />} />
      <Route path="/concierge/providers" element={<ConciergeCenter />} />
      <Route path="/concierge/events" element={<ConciergeCenter />} />
      <Route path="/concierge/workflows" element={<ConciergeCenter />} />
      <Route path="/concierge/proof" element={<ConciergeCenter />} />
      <Route path="/concierge/files" element={<ConciergeCenter />} />
      <Route path="/concierge/boardroom" element={<ConciergeCenter />} />
      <Route path="/concierge/settings" element={<ConciergeCenter />} />
      <Route path="/concierge/life-admin" element={<ConciergeCenter />} />
      <Route path="/concierge/errands" element={<ConciergeCenter />} />
      <Route path="/concierge/upcoming" element={<ConciergeCenter />} />
      <Route path="/concierge/recurring" element={<ConciergeCenter />} />
      <Route path="/concierge/household" element={<ConciergeCenter />} />
    </>
  );
}
