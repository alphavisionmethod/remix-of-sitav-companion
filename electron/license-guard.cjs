// ═══════════════════════════════════════════════════════════════
// SITA OS — License Guard: Hardware Fingerprinting & Validation
// Defense Layer 4+5: Hardware-bound server-validated licensing
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');
const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { net } = require('electron');

// ── Configuration ───────────────────────────────────────────────

const LICENSE_STORE_FILE = path.join(
  require('electron').app.getPath('userData'),
  'license.enc'
);

const HEARTBEAT_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours
const OFFLINE_GRACE_HOURS = 72;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// ── Hardware Fingerprint ────────────────────────────────────────

function generateDeviceFingerprint() {
  const components = [
    os.cpus()[0]?.model || 'unknown-cpu',
    os.totalmem().toString(),
    os.hostname(),
    os.platform(),
    os.arch(),
  ];

  // Try to get disk serial (platform-specific, best-effort)
  try {
    if (os.platform() === 'linux') {
      const serial = execSync('cat /etc/machine-id 2>/dev/null || echo "no-id"', { encoding: 'utf-8' }).trim();
      components.push(serial);
    } else if (os.platform() === 'darwin') {
      const serial = execSync("ioreg -rd1 -c IOPlatformExpertDevice | awk '/IOPlatformSerialNumber/ { print $3 }' | tr -d '\"'", { encoding: 'utf-8' }).trim();
      components.push(serial || 'no-serial');
    } else if (os.platform() === 'win32') {
      const serial = execSync('wmic bios get serialnumber /format:value', { encoding: 'utf-8' }).trim();
      components.push(serial || 'no-serial');
    }
  } catch {
    components.push('no-hw-serial');
  }

  return crypto.createHash('sha256').update(components.join('|')).digest('hex');
}

// ── Encrypted Storage ───────────────────────────────────────────

const ENCRYPTION_KEY = crypto.createHash('sha256')
  .update(`sita-os-${os.hostname()}-${os.userInfo().username}`)
  .digest();

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(data) {
  const [ivHex, encrypted] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function loadStoredLicense() {
  try {
    if (!fs.existsSync(LICENSE_STORE_FILE)) return null;
    const raw = fs.readFileSync(LICENSE_STORE_FILE, 'utf-8');
    return JSON.parse(decrypt(raw));
  } catch {
    return null;
  }
}

function saveLicense(data) {
  const dir = path.dirname(LICENSE_STORE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LICENSE_STORE_FILE, encrypt(JSON.stringify(data)));
}

function clearStoredLicense() {
  try {
    if (fs.existsSync(LICENSE_STORE_FILE)) fs.unlinkSync(LICENSE_STORE_FILE);
  } catch { /* ignore */ }
}

// ── Server Communication ────────────────────────────────────────

async function callLicenseGateway(action, payload) {
  const url = `${SUPABASE_URL}/functions/v1/license-gateway`;
  
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: 'POST',
      url,
    });

    request.setHeader('Content-Type', 'application/json');
    request.setHeader('apikey', SUPABASE_ANON_KEY);

    let responseData = '';

    request.on('response', (response) => {
      response.on('data', (chunk) => { responseData += chunk.toString(); });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (response.statusCode >= 400) {
            reject(new Error(parsed.error || `Server error ${response.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error('Invalid server response'));
        }
      });
    });

    request.on('error', reject);
    request.write(JSON.stringify({ action, ...payload }));
    request.end();
  });
}

// ── License Validation ──────────────────────────────────────────

let heartbeatTimer = null;

async function activateLicense(licenseKey) {
  const fingerprint = generateDeviceFingerprint();
  const deviceName = os.hostname();
  const platform = `${os.platform()}-${os.arch()}`;

  const result = await callLicenseGateway('activate', {
    license_key: licenseKey,
    device_fingerprint: fingerprint,
    device_name: deviceName,
    platform,
  });

  if (result.activated) {
    saveLicense({
      license_key: licenseKey,
      device_fingerprint: fingerprint,
      activation_token: result.activation_token,
      activated_at: new Date().toISOString(),
      last_validated: new Date().toISOString(),
      product_tier: result.product_tier || 'standard',
    });
  }

  return result;
}

async function validateLicense() {
  const stored = loadStoredLicense();
  if (!stored) return { valid: false, reason: 'no_license' };

  const fingerprint = generateDeviceFingerprint();
  if (stored.device_fingerprint !== fingerprint) {
    clearStoredLicense();
    return { valid: false, reason: 'fingerprint_mismatch' };
  }

  // Check offline grace period
  const lastValidated = new Date(stored.last_validated);
  const hoursSince = (Date.now() - lastValidated.getTime()) / (1000 * 60 * 60);

  try {
    const result = await callLicenseGateway('validate', {
      license_key: stored.license_key,
      device_fingerprint: fingerprint,
    });

    if (result.valid) {
      stored.last_validated = new Date().toISOString();
      saveLicense(stored);
    }

    return result;
  } catch {
    // Offline — check grace period
    if (hoursSince < OFFLINE_GRACE_HOURS) {
      return { valid: true, reason: 'offline_grace', hours_remaining: OFFLINE_GRACE_HOURS - hoursSince };
    }
    return { valid: false, reason: 'offline_expired' };
  }
}

async function sendHeartbeat() {
  const stored = loadStoredLicense();
  if (!stored) return;

  const fingerprint = generateDeviceFingerprint();

  try {
    const result = await callLicenseGateway('heartbeat', {
      license_key: stored.license_key,
      device_fingerprint: fingerprint,
    });

    if (result.valid) {
      stored.last_validated = new Date().toISOString();
      saveLicense(stored);
    } else {
      // License revoked or exceeded — emit event
      console.warn('[license-guard] Heartbeat failed:', result.reason);
    }

    return result;
  } catch (err) {
    console.warn('[license-guard] Heartbeat network error:', err.message);
    return null;
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => sendHeartbeat(), HEARTBEAT_INTERVAL_MS);
  // First heartbeat after 1 minute
  setTimeout(() => sendHeartbeat(), 60_000);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

async function deactivateLicense() {
  const stored = loadStoredLicense();
  if (!stored) return { success: true };

  try {
    await callLicenseGateway('deactivate', {
      license_key: stored.license_key,
      device_fingerprint: stored.device_fingerprint,
    });
  } catch { /* best-effort */ }

  clearStoredLicense();
  stopHeartbeat();
  return { success: true };
}

function getLicenseInfo() {
  const stored = loadStoredLicense();
  if (!stored) return null;
  return {
    license_key: stored.license_key.slice(0, 8) + '...',
    product_tier: stored.product_tier,
    activated_at: stored.activated_at,
    last_validated: stored.last_validated,
  };
}

function isLicensed() {
  return loadStoredLicense() !== null;
}

// ── Exports ─────────────────────────────────────────────────────

module.exports = {
  generateDeviceFingerprint,
  activateLicense,
  validateLicense,
  sendHeartbeat,
  startHeartbeat,
  stopHeartbeat,
  deactivateLicense,
  getLicenseInfo,
  isLicensed,
  loadStoredLicense,
  clearStoredLicense,
};
