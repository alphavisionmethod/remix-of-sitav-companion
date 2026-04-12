

# Add `designVersion: 'nova-1.0'` to All App Manifests

## What We're Doing

Adding the required `designVersion: 'nova-1.0'` field to all 5 app manifests so they pass the design contract validation in `design-contract.ts`. Also updating the 2 dynamic/test manifest sites for consistency.

## Files to Modify

| File | Manifest | Line to Add After |
|------|----------|---|
| `src/components/sita/shell/windows/NovaTerminal.tsx` | `NOVA_TERMINAL_MANIFEST` | After `description` (line 29) |
| `src/components/sita/shell/windows/NotesWindow.tsx` | `NOTES_MANIFEST` | After `description` (line 35) |
| `src/components/sita/shell/windows/CalendarWindow.tsx` | `CALENDAR_MANIFEST` | After `description` (line 30) |
| `src/components/sita/shell/windows/WeatherWindow.tsx` | `WEATHER_MANIFEST` | After `description` (line 23) |
| `src/components/sita/shell/windows/TerminalWindow.tsx` | `TERMINAL_MANIFEST` | After `description` (line 24) |
| `src/components/sita/ShellLayout.tsx` | Dynamic manifest in `launchWithKernel` | After `windowDefaults` (line 240) |
| `src/lib/nova-sdk/kernel/__tests__/syscall.test.ts` | Test helper `spawnUserProcess` | After `windowDefaults` (line 40) |

Each change is a single line addition: `designVersion: "nova-1.0",`

