#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Bootstrap New Service
// Creates a new service directory with standard structure
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const SERVICES_ROOT = "src/lib/services";

async function main() {
  const args = process.argv.slice(2);
  let serviceName = args[0];
  let domain = args[1] || "platform";

  if (!serviceName) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    serviceName = await new Promise<string>(resolve => rl.question("Service name (kebab-case): ", resolve));
    domain = await new Promise<string>(resolve => rl.question("Domain (business-os/finance-os/concierge-os/platform): ", ans => resolve(ans || "platform")));
    rl.close();
  }

  const svcDir = path.join(SERVICES_ROOT, serviceName);
  if (fs.existsSync(svcDir)) {
    console.error(`❌ Service "${serviceName}" already exists at ${svcDir}`);
    process.exit(1);
  }

  fs.mkdirSync(svcDir, { recursive: true });

  // Types file
  const pascalName = serviceName.split("-").map(s => s[0].toUpperCase() + s.slice(1)).join("");
  fs.writeFileSync(path.join(svcDir, `${serviceName}.types.ts`), `// ═══════════════════════════════════════════════════════════════
// SITA OS — ${pascalName} Service Types
// ═══════════════════════════════════════════════════════════════

export interface ${pascalName}Config {
  enabled: boolean;
  debug?: boolean;
}

export interface ${pascalName}State {
  initialized: boolean;
  lastUpdated: string | null;
}
`);

  // Service file
  fs.writeFileSync(path.join(svcDir, `${serviceName}.service.ts`), `// ═══════════════════════════════════════════════════════════════
// SITA OS — ${pascalName} Service
// Domain: ${domain}
// ═══════════════════════════════════════════════════════════════

import type { ${pascalName}Config, ${pascalName}State } from "./${serviceName}.types";

export function create${pascalName}Service(config: ${pascalName}Config = { enabled: true }) {
  let state: ${pascalName}State = { initialized: false, lastUpdated: null };

  function initialize(): void {
    if (!config.enabled) return;
    state = { initialized: true, lastUpdated: new Date().toISOString() };
    console.log(\`[${serviceName}] Service initialized\`);
  }

  function getState(): ${pascalName}State {
    return { ...state };
  }

  function getHealthStatus(): { healthy: boolean; details: string } {
    return { healthy: state.initialized, details: state.initialized ? "Running" : "Not initialized" };
  }

  return { initialize, getState, getHealthStatus };
}

export type ${pascalName}Service = ReturnType<typeof create${pascalName}Service>;
`);

  // Barrel export
  fs.writeFileSync(path.join(svcDir, "index.ts"), `export { create${pascalName}Service } from "./${serviceName}.service";
export type { ${pascalName}Service } from "./${serviceName}.service";
export type { ${pascalName}Config, ${pascalName}State } from "./${serviceName}.types";
`);

  console.log(`✅ Service "${serviceName}" created at ${svcDir}`);
  console.log(`   📁 ${serviceName}.types.ts`);
  console.log(`   📁 ${serviceName}.service.ts`);
  console.log(`   📁 index.ts`);
  console.log(`\n   Run: npx tsx scripts/generate-service-manifest.ts to update the manifest`);
}

main().catch(console.error);
