export { founderScenario } from "./founder";
export { familyScenario } from "./family";
export { moneyScenario } from "./money";
export { defaultScenario } from "./default";

export const scenarios = [
  { key: "founder", label: "Founder / Operator", description: "Leads, pipeline, invoices, revenue" },
  { key: "family", label: "Family Manager", description: "Schedules, school, groceries, tasks" },
  { key: "money", label: "Finance Focus", description: "Bills, subscriptions, savings, cash timing" },
  { key: "default", label: "Full OS Demo", description: "All domains with rich interconnected data" },
] as const;

export type ScenarioKey = typeof scenarios[number]["key"];

export function getScenarioData(key: ScenarioKey) {
  switch (key) {
    case "founder":
      return import("./founder").then(m => m.founderScenario);
    case "family":
      return import("./family").then(m => m.familyScenario);
    case "money":
      return import("./money").then(m => m.moneyScenario);
    case "default":
      return import("./default").then(m => m.defaultScenario);
  }
}
