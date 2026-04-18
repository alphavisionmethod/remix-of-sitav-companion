export const founderScenario = {
  name: "Founder / Operator",
  description: "Service business with active pipeline, clients, and revenue operations",
  data: {
    leads: [
      { id: "L-F01", name: "Sarah Chen", company: "Bloom Studio", source: "Website", status: "new", score: 87, value: "$12,000", lastTouch: "2h ago", nextAction: "Follow-up call" },
      { id: "L-F02", name: "Marcus Rivera", company: "RiverTech", source: "Referral", status: "contacted", score: 72, value: "$8,500", lastTouch: "1d ago", nextAction: "Send proposal" },
      { id: "L-F03", name: "Emily Park", company: "Park & Associates", source: "LinkedIn", status: "qualified", score: 91, value: "$24,000", lastTouch: "3h ago", nextAction: "Schedule demo" },
      { id: "L-F04", name: "James Morton", company: "Morton Labs", source: "Cold outreach", status: "cooling", score: 45, value: "$6,000", lastTouch: "5d ago", nextAction: "Re-engage" },
      { id: "L-F05", name: "Amanda Liu", company: "Liu Design Co", source: "Website", status: "new", score: 78, value: "$15,000", lastTouch: "1h ago", nextAction: "Initial outreach" },
    ],
    invoices: [
      { id: "INV-F01", client: "Acme Corp", amount: "$4,800", status: "paid", dueDate: "Mar 15" },
      { id: "INV-F02", client: "Bloom Studio", amount: "$1,200", status: "overdue", dueDate: "Mar 20" },
      { id: "INV-F03", client: "NovaTech", amount: "$9,600", status: "pending", dueDate: "Apr 5" },
    ],
    focus: "Close the Sarah Chen deal and follow up on overdue invoices",
  },
};
