import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../types';
import { X, Award, ExternalLink, Calendar, Trophy } from 'lucide-react';

interface AchievementDetailProps {
    achievement: Achievement | null;
    onClose: () => void;
}

export const AchievementDetail: React.FC<AchievementDetailProps> = ({ achievement, onClose }) => {
    // Lock body scroll when active
    useEffect(() => {
        if (achievement) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [achievement]);

    if (!achievement) return null;

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
                className="w-full max-w-xl bg-surface/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
            >
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                            <Trophy size={24} className="text-accent" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-mono text-accent/70 bg-accent/10 px-2 py-1 rounded-full uppercase tracking-widest">
                                    {achievement.year}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-primaryText tracking-tight">
                                {achievement.title}
                            </h2>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Context / Description */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono text-secondaryText/50 uppercase tracking-widest">Details</h3>
                        <p className="text-lg text-primaryText/90 leading-relaxed">
                            {achievement.context}
                        </p>
                    </div>

                    {/* Verification Link */}
                    {achievement.verificationLink && (
                        <a
                            href={achievement.verificationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-full text-accent text-sm font-medium transition-all hover:scale-105"
                        >
                            <ExternalLink size={16} />
                            View Verification
                        </a>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
