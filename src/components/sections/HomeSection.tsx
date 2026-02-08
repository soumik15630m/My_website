import React from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest } from 'lucide-react';
import { Section } from '../Section';
import { ScrollTrigger } from '../ScrollTrigger';
import { Profile, Project, OpenSourceContribution } from '../../types';

interface HomeSectionProps {
    profile: Profile;
    projects: Project[];
    opensource: OpenSourceContribution[];
    handleViewChange: (view: any) => void;
    setSelectedProject: (project: Project) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
    profile,
    projects,
    opensource,
    handleViewChange,
    setSelectedProject
}) => {
    // Get pinned projects for side panel (fallback to first 3 active if none pinned)
    const pinnedProjects = projects.filter(p => p.pinned);

    return (
        <div className="max-w-7xl mx-auto min-h-[80vh]">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Left Column - Hero + About */}
                <div className="lg:col-span-7 xl:col-span-8">
                    {/* Hero Section */}
                    <Section className="py-16 md:py-20">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                            className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]"
                        >
                            <span className="text-primaryText block">
                                {profile.role || 'Systems Engineer'}
                            </span>
                            <span className="text-secondaryText/50 block mt-2 text-3xl md:text-4xl lg:text-5xl">
                                {profile.tagline || 'Open Source Contributor | Building performant systems'}
                            </span>
                        </motion.h1>
                    </Section>

                    {/* About + Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                        className="border-t border-white/5 py-12"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* About */}
                            <div className="md:col-span-2">
                                <h2 className="text-[10px] font-mono text-secondaryText/40 uppercase tracking-[0.2em] mb-4">About</h2>
                                <p className="text-sm md:text-base text-primaryText/80 leading-relaxed font-light">
                                    {profile.about}
                                </p>
                            </div>

                            {/* Location + Status */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-[10px] font-mono text-secondaryText/40 uppercase tracking-[0.2em] mb-2">Location</h2>
                                    <p className="text-primaryText font-medium text-sm">{profile.location}</p>
                                </div>
                                <div>
                                    <h2 className="text-[10px] font-mono text-secondaryText/40 uppercase tracking-[0.2em] mb-2">Status</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                        </span>
                                        <p className="text-accent font-medium text-sm">{profile.availability}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Side Panel */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                        className="lg:sticky lg:top-24 space-y-6"
                    >
                        {/* Pinned Projects Panel */}
                        {pinnedProjects.length > 0 && (
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-[10px] font-mono text-secondaryText/40 uppercase tracking-[0.2em]">Pinned Projects</h2>
                                    <button
                                        onClick={() => handleViewChange('projects')}
                                        className="text-[10px] font-mono text-accent hover:text-accent/80 transition-colors"
                                    >
                                        View all →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {pinnedProjects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => setSelectedProject(project)}
                                            className="group w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent/30 hover:bg-white/[0.04] transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                {project.image && (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface">
                                                        <img src={project.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-primaryText truncate group-hover:text-accent transition-colors">
                                                        {project.title}
                                                    </p>
                                                    <p className="text-xs text-secondaryText/50 mt-0.5 line-clamp-1">{project.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Open Source Panel */}
                        {opensource.some(c => c.pinned) ? (
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-[10px] font-mono text-secondaryText/40 uppercase tracking-[0.2em]">Open Source</h2>
                                    <button
                                        onClick={() => handleViewChange('opensource')}
                                        className="text-[10px] font-mono text-accent hover:text-accent/80 transition-colors"
                                    >
                                        View all →
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {opensource.filter(c => c.pinned).map((contrib) => (
                                        <a
                                            key={contrib.id}
                                            href={contrib.prUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                                        >
                                            <GitPullRequest size={14} className="text-green-500 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-primaryText truncate group-hover:text-accent transition-colors">
                                                    {contrib.title}
                                                </p>
                                                <p className="text-[10px] text-secondaryText/40 mt-0.5">{contrib.repo}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            </div>

            <ScrollTrigger
                nextSection="Selected Work"
                onClick={() => handleViewChange('projects')}
            />
        </div>
    );
};
