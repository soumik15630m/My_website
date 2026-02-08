import React from 'react';
import { motion } from 'framer-motion';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface LoadingScreenProps {
    profile?: {
        logoText?: string;
        logoImage?: string;
        role?: string;
    };
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ profile }) => {
    // "STK" fluid animation
    // Using SVG clipPath/mask for best text cut-out effect

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                transition: { duration: 0.8 }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
            <div className="relative flex flex-col items-center justify-center">
                {/* SVG Liquid Text Container */}
                <div className="relative w-[300px] h-[150px] md:w-[400px] md:h-[200px]">
                    <svg viewBox="0 0 400 200" className="w-full h-full font-bold">
                        {/* Define the Mask - The Text Itself */}
                        <defs>
                            <mask id="text-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="black" />
                                <text x="50%" y="50%" textAnchor="middle" dy=".35em" fill="white" className="text-8xl md:text-9xl font-mono tracking-widest">
                                    STK
                                </text>
                            </mask>
                            {/* Wave Gradient */}
                            <linearGradient id="wave-gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#60a5fa" />
                            </linearGradient>
                        </defs>

                        {/* Background Text (Outline/Dim) */}
                        <text x="50%" y="50%" textAnchor="middle" dy=".35em"
                            fill="none" stroke="#333" strokeWidth="2"
                            className="text-8xl md:text-9xl font-mono tracking-widest"
                        >
                            STK
                        </text>

                        {/* Liquid Fill Group - Masked by Text */}
                        <g mask="url(#text-mask)">
                            {/* The Rising Wave */}
                            <motion.rect
                                x="0"
                                y="200"
                                width="400"
                                height="200"
                                fill="url(#wave-gradient)"
                                animate={{ y: [-50, -250] }}
                                transition={{
                                    duration: 3,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatType: "mirror"
                                }}
                            />
                            {/* Horizontal Wave Motion */}
                            <motion.path
                                d="M0,0 Q50,10 100,0 T200,0 T300,0 T400,0 V200 H0 Z"
                                fill="url(#wave-gradient)"
                                transform="translate(0, 150)" // Start from bottom
                                animate={{
                                    d: [
                                        "M0,10 Q50,20 100,10 T200,10 T300,10 T400,10 V200 H0 Z",
                                        "M0,0 Q50,-10 100,0 T200,0 T300,0 T400,0 V200 H0 Z",
                                        "M0,10 Q50,20 100,10 T200,10 T300,10 T400,10 V200 H0 Z"
                                    ],
                                    y: [200, 0] // Rise up
                                }}
                                transition={{
                                    d: { duration: 2, repeat: Infinity, ease: "linear" },
                                    y: { duration: 2.5, ease: "easeInOut" } // Fill duration
                                }}
                            />
                        </g>
                    </svg>
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-4 text-blue-400/60 font-mono text-xs tracking-[0.5em] uppercase"
                >
                    Systems Engineer
                </motion.p>
            </div>
        </motion.div>
    );
};
