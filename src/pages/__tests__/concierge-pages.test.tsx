import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["ConciergeCenter", () => import("@/pages/ConciergeCenter")],
  ["ConciergeOverview", () => import("@/pages/concierge/ConciergeOverview")],
  ["ConciergeFiles", () => import("@/pages/concierge/ConciergeFiles")],
  ["ConciergeProof", () => import("@/pages/concierge/ConciergeProof")],
  ["ConciergeSettings", () => import("@/pages/concierge/ConciergeSettings")],
  ["ConciergeWorkflows", () => import("@/pages/concierge/ConciergeWorkflows")],
  ["AppointmentsPrep", () => import("@/pages/concierge/AppointmentsPrep")],
  ["EventsGifts", () => import("@/pages/concierge/EventsGifts")],
  ["FamilyBoardroom", () => import("@/pages/concierge/FamilyBoardroom")],
  ["FamilyCalendar", () => import("@/pages/concierge/FamilyCalendar")],
  ["GroceryPlanning", () => import("@/pages/concierge/GroceryPlanning")],
  ["HouseholdCommandCenter", () => import("@/pages/concierge/HouseholdCommandCenter")],
  ["HouseholdTasks", () => import("@/pages/concierge/HouseholdTasks")],
  ["MonthGridCalendar", () => import("@/pages/concierge/MonthGridCalendar")],
  ["SchoolActivities", () => import("@/pages/concierge/SchoolActivities")],
  ["ServiceProviders", () => import("@/pages/concierge/ServiceProviders")],
  ["TravelPlanning", () => import("@/pages/concierge/TravelPlanning")],
  ["ErrandsLogistics", () => import("@/pages/concierge/ErrandsLogistics")],
  ["UpcomingNeeds", () => import("@/pages/concierge/UpcomingNeeds")],
  ["RecurringObligations", () => import("@/pages/concierge/RecurringObligations")],
  ["CalendarWorkspace", () => import("@/pages/CalendarWorkspace")],
  ["CommunicationsPage", () => import("@/pages/CommunicationsPage")],
  ["PeopleWorkspace", () => import("@/pages/PeopleWorkspace")],
] as const;

describe("Concierge Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
