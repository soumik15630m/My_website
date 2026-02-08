import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest, GitMerge, XCircle, ExternalLink } from 'lucide-react';

interface GitHubPRProps {
    repoUrl: string; // e.g., "https://github.com/owner/repo"
    prNumber: number;
    initialTitle?: string;
    initialStatus?: 'merged' | 'open' | 'closed';
    initialImage?: string;
}

interface PRData {
    status: 'merged' | 'open' | 'closed';
    title: string;
    image: string;
    repo: string;
}

export const GitHubPR: React.FC<GitHubPRProps> = ({ repoUrl, prNumber, initialTitle }) => {
    const [data, setData] = useState<PRData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Parse owner/repo from URL
    // Format: https://github.com/owner/repo
    const parts = repoUrl.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/github-status?owner=${owner}&repo=${repo}&number=${prNumber}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [owner, repo, prNumber]);

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'merged': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
            case 'closed': return 'text-red-400 border-red-500/30 bg-red-500/10';
            case 'open': return 'text-green-400 border-green-500/30 bg-green-500/10';
            default: return 'text-secondaryText border-white/10 bg-white/5';
        }
    };

    const StatusIcon = ({ status }: { status?: string }) => {
        switch (status) {
            case 'merged': return <GitMerge size={14} />;
            case 'closed': return <XCircle size={14} />;
            default: return <GitPullRequest size={14} />;
        }
    };

    if (loading) {
        return (
            <div className="w-full h-24 rounded-xl bg-white/5 animate-pulse border border-white/5" />
        );
    }

    const prTitle = data?.title || initialTitle || `PR #${prNumber}`;
    const statusStyle = getStatusColor(data?.status);

    return (
        <motion.a
            href={`${repoUrl}/pull/${prNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
            className="group block relative w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all overflow-hidden"
        >
            {/* Background Image Effect (Subtle) */}
            {data?.image && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                    <img src={data.image} alt="" className="w-full h-full object-cover blur-sm" />
                </div>
            )}

            <div className="relative z-10 flex items-start gap-4">
                {/* Status Icon Badge */}
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${statusStyle} transition-colors`}>
                    <StatusIcon status={data?.status} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-mono text-secondaryText/60 truncate">
                            {owner}/{repo} #{prNumber}
                        </p>
                        <ExternalLink size={12} className="text-secondaryText/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <h3 className="text-sm font-medium text-primaryText mt-1 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                        {prTitle}
                    </h3>

                    {/* Meta / Status Text */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${statusStyle}`}>
                            {data?.status || 'Active'}
                        </span>
                        {/* If we had date, we could put it here */}
                    </div>
                </div>

                {/* Optional: Small Image Thumbnail if available and not just background */}
                {data?.image && (
                    <div className="hidden sm:block w-20 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/20">
                        <img src={data.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>
        </motion.a>
    );
};
