#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Consolidation Progress Tracker
// ═══════════════════════════════════════════════════════════════

import { getConsolidationStats } from "../../../src/lib/architecture/service-inventory";

const stats = getConsolidationStats();

console.log(`  📦 Current services: ${stats.currentCount}`);
console.log(`  🎯 Target services: ${stats.targetCount}`);
console.log(`  📋 Sample mapped: ${stats.sampleMapped}`);
console.log(`  ✅ Keep: ${stats.keepCount}`);
console.log(`  🔀 Merge: ${stats.mergeCount}`);
console.log(`  🗑️  Delete/Archive: ${stats.deleteCount}`);
console.log(`  🌊 Wave 1 candidates: ${stats.wave1Candidates}`);

const reductionPct = Math.round(((stats.currentCount - stats.targetCount) / stats.currentCount) * 100);
console.log(`\n  📉 Target reduction: ${reductionPct}% (${stats.currentCount} → ${stats.targetCount})`);
console.log(`✅ service-consolidation-progress: tracked`);