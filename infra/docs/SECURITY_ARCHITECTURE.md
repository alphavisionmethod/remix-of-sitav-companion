# SITA OS — Security Architecture

## 5-Ring Trust Model
| Ring | Name | Scope |
|------|------|-------|
| 0 | Kernel | Scheduler, VMM, interrupt dispatch |
| 1 | Trusted | Signed SITA services (executor, policy, receipts) |
| 2 | Verified | Reviewed third-party apps |
| 3 | Sandboxed | Restricted third-party apps |
| 4 | Untrusted | Unknown/unsigned code |

## Sandboxing
- **Seccomp-BPF**: per-process syscall allowlist filtering
- **Landlock LSM**: filesystem access restriction
- **Namespace isolation**: PID, net, mount, user, IPC, UTS, cgroup
- **Resource limits**: cgroups v2 (CPU, memory, I/O, PIDs)

## Code Signing
- **Algorithms**: Ed25519 (speed), RSA-4096 (compatibility), ECDSA-P256
- **Modes**: enforced (block unsigned), permissive (warn), disabled
- **Boot chain**: UEFI → Shim → Kernel → Initramfs → Runtime verified
- **CRL**: certificate revocation distributed via OTA

## Permissions (3 Layers)
1. **POSIX DAC**: user/group/other
2. **Linux capabilities**: fine-grained privilege decomposition
3. **SITA tokens**: domain-scoped, time-windowed, amount-limited, device-trust-gated

## Runtime Protections
| Protection | Implementation |
|-----------|---------------|
| ASLR | Full kernel + user |
| DEP/NX | Hardware-enforced |
| Stack canaries | `-fstack-protector-strong` |
| CFI | Clang CFI / IBT |
| Shadow stack | CET (Intel) |
| KASLR | Kernel + module randomization |
| Memory tagging | MTE (ARM64 future) |

## Encryption
- **FDE**: LUKS2, AES-256-XTS, Argon2id KDF
- **Key hierarchy**: Master → Volume → File → Transport → Session
- **TPM 2.0 sealing**: keys sealed to PCR values, auto-unseal on measured boot
- **In-transit**: TLS 1.3 mandatory, mTLS for service-to-service
- **Rotation**: 90-day default, emergency rotation on compromise

## Application Isolation
5 levels: none → basic → standard → strict → maximum. Each level progressively adds namespace isolation, filesystem restrictions, resource limits, and network firewalling. Crashes are always isolated — cannot affect other apps or kernel.
