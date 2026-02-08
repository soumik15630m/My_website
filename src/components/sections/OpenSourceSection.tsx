import React from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest } from 'lucide-react';
import { Section } from '../Section';
import { ScrollTrigger } from '../ScrollTrigger';
import { OpenSourceContribution } from '../../types';

interface OpenSourceSectionProps {
    opensource: OpenSourceContribution[];
    handleViewChange: (view: any) => void;
    setSelectedOSS: (oss: OpenSourceContribution) => void;
}

export const OpenSourceSection: React.FC<OpenSourceSectionProps> = ({
    opensource,
    handleViewChange,
    setSelectedOSS
}) => {
    return (
        <div className="max-w-5xl mx-auto">
            <Section className="space-y-8">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
                        Open Source
                    </h2>
                    <p className="text-secondaryText text-lg max-w-2xl">
                        Contributing to projects that power millions of developers. Here are some of my merged pull requests.
                    </p>
                </div>

                <div className="space-y-4 pt-8">
                    {opensource.map((contrib, index) => (
                        <motion.div
                            key={contrib.id}
                            onClick={() => setSelectedOSS(contrib)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-accent/30 transition-all duration-300 hover:bg-white/8 cursor-pointer"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <GitPullRequest size={20} className="text-green-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-primaryText group-hover:text-accent transition-colors">{contrib.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-secondaryText/60">{contrib.repo}</span>
                                        <span className="text-secondaryText/30">•</span>
                                        <span className="text-sm text-secondaryText/60">#{contrib.prNumber}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {contrib.labels?.map((label) => (
                                    <span key={label} className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                                        {label}
                                    </span>
                                ))}
                                <span className="text-xs text-secondaryText/40">{contrib.date}</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
                                    {contrib.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

            <ScrollTrigger nextSection="Recognition" onClick={() => handleViewChange('achievements')} />
        </div>
    );
};
