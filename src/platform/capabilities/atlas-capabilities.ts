import { registerCapability } from "./capability-registry";

registerCapability("atlas.map.create", async (params) => ({
  success: true, data: { id: crypto.randomUUID(), ...params },
}));

registerCapability("atlas.region.update", async (params) => ({
  success: true, data: params,
}));

registerCapability("atlas.search.query", async (params) => ({
  success: true, data: { results: [], ...params },
}));
