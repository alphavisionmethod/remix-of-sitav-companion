// ═══════════════════════════════════════════════════════════════
// native-apps/registry — allowlist of launchable native apps
// (Mirror of the Electron-side allowlist for renderer-side gating)
// ═══════════════════════════════════════════════════════════════

export interface NativeAppEntry {
  appId: string;
  name: string;
  darwin?: string;
  win32?: string;
  linux?: string;
  fallbackUrl?: string;
}

export const NATIVE_APP_ALLOWLIST: readonly NativeAppEntry[] = [
  {
    appId: "chrome-desktop",
    name: "Google Chrome",
    darwin: "/Applications/Google Chrome.app",
    win32: "chrome.exe",
    linux: "google-chrome",
    fallbackUrl: "https://www.google.com/chrome/",
  },
  {
    appId: "whatsapp-desktop",
    name: "WhatsApp Desktop",
    darwin: "/Applications/WhatsApp.app",
    win32: "WhatsApp.exe",
    fallbackUrl: "https://www.whatsapp.com/download",
  },
  {
    appId: "vscode-desktop",
    name: "Visual Studio Code",
    darwin: "/Applications/Visual Studio Code.app",
    win32: "Code.exe",
    linux: "code",
    fallbackUrl: "https://code.visualstudio.com/",
  },
  {
    appId: "cursor-desktop",
    name: "Cursor",
    darwin: "/Applications/Cursor.app",
    win32: "Cursor.exe",
    fallbackUrl: "https://cursor.sh/",
  },
  {
    appId: "spotify-desktop",
    name: "Spotify",
    darwin: "/Applications/Spotify.app",
    win32: "Spotify.exe",
    fallbackUrl: "https://www.spotify.com/download/",
  },
  {
    appId: "notion-desktop",
    name: "Notion Desktop",
    darwin: "/Applications/Notion.app",
    win32: "Notion.exe",
    fallbackUrl: "https://www.notion.so/desktop",
  },
] as const;

export function getNativeAppEntry(appId: string): NativeAppEntry | undefined {
  return NATIVE_APP_ALLOWLIST.find((a) => a.appId === appId);
}

export function isAllowlistedNativeApp(appId: string): boolean {
  return NATIVE_APP_ALLOWLIST.some((a) => a.appId === appId);
}
