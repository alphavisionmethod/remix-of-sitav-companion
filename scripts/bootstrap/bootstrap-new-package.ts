#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Bootstrap New Package
// Creates a new package under src/packages/ with standard structure
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const PACKAGES_ROOT = "src/packages";

async function main() {
  const args = process.argv.slice(2);
  let packageName = args[0];

  if (!packageName) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    packageName = await new Promise<string>(resolve => rl.question("Package name (kebab-case): ", resolve));
    rl.close();
  }

  const pkgDir = path.join(PACKAGES_ROOT, packageName);
  if (fs.existsSync(pkgDir)) {
    console.error(`❌ Package "${packageName}" already exists at ${pkgDir}`);
    process.exit(1);
  }

  fs.mkdirSync(pkgDir, { recursive: true });

  const pascalName = packageName.split("-").map(s => s[0].toUpperCase() + s.slice(1)).join("");

  // Types scaffold
  fs.writeFileSync(path.join(pkgDir, `${packageName}.ts`), `// ═══════════════════════════════════════════════════════════════
// SITA OS — ${pascalName} Package
// ═══════════════════════════════════════════════════════════════

export interface ${pascalName}Config {
  version: string;
  enabled: boolean;
}
`);

  // Barrel export
  fs.writeFileSync(path.join(pkgDir, "index.ts"), `export * from "./${packageName}";
`);

  console.log(`✅ Package "${packageName}" created at ${pkgDir}`);
  console.log(`   📁 ${packageName}.ts`);
  console.log(`   📁 index.ts`);
}

main().catch(console.error);
