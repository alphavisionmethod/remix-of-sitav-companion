// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: System Call Table & ABI
// ~120 syscalls across 7 categories
// ABI: x86_64 System V — syscall instruction
//   Args: rdi, rsi, rdx, r10, r8, r9 — Return: rax
// ═══════════════════════════════════════════════════════════════

export type SyscallCategory = "process" | "memory" | "filesystem" | "ipc" | "security" | "device" | "proof";

export interface SyscallDefinition {
  number: number;
  name: string;
  category: SyscallCategory;
  args: { name: string; type: string; register: string }[];
  returnType: string;
  description: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresCapability: string | null;
  audited: boolean;
}

// ── Full Syscall Table ─────────────────────────────────────────

export const SYSCALL_TABLE: SyscallDefinition[] = [
  // ── Process (0-19) ───────────────────────────────────────────
  { number: 0, name: "sys_spawn", category: "process", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "argv", type: "char**", register: "rsi" }, { name: "envp", type: "char**", register: "rdx" }], returnType: "pid_t", description: "Spawn a new process", riskLevel: "medium", requiresCapability: "CAP_PROC_SPAWN", audited: true },
  { number: 1, name: "sys_exit", category: "process", args: [{ name: "status", type: "int", register: "rdi" }], returnType: "void", description: "Terminate current process", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 2, name: "sys_wait", category: "process", args: [{ name: "pid", type: "pid_t", register: "rdi" }, { name: "status", type: "int*", register: "rsi" }], returnType: "pid_t", description: "Wait for child process", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 3, name: "sys_yield", category: "process", args: [], returnType: "void", description: "Yield CPU voluntarily", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 4, name: "sys_set_priority", category: "process", args: [{ name: "pid", type: "pid_t", register: "rdi" }, { name: "priority", type: "int", register: "rsi" }], returnType: "int", description: "Set process priority", riskLevel: "high", requiresCapability: "CAP_SYS_NICE", audited: true },
  { number: 5, name: "sys_getpid", category: "process", args: [], returnType: "pid_t", description: "Get current PID", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 6, name: "sys_getppid", category: "process", args: [], returnType: "pid_t", description: "Get parent PID", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 7, name: "sys_fork", category: "process", args: [], returnType: "pid_t", description: "Fork current process (CoW)", riskLevel: "medium", requiresCapability: "CAP_PROC_SPAWN", audited: true },
  { number: 8, name: "sys_exec", category: "process", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "argv", type: "char**", register: "rsi" }], returnType: "int", description: "Replace process image", riskLevel: "high", requiresCapability: "CAP_PROC_EXEC", audited: true },
  { number: 9, name: "sys_thread_create", category: "process", args: [{ name: "entry", type: "void*", register: "rdi" }, { name: "stack", type: "void*", register: "rsi" }, { name: "arg", type: "void*", register: "rdx" }], returnType: "tid_t", description: "Create thread", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 10, name: "sys_thread_exit", category: "process", args: [{ name: "retval", type: "void*", register: "rdi" }], returnType: "void", description: "Exit thread", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 11, name: "sys_thread_join", category: "process", args: [{ name: "tid", type: "tid_t", register: "rdi" }], returnType: "int", description: "Join thread", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 12, name: "sys_sleep", category: "process", args: [{ name: "ns", type: "uint64_t", register: "rdi" }], returnType: "int", description: "Sleep for nanoseconds", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 13, name: "sys_kill", category: "process", args: [{ name: "pid", type: "pid_t", register: "rdi" }, { name: "sig", type: "int", register: "rsi" }], returnType: "int", description: "Send signal to process", riskLevel: "high", requiresCapability: "CAP_SIGNAL", audited: true },
  { number: 14, name: "sys_setns", category: "process", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "nstype", type: "int", register: "rsi" }], returnType: "int", description: "Set namespace", riskLevel: "critical", requiresCapability: "CAP_SYS_ADMIN", audited: true },
  { number: 15, name: "sys_clone", category: "process", args: [{ name: "flags", type: "uint64_t", register: "rdi" }, { name: "stack", type: "void*", register: "rsi" }], returnType: "pid_t", description: "Clone with flags", riskLevel: "high", requiresCapability: "CAP_PROC_SPAWN", audited: true },
  { number: 16, name: "sys_getuid", category: "process", args: [], returnType: "uid_t", description: "Get user ID", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 17, name: "sys_setuid", category: "process", args: [{ name: "uid", type: "uid_t", register: "rdi" }], returnType: "int", description: "Set user ID", riskLevel: "critical", requiresCapability: "CAP_SETUID", audited: true },

  // ── Memory (20-39) ──────────────────────────────────────────
  { number: 20, name: "sys_mmap", category: "memory", args: [{ name: "addr", type: "void*", register: "rdi" }, { name: "length", type: "size_t", register: "rsi" }, { name: "prot", type: "int", register: "rdx" }, { name: "flags", type: "int", register: "r10" }], returnType: "void*", description: "Map memory region", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 21, name: "sys_munmap", category: "memory", args: [{ name: "addr", type: "void*", register: "rdi" }, { name: "length", type: "size_t", register: "rsi" }], returnType: "int", description: "Unmap memory region", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 22, name: "sys_mprotect", category: "memory", args: [{ name: "addr", type: "void*", register: "rdi" }, { name: "length", type: "size_t", register: "rsi" }, { name: "prot", type: "int", register: "rdx" }], returnType: "int", description: "Set memory protection", riskLevel: "high", requiresCapability: null, audited: true },
  { number: 23, name: "sys_brk", category: "memory", args: [{ name: "addr", type: "void*", register: "rdi" }], returnType: "void*", description: "Adjust program break", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 24, name: "sys_mlock", category: "memory", args: [{ name: "addr", type: "void*", register: "rdi" }, { name: "length", type: "size_t", register: "rsi" }], returnType: "int", description: "Lock pages in memory", riskLevel: "medium", requiresCapability: "CAP_IPC_LOCK", audited: false },
  { number: 25, name: "sys_munlock", category: "memory", args: [{ name: "addr", type: "void*", register: "rdi" }, { name: "length", type: "size_t", register: "rsi" }], returnType: "int", description: "Unlock pages", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 26, name: "sys_madvise", category: "memory", args: [{ name: "addr", type: "void*", register: "rdi" }, { name: "length", type: "size_t", register: "rsi" }, { name: "advice", type: "int", register: "rdx" }], returnType: "int", description: "Memory access advice", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 27, name: "sys_mincore", category: "memory", args: [{ name: "addr", type: "void*", register: "rdi" }, { name: "length", type: "size_t", register: "rsi" }, { name: "vec", type: "uint8_t*", register: "rdx" }], returnType: "int", description: "Check page residency", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 28, name: "sys_mremap", category: "memory", args: [{ name: "old_addr", type: "void*", register: "rdi" }, { name: "old_size", type: "size_t", register: "rsi" }, { name: "new_size", type: "size_t", register: "rdx" }], returnType: "void*", description: "Remap memory region", riskLevel: "medium", requiresCapability: null, audited: false },

  // ── Filesystem (40-69) ──────────────────────────────────────
  { number: 40, name: "sys_open", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "flags", type: "int", register: "rsi" }, { name: "mode", type: "mode_t", register: "rdx" }], returnType: "int", description: "Open file", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 41, name: "sys_close", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }], returnType: "int", description: "Close file descriptor", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 42, name: "sys_read", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "buf", type: "void*", register: "rsi" }, { name: "count", type: "size_t", register: "rdx" }], returnType: "ssize_t", description: "Read from FD", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 43, name: "sys_write", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "buf", type: "const void*", register: "rsi" }, { name: "count", type: "size_t", register: "rdx" }], returnType: "ssize_t", description: "Write to FD", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 44, name: "sys_stat", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "buf", type: "struct stat*", register: "rsi" }], returnType: "int", description: "Get file status", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 45, name: "sys_lseek", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "offset", type: "off_t", register: "rsi" }, { name: "whence", type: "int", register: "rdx" }], returnType: "off_t", description: "Seek in file", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 46, name: "sys_mkdir", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "mode", type: "mode_t", register: "rsi" }], returnType: "int", description: "Create directory", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 47, name: "sys_rmdir", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }], returnType: "int", description: "Remove directory", riskLevel: "medium", requiresCapability: null, audited: true },
  { number: 48, name: "sys_unlink", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }], returnType: "int", description: "Delete file", riskLevel: "medium", requiresCapability: null, audited: true },
  { number: 49, name: "sys_rename", category: "filesystem", args: [{ name: "oldpath", type: "const char*", register: "rdi" }, { name: "newpath", type: "const char*", register: "rsi" }], returnType: "int", description: "Rename file", riskLevel: "medium", requiresCapability: null, audited: true },
  { number: 50, name: "sys_chmod", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "mode", type: "mode_t", register: "rsi" }], returnType: "int", description: "Change permissions", riskLevel: "high", requiresCapability: null, audited: true },
  { number: 51, name: "sys_chown", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "uid", type: "uid_t", register: "rsi" }, { name: "gid", type: "gid_t", register: "rdx" }], returnType: "int", description: "Change ownership", riskLevel: "high", requiresCapability: "CAP_CHOWN", audited: true },
  { number: 52, name: "sys_link", category: "filesystem", args: [{ name: "oldpath", type: "const char*", register: "rdi" }, { name: "newpath", type: "const char*", register: "rsi" }], returnType: "int", description: "Create hard link", riskLevel: "medium", requiresCapability: null, audited: true },
  { number: 53, name: "sys_symlink", category: "filesystem", args: [{ name: "target", type: "const char*", register: "rdi" }, { name: "linkpath", type: "const char*", register: "rsi" }], returnType: "int", description: "Create symlink", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 54, name: "sys_readlink", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "buf", type: "char*", register: "rsi" }, { name: "bufsiz", type: "size_t", register: "rdx" }], returnType: "ssize_t", description: "Read symlink target", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 55, name: "sys_getdents", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "dirp", type: "void*", register: "rsi" }, { name: "count", type: "size_t", register: "rdx" }], returnType: "int", description: "Read directory entries", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 56, name: "sys_mount", category: "filesystem", args: [{ name: "source", type: "const char*", register: "rdi" }, { name: "target", type: "const char*", register: "rsi" }, { name: "fstype", type: "const char*", register: "rdx" }], returnType: "int", description: "Mount filesystem", riskLevel: "critical", requiresCapability: "CAP_SYS_ADMIN", audited: true },
  { number: 57, name: "sys_umount", category: "filesystem", args: [{ name: "target", type: "const char*", register: "rdi" }], returnType: "int", description: "Unmount filesystem", riskLevel: "critical", requiresCapability: "CAP_SYS_ADMIN", audited: true },
  { number: 58, name: "sys_snapshot", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "name", type: "const char*", register: "rsi" }], returnType: "int", description: "Create CoW filesystem snapshot", riskLevel: "medium", requiresCapability: "CAP_FS_SNAPSHOT", audited: true },
  { number: 59, name: "sys_fsync", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }], returnType: "int", description: "Sync file to disk", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 60, name: "sys_truncate", category: "filesystem", args: [{ name: "path", type: "const char*", register: "rdi" }, { name: "length", type: "off_t", register: "rsi" }], returnType: "int", description: "Truncate file", riskLevel: "medium", requiresCapability: null, audited: true },
  { number: 61, name: "sys_dup", category: "filesystem", args: [{ name: "oldfd", type: "int", register: "rdi" }], returnType: "int", description: "Duplicate file descriptor", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 62, name: "sys_pipe", category: "filesystem", args: [{ name: "pipefd", type: "int[2]", register: "rdi" }], returnType: "int", description: "Create pipe", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 63, name: "sys_ioctl", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "request", type: "uint64_t", register: "rsi" }, { name: "arg", type: "void*", register: "rdx" }], returnType: "int", description: "Device control", riskLevel: "high", requiresCapability: null, audited: true },
  { number: 64, name: "sys_fcntl", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "cmd", type: "int", register: "rsi" }, { name: "arg", type: "uint64_t", register: "rdx" }], returnType: "int", description: "File control", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 65, name: "sys_flock", category: "filesystem", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "operation", type: "int", register: "rsi" }], returnType: "int", description: "File lock", riskLevel: "medium", requiresCapability: null, audited: false },

  // ── IPC (70-89) ─────────────────────────────────────────────
  { number: 70, name: "sys_send", category: "ipc", args: [{ name: "port_id", type: "uint64_t", register: "rdi" }, { name: "msg", type: "const void*", register: "rsi" }, { name: "len", type: "size_t", register: "rdx" }, { name: "cap_id", type: "uint64_t", register: "r10" }], returnType: "int", description: "Send IPC message", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 71, name: "sys_recv", category: "ipc", args: [{ name: "port_id", type: "uint64_t", register: "rdi" }, { name: "buf", type: "void*", register: "rsi" }, { name: "len", type: "size_t", register: "rdx" }], returnType: "ssize_t", description: "Receive IPC message", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 72, name: "sys_shm_create", category: "ipc", args: [{ name: "name", type: "const char*", register: "rdi" }, { name: "size", type: "size_t", register: "rsi" }], returnType: "int", description: "Create shared memory", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 73, name: "sys_shm_attach", category: "ipc", args: [{ name: "shm_id", type: "int", register: "rdi" }, { name: "addr", type: "void*", register: "rsi" }], returnType: "void*", description: "Attach to shared memory", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 74, name: "sys_shm_detach", category: "ipc", args: [{ name: "addr", type: "void*", register: "rdi" }], returnType: "int", description: "Detach shared memory", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 75, name: "sys_signal", category: "ipc", args: [{ name: "pid", type: "pid_t", register: "rdi" }, { name: "sig", type: "int", register: "rsi" }], returnType: "int", description: "Send signal", riskLevel: "high", requiresCapability: "CAP_SIGNAL", audited: true },
  { number: 76, name: "sys_sigaction", category: "ipc", args: [{ name: "sig", type: "int", register: "rdi" }, { name: "act", type: "const struct sigaction*", register: "rsi" }, { name: "oldact", type: "struct sigaction*", register: "rdx" }], returnType: "int", description: "Set signal handler", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 77, name: "sys_port_create", category: "ipc", args: [{ name: "name", type: "const char*", register: "rdi" }, { name: "capacity", type: "size_t", register: "rsi" }], returnType: "int", description: "Create message port", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 78, name: "sys_port_destroy", category: "ipc", args: [{ name: "port_id", type: "uint64_t", register: "rdi" }], returnType: "int", description: "Destroy message port", riskLevel: "medium", requiresCapability: null, audited: false },
  { number: 79, name: "sys_select", category: "ipc", args: [{ name: "nfds", type: "int", register: "rdi" }, { name: "readfds", type: "fd_set*", register: "rsi" }, { name: "writefds", type: "fd_set*", register: "rdx" }], returnType: "int", description: "Multiplex I/O", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 80, name: "sys_poll", category: "ipc", args: [{ name: "fds", type: "struct pollfd*", register: "rdi" }, { name: "nfds", type: "nfds_t", register: "rsi" }, { name: "timeout", type: "int", register: "rdx" }], returnType: "int", description: "Poll file descriptors", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 81, name: "sys_epoll_create", category: "ipc", args: [{ name: "size", type: "int", register: "rdi" }], returnType: "int", description: "Create epoll instance", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 82, name: "sys_epoll_ctl", category: "ipc", args: [{ name: "epfd", type: "int", register: "rdi" }, { name: "op", type: "int", register: "rsi" }, { name: "fd", type: "int", register: "rdx" }], returnType: "int", description: "Control epoll", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 83, name: "sys_eventfd", category: "ipc", args: [{ name: "initval", type: "uint64_t", register: "rdi" }], returnType: "int", description: "Create event file descriptor", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 84, name: "sys_futex", category: "ipc", args: [{ name: "addr", type: "uint32_t*", register: "rdi" }, { name: "op", type: "int", register: "rsi" }, { name: "val", type: "uint32_t", register: "rdx" }], returnType: "int", description: "Fast userspace mutex", riskLevel: "low", requiresCapability: null, audited: false },

  // ── Security (90-109) ───────────────────────────────────────
  { number: 90, name: "sys_cap_grant", category: "security", args: [{ name: "target_pid", type: "pid_t", register: "rdi" }, { name: "cap_type", type: "int", register: "rsi" }, { name: "resource", type: "const char*", register: "rdx" }], returnType: "int", description: "Grant capability", riskLevel: "critical", requiresCapability: "CAP_ADMIN", audited: true },
  { number: 91, name: "sys_cap_revoke", category: "security", args: [{ name: "cap_id", type: "uint64_t", register: "rdi" }], returnType: "int", description: "Revoke capability", riskLevel: "high", requiresCapability: "CAP_ADMIN", audited: true },
  { number: 92, name: "sys_cap_check", category: "security", args: [{ name: "cap_id", type: "uint64_t", register: "rdi" }, { name: "action", type: "int", register: "rsi" }], returnType: "int", description: "Check capability validity", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 93, name: "sys_seal", category: "security", args: [{ name: "fd", type: "int", register: "rdi" }, { name: "seals", type: "uint32_t", register: "rsi" }], returnType: "int", description: "Seal file descriptor", riskLevel: "medium", requiresCapability: null, audited: true },
  { number: 94, name: "sys_seccomp", category: "security", args: [{ name: "op", type: "uint32_t", register: "rdi" }, { name: "flags", type: "uint32_t", register: "rsi" }, { name: "args", type: "void*", register: "rdx" }], returnType: "int", description: "Install seccomp filter", riskLevel: "high", requiresCapability: null, audited: true },
  { number: 95, name: "sys_landlock_create", category: "security", args: [{ name: "attr", type: "const void*", register: "rdi" }, { name: "size", type: "size_t", register: "rsi" }], returnType: "int", description: "Create Landlock ruleset", riskLevel: "high", requiresCapability: null, audited: true },
  { number: 96, name: "sys_landlock_add_rule", category: "security", args: [{ name: "ruleset_fd", type: "int", register: "rdi" }, { name: "rule_type", type: "int", register: "rsi" }, { name: "rule_attr", type: "void*", register: "rdx" }], returnType: "int", description: "Add Landlock rule", riskLevel: "high", requiresCapability: null, audited: true },
  { number: 97, name: "sys_landlock_enforce", category: "security", args: [{ name: "ruleset_fd", type: "int", register: "rdi" }], returnType: "int", description: "Enforce Landlock ruleset", riskLevel: "critical", requiresCapability: null, audited: true },
  { number: 98, name: "sys_prctl", category: "security", args: [{ name: "option", type: "int", register: "rdi" }, { name: "arg2", type: "uint64_t", register: "rsi" }], returnType: "int", description: "Process control", riskLevel: "high", requiresCapability: null, audited: true },
  { number: 99, name: "sys_setgroups", category: "security", args: [{ name: "size", type: "size_t", register: "rdi" }, { name: "list", type: "gid_t*", register: "rsi" }], returnType: "int", description: "Set supplementary groups", riskLevel: "high", requiresCapability: "CAP_SETGID", audited: true },
  { number: 100, name: "sys_getgroups", category: "security", args: [{ name: "size", type: "size_t", register: "rdi" }, { name: "list", type: "gid_t*", register: "rsi" }], returnType: "int", description: "Get supplementary groups", riskLevel: "low", requiresCapability: null, audited: false },
  { number: 101, name: "sys_pivot_root", category: "security", args: [{ name: "new_root", type: "const char*", register: "rdi" }, { name: "put_old", type: "const char*", register: "rsi" }], returnType: "int", description: "Change root filesystem", riskLevel: "critical", requiresCapability: "CAP_SYS_ADMIN", audited: true },
  { number: 102, name: "sys_chroot", category: "security", args: [{ name: "path", type: "const char*", register: "rdi" }], returnType: "int", description: "Change root directory", riskLevel: "critical", requiresCapability: "CAP_SYS_CHROOT", audited: true },
  { number: 103, name: "sys_unshare", category: "security", args: [{ name: "flags", type: "int", register: "rdi" }], returnType: "int", description: "Unshare namespaces", riskLevel: "high", requiresCapability: "CAP_SYS_ADMIN", audited: true },
  { number: 104, name: "sys_keyctl", category: "security", args: [{ name: "operation", type: "int", register: "rdi" }, { name: "arg2", type: "uint64_t", register: "rsi" }], returnType: "long", description: "Kernel key management", riskLevel: "high", requiresCapability: null, audited: true },

  // ── Device (110-119) ────────────────────────────────────────
  { number: 110, name: "sys_dma_alloc", category: "device", args: [{ name: "size", type: "size_t", register: "rdi" }, { name: "flags", type: "int", register: "rsi" }], returnType: "void*", description: "Allocate DMA buffer", riskLevel: "high", requiresCapability: "CAP_DMA", audited: true },
  { number: 111, name: "sys_dma_free", category: "device", args: [{ name: "addr", type: "void*", register: "rdi" }], returnType: "int", description: "Free DMA buffer", riskLevel: "medium", requiresCapability: "CAP_DMA", audited: false },
  { number: 112, name: "sys_irq_register", category: "device", args: [{ name: "irq", type: "int", register: "rdi" }, { name: "handler", type: "void*", register: "rsi" }], returnType: "int", description: "Register IRQ handler", riskLevel: "critical", requiresCapability: "CAP_IRQ", audited: true },
  { number: 113, name: "sys_irq_unregister", category: "device", args: [{ name: "irq", type: "int", register: "rdi" }], returnType: "int", description: "Unregister IRQ handler", riskLevel: "high", requiresCapability: "CAP_IRQ", audited: true },
  { number: 114, name: "sys_mmio_map", category: "device", args: [{ name: "phys_addr", type: "uint64_t", register: "rdi" }, { name: "size", type: "size_t", register: "rsi" }], returnType: "void*", description: "Map MMIO region", riskLevel: "critical", requiresCapability: "CAP_MMIO", audited: true },
  { number: 115, name: "sys_device_probe", category: "device", args: [{ name: "bus", type: "int", register: "rdi" }], returnType: "int", description: "Probe bus for devices", riskLevel: "medium", requiresCapability: "CAP_DEVICE", audited: true },

  // ── Proof (120-129) ─────────────────────────────────────────
  { number: 120, name: "sys_receipt_emit", category: "proof", args: [{ name: "receipt", type: "const void*", register: "rdi" }, { name: "len", type: "size_t", register: "rsi" }], returnType: "int", description: "Emit execution receipt", riskLevel: "medium", requiresCapability: null, audited: true },
  { number: 121, name: "sys_attest", category: "proof", args: [{ name: "nonce", type: "const void*", register: "rdi" }, { name: "quote", type: "void*", register: "rsi" }, { name: "quote_len", type: "size_t*", register: "rdx" }], returnType: "int", description: "Generate TPM attestation quote", riskLevel: "high", requiresCapability: "CAP_ATTEST", audited: true },
  { number: 122, name: "sys_measure", category: "proof", args: [{ name: "pcr", type: "int", register: "rdi" }, { name: "data", type: "const void*", register: "rsi" }, { name: "len", type: "size_t", register: "rdx" }], returnType: "int", description: "Extend PCR measurement", riskLevel: "critical", requiresCapability: "CAP_MEASURE", audited: true },
  { number: 123, name: "sys_proof_chain_append", category: "proof", args: [{ name: "entry", type: "const void*", register: "rdi" }, { name: "len", type: "size_t", register: "rsi" }], returnType: "int", description: "Append to proof chain", riskLevel: "medium", requiresCapability: null, audited: true },
  { number: 124, name: "sys_proof_chain_verify", category: "proof", args: [{ name: "chain_id", type: "uint64_t", register: "rdi" }], returnType: "int", description: "Verify proof chain integrity", riskLevel: "low", requiresCapability: null, audited: true },
  { number: 125, name: "sys_audit_log", category: "proof", args: [{ name: "msg", type: "const char*", register: "rdi" }, { name: "len", type: "size_t", register: "rsi" }, { name: "level", type: "int", register: "rdx" }], returnType: "int", description: "Write to immutable audit log", riskLevel: "medium", requiresCapability: null, audited: true },
];

