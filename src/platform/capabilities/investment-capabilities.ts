import { registerCapability } from "./capability-registry";

registerCapability("investment.portfolio.create", async (params) => ({
  success: true, data: { id: crypto.randomUUID(), ...params },
}));

registerCapability("investment.portfolio.update", async (params) => ({
  success: true, data: params,
}));

registerCapability("investment.transaction.create", async (params) => ({
  success: true, data: { id: crypto.randomUUID(), ...params },
}));

registerCapability("investment.analysis.run", async (params) => ({
  success: true, data: { recommendation: "hold", ...params },
}));
