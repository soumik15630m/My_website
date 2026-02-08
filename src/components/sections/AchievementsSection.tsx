import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '../Section';
import { ScrollTrigger } from '../ScrollTrigger';
import { AchievementItem } from '../AchievementItem';
import { Achievement } from '../../types';

interface AchievementsSectionProps {
    achievements: Achievement[];
    handleViewChange: (view: any) => void;
    setSelectedAchievement: (achievement: Achievement) => void;
    containerVariants: any;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
    achievements,
    handleViewChange,
    setSelectedAchievement,
    containerVariants
}) => {
    return (
        <div className="max-w-3xl mx-auto">
            <Section className="mb-20 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-semibold text-primaryText mb-6 tracking-tight">Certificates</h2>
                <p className="text-xl text-secondaryText font-light max-w-2xl leading-relaxed mx-auto md:mx-0">
                    Validation through competition and community contribution.
                </p>
            </Section>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2"
            >
                {achievements.map((achievement, index) => (
                    <AchievementItem
                        key={achievement.id}
                        achievement={achievement}
                        index={index}
                        onClick={() => setSelectedAchievement(achievement)}
                    />
                ))}
            </motion.div>

            <ScrollTrigger nextSection="Writings" onClick={() => handleViewChange('notes')} />
        </div>
    );
};
