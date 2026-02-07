import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// Fake data for stress testing
const FAKE_PROFILE = {
    name: "Soumik Ghosh",
    handle: "soumik_dev",
    role: "Full Stack Developer",
    tagline: "Building scalable systems and beautiful interfaces",
    location: "Kolkata, India",
    availability: "Open to opportunities",
    email: "soumik@example.com",
    github: "https://github.com/soumik15630m",
    about: `I'm a passionate developer specializing in modern web technologies, distributed systems, and cloud architecture.

With expertise in React, Node.js, Python, and cloud platforms like AWS and GCP, I build performant applications that scale.

Currently exploring AI/ML integration in web applications and contributing to open-source projects.`
};

const FAKE_PROJECTS = [
    {
        id: 'p1',
        title: "CloudSync Pro",
        description: "A real-time file synchronization platform with conflict resolution and version control.",
        problemStatement: "Teams needed a reliable way to sync large files across distributed offices without data loss.",
        technicalDecisions: [
            "CRDT-based conflict resolution for seamless merging",
            "WebSocket + HTTP/2 for real-time updates",
            "Content-addressable storage for deduplication"
        ],
        techStack: ["TypeScript", "Node.js", "PostgreSQL", "Redis"],
        status: 'completed',
        year: "2024",
        githubUrl: "https://github.com/example/cloudsync"
    },
    {
        id: 'p2',
        title: "Neural Search Engine",
        description: "AI-powered semantic search that understands context and intent, not just keywords.",
        problemStatement: "Traditional keyword search failed to find relevant documents when users described problems in natural language.",
        technicalDecisions: [
            "Transformer embeddings for semantic understanding",
            "Approximate nearest neighbor search with HNSW",
            "Hybrid ranking combining BM25 and neural scores"
        ],
        techStack: ["Python", "FastAPI", "PyTorch", "Milvus"],
        status: 'active',
        year: "2024",
        githubUrl: "https://github.com/example/neural-search"
    },
    {
        id: 'p3',
        title: "Metrics Dashboard",
        description: "Real-time observability platform for monitoring microservices with custom alerting.",
        problemStatement: "Existing solutions were too expensive for startups and lacked flexible querying.",
        technicalDecisions: [
            "Time-series compression with gorilla encoding",
            "PromQL-compatible query language",
            "Distributed tracing with OpenTelemetry"
        ],
        techStack: ["Go", "React", "ClickHouse", "Grafana"],
        status: 'completed',
        year: "2023",
        githubUrl: "https://github.com/example/metrics"
    },
    {
        id: 'p4',
        title: "API Gateway",
        description: "High-performance API gateway with rate limiting, authentication, and request transformation.",
        problemStatement: "Needed a lightweight gateway that could handle 100k+ RPS without breaking the bank.",
        technicalDecisions: [
            "Lua scripting for custom transformations",
            "Token bucket algorithm for rate limiting",
            "Zero-copy request forwarding"
        ],
        techStack: ["Rust", "Tokio", "Redis", "etcd"],
        status: 'completed',
        year: "2023",
        githubUrl: "https://github.com/example/gateway"
    },
    {
        id: 'p5',
        title: "DevOps CLI Tool",
        description: "Command-line tool for managing Kubernetes clusters and CI/CD pipelines.",
        problemStatement: "Developers spent too much time context-switching between kubectl, helm, and various cloud CLIs.",
        technicalDecisions: [
            "Plugin architecture for extensibility",
            "Interactive TUI with Bubble Tea",
            "GitOps-native workflow"
        ],
        techStack: ["Go", "Cobra", "Kubernetes API", "GitHub Actions"],
        status: 'active',
        year: "2024",
        githubUrl: "https://github.com/example/devops-cli"
    },
    {
        id: 'p6',
        title: "Chat Platform",
        description: "End-to-end encrypted messaging platform with group chats and file sharing.",
        problemStatement: "Privacy-focused teams needed a self-hosted alternative to Slack.",
        technicalDecisions: [
            "Signal Protocol for E2E encryption",
            "WebRTC for voice/video calls",
            "Matrix protocol for federation"
        ],
        techStack: ["React Native", "Elixir", "Phoenix", "WebRTC"],
        status: 'archived',
        year: "2022",
        githubUrl: "https://github.com/example/chat"
    }
];

