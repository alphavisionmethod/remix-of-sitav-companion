// ═══════════════════════════════════════════════════════════════
// SITA OS — Data Loss Prevention Guard
// Layer: Electron Main Process
// ═══════════════════════════════════════════════════════════════

const { clipboard, systemPreferences } = require('electron');

const DLP_VERSION = '1.0.0';
const CLIPBOARD_POLL_MS = 2000;

let _dlpActive = false;
let _clipboardTimer = null;
let _lastClipboardHash = '';
let _incidents = [];
let _mainWindow = null;

// ── Sensitive Data Patterns ────────────────────────────────────

const SENSITIVE_PATTERNS = [
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: 'credit_card', pattern: /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/ },
  { name: 'api_key', pattern: /\b(?:sk_live_|sk_test_|pk_live_|pk_test_|eyJ[a-zA-Z0-9]{20,})\b/ },
  { name: 'private_key', pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  { name: 'supabase_key', pattern: /\beyJ[a-zA-Z0-9_-]{50,}\b/ },
  { name: 'bearer_token', pattern: /Bearer\s+[a-zA-Z0-9._\-]{20,}/ },
  { name: 'password_field', pattern: /password["']?\s*[:=]\s*["'][^"']{4,}["']/ },
];

// ── Simple hash for clipboard change detection ─────────────────

function quickHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

// ── Clipboard Monitor ──────────────────────────────────────────

function pollClipboard() {
  try {
    const text = clipboard.readText() || '';
    const currentHash = quickHash(text);

    if (currentHash === _lastClipboardHash) return;
    _lastClipboardHash = currentHash;

    if (text.length < 5) return;

    for (const { name, pattern } of SENSITIVE_PATTERNS) {
      if (pattern.test(text)) {
        // Scrub the clipboard
        clipboard.writeText('[SITA OS — Sensitive content removed]');

        const incident = {
          type: 'clipboard_scrub',
          patternMatched: name,
          contentLength: text.length,
          timestamp: new Date().toISOString(),
        };
        _incidents.push(incident);
        console.warn(`[dlp-guard] 🛡️ Clipboard scrubbed: ${name} pattern detected (${text.length} chars)`);
        return;
      }
    }
  } catch {
    // Clipboard access may fail — ignore
  }
}

// ── Screenshot Protection ──────────────────────────────────────

function enableContentProtection(win) {
  if (!win || win.isDestroyed()) return false;
  try {
    win.setContentProtection(true);
    console.log('[dlp-guard] Screen capture protection enabled');
    return true;
  } catch (err) {
    console.warn('[dlp-guard] Content protection not available:', err.message);
    return false;
  }
}

// ── Print Interception ─────────────────────────────────────────

function interceptPrint(webContents) {
  if (!webContents) return;

  webContents.on('before-input-event', (event, input) => {
    // Block Ctrl+P / Cmd+P in production
    if ((input.control || input.meta) && input.key === 'p') {
      event.preventDefault();
      _incidents.push({
        type: 'print_blocked',
        timestamp: new Date().toISOString(),
      });
      console.warn('[dlp-guard] 🖨️ Print attempt blocked');
    }
  });
}

// ── Screen Recording Detection (macOS) ─────────────────────────

function checkScreenRecording() {
  if (process.platform !== 'darwin') return null;
  try {
    const status = systemPreferences.getMediaAccessStatus('screen');
    if (status === 'granted') {
      return { type: 'screen_recording_granted', detail: 'Screen recording access is granted to other apps' };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Watermark Injection ────────────────────────────────────────

function injectWatermark(webContents, userId) {
  if (!webContents || !userId) return;

  // Encode user ID into invisible CSS pseudo-elements
  const encoded = Buffer.from(userId).toString('base64').substring(0, 16);
  const css = `
    body::after {
      content: '${encoded}';
      position: fixed;
      bottom: 0;
      right: 0;
      font-size: 1px;
      color: rgba(0, 0, 0, 0.002);
      pointer-events: none;
      z-index: 999999;
      user-select: none;
      mix-blend-mode: difference;
    }
  `;

  webContents.insertCSS(css).catch(() => {});
}

// ── Public API ─────────────────────────────────────────────────

function initDLPGuard(mainWindow, options = {}) {
  if (_dlpActive) return;
  _dlpActive = true;
  _mainWindow = mainWindow;

  console.log(`[dlp-guard] Initializing v${DLP_VERSION}`);

  // Enable screenshot protection
  enableContentProtection(mainWindow);

  // Start clipboard monitoring
  _clipboardTimer = setInterval(pollClipboard, CLIPBOARD_POLL_MS);

  // Intercept print
  if (mainWindow?.webContents) {
    interceptPrint(mainWindow.webContents);
  }

  // Inject watermark if user ID provided
  if (options.userId && mainWindow?.webContents) {
    mainWindow.webContents.on('did-finish-load', () => {
      injectWatermark(mainWindow.webContents, options.userId);
    });
  }

  // Check screen recording status (macOS)
  const screenStatus = checkScreenRecording();
  if (screenStatus) {
    console.warn('[dlp-guard] ⚠️', screenStatus.detail);
  }

  return { version: DLP_VERSION, contentProtection: true };
}

function getDLPStatus() {
  return {
    active: _dlpActive,
    incidentCount: _incidents.length,
    recentIncidents: _incidents.slice(-10),
    screenRecording: checkScreenRecording(),
    version: DLP_VERSION,
  };
}

function destroyDLP() {
  if (_clipboardTimer) {
    clearInterval(_clipboardTimer);
    _clipboardTimer = null;
  }
  _dlpActive = false;
}

module.exports = { initDLPGuard, getDLPStatus, destroyDLP };
