// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Shield: Anti-Debug & Anti-Tamper
// Layer: Electron Main Process
// ═══════════════════════════════════════════════════════════════

const os = require('os');

const SHIELD_VERSION = '1.0.0';
const IS_PRODUCTION = !process.defaultApp;
const CHECK_INTERVAL_MS = 5000;

let _shieldActive = false;
let _violations = [];
let _checkTimer = null;

// ── Known VM indicators ────────────────────────────────────────
const VM_MAC_PREFIXES = [
  '00:05:69', '00:0c:29', '00:1c:14', '00:50:56', // VMware
  '08:00:27', '0a:00:27',                           // VirtualBox
  '00:15:5d',                                        // Hyper-V
  '00:16:3e',                                        // Xen
  '52:54:00',                                        // QEMU/KVM
];

const VM_PROCESS_NAMES = [
  'vmtoolsd', 'vmwaretray', 'vboxservice', 'vboxtray',
  'xenservice', 'qemu-ga',
];

// ── Debugger Detection ─────────────────────────────────────────

function detectDebugger() {
  const violations = [];

  // Check debug port
  if (process.debugPort && process.debugPort !== 0) {
    violations.push({ type: 'debug_port', detail: `Port ${process.debugPort}` });
  }

  // Check --inspect flags
  const inspectArgs = process.execArgv.filter(a =>
    a.startsWith('--inspect') || a.startsWith('--debug')
  );
  if (inspectArgs.length > 0) {
    violations.push({ type: 'inspect_flag', detail: inspectArgs.join(', ') });
  }

  // Check environment variables used by debuggers
  const debugEnvVars = ['NODE_OPTIONS', 'ELECTRON_RUN_AS_NODE'];
  for (const envVar of debugEnvVars) {
    if (process.env[envVar]) {
      violations.push({ type: 'debug_env', detail: `${envVar}=${process.env[envVar]}` });
    }
  }

  return violations;
}

// ── Timing Attack Detection ────────────────────────────────────

function createTimingCanary() {
  const EXPECTED_MAX_MS = 5;
  const start = process.hrtime.bigint();

  // Simple arithmetic — should take <1ms
  let x = 0;
  for (let i = 0; i < 1000; i++) x += i;

  const elapsed = Number(process.hrtime.bigint() - start) / 1e6;

  if (elapsed > EXPECTED_MAX_MS) {
    return { type: 'timing_anomaly', detail: `${elapsed.toFixed(1)}ms (expected <${EXPECTED_MAX_MS}ms)` };
  }
  return null;
}

// ── DLL / Module Injection Detection (Windows) ─────────────────

function detectModuleInjection() {
  if (process.platform !== 'win32') return [];

  const violations = [];
  const loadedModules = process.moduleLoadList || [];

  // Check for known injection tools
  const suspiciousPatterns = [
    'frida', 'cheat', 'inject', 'hook', 'detour',
    'minhook', 'easyhook', 'deviare',
  ];

  for (const mod of loadedModules) {
    const lower = mod.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (lower.includes(pattern)) {
        violations.push({ type: 'suspicious_module', detail: mod });
      }
    }
  }

  return violations;
}

// ── VM Detection (Warning Only) ────────────────────────────────

function detectVirtualMachine() {
  const indicators = [];

  // Check MAC addresses
  const interfaces = os.networkInterfaces();
  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      if (addr.mac && addr.mac !== '00:00:00:00:00:00') {
        const prefix = addr.mac.substring(0, 8).toLowerCase();
        if (VM_MAC_PREFIXES.includes(prefix)) {
          indicators.push({ type: 'vm_mac', detail: `${name}: ${addr.mac}` });
        }
      }
    }
  }

  // Check hostname patterns
  const hostname = os.hostname().toLowerCase();
  if (/^(desktop-|win-)?[a-z0-9]{6,8}$/i.test(hostname)) {
    indicators.push({ type: 'vm_hostname_pattern', detail: hostname });
  }

  // Check low resource counts (common in VMs)
  const cpuCount = os.cpus().length;
  const totalMem = os.totalmem() / (1024 * 1024 * 1024);
  if (cpuCount <= 1 && totalMem < 2) {
    indicators.push({ type: 'vm_low_resources', detail: `${cpuCount} CPU, ${totalMem.toFixed(1)}GB RAM` });
  }

  return indicators;
}

// ── DevTools Guard ─────────────────────────────────────────────

function guardDevTools(webContents) {
  if (!IS_PRODUCTION) return;

  webContents.on('devtools-opened', () => {
    console.warn('[runtime-shield] ⚠️ DevTools opened in production — closing');
    webContents.closeDevTools();
    _violations.push({
      type: 'devtools_opened',
      timestamp: new Date().toISOString(),
    });
  });
}

// ── Periodic Integrity Check ───────────────────────────────────

function runPeriodicCheck() {
  const newViolations = [];

  // Debugger check
  const debugViolations = detectDebugger();
  newViolations.push(...debugViolations);

  // Timing canary
  const timing = createTimingCanary();
  if (timing) newViolations.push(timing);

  // Module injection
  const moduleViolations = detectModuleInjection();
  newViolations.push(...moduleViolations);

  if (newViolations.length > 0) {
    const timestamped = newViolations.map(v => ({
      ...v,
      timestamp: new Date().toISOString(),
    }));
    _violations.push(...timestamped);

    console.warn('[runtime-shield] 🛡️ Violations detected:', JSON.stringify(timestamped));

    // In production with debugger attached, terminate
    if (IS_PRODUCTION && debugViolations.length > 0) {
      console.error('[runtime-shield] 🚨 Debugger detected in production — terminating');
      process.exit(1);
    }
  }
}

// ── Public API ─────────────────────────────────────────────────

function initRuntimeShield(mainWindow) {
  if (_shieldActive) return;
  _shieldActive = true;

  console.log(`[runtime-shield] Initializing v${SHIELD_VERSION} (production=${IS_PRODUCTION})`);

  // Apply command-line hardening
  const { app } = require('electron');
  app.commandLine.appendSwitch('js-flags', '--noexpose_wasm');
  app.commandLine.appendSwitch('disable-software-rasterizer');

  // Initial checks
  runPeriodicCheck();

  // VM detection (warning only — don't block legitimate VM users)
  const vmIndicators = detectVirtualMachine();
  if (vmIndicators.length > 0) {
    console.warn('[runtime-shield] ⚠️ Virtual machine indicators:', JSON.stringify(vmIndicators));
  }

  // Guard DevTools on main window
  if (mainWindow?.webContents) {
    guardDevTools(mainWindow.webContents);
  }

  // Periodic checks
  _checkTimer = setInterval(runPeriodicCheck, CHECK_INTERVAL_MS);

  return { version: SHIELD_VERSION, production: IS_PRODUCTION, vmIndicators };
}

function getShieldStatus() {
  return {
    active: _shieldActive,
    production: IS_PRODUCTION,
    violationCount: _violations.length,
    recentViolations: _violations.slice(-10),
    version: SHIELD_VERSION,
  };
}

function destroyShield() {
  if (_checkTimer) {
    clearInterval(_checkTimer);
    _checkTimer = null;
  }
  _shieldActive = false;
}

module.exports = { initRuntimeShield, getShieldStatus, destroyShield, guardDevTools };
