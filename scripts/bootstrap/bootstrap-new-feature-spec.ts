#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Bootstrap New Feature Spec
// Creates feature spec template with capability definition
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

async function main() {
  const args = process.argv.slice(2);
  let featureName = args[0];
  let domain = args[1] || "platform";

  if (!featureName) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    featureName = await new Promise<string>(resolve => rl.question("Feature name (kebab-case): ", resolve));
    domain = await new Promise<string>(resolve => rl.question("Domain (business-os/finance-os/concierge-os/platform): ", ans => resolve(ans || "platform")));
    rl.close();
  }

  const pascalName = featureName.split("-").map(s => s[0].toUpperCase() + s.slice(1)).join("");
  const featureDir = path.join("src/packages/feature-governance/features", featureName);

  if (fs.existsSync(featureDir)) {
    console.error(`❌ Feature "${featureName}" already exists`);
    process.exit(1);
  }

  fs.mkdirSync(featureDir, { recursive: true });

  // Capability definition
  fs.writeFileSync(path.join(featureDir, "capability.ts"), `// ═══════════════════════════════════════════════════════════════
// SITA OS — ${pascalName} Capability Definition
// Domain: ${domain}
// ═══════════════════════════════════════════════════════════════

export const ${pascalName.charAt(0).toLowerCase() + pascalName.slice(1)}Capability = {
  id: "${featureName}",
  name: "${pascalName}",
  domain: "${domain}",
  status: "scaffold" as const,
  description: "TODO: describe capability",
  owner: "${domain}-team",
  contracts: [] as string[],
  events: {
    emits: [] as string[],
    consumes: [] as string[],
  },
  receipts: [] as string[],
  routes: [] as string[],
  dependencies: [] as string[],
};

export type ${pascalName}Capability = typeof ${pascalName.charAt(0).toLowerCase() + pascalName.slice(1)}Capability;
`);

  // Contract types
  fs.writeFileSync(path.join(featureDir, "contracts.ts"), `// ═══════════════════════════════════════════════════════════════
// SITA OS — ${pascalName} Contract Types
// ═══════════════════════════════════════════════════════════════

export interface ${pascalName}Request {
  id: string;
  timestamp: string;
}

export interface ${pascalName}Response {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ${pascalName}Event {
  type: "${featureName}.executed";
  payload: ${pascalName}Request;
  timestamp: string;
}

export interface ${pascalName}Receipt {
  eventId: string;
  capabilityId: "${featureName}";
  result: ${pascalName}Response;
  issuedAt: string;
}
`);

  // Barrel
  fs.writeFileSync(path.join(featureDir, "index.ts"), `export * from "./capability";
export * from "./contracts";
`);

  console.log(`✅ Feature "${featureName}" spec created at ${featureDir}`);
  console.log(`   📁 capability.ts — Capability definition`);
  console.log(`   📁 contracts.ts — Contract types`);
  console.log(`   📁 index.ts — Barrel export`);
}

main().catch(console.error);