// ── Lookup Helpers ─────────────────────────────────────────────

export function getSyscallByNumber(num: number): SyscallDefinition | undefined {
  return SYSCALL_TABLE.find(s => s.number === num);
}

export function getSyscallByName(name: string): SyscallDefinition | undefined {
  return SYSCALL_TABLE.find(s => s.name === name);
}

export function getSyscallsByCategory(cat: SyscallCategory): SyscallDefinition[] {
  return SYSCALL_TABLE.filter(s => s.category === cat);
}

export function getAuditedSyscalls(): SyscallDefinition[] {
  return SYSCALL_TABLE.filter(s => s.audited);
}

export function getCriticalSyscalls(): SyscallDefinition[] {
  return SYSCALL_TABLE.filter(s => s.riskLevel === "critical");
}

export function getSyscallStats() {
  const byCategory: Record<string, number> = {};
  const byRisk: Record<string, number> = {};
  for (const s of SYSCALL_TABLE) {
    byCategory[s.category] = (byCategory[s.category] ?? 0) + 1;
    byRisk[s.riskLevel] = (byRisk[s.riskLevel] ?? 0) + 1;
  }
  return {
    total: SYSCALL_TABLE.length,
    byCategory,
    byRisk,
    audited: SYSCALL_TABLE.filter(s => s.audited).length,
    requiresCapability: SYSCALL_TABLE.filter(s => s.requiresCapability).length,
  };
}
