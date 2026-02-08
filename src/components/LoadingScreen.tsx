import React from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
    profile?: {
        logoText?: string;
        logoImage?: string;
        role?: string;
        tagline?: string;
        loadingSettings?: {
            style: 'curtain' | 'minimal';
            revealDuration: number;
            taglineDelay: number;
            taglineStagger: number;
        };
    };
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ profile }) => {
    const settings = profile?.loadingSettings || {
        style: 'curtain',
        revealDuration: 3.5,
        taglineDelay: 1.5,
        taglineStagger: 0.1
    };

    const logoText = profile?.logoText || "STK";
    const role = profile?.role || 'Systems Engineer';
    const tagline = profile?.tagline || "Architecting Digital Excellence";

    // Minimal Style: clean fade in/out
    if (settings.style === 'minimal') {
        return (
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.8 } }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            >
                <div className="flex flex-col items-center gap-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.0 }}
                        className="text-6xl md:text-8xl font-['Inter'] font-black tracking-tighter text-white"
                    >
                        {logoText}
                    </motion.div>

                    <div className="flex flex-col items-center space-y-2">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="text-blue-400/80 font-mono text-sm tracking-[0.3em] uppercase"
                        >
                            {role}
                        </motion.p>

                        <div className="flex flex-wrap justify-center max-w-[80%] mx-auto text-center gap-y-1">
                            {tagline.split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 1.0 + (index * 0.03),
                                        ease: "easeOut"
                                    }}
                                    className="text-white/40 text-xs tracking-widest font-light uppercase inline-block"
                                    style={{ marginRight: char === " " ? "0.5em" : "0" }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Default: Curtain Style
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                transition: { duration: 0.8 } // Fade out duration
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
            <div className="relative flex flex-col items-center justify-center">
                <div className="relative w-[300px] h-[150px] md:w-[400px] md:h-[200px]">
                    <svg viewBox="0 0 400 200" className="w-full h-full font-bold">
                        <defs>
                            {/* Mask 1: The Text Shape */}
                            <mask id="text-shape-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="black" />
                                <text x="50%" y="54%" textAnchor="middle" dy=".35em" fill="white" className="text-8xl md:text-9xl font-['Inter'] font-black tracking-tighter" style={{ fontWeight: 900 }}>
                                    {logoText}
                                </text>
                            </mask>

                            {/* Mask 2: The Curtain Reveal */}
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
                                        duration: settings.revealDuration, // Configurable duration
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

                            {/* Layer 1: The Dim Outline */}
                            <text x="50%" y="54%" textAnchor="middle" dy=".35em"
                                fill="none" stroke="#333" strokeWidth="1"
                                className="text-8xl md:text-9xl font-['Inter'] font-black tracking-tighter"
                                style={{ fontWeight: 900 }}
                            >
                                {logoText}
                            </text>

                            {/* Layer 2: The Gradient Fill (Masked to Text Shape) - With Water Flow */}
                            <g mask="url(#text-shape-mask)">
                                <rect x="0" y="0" width="400" height="200" fill="#000" />
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

                        {/* Scanning Line */}
                        <motion.rect
                            x="0"
                            y="0"
                            width="2"
                            height="200"
                            fill="#fff"
                            initial={{ x: 0, opacity: 1 }}
                            animate={{ x: 400, opacity: [1, 1, 0] }}
                            transition={{
                                duration: settings.revealDuration, // Configurable
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        />
                    </svg>
                </div>

                <div className="flex flex-col items-center mt-6 space-y-2">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="text-blue-400/80 font-mono text-sm tracking-[0.3em] uppercase"
                    >
                        {role}
                    </motion.p>

                    <div className="flex flex-wrap justify-center max-w-[80%] mx-auto text-center gap-y-1">
                        {tagline.split("").map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, filter: "blur(10px)", y: 5 }}
                                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                transition={{
                                    duration: 1.5,
                                    delay: settings.taglineDelay + (index * settings.taglineStagger), // Configurable Delay & Stagger
                                    ease: "easeOut"
                                }}
                                className="text-white/40 text-xs tracking-widest font-light uppercase inline-block"
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
