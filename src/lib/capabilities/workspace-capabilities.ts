import { registerCapability } from "./capability-registry";

registerCapability("workspace.memory.upsert", async (params) => ({
  success: true, data: params,
}));

registerCapability("workspace.profile.update", async (params) => ({
  success: true, data: params,
}));

registerCapability("workspace.settings.update", async (params) => ({
  success: true, data: params,
}));

registerCapability("workspace.activity.log", async (params) => ({
  success: true, data: { id: crypto.randomUUID(), ...params },
}));
