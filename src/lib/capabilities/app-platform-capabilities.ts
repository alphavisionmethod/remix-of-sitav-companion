import { registerCapability } from "./capability-registry";

registerCapability("app-platform.app.install", async (params) => ({
  success: true, data: { id: crypto.randomUUID(), ...params },
}));

registerCapability("app-platform.app.uninstall", async (params) => ({
  success: true, data: params,
}));

registerCapability("app-platform.pack.create", async (params) => ({
  success: true, data: { id: crypto.randomUUID(), ...params },
}));

registerCapability("app-platform.pack.update", async (params) => ({
  success: true, data: params,
}));
