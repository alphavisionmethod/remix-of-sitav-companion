// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Calendar
// ═══════════════════════════════════════════════════════════════

export interface MockCalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "booking" | "task";
  status: string;
  provider?: string;
}

export function generateCalendarDemoEvents(year: number, month: number): MockCalendarEvent[] {
  const mm = String(month + 1).padStart(2, "0");
  return [
    { id: "d1", title: "Soccer practice", date: `${year}-${mm}-14`, type: "booking", status: "confirmed", provider: "Riverside Park" },
    { id: "d2", title: "Piano lesson", date: `${year}-${mm}-15`, type: "booking", status: "confirmed", provider: "Music Academy" },
    { id: "d3", title: "Dentist checkup", date: `${year}-${mm}-18`, type: "booking", status: "pending", provider: "Dr. Patel" },
    { id: "d4", title: "Parent-teacher conf.", date: `${year}-${mm}-16`, type: "booking", status: "confirmed" },
    { id: "d5", title: "Grocery run", date: `${year}-${mm}-14`, type: "task", status: "pending" },
    { id: "d6", title: "Oil change", date: `${year}-${mm}-20`, type: "task", status: "pending" },
    { id: "d7", title: "Family dinner", date: `${year}-${mm}-19`, type: "booking", status: "confirmed", provider: "Chez Marie" },
    { id: "d8", title: "HVAC maintenance", date: `${year}-${mm}-22`, type: "booking", status: "pending", provider: "Home" },
    { id: "d9", title: "Birthday party", date: `${year}-${mm}-21`, type: "booking", status: "confirmed" },
    { id: "d10", title: "Call plumber", date: `${year}-${mm}-15`, type: "task", status: "pending" },
  ];
}
