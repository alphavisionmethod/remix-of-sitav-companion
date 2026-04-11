# SITA OS — SitaFS & VFS Architecture

## SitaFS
Copy-on-write, journaled, snapshot-capable filesystem.

- **Structure**: CoW B-tree (inspired by Btrfs/ZFS)
- **Journaling**: metadata write-ahead log, bounded at 10K entries
- **Snapshots**: instant CoW snapshots (nearly zero cost), used for A/B rollback
- **Integrity**: per-file SHA-256 checksums verified on read
- **Compression**: LZ4 (fast), ZSTD (ratio) — per-file configurable
- **Extended attributes**: arbitrary key-value metadata per inode
- **Proof integration**: file mutations emit filesystem receipts via journal

## VFS Layer
Unified mount abstraction supporting multiple filesystem types:

| Mount Point | Type | Purpose |
|------------|------|---------|
| `/` | sitafs | Root filesystem |
| `/boot/efi` | fat32 | EFI System Partition (read-only) |
| `/proc` | procfs | Process information |
| `/sys` | sysfs | Kernel/device information |
| `/dev` | devfs | Device nodes |
| `/tmp` | tmpfs | Temporary storage |

## Inode Flags
- `immutable`: cannot be modified
- `appendOnly`: can only append
- `encrypted`: per-file encryption
- `copyOnWrite`: CoW enabled (default)
- `noAtime`: skip access time updates
