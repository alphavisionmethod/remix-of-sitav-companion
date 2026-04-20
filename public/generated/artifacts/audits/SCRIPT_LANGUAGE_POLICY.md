# Script Language Policy

## Preferred Languages

| Language | Use For | New Scripts |
|----------|---------|-------------|
| **TypeScript** | Repo analysis, JSON generation, validation, CI checks | ✅ Default |
| **Shell (.sh)** | Linux packaging, ISO/OVA, system ops | When POSIX required |
| **PowerShell (.ps1)** | Windows parity wrappers | Only when needed |
| **JavaScript (.js/.mjs)** | Legacy codemod compatibility | Avoid for new scripts |

## Rules

- No new duplicate TS/PS1/SH implementations of the same check unless justified and registered
- All new permanent scripts must be TypeScript
- Shell scripts only for system-level packaging requiring POSIX tools
- PowerShell only for Windows CI runner parity
