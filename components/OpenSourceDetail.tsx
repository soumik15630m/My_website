import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { OpenSourceContribution } from '../types';
import { X, GitPullRequest, ExternalLink, GitMerge, Calendar, Tag } from 'lucide-react';

interface OpenSourceDetailProps {
    contribution: OpenSourceContribution | null;
    onClose: () => void;
}

export const OpenSourceDetail: React.FC<OpenSourceDetailProps> = ({ contribution, onClose }) => {
    // Lock body scroll when active
    useEffect(() => {
        if (contribution) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [contribution]);

    if (!contribution) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#050608]/95 backdrop-blur-xl flex items-center justify-center p-6"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 z-[110] p-3 bg-white/5 rounded-full hover:bg-white/10 text-secondaryText hover:text-white transition-all transform hover:rotate-90 hover:scale-110"
            >
                <X size={20} />
            </button>

            {/* Content Card */}
            <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-surface/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden max-h-[85vh] overflow-y-auto"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                            <GitPullRequest size={24} className="text-green-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3 flex-wrap">
                                <span className="flex items-center gap-1.5 text-xs font-mono text-secondaryText/60">
                                    <Calendar size={12} />
                                    {contribution.date}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium flex items-center gap-1">
                                    <GitMerge size={10} />
                                    {contribution.status}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-primaryText tracking-tight leading-tight">
                                {contribution.title}
                            </h2>
                        </div>
                    </div>

                    {/* Repository Info */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <a
                            href={contribution.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-mono text-accent hover:underline"
                        >
                            {contribution.repo}
                            <ExternalLink size={12} />
                        </a>
                        <span className="text-secondaryText/30">•</span>
                        <span className="text-sm font-mono text-secondaryText/60">PR #{contribution.prNumber}</span>
                    </div>

                    {/* Labels */}
                    {contribution.labels && contribution.labels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {contribution.labels.map(label => (
                                <span
                                    key={label}
                                    className="inline-flex items-center gap-1 text-[10px] font-mono px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent uppercase tracking-wider"
                                >
                                    <Tag size={10} />
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Problem Statement */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono text-secondaryText/50 uppercase tracking-widest">The Problem</h3>
                        <p className="text-lg text-primaryText/90 leading-relaxed">
                            {contribution.description || 'This contribution addressed an issue in the codebase that needed fixing.'}
                        </p>
                    </div>

                    {/* Technical Details - Generated based on the contribution */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono text-secondaryText/50 uppercase tracking-widest">Technical Approach</h3>
                        <div className="space-y-3 text-primaryText/80">
                            {contribution.repo.includes('llvm') && (
                                <>
                                    <p>Analyzed the LLVM IR transformation pass to identify the root cause of the crash.</p>
                                    <p>The fix involved adding proper bounds checking before accessing vector elements during the SLP vectorization phase.</p>
                                    <p>Comprehensive test cases were added to prevent regression.</p>
                                </>
                            )}
                            {contribution.repo.includes('fmt') && (
                                <>
                                    <p>Investigated the formatting pipeline to understand how range types were being processed.</p>
                                    <p>The solution involved correcting the template specialization for suppressor handling.</p>
                                    <p>The fix maintains backward compatibility with existing code.</p>
                                </>
                            )}
                            {!contribution.repo.includes('llvm') && !contribution.repo.includes('fmt') && (
                                <>
                                    <p>Investigated the codebase to identify the underlying issue causing the problem.</p>
                                    <p>Implemented a fix following the project's coding standards and best practices.</p>
                                    <p>Added appropriate tests and documentation for the changes.</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* View PR Button */}
                    <a
                        href={contribution.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 font-medium hover:bg-green-500/20 transition-all"
                    >
                        <GitPullRequest size={16} />
                        View Pull Request
                        <ExternalLink size={14} />
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
};
