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

export const GitHubPR: React.FC<GitHubPRProps> = ({ repoUrl, prNumber, initialTitle, initialStatus = 'open', initialImage }) => {
    const [data, setData] = useState<PRData | null>(null);
    const [loading, setLoading] = useState(true);

    // Parse owner/repo
    const parts = repoUrl.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];

    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            try {
                const res = await fetch(`/api/github-status?owner=${owner}&repo=${repo}&number=${prNumber}`);
                if (!res.ok) throw new Error('API unavailable');
                const json = await res.json();
                if (mounted) setData(json);
            } catch (err) {
                // Silent fail
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchData();
        return () => { mounted = false; };
    }, [owner, repo, prNumber]);

    // Derived state
    const currentStatus = data?.status || initialStatus;
    const currentTitle = data?.title || initialTitle || `PR #${prNumber}`;
    const currentImage = data?.image || initialImage || `https://opengraph.githubassets.com/1/${owner}/${repo}/pull/${prNumber}`;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'merged': return {
                badge: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
                // Neutral border by default, Purple on hover
                border: 'border-white/5 hover:border-purple-500/50',
                glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]'
            };
            case 'closed': return {
                badge: 'text-red-400 border-red-500/30 bg-red-500/10',
                // Neutral border by default, Red on hover
                border: 'border-white/5 hover:border-red-500/50',
                glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]'
            };
            case 'open': return {
                badge: 'text-green-400 border-green-500/30 bg-green-500/10',
                // Green border ALWAYS (Active state), Green on hover too
                border: 'border-green-500/30 hover:border-green-500/50',
                glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]'
            };
            default: return {
                badge: 'text-secondaryText border-white/10 bg-white/5',
                border: 'border-white/5 hover:border-white/10',
                glow: ''
            };
        }
    };

    const styles = getStatusStyle(currentStatus);

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case 'merged': return <GitMerge size={14} />;
            case 'closed': return <XCircle size={14} />;
            default: return <GitPullRequest size={14} />;
        }
    };

    return (
        <motion.a
            href={`${repoUrl}/pull/${prNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
            className={`group block relative w-full p-4 rounded-xl bg-white/[0.02] border transition-all duration-300 overflow-hidden ${styles.border} ${styles.glow}`}
        >
            {/* Background Image Effect (Always visible, faint) */}
            {currentImage && (
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                    <img src={currentImage} alt="" className="w-full h-full object-cover blur-sm" />
                </div>
            )}

            <div className="relative z-10 flex items-start gap-4">
                {/* Status Icon Badge */}
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${styles.badge}`}>
                    <StatusIcon status={currentStatus} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-mono text-secondaryText/60 truncate">
                            {owner}/{repo} #{prNumber}
                        </p>
                        <ExternalLink size={12} className="text-secondaryText/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <h3 className="text-sm font-medium text-primaryText mt-1 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                        {currentTitle}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${styles.badge}`}>
                            {currentStatus}
                        </span>
                    </div>
                </div>

                {/* Thumbnail (Always visible on mobile/desktop) */}
                {currentImage && (
                    <div className="w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/20">
                        <img src={currentImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>
        </motion.a>
    );
};
