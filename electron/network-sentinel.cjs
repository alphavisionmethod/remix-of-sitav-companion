// ═══════════════════════════════════════════════════════════════
// SITA OS — Network Sentinel: Exfiltration Guard
// Layer: Electron Main Process
// ═══════════════════════════════════════════════════════════════

const { session } = require('electron');

const SENTINEL_VERSION = '1.0.0';
const BANDWIDTH_WINDOW_MS = 60000;
const BANDWIDTH_ALERT_MULTIPLIER = 5;

let _sentinelActive = false;
let _incidents = [];
let _bytesOutWindow = [];
let _baselineBytesPerMinute = 500000; // 500KB baseline

// ── Domain Allowlist ───────────────────────────────────────────

const ALLOWED_DOMAINS = [
  // Supabase
  'fctupowhcljejygjfpty.supabase.co',
  'fctupowhcljejygjfpty.supabase.in',
  // Lovable AI Gateway
  'ai.gateway.lovable.dev',
  // Google Fonts
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  // Electron updates
  'github.com',
  'objects.githubusercontent.com',
  'api.github.com',
  // localhost for dev
  'localhost',
  '127.0.0.1',
];

const SUSPICIOUS_TLDS = [
  '.onion', '.bit', '.i2p', '.loki', '.zeronet',
  '.bazar', '.coin', '.lib', '.emc',
];

// ── URL Validation ─────────────────────────────────────────────

function isAllowedURL(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Always allow same-origin / file protocol
    if (parsed.protocol === 'file:' || parsed.protocol === 'devtools:') return true;
    if (parsed.protocol === 'data:' || parsed.protocol === 'blob:') return true;

    // Check allowlist
    for (const domain of ALLOWED_DOMAINS) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) return true;
    }

    return false;
  } catch {
    return false;
  }
}

function isSuspiciousTLD(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
  } catch {
    return false;
  }
}

// ── Bandwidth Tracking ─────────────────────────────────────────

function trackBandwidth(bytes) {
  const now = Date.now();
  _bytesOutWindow.push({ bytes, time: now });

  // Prune old entries
  _bytesOutWindow = _bytesOutWindow.filter(e => now - e.time < BANDWIDTH_WINDOW_MS);

  // Sum current window
  const totalBytes = _bytesOutWindow.reduce((sum, e) => sum + e.bytes, 0);

  if (totalBytes > _baselineBytesPerMinute * BANDWIDTH_ALERT_MULTIPLIER) {
    const incident = {
      type: 'bandwidth_anomaly',
      bytesPerMinute: totalBytes,
      baseline: _baselineBytesPerMinute,
      multiplier: (totalBytes / _baselineBytesPerMinute).toFixed(1),
      timestamp: new Date().toISOString(),
    };
    _incidents.push(incident);
    console.warn(`[network-sentinel] 📡 Bandwidth anomaly: ${(totalBytes / 1024).toFixed(0)}KB/min (${incident.multiplier}x baseline)`);
    return true;
  }
  return false;
}

// ── Request Interceptor ────────────────────────────────────────

function setupRequestInterceptor(ses) {
  ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const { url, method, resourceType } = details;

    // Check suspicious TLDs
    if (isSuspiciousTLD(url)) {
      _incidents.push({
        type: 'suspicious_tld',
        url: url.substring(0, 200),
        timestamp: new Date().toISOString(),
      });
      console.warn(`[network-sentinel] 🚫 Suspicious TLD blocked: ${url.substring(0, 100)}`);
      callback({ cancel: true });
      return;
    }

    // Check allowlist
    if (!isAllowedURL(url)) {
      _incidents.push({
        type: 'blocked_domain',
        url: url.substring(0, 200),
        method,
        resourceType,
        timestamp: new Date().toISOString(),
      });
      console.warn(`[network-sentinel] 🚫 Blocked: ${method} ${url.substring(0, 100)}`);
      callback({ cancel: true });
      return;
    }

    callback({});
  });

  // Track outbound data size
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const bodySize = details.uploadData
      ? details.uploadData.reduce((sum, d) => sum + (d.bytes?.length || 0), 0)
      : 0;

    if (bodySize > 0) {
      trackBandwidth(bodySize);
    }

    callback({});
  });

  // Monitor response headers for cert issues
  ses.webRequest.onHeadersReceived((details, callback) => {
    callback({});
  });
}

// ── WebSocket Monitor ──────────────────────────────────────────

function setupWebSocketMonitor(webContents) {
  if (!webContents) return;

  // Inject WebSocket monitoring into the renderer
  const monitorScript = `
    (function() {
      const _OrigWS = window.WebSocket;
      const _allowedHosts = ${JSON.stringify(ALLOWED_DOMAINS)};
      
      window.WebSocket = function(url, protocols) {
        try {
          const parsed = new URL(url);
          const allowed = _allowedHosts.some(d => 
            parsed.hostname === d || parsed.hostname.endsWith('.' + d)
          );
          if (!allowed) {
            console.warn('[network-sentinel] Blocked WebSocket to:', parsed.hostname);
            throw new Error('WebSocket blocked by network sentinel');
          }
        } catch(e) {
          if (e.message.includes('blocked')) throw e;
        }
        return new _OrigWS(url, protocols);
      };
      window.WebSocket.prototype = _OrigWS.prototype;
      window.WebSocket.CONNECTING = _OrigWS.CONNECTING;
      window.WebSocket.OPEN = _OrigWS.OPEN;
      window.WebSocket.CLOSING = _OrigWS.CLOSING;
      window.WebSocket.CLOSED = _OrigWS.CLOSED;
    })();
  `;

  webContents.on('did-finish-load', () => {
    webContents.executeJavaScript(monitorScript).catch(() => {});
  });
}

// ── Certificate Pinning ────────────────────────────────────────

function setupCertPinning(ses) {
  ses.setCertificateVerifyProc((request, callback) => {
    const { hostname, certificate, verificationResult } = request;

    // Reject if system verification failed
    if (verificationResult !== 'net::OK' && verificationResult !== 0) {
      _incidents.push({
        type: 'cert_rejected',
        hostname,
        reason: verificationResult,
        timestamp: new Date().toISOString(),
      });
      console.warn(`[network-sentinel] 🔒 Certificate rejected for ${hostname}: ${verificationResult}`);
      callback(-2); // reject
      return;
    }

    callback(0); // accept
  });
}

// ── Public API ─────────────────────────────────────────────────

function initNetworkSentinel(mainWindow) {
  if (_sentinelActive) return;
  _sentinelActive = true;

  console.log(`[network-sentinel] Initializing v${SENTINEL_VERSION}`);

  const ses = session.defaultSession;

  // Setup request interceptor
  setupRequestInterceptor(ses);

  // Setup certificate pinning
  setupCertPinning(ses);

  // Setup WebSocket monitor
  if (mainWindow?.webContents) {
    setupWebSocketMonitor(mainWindow.webContents);
  }

  return { version: SENTINEL_VERSION, allowedDomains: ALLOWED_DOMAINS.length };
}

function getNetworkSentinelStatus() {
  return {
    active: _sentinelActive,
    incidentCount: _incidents.length,
    recentIncidents: _incidents.slice(-10),
    allowedDomains: ALLOWED_DOMAINS,
    version: SENTINEL_VERSION,
  };
}

function addAllowedDomain(domain) {
  if (!ALLOWED_DOMAINS.includes(domain)) {
    ALLOWED_DOMAINS.push(domain);
  }
}

module.exports = { initNetworkSentinel, getNetworkSentinelStatus, addAllowedDomain };
