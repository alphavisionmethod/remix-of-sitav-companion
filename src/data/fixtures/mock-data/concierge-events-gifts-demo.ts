// ═══════════════════════════════════════════════════════════════
// SITA OS — Concierge Events & Gifts demo fixtures
// Demo-mode-only. Consumed via useRealityModeSafe().isDemo gate.
// ═══════════════════════════════════════════════════════════════

export interface EventItem {
  id: string;
  title: string;
  who: string;
  date: string;
  category: "birthday" | "anniversary" | "social" | "holiday" | "thank-you" | "follow-up";
  giftStatus?: "idea" | "purchased" | "wrapped" | "sent" | "none";
  giftIdea?: string;
  budget?: number;
  prepItems: string[];
  status: "upcoming" | "prep-needed" | "handled" | "overdue";
  daysUntil: number;
}

export const EVENTS_GIFTS_DEMO: ReadonlyArray<EventItem> = [
  { id: "1", title: "Mom's birthday",                  who: "Mom",            date: "Apr 14",       category: "birthday",   giftStatus: "idea",      giftIdea: "Spa gift card + photo book",  budget: 120, prepItems: ["Order photo book", "Buy card", "Make dinner reservation"], status: "prep-needed", daysUntil: 12 },
  { id: "2", title: "Max's birthday party (friend)",   who: "Liam → Max",     date: "This Sunday",  category: "birthday",   giftStatus: "purchased", giftIdea: "LEGO Space Set",              budget: 35,  prepItems: ["Wrap gift", "RSVP confirmed", "Drop-off at 3 PM"],          status: "prep-needed", daysUntil: 4  },
  { id: "3", title: "Wedding anniversary",             who: "You & Partner",  date: "Apr 28",       category: "anniversary", giftStatus: "none",                                                            prepItems: ["Book restaurant", "Arrange babysitter", "Gift ideas needed"], status: "upcoming",    daysUntil: 26 },
  { id: "4", title: "Thank you — Johnsons (dinner)",   who: "Johnson family", date: "Overdue",      category: "thank-you",  giftStatus: "none",                                                            prepItems: ["Send thank you card or message"],                            status: "overdue",     daysUntil: -3 },
  { id: "5", title: "School spring carnival",          who: "Family",         date: "Apr 15",       category: "social",                                                                                    prepItems: ["Volunteer shift confirmed", "Bake cookies for booth"],       status: "upcoming",    daysUntil: 13 },
  { id: "6", title: "Neighbor's new baby",             who: "Hendersons",     date: "Apr 10",       category: "follow-up",  giftStatus: "idea",      giftIdea: "Meal delivery gift card",     budget: 50,  prepItems: ["Order gift card", "Write congratulations card"],             status: "prep-needed", daysUntil: 8  },
  { id: "7", title: "Father's Day",                    who: "Dad",            date: "Jun 15",       category: "holiday",    giftStatus: "none",                                                            prepItems: [],                                                            status: "upcoming",    daysUntil: 74 },
] as const;