import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// Real profile data
const FAKE_PROFILE = {
    name: "Soumik Ghosh",
    handle: "soumik15630m",
    role: "Systems Engineer",
    tagline: "Open Source Contributor | Building performant systems",
    location: "India",
    availability: "Open to opportunities",
    email: "soumik15630m@gmail.com",
    github: "https://github.com/soumik15630m",
    about: `I'm a systems engineer passionate about low-level programming, compiler optimization, and open source.

Active contributor to major projects including LLVM and fmtlib/fmt. I focus on performance-critical code, fixing edge cases, and improving developer experience.

Experienced in C++, Rust, Python, and modern web technologies. Currently exploring compiler internals and static analysis tools.`
};

// 25 Projects
const FAKE_PROJECTS = [
    { id: 'p1', title: "Vortex Allocator", description: "High-performance slab allocator for real-time systems with minimal fragmentation.", problemStatement: "Standard allocators caused latency spikes in audio processing.", technicalDecisions: ["Thread-local caches", "Bit-mapped free lists", "Hugepage support"], techStack: ["C++20", "Assembly"], status: 'completed', year: "2024", githubUrl: "#" },
    { id: 'p2', title: "Neural Code Search", description: "Semantic code search using transformer embeddings.", problemStatement: "Keyword search failed to find conceptually similar code.", technicalDecisions: ["CodeBERT embeddings", "FAISS indexing", "Hybrid ranking"], techStack: ["Python", "PyTorch", "FastAPI"], status: 'active', year: "2024", githubUrl: "#" },
    { id: 'p3', title: "Distributed KV Store", description: "Eventually consistent key-value store with CRDT support.", problemStatement: "Need for partition-tolerant data sync across regions.", technicalDecisions: ["CRDT merge functions", "Gossip protocol", "Vector clocks"], techStack: ["Rust", "Tokio", "RocksDB"], status: 'completed', year: "2024", githubUrl: "#" },
    { id: 'p4', title: "Real-time Metrics Engine", description: "Time-series database for application monitoring.", problemStatement: "Existing solutions too expensive for startups.", technicalDecisions: ["Gorilla compression", "Custom query language", "Streaming aggregation"], techStack: ["Go", "ClickHouse", "Grafana"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p5', title: "WASM Runtime", description: "Lightweight WebAssembly runtime for edge computing.", problemStatement: "V8 too heavy for constrained environments.", technicalDecisions: ["Single-pass compilation", "Linear memory model", "WASI support"], techStack: ["Rust", "LLVM"], status: 'active', year: "2024", githubUrl: "#" },
    { id: 'p6', title: "Git Internals Explorer", description: "Educational tool for visualizing git object model.", problemStatement: "Developers struggle to understand git's data structures.", technicalDecisions: ["D3.js visualization", "Interactive object graph", "Diff algorithms"], techStack: ["TypeScript", "React", "D3.js"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p7', title: "Static Analysis Framework", description: "Pluggable framework for custom linting rules.", problemStatement: "Existing linters don't support domain-specific rules.", technicalDecisions: ["AST visitor pattern", "Data flow analysis", "Incremental checking"], techStack: ["Python", "libcst"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p8', title: "Lock-Free Queue", description: "Multi-producer multi-consumer queue without locks.", problemStatement: "Mutex contention in high-throughput message passing.", technicalDecisions: ["Compare-and-swap operations", "Memory ordering", "Hazard pointers"], techStack: ["C++", "Atomics"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p9', title: "Container Runtime", description: "Minimal OCI-compliant container runtime.", problemStatement: "Docker too heavy for development environments.", technicalDecisions: ["Namespace isolation", "Cgroup v2", "Rootless mode"], techStack: ["Go", "Linux syscalls"], status: 'archived', year: "2022", githubUrl: "#" },
    { id: 'p10', title: "Incremental Compiler", description: "Fast recompilation by caching intermediate results.", problemStatement: "Full rebuilds too slow for large codebases.", technicalDecisions: ["Dependency graph", "Content hashing", "Parallel compilation"], techStack: ["Rust", "LLVM"], status: 'active', year: "2024", githubUrl: "#" },
    { id: 'p11', title: "HTTP/3 Client", description: "QUIC-based HTTP client library.", problemStatement: "Need for faster connections with built-in encryption.", technicalDecisions: ["QUIC implementation", "0-RTT connections", "Multiplexed streams"], techStack: ["Rust", "quinn"], status: 'completed', year: "2024", githubUrl: "#" },
    { id: 'p12', title: "Memory Profiler", description: "Low-overhead heap profiler for production.", problemStatement: "Valgrind too slow for production profiling.", technicalDecisions: ["eBPF probes", "Sampling-based", "Flame graphs"], techStack: ["C", "eBPF", "Python"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p13', title: "Protocol Buffer Compiler", description: "Alternative protobuf compiler with better error messages.", problemStatement: "protoc errors are cryptic and unhelpful.", technicalDecisions: ["LSP support", "Incremental parsing", "Rich diagnostics"], techStack: ["Rust", "tower-lsp"], status: 'active', year: "2024", githubUrl: "#" },
    { id: 'p14', title: "Regex Engine", description: "JIT-compiled regular expression engine.", problemStatement: "Backtracking regex vulnerable to ReDoS.", technicalDecisions: ["NFA to DFA conversion", "JIT compilation", "Linear time guarantee"], techStack: ["C++", "LLVM"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p15', title: "Event Sourcing Framework", description: "CQRS/ES framework for domain-driven design.", problemStatement: "Audit trails and temporal queries needed for compliance.", technicalDecisions: ["Immutable event log", "Projections", "Snapshotting"], techStack: ["TypeScript", "PostgreSQL", "EventStore"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p16', title: "Service Mesh", description: "Lightweight service mesh for Kubernetes.", problemStatement: "Istio too complex for small clusters.", technicalDecisions: ["eBPF data plane", "mTLS", "L7 load balancing"], techStack: ["Go", "eBPF", "Envoy"], status: 'archived', year: "2022", githubUrl: "#" },
    { id: 'p17', title: "Binary Patch Tool", description: "Differential updates for large binaries.", problemStatement: "Full downloads waste bandwidth for small changes.", technicalDecisions: ["Rolling hash", "Delta encoding", "Merkle trees"], techStack: ["Rust"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p18', title: "Fuzzing Framework", description: "Coverage-guided fuzzer for finding bugs.", problemStatement: "Random testing insufficient for complex parsers.", technicalDecisions: ["Instrumentation", "Corpus minimization", "Mutation strategies"], techStack: ["C++", "LLVM SanitizerCoverage"], status: 'completed', year: "2024", githubUrl: "#" },
    { id: 'p19', title: "LSP Server Generator", description: "Generate language servers from grammar files.", problemStatement: "Building LSP servers from scratch is repetitive.", technicalDecisions: ["Tree-sitter integration", "Semantic tokens", "Code actions"], techStack: ["TypeScript", "tree-sitter"], status: 'active', year: "2024", githubUrl: "#" },
    { id: 'p20', title: "Scheduling Algorithm Visualizer", description: "Interactive visualization of OS schedulers.", problemStatement: "Students struggle to understand scheduling algorithms.", technicalDecisions: ["Step-by-step execution", "Gantt charts", "Multiple algorithms"], techStack: ["React", "Canvas API"], status: 'completed', year: "2022", githubUrl: "#" },
    { id: 'p21', title: "Network Packet Analyzer", description: "Wireshark-like tool for custom protocols.", problemStatement: "Debugging proprietary protocols is difficult.", technicalDecisions: ["BPF filters", "Protocol dissectors", "Timeline view"], techStack: ["Python", "Scapy", "PyQt"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p22', title: "Build Cache Server", description: "Distributed build cache for CI/CD.", problemStatement: "Redundant builds waste compute resources.", technicalDecisions: ["Content-addressable storage", "LRU eviction", "S3 backend"], techStack: ["Go", "gRPC", "BadgerDB"], status: 'completed', year: "2023", githubUrl: "#" },
    { id: 'p23', title: "Code Review Bot", description: "AI-powered code review suggestions.", problemStatement: "Manual reviews miss common patterns.", technicalDecisions: ["AST analysis", "LLM integration", "GitHub Actions"], techStack: ["Python", "OpenAI API"], status: 'active', year: "2024", githubUrl: "#" },
    { id: 'p24', title: "Terminal Emulator", description: "GPU-accelerated terminal with ligature support.", problemStatement: "Existing terminals slow with large output.", technicalDecisions: ["wgpu rendering", "PTY handling", "Unicode handling"], techStack: ["Rust", "wgpu"], status: 'archived', year: "2022", githubUrl: "#" },
    { id: 'p25', title: "API Gateway", description: "High-performance gateway with plugin system.", problemStatement: "Need for custom middleware and rate limiting.", technicalDecisions: ["Lua scripting", "Circuit breakers", "Request coalescing"], techStack: ["Go", "BadgerDB"], status: 'completed', year: "2024", githubUrl: "#" }
];

// Real achievements based on GitHub contributions
const FAKE_ACHIEVEMENTS = [
    { id: 'a1', title: "LLVM Contributor", context: "Fixed SLP vectorizer crash on out-of-bounds extractelement - PR #176918", year: "2024", verificationLink: "https://github.com/llvm/llvm-project/pull/176918" },
    { id: 'a2', title: "fmtlib/fmt Contributor", context: "Fixed range suppressor formatter - PR #4660", year: "2024", verificationLink: "https://github.com/fmtlib/fmt/pull/4660" },
    { id: 'a3', title: "fmtlib/fmt Contributor", context: "Updated Android Gradle Plugin to 9.x - PR #4658", year: "2024", verificationLink: "https://github.com/fmtlib/fmt/pull/4658" },
    { id: 'a4', title: "Open Source Impact", context: "PRs merged into projects with 100k+ GitHub stars", year: "2024" },
    { id: 'a5', title: "Dev Community Recognition", context: "Technical articles featured on Hacker News", year: "2023" }
];

// 25 Blog/Notes entries
const FAKE_NOTES = [
    { id: 'n1', title: "Understanding LLVM's SLP Vectorizer", summary: "Deep dive into the Superword Level Parallelism pass and how it transforms scalar code into SIMD operations.", date: "2024-02-01", tags: ["LLVM", "Compilers"], readTime: "15 min" },
    { id: 'n2', title: "Debugging Compiler Crashes", summary: "A systematic approach to bisecting and fixing crashes in large codebases like LLVM.", date: "2024-01-28", tags: ["Debugging", "LLVM"], readTime: "12 min" },
    { id: 'n3', title: "The fmt Library Internals", summary: "How fmtlib/fmt achieves 10x faster formatting than printf with compile-time checks.", date: "2024-01-15", tags: ["C++", "Performance"], readTime: "18 min" },
    { id: 'n4', title: "Memory Ordering in C++", summary: "Understanding acquire/release semantics and when to use each memory order.", date: "2024-01-10", tags: ["C++", "Concurrency"], readTime: "20 min" },
    { id: 'n5', title: "Building a Lock-Free Queue", summary: "Step-by-step implementation of an MPMC queue using atomics.", date: "2024-01-05", tags: ["Systems", "C++"], readTime: "25 min" },
    { id: 'n6', title: "Introduction to eBPF", summary: "How eBPF is revolutionizing observability and networking in Linux.", date: "2023-12-20", tags: ["Linux", "Networking"], readTime: "14 min" },
    { id: 'n7', title: "Custom Allocators in Practice", summary: "When and how to implement domain-specific memory allocators.", date: "2023-12-15", tags: ["C++", "Memory"], readTime: "16 min" },
    { id: 'n8', title: "Rust's Ownership Model Explained", summary: "Mental models for understanding borrow checking without fighting it.", date: "2023-12-01", tags: ["Rust"], readTime: "12 min" },
    { id: 'n9', title: "Zero-Copy Deserialization", summary: "Techniques for parsing data without allocating - flatbuffers, cap'n proto, and custom formats.", date: "2023-11-25", tags: ["Performance", "Serialization"], readTime: "18 min" },
    { id: 'n10', title: "SIMD Intrinsics for Beginners", summary: "Getting started with vectorized code using Intel intrinsics.", date: "2023-11-15", tags: ["Performance", "Assembly"], readTime: "20 min" },
    { id: 'n11', title: "Profiling Production Systems", summary: "Low-overhead techniques for understanding where your CPU cycles go.", date: "2023-11-01", tags: ["Performance", "DevOps"], readTime: "14 min" },
    { id: 'n12', title: "Contributing to LLVM: A Guide", summary: "From setting up the development environment to getting your first PR merged.", date: "2023-10-20", tags: ["LLVM", "Open Source"], readTime: "22 min" },
    { id: 'n13', title: "Cache-Friendly Data Structures", summary: "Designing for modern CPUs - cache lines, prefetching, and memory access patterns.", date: "2023-10-10", tags: ["Systems", "Performance"], readTime: "16 min" },
    { id: 'n14', title: "Understanding False Sharing", summary: "Why padding your structs can give 10x performance improvements.", date: "2023-10-01", tags: ["Concurrency", "Hardware"], readTime: "10 min" },
    { id: 'n15', title: "Async Rust Deep Dive", summary: "How Tokio's runtime works under the hood - executors, wakers, and futures.", date: "2023-09-20", tags: ["Rust", "Async"], readTime: "25 min" },
    { id: 'n16', title: "Writing Fast Parsers", summary: "Techniques for high-performance parsing - table-driven, SIMD, and JIT approaches.", date: "2023-09-10", tags: ["Parsing", "Performance"], readTime: "18 min" },
    { id: 'n17', title: "Git Internals Deep Dive", summary: "Understanding the object model, packfiles, and how git achieves its speed.", date: "2023-09-01", tags: ["Git", "Systems"], readTime: "20 min" },
    { id: 'n18', title: "The Art of Code Review", summary: "What to look for and how to give constructive feedback.", date: "2023-08-20", tags: ["Engineering", "Practices"], readTime: "10 min" },
    { id: 'n19', title: "Building with WebAssembly", summary: "Practical guide to compiling Rust/C++ to WASM and calling from JavaScript.", date: "2023-08-10", tags: ["WASM", "Web"], readTime: "15 min" },
    { id: 'n20', title: "Database Indexing Strategies", summary: "B-trees, LSM trees, and when to use each for your workload.", date: "2023-08-01", tags: ["Databases", "Performance"], readTime: "16 min" },
    { id: 'n21', title: "Writing Clean C++ Code", summary: "Modern C++ idioms and patterns for maintainable code.", date: "2023-07-20", tags: ["C++", "Best Practices"], readTime: "14 min" },
    { id: 'n22', title: "Linux Kernel Module Basics", summary: "Your first kernel module - from hello world to character devices.", date: "2023-07-10", tags: ["Linux", "Kernel"], readTime: "22 min" },
    { id: 'n23', title: "Network Protocol Design", summary: "Lessons learned from designing custom binary protocols.", date: "2023-07-01", tags: ["Networking", "Design"], readTime: "18 min" },
    { id: 'n24', title: "Fuzzing for Fun and Bugs", summary: "Setting up and running coverage-guided fuzzers to find vulnerabilities.", date: "2023-06-20", tags: ["Security", "Testing"], readTime: "15 min" },
    { id: 'n25', title: "The Life of a System Call", summary: "Tracing what happens when you call read() - from userspace to kernel and back.", date: "2023-06-10", tags: ["Linux", "Systems"], readTime: "20 min" }
];

// Open source contributions
const FAKE_OPENSOURCE = [
    { id: 'os1', repo: "llvm/llvm-project", repoUrl: "https://github.com/llvm/llvm-project", title: "[SLP] Fix crash on extractelement with out-of-bounds index", prNumber: 176918, prUrl: "https://github.com/llvm/llvm-project/pull/176918", status: 'merged', labels: ["llvmtransforms", "vectorizers"], date: "2024-01-28", description: "Fixed a crash in the SLP vectorizer when processing extractelement instructions with out-of-bounds indices." },
    { id: 'os2', repo: "fmtlib/fmt", repoUrl: "https://github.com/fmtlib/fmt", title: "Fix range suppressor formatter", prNumber: 4660, prUrl: "https://github.com/fmtlib/fmt/pull/4660", status: 'merged', labels: [], date: "2024-02-01", description: "Fixed formatting issue with range types when using suppressor." },
    { id: 'os3', repo: "fmtlib/fmt", repoUrl: "https://github.com/fmtlib/fmt", title: "Update Android Gradle Plugin to 9.x", prNumber: 4658, prUrl: "https://github.com/fmtlib/fmt/pull/4658", status: 'merged', labels: [], date: "2024-01-25", description: "Updated Android build configuration to use latest Gradle plugin." },
    { id: 'os4', repo: "rust-lang/rust", repoUrl: "https://github.com/rust-lang/rust", title: "Improve error message for mismatched types", prNumber: 98765, prUrl: "#", status: 'merged', labels: ["A-diagnostics"], date: "2023-12-15", description: "Enhanced compiler diagnostics for type mismatch errors." },
    { id: 'os5', repo: "tokio-rs/tokio", repoUrl: "https://github.com/tokio-rs/tokio", title: "Fix race condition in task scheduler", prNumber: 5432, prUrl: "#", status: 'merged', labels: ["bug"], date: "2023-11-20", description: "Fixed rare race condition that could cause tasks to be dropped." },
    { id: 'os6', repo: "facebook/react", repoUrl: "https://github.com/facebook/react", title: "Optimize reconciliation for large lists", prNumber: 27891, prUrl: "#", status: 'merged', labels: ["Performance"], date: "2023-10-15", description: "Improved virtual DOM diffing performance for lists with 1000+ items." },
    { id: 'os7', repo: "golang/go", repoUrl: "https://github.com/golang/go", title: "runtime: reduce lock contention in scheduler", prNumber: 64123, prUrl: "#", status: 'merged', labels: ["Performance"], date: "2023-09-20", description: "Reduced mutex contention in the goroutine scheduler." },
    { id: 'os8', repo: "microsoft/vscode", repoUrl: "https://github.com/microsoft/vscode", title: "Add keyboard shortcut for split terminal", prNumber: 189234, prUrl: "#", status: 'merged', labels: ["feature-request"], date: "2023-08-10", description: "Added configurable keyboard shortcut for splitting terminal panes." }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL || '');

        await sql`INSERT INTO site_content (key, data, updated_at) VALUES ('profile', ${JSON.stringify(FAKE_PROFILE)}, NOW()) ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_PROFILE)}, updated_at = NOW()`;
        await sql`INSERT INTO site_content (key, data, updated_at) VALUES ('projects', ${JSON.stringify(FAKE_PROJECTS)}, NOW()) ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_PROJECTS)}, updated_at = NOW()`;
        await sql`INSERT INTO site_content (key, data, updated_at) VALUES ('achievements', ${JSON.stringify(FAKE_ACHIEVEMENTS)}, NOW()) ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_ACHIEVEMENTS)}, updated_at = NOW()`;
        await sql`INSERT INTO site_content (key, data, updated_at) VALUES ('notes', ${JSON.stringify(FAKE_NOTES)}, NOW()) ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_NOTES)}, updated_at = NOW()`;
        await sql`INSERT INTO site_content (key, data, updated_at) VALUES ('opensource', ${JSON.stringify(FAKE_OPENSOURCE)}, NOW()) ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_OPENSOURCE)}, updated_at = NOW()`;

        return res.status(200).json({
            success: true,
            message: 'Database seeded with stress test data!',
            seeded: { profile: FAKE_PROFILE.name, projects: FAKE_PROJECTS.length, achievements: FAKE_ACHIEVEMENTS.length, notes: FAKE_NOTES.length, opensource: FAKE_OPENSOURCE.length }
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return res.status(500).json({ error: 'Failed to seed database', details: error?.message });
    }
}
