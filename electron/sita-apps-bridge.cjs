// ═══════════════════════════════════════════════════════════════
// SITA OS — Native App Bridge (main process side)
// Allowlist-based launch of external desktop apps.
// Wired via electron/main.cjs IPC handlers.
// ═══════════════════════════════════════════════════════════════

const { ipcMain, shell, app } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Allowlist mirrors src/lib/services/native-apps/registry.ts
const NATIVE_APP_ALLOWLIST = [
  { appId: 'chrome-desktop', name: 'Google Chrome',
    darwin: '/Applications/Google Chrome.app', win32: 'chrome.exe', linux: 'google-chrome',
    fallbackUrl: 'https://www.google.com/chrome/' },
  { appId: 'whatsapp-desktop', name: 'WhatsApp Desktop',
    darwin: '/Applications/WhatsApp.app', win32: 'WhatsApp.exe',
    fallbackUrl: 'https://www.whatsapp.com/download' },
  { appId: 'vscode-desktop', name: 'Visual Studio Code',
    darwin: '/Applications/Visual Studio Code.app', win32: 'Code.exe', linux: 'code',
    fallbackUrl: 'https://code.visualstudio.com/' },
  { appId: 'cursor-desktop', name: 'Cursor',
    darwin: '/Applications/Cursor.app', win32: 'Cursor.exe',
    fallbackUrl: 'https://cursor.sh/' },
  { appId: 'spotify-desktop', name: 'Spotify',
    darwin: '/Applications/Spotify.app', win32: 'Spotify.exe',
    fallbackUrl: 'https://www.spotify.com/download/' },
  { appId: 'notion-desktop', name: 'Notion Desktop',
    darwin: '/Applications/Notion.app', win32: 'Notion.exe',
    fallbackUrl: 'https://www.notion.so/desktop' },
];

const URL_ALLOWLIST_HOSTS = new Set([
  'google.com', 'www.google.com',
  'whatsapp.com', 'www.whatsapp.com', 'web.whatsapp.com',
  'openai.com', 'chat.openai.com',
  'mail.google.com', 'calendar.google.com', 'drive.google.com',
  'notion.so', 'www.notion.so',
  'figma.com', 'www.figma.com',
  'github.com',
  'slack.com', 'app.slack.com',
  'spotify.com', 'open.spotify.com', 'www.spotify.com',
  'linear.app',
  'canva.com', 'www.canva.com',
  'youtube.com', 'www.youtube.com',
  'x.com', 'twitter.com',
  'cursor.sh', 'www.cursor.sh',
  'code.visualstudio.com',
]);

function findEntry(appId) {
  return NATIVE_APP_ALLOWLIST.find((a) => a.appId === appId);
}

function resolveTargetForPlatform(entry) {
  switch (process.platform) {
    case 'darwin': return entry.darwin;
    case 'win32': return entry.win32;
    case 'linux': return entry.linux;
    default: return null;
  }
}

function targetExists(target) {
  if (!target) return false;
  if (process.platform === 'darwin') {
    try { return fs.existsSync(target); } catch { return false; }
  }
  // Best-effort: existence check for absolute path; otherwise rely on PATH lookup at spawn time
  if (path.isAbsolute(target)) {
    try { return fs.existsSync(target); } catch { return false; }
  }
  return true;
}

function isUrlAllowlisted(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    return URL_ALLOWLIST_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

function registerSitaAppsBridge() {
  ipcMain.handle('sita-apps:host-capabilities', () => ({
    platform: process.platform,
    canLaunchNative: true,
    allowlistedAppIds: NATIVE_APP_ALLOWLIST.map((a) => a.appId),
  }));

  ipcMain.handle('sita-apps:check-native', async (_evt, appId) => {
    if (typeof appId !== 'string') return { available: false, appId: '', reason: 'invalid_app_id' };
    const entry = findEntry(appId);
    if (!entry) return { available: false, appId, reason: 'not_allowlisted' };
    const target = resolveTargetForPlatform(entry);
    if (!target) return { available: false, appId, reason: 'unsupported_platform' };
    return { available: targetExists(target), appId };
  });

  ipcMain.handle('sita-apps:launch-native', async (_evt, appId) => {
    if (typeof appId !== 'string') return { ok: false, appId: '', reason: 'invalid_app_id' };
    const entry = findEntry(appId);
    if (!entry) return { ok: false, appId, reason: 'not_allowlisted' };

    const target = resolveTargetForPlatform(entry);
    if (!target) {
      return { ok: false, appId, reason: 'unsupported_platform', fallbackUrl: entry.fallbackUrl };
    }

    try {
      if (process.platform === 'darwin' && target.endsWith('.app')) {
        spawn('open', ['-a', target], { detached: true, stdio: 'ignore' }).unref();
      } else {
        spawn(target, [], { detached: true, stdio: 'ignore', shell: false }).unref();
      }
      return { ok: true, appId };
    } catch (e) {
      return { ok: false, appId, reason: e && e.message ? e.message : 'spawn_failed', fallbackUrl: entry.fallbackUrl };
    }
  });

  ipcMain.handle('sita-apps:open-external', async (_evt, url) => {
    if (typeof url !== 'string') return { ok: false, reason: 'invalid_url' };
    if (!isUrlAllowlisted(url)) return { ok: false, reason: 'url_not_allowlisted' };
    try {
      await shell.openExternal(url);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: e && e.message ? e.message : 'open_failed' };
    }
  });
}

module.exports = { registerSitaAppsBridge, NATIVE_APP_ALLOWLIST };
