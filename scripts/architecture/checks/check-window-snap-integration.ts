#!/usr/bin/env node
/* eslint-disable no-console */
// Phase L (graduated to BLOCK in Phase Q) — Window snap integration
// Asserts SnapGuideOverlay stays mounted in AppWindow.
import { readJsonSafe } from "../lib/utils";

const data = readJsonSafe<{ classification: string; appWindowMountIntegratesOverlay: boolean }>("generated/deployment-gap-closure/window-snap-adoption-map.json");
if (!data) { console.error("❌ window-snap-adoption-map.json missing"); process.exit(1); }
const ok = data.classification === "fully-integrated" && data.appWindowMountIntegratesOverlay === true;
console.log(`${ok ? "✅" : "❌"} Window snap: ${data.classification}`);
process.exit(ok ? 0 : 1);
