#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — VMware Supply Chain Tier Emitter
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { readJsonSafe, writeJsonOutput, envelope } from "../architecture/lib/utils";

const manifest = readJsonSafe<any>("generated/service-manifest.json");
const services = manifest?.services || [];

const tiers = {
  critical: services.filter((s: any) => ["brain-core", "api-gateway", "identity", "event-bus"].includes(s.id)),
  standard: services.filter((s: any) => ["business-os", "finance-os", "concierge-os"].includes(s.id)),
  support: services.filter((s: any) => !["brain-core", "api-gateway", "identity", "event-bus", "business-os", "finance-os", "concierge-os"].includes(s.id)),
};

const output = envelope("1.0.0", {
  tiers: {
    critical: { count: tiers.critical.length, services: tiers.critical.map((s: any) => s.id) },
    standard: { count: tiers.standard.length, services: tiers.standard.map((s: any) => s.id) },
    support: { count: tiers.support.length, services: tiers.support.map((s: any) => s.id) },
  },
  totalServices: services.length,
});

writeJsonOutput("generated/vmware-supply-chain-tier.json", output);
console.log("✅ VMware supply chain tier emitted");
