import React from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest } from 'lucide-react';
import { Section } from '../Section';
import { ScrollTrigger } from '../ScrollTrigger';
import { OpenSourceContribution } from '../../types';
import { GitHubPR } from '../GitHubPR';

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
                    {opensource.map((contrib) => (
                        <GitHubPR
                            key={contrib.id}
                            repoUrl={contrib.repoUrl}
                            prNumber={contrib.prNumber}
                            initialTitle={contrib.title}
                            initialStatus={contrib.status}
                            initialImage={contrib.image}
                        />
                    ))}
                </div>
            </Section>

            <ScrollTrigger nextSection="Recognition" onClick={() => handleViewChange('achievements')} />
        </div>
    );
};
