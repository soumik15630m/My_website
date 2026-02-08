import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen: React.FC = () => {
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
            <div className="relative">
                {/* Logo Container */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-primaryText">
                        0x1A
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
                    className="text-center mt-4 text-secondaryText font-mono text-sm tracking-widest uppercase"
                >
                    Systems Engineer
                </motion.p>
            </div>
        </motion.div>
    );
};
