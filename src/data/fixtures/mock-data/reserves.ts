// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Reserves & Savings
// ═══════════════════════════════════════════════════════════════

export const MOCK_RESERVES_SAVINGS = [
  { id: "1", name: "Emergency Fund", current_amount: 12000, target_amount: 15000, category: "emergency", contribution_amount: 500, notes: "Safety net", auto_contribute: true, priority: 1 },
  { id: "2", name: "Tax Reserve", current_amount: 8400, target_amount: 12000, category: "sinking", contribution_amount: 1200, notes: "Q2 estimated", auto_contribute: true, priority: 2 },
  { id: "3", name: "Equipment Fund", current_amount: 2800, target_amount: 5000, category: "sinking", contribution_amount: 400, notes: "Business capex", auto_contribute: false, priority: 3 },
  { id: "4", name: "Vacation Fund", current_amount: 1600, target_amount: 4000, category: "goal", contribution_amount: 300, notes: "Summer trip", auto_contribute: true, priority: 4 },
  { id: "5", name: "Kids Education", current_amount: 6200, target_amount: 25000, category: "goal", contribution_amount: 500, notes: "529 supplement", auto_contribute: true, priority: 5 },
];
