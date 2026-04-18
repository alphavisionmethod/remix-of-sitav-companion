export const moneyScenario = {
  name: "Finance Focus",
  description: "Bills, subscriptions, savings, and cash flow optimization",
  data: {
    bills: [
      { id: "B-MF01", name: "Office Rent", amount: "$2,500", dueDate: "Apr 1", status: "upcoming", recurring: true },
      { id: "B-MF02", name: "AWS Hosting", amount: "$342", dueDate: "Apr 3", status: "upcoming", recurring: true },
      { id: "B-MF03", name: "Insurance Premium", amount: "$890", dueDate: "Mar 30", status: "overdue", recurring: true },
      { id: "B-MF04", name: "Quarterly Tax Estimate", amount: "$4,200", dueDate: "Apr 15", status: "upcoming", recurring: false },
    ],
    cashFlow: {
      available: "$24,680",
      incoming: "$12,400",
      outgoing: "$8,900",
      safeToSpend: "$11,580",
      runway: "2.6 months",
    },
    focus: "Pay the overdue insurance bill and plan for quarterly taxes",
  },
};
