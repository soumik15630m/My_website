import { Project, Achievement, Note, NavItem } from './types';

export const PROFILE = {
  name: "Alex V.",
  handle: "0x1A",
  role: "Systems Engineer",
  tagline: "Building high-performance systems with zero-cost abstractions.",
  location: "San Francisco, CA",
  availability: "Open to select contract work",
  email: "alex@example.com",
  github: "https://github.com/example",
  about: `
    I specialize in low-level systems programming, focusing on memory safety, concurrency, and distributed consistency.
    My work prioritizes correctness and performance over feature bloat. I write C++, Rust, and occasionally Go when the garbage collector is forgiven.
    
    Currently exploring lock-free data structures and custom allocators for real-time audio processing.
  `
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '_home' },
  { id: 'projects', label: '_projects' },
  { id: 'achievements', label: '_achievements' },
  { id: 'notes', label: '_log' },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: "Vortex Allocator",
    description: "A slab allocator designed for high-concurrency environments with minimal fragmentation.",
    problemStatement: "Standard malloc/free implementations introduced unpredictable latency spikes in a real-time trading engine.",
    technicalDecisions: [
      "Thread-local caches to reduce lock contention",
      "Bit-mapped free lists for O(1) allocation",
      "Hugepage support strictly enforced"
    ],
    techStack: ["C++20", "Assembly", "Linux Kernel"],
    status: 'completed',
    year: "2023",
    githubUrl: "#"
  },
  {
    id: 'p2',
    title: "Hyperion KV",
    description: "Distributed key-value store optimized for read-heavy workloads using RDMA.",
    problemStatement: "Existing solutions saturated CPU before network bandwidth on 100GbE links.",
    technicalDecisions: [
      "Kernel-bypass networking via IB Verbs",
      "Log-structured merge tree for persistence",
      "Zero-copy serialization path"
    ],
    techStack: ["Rust", "gRPC", "RocksDB"],
    status: 'active',
    year: "2024",
    githubUrl: "#"
  },
  {
    id: 'p3',
    title: "Synthetix Audio Engine",
    description: "Headless DSP graph engine for procedural audio generation.",
    problemStatement: "Web Audio API introduced too much garbage collection overhead for complex synthesis graphs.",
    technicalDecisions: [
      "SIMD optimizations for mixing pipeline",
      "Lock-free ring buffers for audio thread communication",
      "WASM target for browser portability"
    ],
    techStack: ["C++", "WebAssembly", "SharedArrayBuffer"],
    status: 'completed',
    year: "2022",
    githubUrl: "#"
  },
  {
    id: 'p4',
    title: "Nebula FS",
    description: "A userspace file system for nvme-over-fabrics targeted at AI training clusters.",
    problemStatement: "POSIX metadata operations became a bottleneck when training on datasets with millions of small files.",
    technicalDecisions: [
      "Metadata server separation with Raft consensus",
      "Client-side caching with invalidation leases",
      "Bypassed VFS layer for direct device access"
    ],
    techStack: ["C", "SPDK", "Paxos"],
    status: 'archived',
    year: "2021",
    githubUrl: "#"
  },
  {
    id: 'p5',
    title: "ZK-Rollup Verifier",
    description: "Optimized STARK verification primitives for constrained edge devices.",
    problemStatement: "Mobile wallet verification of L2 state transitions was draining battery and taking >2s.",
    technicalDecisions: [
      "Hand-tuned scalar multiplication assembly",
      "Pipeline parallelism for hashing functions",
      "Memory-efficient polynomial commitment scheme"
    ],
    techStack: ["Rust", "WASM", "Cryptography"],
    status: 'completed',
    year: "2023",
    githubUrl: "#"
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: "Top 1% Performance",
    context: "Advent of Code Global Leaderboard",
    year: "2023",
    verificationLink: "#"
  },
  {
    id: 'a2',
    title: "Core Contributor",
    context: "LLVM Project (Clang Frontend)",
    year: "2022 - Present",
    verificationLink: "#"
  },
  {
    id: 'a3',
    title: "First Place",
    context: "System Design Hackathon @ TechConf",
    year: "2021",
  }
];

export const NOTES: Note[] = [
  {
    id: 'n1',
    title: "Understanding False Sharing",
    summary: "An analysis of cache coherency protocols and how padding structs affects multi-threaded performance.",
    date: "2024-02-14",
    tags: ["Systems", "Hardware"],
    readTime: "8 min"
  },
  {
    id: 'n2',
    title: "The Case for Custom Allocators",
    summary: "Why general purpose allocators fail in specific domains and how to implement a simple arena allocator.",
    date: "2023-11-20",
    tags: ["C++", "Memory"],
    readTime: "12 min"
  },
  {
    id: 'n3',
    title: "Zero-Copy Networking",
    summary: "Exploring the intricacies of sendfile, mmap, and modern io_uring interfaces on Linux.",
    date: "2023-08-05",
    tags: ["Linux", "Networking"],
    readTime: "15 min"
  }
];