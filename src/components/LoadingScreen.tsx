import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
    profile?: {
        logoText?: string;
        logoImage?: string;
        role?: string;
    };
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ profile }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.1,
                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
            <div className="relative flex flex-col items-center justify-center">
                {/* Logo Container */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center"
                >
                    {profile?.logoImage ? (
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 border-4 border-accent/20 shadow-[0_0_40px_-10px_rgba(var(--accent-rgb),0.3)]">
                            <img
                                src={profile.logoImage}
                                alt="Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-primaryText">
                                {profile?.logoText || '0x1A'}
                            </h1>
                            <div className="h-1 w-full bg-accent mt-2 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "linear"
                                    }}
                                    className="h-full w-full bg-white/50"
                                />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Subtle Glow Behind Logo */}
                <motion.div
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-[40px] -z-10"
                />

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-8 text-secondaryText font-mono text-sm tracking-widest uppercase"
                >
                    {profile?.role || 'Systems Engineer'}
                </motion.p>
            </div>
        </motion.div>
    );
};
