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
                                <text x="50%" y="54%" textAnchor="middle" dy=".35em" fill="white" className="text-8xl md:text-9xl font-['Inter'] font-black tracking-tighter" style={{ fontWeight: 900 }}>
                                    STK
                                </text>
                            </mask>
                            {/* Context Aware Gradient - Data Stream / Cyberpunk */}
                            <linearGradient id="wave-gradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan */}
                                <stop offset="50%" stopColor="#0ea5e9" /> {/* Sky Blue */}
                                <stop offset="100%" stopColor="#2563eb" /> {/* Blue */}
                            </linearGradient>
                        </defs>

                        {/* Background Text (Outline/Dim) */}
                        <text x="50%" y="54%" textAnchor="middle" dy=".35em"
                            fill="none" stroke="#222" strokeWidth="1"
                            className="text-8xl md:text-9xl font-['Inter'] font-black tracking-tighter"
                            style={{ fontWeight: 900 }}
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
                                animate={{ y: [-20, -220] }}
                                transition={{
                                    duration: 2.5,
                                    ease: "easeInOut",
                                }}
                            />
                            {/* Horizontal Wave Motion 1 */}
                            <motion.path
                                d="M0,0 Q50,15 100,0 T200,0 T300,0 T400,0 V200 H0 Z"
                                fill="url(#wave-gradient)"
                                transform="translate(0, 160)"
                                animate={{
                                    d: [
                                        "M0,0 Q50,15 100,0 T200,0 T300,0 T400,0 V200 H0 Z",
                                        "M0,0 Q50,-15 100,0 T200,0 T300,0 T400,0 V200 H0 Z",
                                        "M0,0 Q50,15 100,0 T200,0 T300,0 T400,0 V200 H0 Z"
                                    ],
                                    y: [200, -20]
                                }}
                                transition={{
                                    d: { duration: 3, repeat: Infinity, ease: "linear" },
                                    y: { duration: 2.5, ease: "easeInOut" }
                                }}
                            />
                            {/* Horizontal Wave Motion 2 (Offset) */}
                            <motion.path
                                d="M0,0 Q50,-10 100,0 T200,0 T300,0 T400,0 V200 H0 Z"
                                fill="url(#wave-gradient)"
                                fillOpacity="0.7"
                                transform="translate(0, 160)"
                                animate={{
                                    d: [
                                        "M0,0 Q50,-10 100,0 T200,0 T300,0 T400,0 V200 H0 Z",
                                        "M0,0 Q50,10 100,0 T200,0 T300,0 T400,0 V200 H0 Z",
                                        "M0,0 Q50,-10 100,0 T200,0 T300,0 T400,0 V200 H0 Z"
                                    ],
                                    y: [200, -20]
                                }}
                                transition={{
                                    d: { duration: 4, repeat: Infinity, ease: "linear" },
                                    y: { duration: 2.5, ease: "easeInOut" }
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
