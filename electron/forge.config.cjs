// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Forge / Packager Configuration
// Code signing and platform-specific packaging settings
// ═══════════════════════════════════════════════════════════════

module.exports = {
  packagerConfig: {
    name: 'SITA OS',
    executableName: 'sita-os',
    appBundleId: 'com.sita.os',
    appVersion: process.env.SITA_VERSION || '1.0.0',
    icon: './public/icons/icon',
    asar: true,
    overwrite: true,
    ignore: [
      /^\/src/,
      /^\/public/,
      /^\/scripts/,
      /^\/deploy/,
      /^\/supabase/,
      /^\/e2e/,
      /^\/tests/,
      /^\/\.github/,
      /^\/electron-release/,
      /^\/node_modules/,
      /\.md$/,
      /\.env/,
    ],

    // macOS code signing
    osxSign: process.env.APPLE_IDENTITY
      ? {
          identity: process.env.APPLE_IDENTITY,
          hardenedRuntime: true,
          entitlements: './electron/entitlements.plist',
          'entitlements-inherit': './electron/entitlements.plist',
          'gatekeeper-assess': false,
        }
      : undefined,

    osxNotarize: process.env.APPLE_ID
      ? {
          appleId: process.env.APPLE_ID,
          appleIdPassword: process.env.APPLE_PASSWORD,
          teamId: process.env.APPLE_TEAM_ID,
        }
      : undefined,

    // Windows code signing
    win32metadata: {
      CompanyName: 'SITA',
      ProductName: 'SITA OS',
      FileDescription: 'SITA OS — Intelligent Operating System',
    },
  },

  // Windows signing via environment
  windowsSign: process.env.CSC_LINK
    ? {
        certificateFile: process.env.CSC_LINK,
        certificatePassword: process.env.CSC_KEY_PASSWORD,
      }
    : undefined,

  makers: [
    // Linux — tar.gz
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux', 'darwin'],
    },
    // Windows — zip
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
  ],
};
