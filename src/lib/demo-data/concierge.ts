// SITA OS — Demo Data: Concierge

export const DEMO_fallbackPriorities = [
  { title: "No tasks yet — add your first household task", due: "Today", category: "General", who: "You", icon: CheckSquare, urgency: "low" as const },
];

export const DEMO_changedSinceYesterday = [
  "HVAC maintenance confirmed for Apr 8",
  "New grocery alerts: laundry detergent (out), olive oil (low)",
  "Bus pass renewal moved to overdue status",
  "Mom's birthday gift ordered — arrives Apr 11",
];

export const DEMO_priorities = [
  { item: "Kids' passport renewal — expires in 60 days", urgency: "high" as const, category: "Admin", action: "Start renewal process", why: "6–8 week processing time" },
  { item: "Birthday party venue — decision needed by Apr 10", urgency: "medium" as const, category: "Events", action: "Compare 3 venues", why: "Venue holds expire in 48h" },
  { item: "Oil change — 2 weeks overdue", urgency: "medium" as const, category: "Vehicle", action: "Schedule with Elite Auto", why: "Risk of engine damage" },
  { item: "Travel insurance — Cancún trip", urgency: "low" as const, category: "Travel", action: "Review and purchase", why: "Trip in 18 days" },
];

export const DEMO_carryover = [
  { item: "Annual home insurance review", weeks: 3 },
  { item: "Schedule HVAC maintenance", weeks: 2 },
  { item: "Update emergency contacts at school", weeks: 1 },
];

export const DEMO_nextMoves = [
  { move: "Begin passport renewal — both kids", why: "60-day expiration window, 6–8 week processing", confidence: "high" as const },
  { move: "Confirm birthday venue by Friday", why: "Venue holds for 48 hours only", confidence: "high" as const },
  { move: "Schedule oil change — Elite Auto", why: "2 weeks overdue, next available: Thursday", confidence: "medium" as const },
  { move: "Review travel insurance quotes", why: "Cancún trip in 18 days — coverage needed", confidence: "medium" as const },
  { move: "Defer home insurance review to next week", why: "No renewal deadline pressure this week", confidence: "high" as const },
  { move: "Book pet sitter for spring break", why: "Preferred sitter has limited slots", confidence: "high" as const },
];

export const DEMO_scheduleConflicts = [
  { conflict: "Emma's soccer match overlaps with family dinner — Saturday", resolution: "Move dinner to 7 PM" },
  { conflict: "Parent-teacher conference conflicts with your 10 AM client meeting — Tuesday", resolution: "Reschedule client meeting to 11 AM" },
];

export const DEMO_proofSummary = [
  { action: "12 tasks completed with proof", icon: CheckSquare },
  { action: "3 provider interactions logged", icon: Wrench },
  { action: "1 grocery run tracked — $87.42", icon: ShoppingCart },
  { action: "6 calendar events confirmed", icon: Calendar },
  { action: "2 school forms submitted", icon: GraduationCap },
  { action: "1 travel booking confirmed", icon: Plane },
];

export const DEMO_familyMembers = [
  { name: "You", DEMO_events: 5, color: "bg-primary" },
  { name: "Partner", DEMO_events: 3, color: "bg-accent" },
  { name: "Emma", DEMO_events: 4, color: "bg-chart-2" },
  { name: "Liam", DEMO_events: 3, color: "bg-amber-500" },
];

export const DEMO_events = [
  { id: "1", title: "Soccer practice", time: "Today 4:00 PM", who: "Emma", location: "Riverside Park", category: "Sports", owner: "Partner", transportTime: "15 min", prep: ["Shin guards", "Water bottle"] },
  { id: "2", title: "Carpool duty — morning route", time: "Tomorrow 7:30 AM", who: "You", category: "Transport", owner: "You" },
  { id: "3", title: "Piano lesson", time: "Tomorrow 3:30 PM", who: "Liam", location: "Music Academy", category: "Education", owner: "Partner", transportTime: "20 min", prep: ["Music book"] },
  { id: "4", title: "Parent-teacher conference", time: "Next Tuesday 9:00 AM", who: "Parents", location: "Lincoln Elementary", category: "School", owner: "Both", transportTime: "10 min", prep: ["Review report card", "Prepare questions"] },
  { id: "5", title: "Dentist — kids checkup", time: "Next Thursday 10:00 AM", who: "Emma & Liam", location: "Dr. Patel", category: "Health", owner: "You", transportTime: "25 min", prep: ["Insurance cards", "Brush teeth morning of"] },
  { id: "6", title: "Soccer match", time: "Saturday 2:00 PM", who: "Emma", location: "County Field", category: "Sports", owner: "Partner", transportTime: "30 min", conflict: true },
  { id: "7", title: "Family dinner — Chez Marie", time: "Saturday 6:00 PM", who: "Everyone", location: "Chez Marie", category: "Family", owner: "You", prep: ["Reservation confirmed"], conflict: true },
  { id: "8", title: "Birthday party — Max", time: "Sunday 3:00 PM", who: "Liam", location: "FunZone", category: "Social", owner: "Partner", transportTime: "15 min", prep: ["Wrap gift", "RSVP done"] },
  { id: "9", title: "HVAC maintenance", time: "Apr 8, 2:00–4:00 PM", who: "Home", location: "At home", category: "Home", owner: "Partner", prep: ["Clear area around furnace", "Service contract ready"] },
  { id: "10", title: "Annual physical", time: "Apr 10, 8:30 AM", who: "You", location: "West Health Clinic", category: "Health", owner: "You", transportTime: "15 min", prep: ["Fast after 10 PM", "List of meds", "ID + Insurance card"] },
];

