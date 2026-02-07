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

// 25 Projects with images
const FAKE_PROJECTS = [
    { id: 'p1', title: "Vortex Allocator", description: "High-performance slab allocator for real-time systems with minimal fragmentation.", problemStatement: "Standard allocators caused latency spikes in audio processing.", technicalDecisions: ["Thread-local caches", "Bit-mapped free lists", "Hugepage support"], techStack: ["C++20", "Assembly"], status: 'completed', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop" },
    { id: 'p2', title: "Neural Code Search", description: "Semantic code search using transformer embeddings.", problemStatement: "Keyword search failed to find conceptually similar code.", technicalDecisions: ["CodeBERT embeddings", "FAISS indexing", "Hybrid ranking"], techStack: ["Python", "PyTorch", "FastAPI"], status: 'active', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop" },
    { id: 'p3', title: "Distributed KV Store", description: "Eventually consistent key-value store with CRDT support.", problemStatement: "Need for partition-tolerant data sync across regions.", technicalDecisions: ["CRDT merge functions", "Gossip protocol", "Vector clocks"], techStack: ["Rust", "Tokio", "RocksDB"], status: 'completed', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop" },
    { id: 'p4', title: "Real-time Metrics Engine", description: "Time-series database for application monitoring.", problemStatement: "Existing solutions too expensive for startups.", technicalDecisions: ["Gorilla compression", "Custom query language", "Streaming aggregation"], techStack: ["Go", "ClickHouse", "Grafana"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop" },
    { id: 'p5', title: "WASM Runtime", description: "Lightweight WebAssembly runtime for edge computing.", problemStatement: "V8 too heavy for constrained environments.", technicalDecisions: ["Single-pass compilation", "Linear memory model", "WASI support"], techStack: ["Rust", "LLVM"], status: 'active', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop" },
    { id: 'p6', title: "Git Internals Explorer", description: "Educational tool for visualizing git object model.", problemStatement: "Developers struggle to understand git's data structures.", technicalDecisions: ["D3.js visualization", "Interactive object graph", "Diff algorithms"], techStack: ["TypeScript", "React", "D3.js"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop" },
    { id: 'p7', title: "Static Analysis Framework", description: "Pluggable framework for custom linting rules.", problemStatement: "Existing linters don't support domain-specific rules.", technicalDecisions: ["AST visitor pattern", "Data flow analysis", "Incremental checking"], techStack: ["Python", "libcst"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop" },
    { id: 'p8', title: "Lock-Free Queue", description: "Multi-producer multi-consumer queue without locks.", problemStatement: "Mutex contention in high-throughput message passing.", technicalDecisions: ["Compare-and-swap operations", "Memory ordering", "Hazard pointers"], techStack: ["C++", "Atomics"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=300&fit=crop" },
    { id: 'p9', title: "Container Runtime", description: "Minimal OCI-compliant container runtime.", problemStatement: "Docker too heavy for development environments.", technicalDecisions: ["Namespace isolation", "Cgroup v2", "Rootless mode"], techStack: ["Go", "Linux syscalls"], status: 'archived', year: "2022", githubUrl: "#", image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop" },
    { id: 'p10', title: "Incremental Compiler", description: "Fast recompilation by caching intermediate results.", problemStatement: "Full rebuilds too slow for large codebases.", technicalDecisions: ["Dependency graph", "Content hashing", "Parallel compilation"], techStack: ["Rust", "LLVM"], status: 'active', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop" },
    { id: 'p11', title: "HTTP/3 Client", description: "QUIC-based HTTP client library.", problemStatement: "Need for faster connections with built-in encryption.", technicalDecisions: ["QUIC implementation", "0-RTT connections", "Multiplexed streams"], techStack: ["Rust", "quinn"], status: 'completed', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop" },
    { id: 'p12', title: "Memory Profiler", description: "Low-overhead heap profiler for production.", problemStatement: "Valgrind too slow for production profiling.", technicalDecisions: ["eBPF probes", "Sampling-based", "Flame graphs"], techStack: ["C", "eBPF", "Python"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop" },
    { id: 'p13', title: "Protocol Buffer Compiler", description: "Alternative protobuf compiler with better error messages.", problemStatement: "protoc errors are cryptic and unhelpful.", technicalDecisions: ["LSP support", "Incremental parsing", "Rich diagnostics"], techStack: ["Rust", "tower-lsp"], status: 'active', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop" },
    { id: 'p14', title: "Regex Engine", description: "JIT-compiled regular expression engine.", problemStatement: "Backtracking regex vulnerable to ReDoS.", technicalDecisions: ["NFA to DFA conversion", "JIT compilation", "Linear time guarantee"], techStack: ["C++", "LLVM"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=300&fit=crop" },
    { id: 'p15', title: "Event Sourcing Framework", description: "CQRS/ES framework for domain-driven design.", problemStatement: "Audit trails and temporal queries needed for compliance.", technicalDecisions: ["Immutable event log", "Projections", "Snapshotting"], techStack: ["TypeScript", "PostgreSQL", "EventStore"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop" },
    { id: 'p16', title: "Service Mesh", description: "Lightweight service mesh for Kubernetes.", problemStatement: "Istio too complex for small clusters.", technicalDecisions: ["eBPF data plane", "mTLS", "L7 load balancing"], techStack: ["Go", "eBPF", "Envoy"], status: 'archived', year: "2022", githubUrl: "#", image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop" },
    { id: 'p17', title: "Binary Patch Tool", description: "Differential updates for large binaries.", problemStatement: "Full downloads waste bandwidth for small changes.", technicalDecisions: ["Rolling hash", "Delta encoding", "Merkle trees"], techStack: ["Rust"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop" },
    { id: 'p18', title: "Fuzzing Framework", description: "Coverage-guided fuzzer for finding bugs.", problemStatement: "Random testing insufficient for complex parsers.", technicalDecisions: ["Instrumentation", "Corpus minimization", "Mutation strategies"], techStack: ["C++", "LLVM SanitizerCoverage"], status: 'completed', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=300&fit=crop" },
    { id: 'p19', title: "LSP Server Generator", description: "Generate language servers from grammar files.", problemStatement: "Building LSP servers from scratch is repetitive.", technicalDecisions: ["Tree-sitter integration", "Semantic tokens", "Code actions"], techStack: ["TypeScript", "tree-sitter"], status: 'active', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop" },
    { id: 'p20', title: "Scheduling Algorithm Visualizer", description: "Interactive visualization of OS schedulers.", problemStatement: "Students struggle to understand scheduling algorithms.", technicalDecisions: ["Step-by-step execution", "Gantt charts", "Multiple algorithms"], techStack: ["React", "Canvas API"], status: 'completed', year: "2022", githubUrl: "#", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" },
    { id: 'p21', title: "Network Packet Analyzer", description: "Wireshark-like tool for custom protocols.", problemStatement: "Debugging proprietary protocols is difficult.", technicalDecisions: ["BPF filters", "Protocol dissectors", "Timeline view"], techStack: ["Python", "Scapy", "PyQt"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop" },
    { id: 'p22', title: "Build Cache Server", description: "Distributed build cache for CI/CD.", problemStatement: "Redundant builds waste compute resources.", technicalDecisions: ["Content-addressable storage", "LRU eviction", "S3 backend"], techStack: ["Go", "gRPC", "BadgerDB"], status: 'completed', year: "2023", githubUrl: "#", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop" },
    { id: 'p23', title: "Code Review Bot", description: "AI-powered code review suggestions.", problemStatement: "Manual reviews miss common patterns.", technicalDecisions: ["AST analysis", "LLM integration", "GitHub Actions"], techStack: ["Python", "OpenAI API"], status: 'active', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop" },
    { id: 'p24', title: "Terminal Emulator", description: "GPU-accelerated terminal with ligature support.", problemStatement: "Existing terminals slow with large output.", technicalDecisions: ["wgpu rendering", "PTY handling", "Unicode handling"], techStack: ["Rust", "wgpu"], status: 'archived', year: "2022", githubUrl: "#", image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=300&fit=crop" },
    { id: 'p25', title: "API Gateway", description: "High-performance gateway with plugin system.", problemStatement: "Need for custom middleware and rate limiting.", technicalDecisions: ["Lua scripting", "Circuit breakers", "Request coalescing"], techStack: ["Go", "BadgerDB"], status: 'completed', year: "2024", githubUrl: "#", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop" }
];

// Real certificates based on GitHub contributions
const FAKE_ACHIEVEMENTS = [
    { id: 'a1', title: "LLVM Contributor", context: "Fixed SLP vectorizer crash on out-of-bounds extractelement - PR #176918", year: "2024", verificationLink: "https://github.com/llvm/llvm-project/pull/176918", image: "https://opengraph.githubassets.com/1/llvm/llvm-project/pull/176918" },
    { id: 'a2', title: "fmtlib/fmt Contributor", context: "Fixed range suppressor formatter - PR #4660", year: "2024", verificationLink: "https://github.com/fmtlib/fmt/pull/4660", image: "https://opengraph.githubassets.com/1/fmtlib/fmt/pull/4660" },
    { id: 'a3', title: "fmtlib/fmt Contributor", context: "Updated Android Gradle Plugin to 9.x - PR #4658", year: "2024", verificationLink: "https://github.com/fmtlib/fmt/pull/4658", image: "https://opengraph.githubassets.com/1/fmtlib/fmt/pull/4658" },
    { id: 'a4', title: "Open Source Impact", context: "PRs merged into projects with 100k+ GitHub stars", year: "2024", image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=300&fit=crop" },
    { id: 'a5', title: "Dev Community Recognition", context: "Technical articles featured on Hacker News", year: "2023", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop" }
];

// 25 Blog/Notes entries with full content
const FAKE_NOTES = [
    {
        id: 'n1', title: "Understanding LLVM's SLP Vectorizer", summary: "Deep dive into the Superword Level Parallelism pass and how it transforms scalar code into SIMD operations.", date: "2024-02-01", tags: ["LLVM", "Compilers"], readTime: "15 min", content: `## What is SLP Vectorization?

Superword Level Parallelism (SLP) vectorization is a compiler optimization technique that identifies opportunities to combine multiple scalar operations into single SIMD (Single Instruction, Multiple Data) instructions.

Unlike loop vectorization which focuses on consecutive iterations, SLP looks for isomorphic operations within a single basic block that can be packed together.

## How the SLP Vectorizer Works

The LLVM SLP vectorizer operates in several phases:

- Bottom-up tree building from scalar values
- Cost model analysis to determine profitability
- Vectorization of profitable trees
- Scheduling of the vectorized code

## Real-World Example

Consider this simple code that adds pairs of arrays:

\`\`\`cpp
a[0] = b[0] + c[0];
a[1] = b[1] + c[1];
a[2] = b[2] + c[2];
a[3] = b[3] + c[3];
\`\`\`

The SLP vectorizer recognizes these four identical add operations and combines them into a single vector addition, dramatically improving performance on modern CPUs with SIMD units.

## Key Takeaways

The SLP vectorizer is crucial for modern compiler optimization. Understanding its internals helps when writing performance-critical code that can benefit from automatic vectorization.` },
    {
        id: 'n2', title: "Debugging Compiler Crashes", summary: "A systematic approach to bisecting and fixing crashes in large codebases like LLVM.", date: "2024-01-28", tags: ["Debugging", "LLVM"], readTime: "12 min", content: `## The Challenge of Compiler Debugging

Debugging crashes in large codebases like LLVM requires a systematic approach. With millions of lines of code, finding the root cause can seem daunting.

## Step 1: Reproduce Reliably

First, create a minimal reproducer. Use tools like creduce or llvm-reduce to minimize the input that triggers the crash.

## Step 2: Git Bisect

Git bisect is invaluable for finding the commit that introduced a regression:

\`\`\`bash
git bisect start
git bisect bad HEAD
git bisect good v17.0.0
git bisect run ./test_crash.sh
\`\`\`

## Step 3: Analyze the Stack Trace

Use tools like ASAN and UBSAN to catch undefined behavior early. Compile with debug symbols for meaningful stack traces.

## Step 4: Understand the Code

Once you've identified the problematic code, understand its intent before fixing. The fix should address the root cause, not just the symptom.

## Lessons Learned

Patience and systematic debugging pay off. Document your process for future reference.` },
    {
        id: 'n3', title: "The fmt Library Internals", summary: "How fmtlib/fmt achieves 10x faster formatting than printf with compile-time checks.", date: "2024-01-15", tags: ["C++", "Performance"], readTime: "18 min", content: `## Why fmt is Fast

The fmtlib/fmt library achieves remarkable performance through several key techniques.

## Compile-Time Format String Parsing

Unlike printf which parses format strings at runtime, fmt parses them at compile time using C++20 consteval:

\`\`\`cpp
fmt::print("Hello, {}!", name); // Format string checked at compile time
\`\`\`

## Type-Safe Formatting

Format specifiers are validated against argument types at compile time, eliminating runtime errors and enabling optimizations.

## Efficient Output Buffering

fmt uses a sophisticated buffering strategy that minimizes system calls and memory allocations.

## Memory Layout Optimization

The library is designed with cache locality in mind, keeping hot data together and minimizing pointer chasing.

## Benchmarks

In my tests, fmt consistently outperforms printf by 5-10x for typical formatting operations. The compile-time checks add zero runtime overhead while catching bugs earlier.

## Integration Tips

Adding fmt to your project is straightforward with CMake's FetchContent or as a header-only library.` },
    {
        id: 'n4', title: "Memory Ordering in C++", summary: "Understanding acquire/release semantics and when to use each memory order.", date: "2024-01-10", tags: ["C++", "Concurrency"], readTime: "20 min", content: `## The Memory Model

C++11 introduced a formal memory model that defines how threads interact through shared memory.

## Memory Orders Explained

### memory_order_relaxed
No synchronization guarantees. Only atomicity is ensured.

### memory_order_acquire
Prevents reads/writes from being reordered before this operation.

### memory_order_release
Prevents reads/writes from being reordered after this operation.

### memory_order_acq_rel
Combines acquire and release semantics.

### memory_order_seq_cst
Full sequential consistency. The default and safest option.

## Practical Example

\`\`\`cpp
std::atomic<bool> ready{false};
std::atomic<int> data{0};

// Thread 1 (producer)
data.store(42, std::memory_order_relaxed);
ready.store(true, std::memory_order_release);

// Thread 2 (consumer)
while (!ready.load(std::memory_order_acquire));
assert(data.load(std::memory_order_relaxed) == 42);
\`\`\`

## When to Use What

Start with seq_cst for correctness, then optimize with weaker orders only when profiling shows a bottleneck.` },
    {
        id: 'n5', title: "Building a Lock-Free Queue", summary: "Step-by-step implementation of an MPMC queue using atomics.", date: "2024-01-05", tags: ["Systems", "C++"], readTime: "25 min", content: `## Why Lock-Free?

Lock-free data structures provide progress guarantees that mutex-based alternatives cannot. At least one thread makes progress regardless of scheduling.

## The Challenge

Building correct lock-free code is notoriously difficult. The ABA problem, memory reclamation, and memory ordering all pose challenges.

## Design Decisions

Our MPMC queue uses:
- Fixed-size ring buffer for bounded memory
- Sequence counters to detect ABA
- Compare-and-swap for atomic updates

## Implementation Sketch

\`\`\`cpp
template<typename T>
class MPMCQueue {
    struct Cell {
        std::atomic<size_t> sequence;
        T data;
    };
    
    Cell* buffer;
    size_t mask;
    std::atomic<size_t> enqueue_pos;
    std::atomic<size_t> dequeue_pos;
};
\`\`\`

## Testing Strategy

Use ThreadSanitizer, stress tests with many threads, and formal verification tools like CDS Checker.

## Performance Results

The lock-free queue achieves 10M operations/sec with 8 producers and 8 consumers on modern hardware.` },
    {
        id: 'n6', title: "Introduction to eBPF", summary: "How eBPF is revolutionizing observability and networking in Linux.", date: "2023-12-20", tags: ["Linux", "Networking"], readTime: "14 min", content: `## What is eBPF?

eBPF (extended Berkeley Packet Filter) allows running sandboxed programs in the Linux kernel without changing kernel source code.

## Use Cases

- Network packet filtering and manipulation
- Performance monitoring and profiling
- Security enforcement
- Container observability

## Architecture

eBPF programs are verified by the kernel for safety, then JIT-compiled to native code for performance.

## Example: Counting System Calls

\`\`\`c
SEC("tracepoint/raw_syscalls/sys_enter")
int count_syscalls(void *ctx) {
    u64 *count = bpf_map_lookup_elem(&syscall_count, &zero);
    if (count) __sync_fetch_and_add(count, 1);
    return 0;
}
\`\`\`

## Tools Ecosystem

Popular tools like bpftrace, BCC, and Cilium build on eBPF to provide powerful observability and networking capabilities.

## Future of eBPF

eBPF is transforming how we think about kernel extensibility, making it safe to run custom code at the OS level.` },
    {
        id: 'n7', title: "Custom Allocators in Practice", summary: "When and how to implement domain-specific memory allocators.", date: "2023-12-15", tags: ["C++", "Memory"], readTime: "16 min", content: `## Why Custom Allocators?

General-purpose allocators like malloc are designed for average-case performance. Custom allocators can be 10x faster for specific patterns.

## Allocation Patterns

- Object pools for fixed-size objects
- Arenas for request-scoped memory
- Slab allocators for kernel-style allocations
- Stack allocators for LIFO patterns

## Implementation Example

\`\`\`cpp
class PoolAllocator {
    void* pool;
    size_t object_size;
    void* free_list;
    
public:
    void* allocate() {
        if (free_list) {
            void* ptr = free_list;
            free_list = *static_cast<void**>(ptr);
            return ptr;
        }
        return nullptr; // Pool exhausted
    }
};
\`\`\`

## Integration with C++

Use std::pmr (polymorphic memory resources) for seamless integration with standard containers.

## When NOT to Use

Custom allocators add complexity. Only use when profiling shows allocation is a bottleneck.` },
    {
        id: 'n8', title: "Rust's Ownership Model Explained", summary: "Mental models for understanding borrow checking without fighting it.", date: "2023-12-01", tags: ["Rust"], readTime: "12 min", content: `## The Core Insight

Ownership in Rust is about tracking who is responsible for cleaning up a value. Every value has exactly one owner.

## Three Rules

1. Each value has one owner
2. Values are dropped when owners go out of scope
3. Ownership can be transferred (moved) or borrowed

## Borrowing

Borrowing lets you access data without taking ownership:

\`\`\`rust
fn print_length(s: &String) {
    println!("Length: {}", s.len());
} // s is borrowed, not dropped here
\`\`\`

## Mutable vs Immutable Borrows

You can have either:
- Many immutable borrows, OR
- One mutable borrow

Never both simultaneously.

## Lifetimes

Lifetimes ensure borrowed references are valid. The compiler infers most lifetimes, but sometimes explicit annotations are needed.

## Mental Model

Think of ownership like unique_ptr in C++, and borrows like references that are checked at compile time.` },
    {
        id: 'n9', title: "Zero-Copy Deserialization", summary: "Techniques for parsing data without allocating - flatbuffers, cap'n proto, and custom formats.", date: "2023-11-25", tags: ["Performance", "Serialization"], readTime: "18 min", content: `## The Cost of Serialization

Traditional serialization (JSON, protobuf) requires copying data into newly allocated objects. For large messages, this is expensive.

## Zero-Copy Approach

Zero-copy formats like FlatBuffers and Cap'n Proto store data in a wire format that can be accessed directly without parsing.

## FlatBuffers Example

\`\`\`cpp
auto monster = GetMonster(buffer);
auto name = monster->name(); // No copy, returns pointer into buffer
\`\`\`

## Trade-offs

Pros:
- No allocation during deserialization
- Very fast access
- Reduced memory usage

Cons:
- Random access performance varies
- More complex schema evolution
- Requires careful memory management

## When to Use

Zero-copy shines for:
- High-throughput message processing
- Memory-mapped files
- Inter-process communication

## Custom Formats

Sometimes a custom format beats generic solutions. Profile before optimizing.` },
    {
        id: 'n10', title: "SIMD Intrinsics for Beginners", summary: "Getting started with vectorized code using Intel intrinsics.", date: "2023-11-15", tags: ["Performance", "Assembly"], readTime: "20 min", content: `## What is SIMD?

Single Instruction, Multiple Data (SIMD) executes the same operation on multiple data elements simultaneously.

## Intel Intrinsics

Intrinsics are C functions that map directly to assembly instructions:

\`\`\`cpp
#include <immintrin.h>

void add_arrays(float* a, float* b, float* c, int n) {
    for (int i = 0; i < n; i += 8) {
        __m256 va = _mm256_load_ps(&a[i]);
        __m256 vb = _mm256_load_ps(&b[i]);
        __m256 vc = _mm256_add_ps(va, vb);
        _mm256_store_ps(&c[i], vc);
    }
}
\`\`\`

## Instruction Sets

- SSE: 128-bit (4 floats)
- AVX: 256-bit (8 floats)
- AVX-512: 512-bit (16 floats)

## Common Pitfalls

- Alignment requirements
- Handling remainder loops
- Branch divergence

## Performance Tips

Use SIMD for tight loops with independent iterations. Profile to verify speedup.` },
    {
        id: 'n11', title: "Profiling Production Systems", summary: "Low-overhead techniques for understanding where your CPU cycles go.", date: "2023-11-01", tags: ["Performance", "DevOps"], readTime: "14 min", content: `## The Challenge

Production profiling must be low-overhead while providing actionable insights.

## Sampling Profilers

Tools like perf and async-profiler sample stack traces at regular intervals with minimal overhead (<1%).

## Flame Graphs

Flame graphs visualize where CPU time is spent. The width of each box represents time in that function.

## Continuous Profiling

Services like Pyroscope and Parca collect profiles continuously, allowing you to compare performance over time.

## Key Metrics

- CPU utilization by function
- Memory allocation hotspots
- Lock contention
- I/O wait time

## Example Workflow

1. Identify high-level bottleneck
2. Drill down with flame graphs
3. Optimize the hot path
4. Measure improvement

## Tools Recommendation

For JVM: async-profiler. For Go: pprof. For native: perf + flamegraph.` },
    {
        id: 'n12', title: "Contributing to LLVM: A Guide", summary: "From setting up the development environment to getting your first PR merged.", date: "2023-10-20", tags: ["LLVM", "Open Source"], readTime: "22 min", content: `## Getting Started

LLVM is one of the most important open-source projects. Contributing is rewarding but requires preparation.

## Building LLVM

\`\`\`bash
cmake -G Ninja -DCMAKE_BUILD_TYPE=Release \\
      -DLLVM_ENABLE_PROJECTS="clang" ../llvm
ninja
\`\`\`

## Finding Issues

Start with issues labeled 'good first issue' on GitHub. The LLVM community is welcoming to newcomers.

## Code Review Process

LLVM uses Phabricator for code review. Be patient - reviews can take time for complex changes.

## Coding Standards

Follow the LLVM Coding Standards strictly. Use clang-format with the LLVM style.

## Testing

Every change needs tests. Use lit for running the test suite. FileCheck patterns are powerful but have a learning curve.

## Tips for Success

- Start small
- Ask questions on Discord
- Read existing code for patterns
- Be responsive to review feedback` },
    {
        id: 'n13', title: "Cache-Friendly Data Structures", summary: "Designing for modern CPUs - cache lines, prefetching, and memory access patterns.", date: "2023-10-10", tags: ["Systems", "Performance"], readTime: "16 min", content: `## The Memory Hierarchy

Modern CPUs have multiple cache levels (L1, L2, L3). Cache misses are expensive - up to 100+ cycles.

## Cache Lines

Data is fetched in cache lines (typically 64 bytes). Accessing one byte loads the entire line.

## Sequential Access

Sequential access patterns leverage hardware prefetching. Arrays are cache-friendly; linked lists are not.

## Data-Oriented Design

Structure your data for access patterns:

\`\`\`cpp
// Bad: Array of Structures
struct AoS { float x, y, z, w; };
AoS particles[1000];

// Good: Structure of Arrays
struct SoA {
    float x[1000], y[1000], z[1000], w[1000];
};
\`\`\`

## Prefetching

Use _mm_prefetch for manual prefetching when access patterns are predictable but not sequential.

## Measuring Cache Performance

Use perf stat with cache-related events to measure misses at each level.` },
    {
        id: 'n14', title: "Understanding False Sharing", summary: "Why padding your structs can give 10x performance improvements.", date: "2023-10-01", tags: ["Concurrency", "Hardware"], readTime: "10 min", content: `## What is False Sharing?

False sharing occurs when threads on different cores modify variables that share a cache line.

## The Problem

Even though the variables are independent, the CPU must synchronize the cache line between cores, destroying performance.

## Detection

Use perf c2c to detect false sharing in your code.

## Solution: Padding

Add padding to ensure each variable is on its own cache line:

\`\`\`cpp
struct alignas(64) Counter {
    std::atomic<int> value;
};

Counter counters[8]; // Each on separate cache line
\`\`\`

## C++17 Solution

Use std::hardware_destructive_interference_size for portable padding.

## Real Impact

I've seen 10x speedups from fixing false sharing in hot paths. Always check for this in multi-threaded code.` },
    {
        id: 'n15', title: "Async Rust Deep Dive", summary: "How Tokio's runtime works under the hood - executors, wakers, and futures.", date: "2023-09-20", tags: ["Rust", "Async"], readTime: "25 min", content: `## The Async Model

Rust's async is based on polling Futures. A Future represents a value that may not be available yet.

## How Futures Work

\`\`\`rust
trait Future {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context) -> Poll<Self::Output>;
}
\`\`\`

## The Executor

Tokio's executor manages a pool of threads that poll futures. Work-stealing ensures balanced load.

## Wakers

When a future returns Pending, it stores the waker. The waker signals when the future should be polled again.

## Task Scheduling

Tokio uses a multi-threaded scheduler by default:
- Per-thread run queues
- Global queue for load balancing
- Work stealing between threads

## Common Pitfalls

- Blocking in async code
- Holding locks across await points
- CPU-bound work on the async pool

## Performance Tips

Use spawn_blocking for CPU work. Use tokio::sync instead of std::sync.` },
    {
        id: 'n16', title: "Writing Fast Parsers", summary: "Techniques for high-performance parsing - table-driven, SIMD, and JIT approaches.", date: "2023-09-10", tags: ["Parsing", "Performance"], readTime: "18 min", content: `## Parser Performance Matters

Parsing is often the bottleneck in data-intensive applications. Fast parsers can be orders of magnitude faster.

## Table-Driven Parsing

Replace conditional logic with table lookups:

\`\`\`cpp
static const uint8_t char_class[256] = {...};
int classify(char c) { return char_class[(uint8_t)c]; }
\`\`\`

## SIMD Parsing

Use SIMD to find delimiters or validate characters in parallel:

\`\`\`cpp
__m256i chunk = _mm256_loadu_si256(...);
__m256i quotes = _mm256_cmpeq_epi8(chunk, _mm256_set1_epi8('"'));
int mask = _mm256_movemask_epi8(quotes);
\`\`\`

## Branchless Techniques

Replace if/else with arithmetic to avoid branch mispredictions.

## Case Study: simdjson

simdjson uses all these techniques to parse JSON at gigabytes per second - 4x faster than alternatives.

## When to Optimize

Only optimize parsers that are proven bottlenecks. Readability matters for correctness.` },
    {
        id: 'n17', title: "Git Internals Deep Dive", summary: "Understanding the object model, packfiles, and how git achieves its speed.", date: "2023-09-01", tags: ["Git", "Systems"], readTime: "20 min", content: `## Git is a Content-Addressable Filesystem

At its core, git stores content by SHA-1 hash. This enables deduplication and integrity verification.

## Object Types

- Blob: File contents
- Tree: Directory listing
- Commit: Snapshot with metadata
- Tag: Named reference

## The Object Store

Objects are stored in .git/objects as zlib-compressed files. The filename is the hash.

## Packfiles

For efficiency, git packs many objects into packfiles with delta compression. This dramatically reduces repository size.

## References

Branches and tags are just files containing commit hashes. HEAD is a symbolic reference.

## Index (Staging Area)

The index is a binary file tracking staged changes. It enables efficient status checks and commits.

## Performance Tricks

- Object caching in memory
- Packfile indexes for fast lookup
- Shallow clones for large histories` },
    {
        id: 'n18', title: "The Art of Code Review", summary: "What to look for and how to give constructive feedback.", date: "2023-08-20", tags: ["Engineering", "Practices"], readTime: "10 min", content: `## Why Code Review Matters

Code review catches bugs, shares knowledge, and maintains code quality. It's one of the most valuable engineering practices.

## What to Look For

- Correctness: Does it work?
- Design: Is the approach right?
- Readability: Can others understand it?
- Testing: Are edge cases covered?
- Performance: Any obvious issues?

## How to Give Feedback

Be specific and constructive:

Bad: "This is wrong"
Good: "This will fail if the input is empty. Consider adding a null check."

## Receiving Feedback

Don't take reviews personally. Reviewers are critiquing code, not you.

## Efficiency Tips

- Review in multiple passes (high-level first)
- Use automated tools for style issues
- Set time limits for large reviews

## Building Culture

Good code review takes practice. Lead by example and mentor others.` },
    {
        id: 'n19', title: "Building with WebAssembly", summary: "Practical guide to compiling Rust/C++ to WASM and calling from JavaScript.", date: "2023-08-10", tags: ["WASM", "Web"], readTime: "15 min", content: `## What is WebAssembly?

WebAssembly is a portable binary format that runs in browsers at near-native speed.

## Compiling Rust to WASM

\`\`\`bash
cargo build --target wasm32-unknown-unknown
wasm-bindgen target/wasm32-unknown-unknown/release/my_lib.wasm --out-dir pkg
\`\`\`

## JavaScript Interop

wasm-bindgen generates JavaScript bindings automatically:

\`\`\`rust
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
\`\`\`

## Memory Management

WASM has linear memory. Passing complex data requires serialization or shared views.

## Performance Considerations

- Startup time (module compilation)
- JS-WASM boundary crossings
- Memory allocation strategies

## Use Cases

- Compute-intensive algorithms
- Games and graphics
- Audio/video processing
- Cryptography` },
    {
        id: 'n20', title: "Database Indexing Strategies", summary: "B-trees, LSM trees, and when to use each for your workload.", date: "2023-08-01", tags: ["Databases", "Performance"], readTime: "16 min", content: `## Why Indexes Matter

Without indexes, databases must scan every row. Indexes enable logarithmic lookup times.

## B-Trees

The classic index structure. Balanced trees optimized for disk I/O with high fanout.

- Good for: Read-heavy workloads, range queries
- Writes require in-place updates

## LSM Trees

Log-Structured Merge trees batch writes in memory, then flush sequentially.

- Good for: Write-heavy workloads
- Reads may need to check multiple levels

## Choosing the Right Index

- B-tree: PostgreSQL, MySQL InnoDB
- LSM: RocksDB, Cassandra, LevelDB

## Composite Indexes

Order matters! Index on (a, b) supports queries on a or (a, b), but not b alone.

## Common Mistakes

- Too many indexes (slows writes)
- Wrong column order
- Not analyzing query patterns

## Monitoring

Use EXPLAIN ANALYZE to understand query plans and index usage.` },
    {
        id: 'n21', title: "Writing Clean C++ Code", summary: "Modern C++ idioms and patterns for maintainable code.", date: "2023-07-20", tags: ["C++", "Best Practices"], readTime: "14 min", content: `## Modern C++ Philosophy

C++11 and beyond transformed the language. Use modern features for safety and clarity.

## RAII Everywhere

Resources should be managed by objects. Use unique_ptr, shared_ptr, and custom RAII wrappers.

## Prefer Value Semantics

Pass by value when copies are cheap. Move semantics make this efficient for larger types.

## Use auto Judiciously

\`\`\`cpp
auto it = container.find(key);  // Good: type is obvious
auto result = process(data);     // Maybe: depends on context
\`\`\`

## Const Correctness

Mark everything const that can be const. It documents intent and enables optimizations.

## Error Handling

Use exceptions or std::expected (C++23). Avoid error codes that can be ignored.

## Code Organization

- Small, focused functions
- Clear naming (verbs for functions, nouns for types)
- Minimize dependencies between components` },
    {
        id: 'n22', title: "Linux Kernel Module Basics", summary: "Your first kernel module - from hello world to character devices.", date: "2023-07-10", tags: ["Linux", "Kernel"], readTime: "22 min", content: `## Getting Started

Kernel modules are dynamically loadable code that extends the kernel's functionality.

## Hello World Module

\`\`\`c
#include <linux/module.h>
#include <linux/kernel.h>

static int __init hello_init(void) {
    printk(KERN_INFO "Hello, kernel!\\n");
    return 0;
}

static void __exit hello_exit(void) {
    printk(KERN_INFO "Goodbye, kernel!\\n");
}

module_init(hello_init);
module_exit(hello_exit);
MODULE_LICENSE("GPL");
\`\`\`

## Building Modules

Use the kernel build system with a Makefile that invokes Kbuild.

## Character Devices

Character devices provide byte-stream access to hardware:
- Implement file_operations struct
- Register with MAJOR/MINOR numbers
- Handle open, read, write, ioctl

## Safety Considerations

Kernel code runs with full privileges. Bugs can crash the system or compromise security.

## Debugging

Use printk for logging, KGDB for interactive debugging, and check dmesg for output.` },
    {
        id: 'n23', title: "Network Protocol Design", summary: "Lessons learned from designing custom binary protocols.", date: "2023-07-01", tags: ["Networking", "Design"], readTime: "18 min", content: `## When to Design a Protocol

Custom protocols make sense when existing ones don't fit performance or feature requirements.

## Design Principles

- Simplicity: Easier to implement and debug
- Extensibility: Version fields and reserved bits
- Efficiency: Minimize overhead for common cases

## Message Format

\`\`\`
+--------+--------+--------+--------+
| Magic  | Version| Type   | Length |
+--------+--------+--------+--------+
|              Payload              |
+--------+--------+--------+--------+
\`\`\`

## Framing

Delimiting messages in a byte stream:
- Length prefix (most common)
- Delimiter-based (requires escaping)
- Fixed-size messages

## Error Handling

- CRC/checksum for integrity
- Timeouts for reliability
- Graceful handling of unknown message types

## Backward Compatibility

Always plan for future versions. Unknown fields should be ignored, not rejected.

## Documentation

Document the wire format precisely. Ambiguity leads to incompatible implementations.` },
    {
        id: 'n24', title: "Fuzzing for Fun and Bugs", summary: "Setting up and running coverage-guided fuzzers to find vulnerabilities.", date: "2023-06-20", tags: ["Security", "Testing"], readTime: "15 min", content: `## What is Fuzzing?

Fuzzing generates random inputs to find bugs that deterministic tests miss.

## Coverage-Guided Fuzzing

Modern fuzzers like AFL++ and libFuzzer use code coverage to guide mutation, focusing on unexplored paths.

## Writing a Fuzz Target

\`\`\`cpp
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    parse_input(data, size);
    return 0;
}
\`\`\`

## Corpus Management

Maintain a corpus of interesting inputs. Minimize it periodically to reduce redundancy.

## Continuous Fuzzing

Run fuzzers continuously in CI. OSS-Fuzz provides free fuzzing for open-source projects.

## Triaging Crashes

Deduplicate crashes by stack trace. Minimize inputs with afl-tmin or similar tools.

## What Fuzzing Finds

- Memory safety issues
- Assertion failures
- Resource exhaustion
- Logic bugs with security implications` },
    {
        id: 'n25', title: "The Life of a System Call", summary: "Tracing what happens when you call read() - from userspace to kernel and back.", date: "2023-06-10", tags: ["Linux", "Systems"], readTime: "20 min", content: `## The User-Kernel Boundary

System calls are the interface between user programs and the kernel. They require a privilege transition.

## Step by Step

1. User calls read()
2. libc wrapper prepares arguments
3. SYSCALL instruction triggers ring transition
4. Kernel entry point saves state
5. System call handler executes
6. SYSRET returns to userspace

## The Cost

A minimal system call takes ~100-200 cycles. The actual work often takes much longer.

## Avoiding Syscalls

- Buffered I/O (reduce calls)
- Memory-mapped files
- io_uring for batch submission
- vDSO for certain calls

## Tracing

Use strace to see system calls:

\`\`\`bash
strace -c ./program  # Summary
strace -f ./program  # Follow forks
\`\`\`

## Performance Analysis

Use perf to measure syscall overhead and identify optimization opportunities.

## Kernel Internals

System call handlers are defined with SYSCALL_DEFINE macros. Each has specific security checks and validation.` }
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