const FAKE_ACHIEVEMENTS = [
    {
        id: 'a1',
        title: "Google Summer of Code",
        context: "Open Source Contributor - Apache Foundation",
        year: "2024",
        verificationLink: "https://summerofcode.withgoogle.com"
    },
    {
        id: 'a2',
        title: "1st Place Hackathon",
        context: "Smart India Hackathon - National Level",
        year: "2023",
        verificationLink: "https://sih.gov.in"
    },
    {
        id: 'a3',
        title: "AWS Certified Solutions Architect",
        context: "Professional Level Certification",
        year: "2023",
        verificationLink: "https://aws.amazon.com/certification"
    },
    {
        id: 'a4',
        title: "500+ GitHub Stars",
        context: "Open Source Project Recognition",
        year: "2024"
    },
    {
        id: 'a5',
        title: "Speaker at DevConf",
        context: "Talk on Microservices Architecture",
        year: "2023"
    }
];

const FAKE_NOTES = [
    {
        id: 'n1',
        title: "Building Scalable WebSocket Servers",
        summary: "Deep dive into connection pooling, message broadcasting, and handling millions of concurrent connections.",
        date: "2024-02-01",
        tags: ["WebSocket", "Node.js", "Scaling"],
        readTime: "12 min"
    },
    {
        id: 'n2',
        title: "The Art of Database Indexing",
        summary: "When to use B-trees vs hash indexes, composite indexes, and common anti-patterns that kill performance.",
        date: "2024-01-15",
        tags: ["PostgreSQL", "Performance"],
        readTime: "15 min"
    },
    {
        id: 'n3',
        title: "React Server Components Explained",
        summary: "Breaking down the mental model behind RSC and when to use client vs server components.",
        date: "2024-01-02",
        tags: ["React", "Next.js"],
        readTime: "8 min"
    },
    {
        id: 'n4',
        title: "My Kubernetes Journey",
        summary: "From confusion to confidence - learning K8s the hard way and lessons from production incidents.",
        date: "2023-12-10",
        tags: ["Kubernetes", "DevOps"],
        readTime: "20 min"
    },
    {
        id: 'n5',
        title: "Understanding CORS Once and For All",
        summary: "The complete guide to Cross-Origin Resource Sharing that I wish I had when starting out.",
        date: "2023-11-25",
        tags: ["Security", "Web"],
        readTime: "10 min"
    }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL || '');

        // Seed all content
        await sql`
      INSERT INTO site_content (key, data, updated_at)
      VALUES ('profile', ${JSON.stringify(FAKE_PROFILE)}, NOW())
      ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_PROFILE)}, updated_at = NOW()
    `;

        await sql`
      INSERT INTO site_content (key, data, updated_at)
      VALUES ('projects', ${JSON.stringify(FAKE_PROJECTS)}, NOW())
      ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_PROJECTS)}, updated_at = NOW()
    `;

        await sql`
      INSERT INTO site_content (key, data, updated_at)
      VALUES ('achievements', ${JSON.stringify(FAKE_ACHIEVEMENTS)}, NOW())
      ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_ACHIEVEMENTS)}, updated_at = NOW()
    `;

        await sql`
      INSERT INTO site_content (key, data, updated_at)
      VALUES ('notes', ${JSON.stringify(FAKE_NOTES)}, NOW())
      ON CONFLICT (key) DO UPDATE SET data = ${JSON.stringify(FAKE_NOTES)}, updated_at = NOW()
    `;

        return res.status(200).json({
            success: true,
            message: 'Database seeded with fake data!',
            seeded: {
                profile: FAKE_PROFILE.name,
                projects: FAKE_PROJECTS.length,
                achievements: FAKE_ACHIEVEMENTS.length,
                notes: FAKE_NOTES.length
            }
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return res.status(500).json({ error: 'Failed to seed database', details: error?.message });
    }
}