export const DEMO_conflicts = [
  {
    DEMO_events: [
      { title: "Soccer match (Emma)", time: "Saturday 2:00 PM", who: "Emma" },
      { title: "Family dinner", time: "Saturday 6:00 PM", who: "Everyone" },
    ],
    resolution: "Soccer match ends ~3:30 PM. Move dinner to 7 PM — restaurant has availability. This resolves the timing pressure.",
  },
];

export const DEMO_prepItems = [
  { title: "Dentist prep — kids checkup", linkedEvent: "Next Thursday 10 AM", items: ["Brush teeth morning of", "Bring insurance cards", "Request x-ray copies"], owner: "You", dueIn: "5 days" },
  { title: "Annual physical prep", linkedEvent: "Apr 10, 8:30 AM", items: ["Fast after 10 PM night before", "List current medications", "Bring ID + insurance card"], owner: "You", dueIn: "8 days" },
  { title: "HVAC maintenance prep", linkedEvent: "Apr 8, 2–4 PM", items: ["Clear area around furnace", "Have service contract accessible", "Someone must be home"], owner: "Partner", dueIn: "6 days" },
];

export const DEMO_transportDuties = [
  { event: "Soccer practice", time: "Today 4 PM", driver: "Partner", route: "Home → Riverside Park → Home", duration: "45 min total" },
  { event: "Carpool duty", time: "Tomorrow 7:30 AM", driver: "You", route: "3-kid route → Lincoln Elementary", duration: "25 min" },
  { event: "Piano lesson", time: "Tomorrow 3:30 PM", driver: "Partner", route: "School → Music Academy → Home", duration: "40 min" },
];

export const DEMO_recurringSupplies = [
  { item: "Laundry detergent", lastPurchased: "3 weeks ago", cycle: "Monthly", status: "out" as const },
  { item: "Olive oil", lastPurchased: "5 weeks ago", cycle: "6 weeks", status: "low" as const },
  { item: "Paper towels", lastPurchased: "2 weeks ago", cycle: "3 weeks", status: "low" as const },
  { item: "Dish soap", lastPurchased: "1 week ago", cycle: "Monthly", status: "ok" as const },
  { item: "Trash bags", lastPurchased: "3 weeks ago", cycle: "Monthly", status: "ok" as const },
  { item: "Kids' vitamins", lastPurchased: "2 weeks ago", cycle: "Monthly", status: "ok" as const },
];

export const DEMO_CONC_categories = [...new Set(initialItems.map(i => i.category))];

export const DEMO_stores = [...new Set(initialItems.map(i => i.store).filter(Boolean))];

export const DEMO_CONC_categories_SERVICE_PROVIDERS = [...new Set(providers.map((p) => p.category))];

export const DEMO_itinerary = [
  { day: "Day 1 — Apr 10", items: ["Flight DEN → CUN 8:30 AM (United 1442)", "Airport transfer — pre-booked", "Hotel check-in: Hyatt Ziva 3 PM", "Dinner at La Habichuela"] },
  { day: "Day 2 — Apr 11", items: ["Breakfast at hotel", "Snorkeling excursion 10 AM — 4 tickets", "Lunch at Tacos Rigo", "Pool afternoon", "Sunset dinner cruise 6 PM"] },
  { day: "Day 3 — Apr 12", items: ["Chichén Itzá day trip (depart 7 AM)", "Packed lunch from hotel", "Return by 5 PM", "Casual dinner at hotel"] },
];

export const DEMO_preTripChecklist = [
  { title: "Flights & Transport", items: ["Book flights — ✅ Done", "Airport transfer — ✅ Booked", "Car rental (days 3–5) — Pending"], dueIn: "8 days" },
  { title: "Accommodation", items: ["Hotel confirmed — ✅ Hyatt Ziva", "Room upgrade request — Pending", "Late checkout request — Not yet"], dueIn: "10 days" },
  { title: "Documents", items: ["Passports — ⚠ Kids need renewal!", "Travel insurance — Compare quotes", "Hotel confirmation printout"], dueIn: "ASAP" },
  { title: "Home Prep", items: ["Pet sitter — ⚠ Needs booking ($280)", "Mail hold — Not started", "Security cameras — Check batteries", "Water plants arrangement"], dueIn: "7 days" },
  { title: "Packing", items: ["Kids' swimwear & sun gear", "Snorkeling gear or rental", "Medications & first aid", "Entertainment for flight"], dueIn: "5 days" },
];

export const DEMO_householdSpillover = [
  { item: "Pet sitter needed — Sarah M. has limited availability", urgency: "high", cost: "$280" },
  { item: "Mail hold — set up with USPS", urgency: "medium" },
  { item: "Grocery — no weekly order needed Apr 10–17", urgency: "low" },
  { item: "School — notify about kids' absence Apr 10–17", urgency: "high" },
  { item: "HVAC maintenance — reschedule if conflicts", urgency: "low" },
];

export const DEMO_postTripTasks = [
  "Unpack and laundry",
  "Restock groceries",
  "Review and file receipts",
  "Thank-you messages if applicable",
  "Resume weekly routines",
  "Pet pickup from sitter",
];
