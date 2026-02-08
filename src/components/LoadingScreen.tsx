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
                <div className="relative w-[300px] h-[150px] md:w-[400px] md:h-[200px]">
                    <svg viewBox="0 0 400 200" className="w-full h-full font-bold">
                        <defs>
                            {/* Mask 1: The Text Shape (For the Gradient Fill) */}
                            <mask id="text-shape-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="black" />
                                <text x="50%" y="54%" textAnchor="middle" dy=".35em" fill="white" className="text-8xl md:text-9xl font-['Inter'] font-black tracking-tighter" style={{ fontWeight: 900 }}>
                                    STK
                                </text>
                            </mask>

                            {/* Mask 2: The Curtain Reveal (For Everything) */}
                            <mask id="curtain-reveal-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="black" />
                                <motion.rect
                                    x="0"
                                    y="0"
                                    width="400"
                                    height="200"
                                    fill="white"
                                    initial={{ width: 0 }}
                                    animate={{ width: 400 }}
                                    transition={{
                                        duration: 3.5, // Slower reveal
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                />
                            </mask>

                            {/* Gradient: Deep Contrast "Cyber Blue" */}
                            <linearGradient id="reveal-gradient" x1="0" x2="1" y1="0" y2="0">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="50%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1e3a8a" />
                            </linearGradient>
                        </defs>

                        {/* Master Group: Everything is revealed by the curtain */}
                        <g mask="url(#curtain-reveal-mask)">

                            {/* Layer 1: The Dim Outline (Now revealed by curtain) */}
                            <text x="50%" y="54%" textAnchor="middle" dy=".35em"
                                fill="none" stroke="#333" strokeWidth="1"
                                className="text-8xl md:text-9xl font-['Inter'] font-black tracking-tighter"
                                style={{ fontWeight: 900 }}
                            >
                                STK
                            </text>

                            {/* Layer 2: The Gradient Fill (Masked to Text Shape) - With Water Flow */}
                            <g mask="url(#text-shape-mask)">
                                {/* Background for deep depth */}
                                <rect x="0" y="0" width="400" height="200" fill="#000" />

                                {/* Flowing Wave 1 */}
                                <motion.path
                                    d="M0,100 Q50,120 100,100 T200,100 T300,100 T400,100 V200 H0 Z"
                                    fill="url(#reveal-gradient)"
                                    animate={{
                                        d: [
                                            "M0,100 Q50,120 100,100 T200,100 T300,100 T400,100 V200 H0 Z",
                                            "M0,100 Q50,80 100,100 T200,100 T300,100 T400,100 V200 H0 Z",
                                            "M0,100 Q50,120 100,100 T200,100 T300,100 T400,100 V200 H0 Z"
                                        ],
                                        x: [-50, 0]
                                    }}
                                    transition={{
                                        d: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                                        x: { duration: 5, repeat: Infinity, ease: "linear" }
                                    }}
                                />

                                {/* Flowing Wave 2 (Offset) */}
                                <motion.path
                                    d="M0,90 Q50,70 100,90 T200,90 T300,90 T400,90 V200 H0 Z"
                                    fill="url(#reveal-gradient)"
                                    fillOpacity="0.7"
                                    animate={{
                                        d: [
                                            "M0,90 Q50,70 100,90 T200,90 T300,90 T400,90 V200 H0 Z",
                                            "M0,90 Q50,110 100,90 T200,90 T300,90 T400,90 V200 H0 Z",
                                            "M0,90 Q50,70 100,90 T200,90 T300,90 T400,90 V200 H0 Z"
                                        ],
                                        x: [-30, 0]
                                    }}
                                    transition={{
                                        d: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                                        x: { duration: 4, repeat: Infinity, ease: "linear" }
                                    }}
                                />
                            </g>
                        </g>

                        {/* Scanning Line (The "Leading Edge" of the curtain) - Draws on top */}
                        <motion.rect
                            x="0"
                            y="0"
                            width="2"
                            height="200"
                            fill="#fff"
                            initial={{ x: 0, opacity: 1 }}
                            animate={{ x: 400, opacity: [1, 1, 0] }}
                            transition={{
                                duration: 3.5,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        />
                    </svg>
                </div>

                <div className="flex flex-col items-center mt-6 space-y-2">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }} // Delayed appearance
                        className="text-blue-400/80 font-mono text-sm tracking-[0.3em] uppercase"
                    >
                        {profile?.role || 'Systems Engineer'}
                    </motion.p>

                    {/* Premium Tagline: Staggered Letter Reveal */}
                    <div className="flex overflow-hidden">
                        {(profile?.tagline || "Architecting Digital Excellence").split("").map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, filter: "blur(10px)", y: 5 }}
                                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                transition={{
                                    duration: 1.5, // Slower fade-in
                                    delay: 1.0 + (index * 0.1), // Start earlier (1.0s) so it's visible before load finishes
                                    ease: "easeOut"
                                }}
                                className="text-white/40 text-[10px] tracking-widest font-light uppercase inline-block"
                                style={{
                                    marginRight: char === " " ? "0.5em" : "0" // Maintain space width
                                }}
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
